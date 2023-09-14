import { SupportedModels, createDetector, HandDetector, Hand } from '@tensorflow-models/hand-pose-detection';
import './gestures.scss';
import { lerp } from './utilities';

let debugOutput: HTMLElement = null;

type Point = {
  x: number;
  y: number;
};

type Point3D = Point & {
  z: number;
};

type PointRecord = Point & {
  time: number;
};

type GestureEventHandler = () => void;

export type GestureAnalyzer = {
  on: (eventName: string, handler: GestureEventHandler) => void;
  off: (eventName: string, handler: GestureEventHandler) => void;
  analyze: (image: HTMLVideoElement) => void;
};

type GestureCursor = {
  element: HTMLElement;
  position: Point;
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

function normalize({ x, y, z }: Point3D): Point3D {
  const magnitude = Math.sqrt(x*x + y*y + z*z);

  return {
    x: x / magnitude,
    y: y / magnitude,
    z: z / magnitude
  };
}

function createGestureCursor(): GestureCursor {
  const cursor = document.createElement('div');

  cursor.classList.add('gesture-cursor');
  document.body.appendChild(cursor);

  return {
    element: cursor,
    position: { x: 0, y: 0 }
  };
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

  public empty() {
    this.queue.length = 0;
  }

  public forEach(handler: (record: PointRecord) => void) {
    this.queue.forEach(handler);
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

  public range(start: number, end: number): PointRecord[] {
    return this.queue.slice(start, end);
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

export function createGestureAnalyzer(detector: HandDetector, {
  debug = false
} = {}): GestureAnalyzer {
  const cursor = createGestureCursor();

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
      canvas.style.left = '0';
      canvas.style.opacity = '0.5';
    
      canvas.setAttribute('id', 'canvas');
    
      document.body.appendChild(canvas);
    }

    {
      debugOutput = document.createElement('div');

      debugOutput.style.width = '320px';
      debugOutput.style.position = 'absolute';
      debugOutput.style.top = '240px';
      debugOutput.style.left = '0';
      debugOutput.style.fontWeight = 'bold';
      debugOutput.style.color = '#fff';
      debugOutput.style.zIndex = '10';

      debugOutput.setAttribute('id', 'debugOutput');
  
      document.body.appendChild(debugOutput);
    }
  }

  let lastEmittedEventTime: number = 0;
  let lastEmittedEventName: string;
  let suppressedEventName: string;

  function maybeEmit(eventName: string) {
    if (timeSince(lastEmittedEventTime) < 150) {
      return;
    }

    if (timeSince(lastEmittedEventTime) < 300 && eventName !== lastEmittedEventName) {
      return;
    }

    if (eventName === suppressedEventName && timeSince(lastEmittedEventTime) < 500) {
      return;
    }

    lastEmittedEventName = eventName;
    lastEmittedEventTime = Date.now();

    if (eventName === 'swipeLeft') suppressedEventName = 'swipeRight';
    if (eventName === 'swipeRight') suppressedEventName = 'swipeLeft';
    if (eventName === 'swipeUp') suppressedEventName = 'swipeDown';
    if (eventName === 'swipeDown') suppressedEventName = 'swipeUp';

    for (const handler of events[eventName]) {
      handler();
    }
  }

  function handleGestureCursor(hands: Hand[]) {
    if (hands.length !== 1) {
      cursor.element.style.opacity = '0';

      return;
    }

    const pageWidth2 = window.innerWidth / 2;
    const pageHeight2 = window.innerHeight / 2;
    const { keypoints3D } = hands[0];
    
    const indexFinger = [
      keypoints3D.find(point => point.name === 'index_finger_mcp'),
      keypoints3D.find(point => point.name === 'index_finger_tip')
    ];

    const v: Point3D = normalize({
      x: indexFinger.at(-1).x - indexFinger[0].x,
      y: indexFinger.at(-1).y - indexFinger[0].y,
      z: indexFinger.at(-1).z - indexFinger[0].z
    });

    if (v.z > 0) {
      cursor.element.style.opacity = '0';

      return;
    }

    cursor.position.x = lerp(cursor.position.x, pageWidth2 - pageWidth2 * v.x, 0.5);
    cursor.position.y = lerp(cursor.position.y, pageHeight2 + pageHeight2 * v.y, 0.5);

    cursor.element.style.opacity = '1';
    cursor.element.style.left = `${cursor.position.x}px`;
    cursor.element.style.top = `${cursor.position.y}px`;
  }

  const indexTipQueue = new PointRecordQueue(5);
  const middleTipQueue = new PointRecordQueue(5);
  const ringTipQueue = new PointRecordQueue(5);

  function addToFingerQueue({ keypoints }: Hand, fingerName: string, queue: PointRecordQueue) {
    const tip = keypoints.find(point => point.name === fingerName);

    queue.add({
      x: Math.round(tip.x),
      y: Math.round(tip.y),
      time: Date.now()
    });
  }

  function getFingerMovementDelta(queue: PointRecordQueue): Point {
    const path = queue.range(0, -1);

    const averagePosition: Point = {
      x: 0,
      y: 0
    };

    for (const { x, y } of path) {
      averagePosition.x += x;
      averagePosition.y += y;
    }

    averagePosition.x /= path.length;
    averagePosition.y /= path.length;

    const last = queue.get(-1);
    const dx = Math.round(last.x - averagePosition.x);
    const dy = Math.round(last.y - averagePosition.y);

    return {
      x: dx,
      y: dy
    };
  }

  function handleSwipeGestures(hands: Hand[]) {
    if (hands.length === 0) {
      indexTipQueue.empty();
    }

    if (hands.length === 1) {
      addToFingerQueue(hands[0], 'index_finger_tip', indexTipQueue);
      addToFingerQueue(hands[0], 'middle_finger_tip', middleTipQueue);
      addToFingerQueue(hands[0], 'ring_finger_tip', ringTipQueue);
    }

    if (timeSince(indexTipQueue.get(-1)?.time) < 100) {
      const indexDelta = getFingerMovementDelta(indexTipQueue);
      const indexMagnitude = Math.sqrt(indexDelta.x*indexDelta.x + indexDelta.y*indexDelta.y);

      if (indexMagnitude > 20) {
        indexTipQueue.empty();

        if (Math.abs(indexDelta.x) > Math.abs(indexDelta.y)) {
          if (indexDelta.x < 0) {
            maybeEmit('swipeRight');
          }

          if (indexDelta.x > 0) {
            maybeEmit('swipeLeft');
          }
        } else {
          if (indexDelta.y < 0) {
            maybeEmit('swipeUp');
          }

          if (indexDelta.y > 0) {
            maybeEmit('swipeDown');
          }
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
        clearDebug();
        drawHands(document.getElementById('canvas') as HTMLCanvasElement, hands);
      }

      handleGestureCursor(hands);
      handleSwipeGestures(hands);
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

export function drawHands(canvas: HTMLCanvasElement, hands: Hand[]) {
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