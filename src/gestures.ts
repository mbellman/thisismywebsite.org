import { SupportedModels, createDetector, HandDetector, Hand } from '@tensorflow-models/hand-pose-detection';

let debugOutput: HTMLElement = null;

const TARGET_KEYPOINTS = [
  'index_finger_tip',
  'middle_finger_tip',
  'ring_finger_tip',
  'pinky_finger_tip'
];

type Point = {
  x: number;
  y: number;
};

type PointRecord = Point & {
  time: number;
};

type GestureEventHandler = () => void;

type GestureAnalyzer = {
  on: (eventName: string, handler: GestureEventHandler) => void;
  off: (eventName: string, handler: GestureEventHandler) => void;
  analyze: (image: HTMLVideoElement) => void;
};

function removeFromArray<T>(array: T[], value: T) {
  let i = 0;

  while (i < array.length) {
    if (array[i] === value) {
      array.splice(i, 1);
    } else {
      i++;
    }
  }
}

function timeSince(time: number) {
  return Date.now() - time;
}

class PointRecordQueue {
  private queue: PointRecord[] = [];
  private size: number;

  public constructor(size: number) {
    this.size = size;
  }

  public add(record: PointRecord): void {
    if (this.queue.length === this.size) {
      this.queue.shift();
    }

    this.queue.push(record);
  }

  public get(index: number): PointRecord {
    return this.queue.at(index);
  }

  public getDeltaFrom(start: number, end: number): Point {
    return {
      x: this.get(end).x - this.get(start).x,
      y: this.get(end).y - this.get(start).y
    };
  }

  public getTimeFrom(start: number, end: number): number {
    return this.get(end).time - this.get(start).time;
  }

  public takeLast(count: number): PointRecord[] {
    return this.queue.slice(-count);
  }
}

export async function createHandDetector(): Promise<HandDetector> {
  const model = SupportedModels.MediaPipeHands;

  const detector = await createDetector(model, {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'full'
  });

  return detector;
}

export async function detectHands(detector: HandDetector, image: HTMLVideoElement): Promise<Hand[]> {
  const hands = await detector.estimateHands(image);

  return hands;
}

export function createGestureAnalyzer(detector: HandDetector, debug: boolean = false): GestureAnalyzer {
  const handCenterQueue = new PointRecordQueue(2);
  const indexTipQueue = new PointRecordQueue(2);

  const events: Record<string, GestureEventHandler[]> = {
    swipeUp: [],
    swipeDown: [],
    swipeLeft: [],
    swipeRight: []
  };

  if (debug) {
    {
      const canvas = document.createElement('canvas');

      canvas.width = 320;
      canvas.height = 240;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.right = '0';
      canvas.style.opacity = '0.5';
    
      canvas.setAttribute('id', 'canvas');
    
      document.body.appendChild(canvas);
    }

    {
      debugOutput = document.createElement('div');

      debugOutput.style.width = '320px';
      debugOutput.style.position = 'absolute';
      debugOutput.style.top = '240px';
      debugOutput.style.right = '0';
      debugOutput.style.fontWeight = 'bold';
      debugOutput.style.color = '#fff';
      debugOutput.style.zIndex = '10';

      debugOutput.setAttribute('id', 'debugOutput');
  
      document.body.appendChild(debugOutput);
    }
  }

  function emit(eventName: string) {
    for (const handler of events[eventName]) {
      handler();
    }
  }

  function analyzeHands(hands: Hand[]) {
    if (hands.length === 1) {
      const { keypoints } = hands[0];
      const indexTip = keypoints.find(point => point.name === 'index_finger_tip');

      const averageX = keypoints.reduce((acc, { x }) => {
        return acc + x;
      }, 0) / keypoints.length;

      const averageY = keypoints.reduce((acc, { y }) => {
        return acc + y;
      }, 0) / keypoints.length;

      handCenterQueue.add({
        x: averageX,
        y: averageY,
        time: Date.now()
      });

      indexTipQueue.add({
        x: indexTip.x,
        y: indexTip.y,
        time: Date.now()
      });
    }

    if (timeSince(indexTipQueue.get(-1)?.time) < 100) {
      const time = indexTipQueue.getTimeFrom(0, -1);
      const delta = indexTipQueue.getDeltaFrom(0, -1);

      const handDelta = handCenterQueue.getDeltaFrom(0, -1);

      if (Math.abs(handDelta.x) < 50 && Math.abs(handDelta.y) < 50) {
        if (delta.x > 40) {
          emit('swipeLeft');
        }
  
        if (delta.x < -40) {
          emit('swipeRight');
        }
  
        if (delta.y > 40) {
          emit('swipeDown');
        }
  
        if (delta.y < -40) {
          emit('swipeUp');
        }
      }
    }
  }

  const analyzer: GestureAnalyzer = {
    on: (eventName, handler) => {
      events[eventName].push(handler);
    },
    off: (eventName, handler) => {
      removeFromArray(events[eventName], handler);
    },
    analyze: async (image) => {
      const hands = await detector.estimateHands(image);

      if (debug) {
        debugHands(document.getElementById('canvas') as HTMLCanvasElement, hands);
      }

      analyzeHands(hands);
    }
  };

  return analyzer;
}

export function clearDebug() {
  debugOutput.innerHTML = '';
}

export function printDebug(text: string | number) {
  debugOutput.innerHTML += `${text}<br />`;
}

export function debugHands(canvas: HTMLCanvasElement, hands: Hand[]) {
  // Draw hand keypoints
  {
    const ctx = canvas.getContext('2d');

    // Background
    {
      ctx.fillStyle = '#00a';
  
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  
    // Keypoints
    {
      ctx.fillStyle = '#f00';
  
      for (const hand of hands) {
        for (const { x, y } of hand.keypoints) {
          ctx.fillRect(x - 2, y - 2, 4, 4);
        }
      }
    }
  }

  // Print data
  {
    clearDebug();

    for (const hand of hands) {
      printDebug(`${hand.handedness}:`);

      for (const { name, x, y } of hand.keypoints) {
        if (TARGET_KEYPOINTS.includes(name)) {
          printDebug(`${name} (${Math.round(x)}, ${Math.round(y)})`);
        }
      }
    }
  }
}