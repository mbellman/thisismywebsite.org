import { SupportedModels, createDetector, HandDetector, Hand } from '@tensorflow-models/hand-pose-detection';
import { initializeDebugConsole, printDebug, updateDebugConsole } from './debug';
import { lerp } from './utilities';
import './gestures.scss';

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

type GestureEventHandler = (delta: Point) => void;

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

function magnitude({ x, y }: Point): number {
  return Math.sqrt(x*x + y*y);
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

function createDebugCanvas({
  width = 320,
  height = 240,
  top = 0,
  id = ''
} = {}) {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;
  canvas.style.position = 'absolute';
  canvas.style.top = `${top}px`;
  canvas.style.left = '0';
  canvas.style.opacity = '0.5';

  canvas.setAttribute('id', id);

  document.body.appendChild(canvas);
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

  public range(start: number, end: number = undefined): PointRecord[] {
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
  if (debug) {
    initializeDebugConsole();
  }

  const cursor = createGestureCursor();

  const events: Record<string, GestureEventHandler[]> = {
    swipeUp: [],
    swipeDown: [],
    swipeLeft: [],
    swipeRight: []
  };

  if (debug) {
    createDebugCanvas({
      width: 320,
      height: 240,
      top: 0,
      id: 'hands-canvas'
    });

    createDebugCanvas({
      width: 320,
      height: 80,
      top: 250,
      id: 'y-canvas'
    });

    createDebugCanvas({
      width: 320,
      height: 80,
      top: 340,
      id: 'x-canvas'
    });
  }

  let lastEmittedEventTime: number = 0;
  let lastEmittedEventName: string;
  let suppressedEventName: string;

  function maybeEmit(eventName: string, delta: Point) {
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
      handler(delta);
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
  const handCenterQueue = new PointRecordQueue(5);

  function addToFingerQueue({ keypoints }: Hand, fingerName: string, queue: PointRecordQueue) {
    const tip = keypoints.find(point => point.name === fingerName);

    queue.add({
      x: Math.round(tip.x),
      y: Math.round(tip.y),
      time: Date.now()
    });
  }

  function getLastMotionDelta(queue: PointRecordQueue): Point {
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

  function getAverageMotionDelta(queue: PointRecordQueue): Point {
    const path = queue.range(0);

    const averageDelta: Point = {
      x: 0,
      y: 0
    };

    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;

      averageDelta.x += dx;
      averageDelta.y += dy;
    }

    averageDelta.x /= (path.length - 1);
    averageDelta.y /= (path.length - 1);

    return {
      x: Math.round(averageDelta.x),
      y: Math.round(averageDelta.y)
    };
  }

  function handleSwipeGestures(hands: Hand[]) {
    if (hands.length === 0) {
      indexTipQueue.empty();
      handCenterQueue.empty();
    }

    if (hands.length === 1) {
      // Track index tip motion
      addToFingerQueue(hands[0], 'index_finger_tip', indexTipQueue);

      // Track general hand motion
      const handCenter: PointRecord = {
        x: 0,
        y: 0,
        time: Date.now()
      };

      for (const { x, y } of hands[0].keypoints) {
        handCenter.x += x;
        handCenter.y += y;
      }

      handCenter.x /= hands[0].keypoints.length;
      handCenter.y /= hands[0].keypoints.length;

      handCenterQueue.add(handCenter)
    }

    if (timeSince(indexTipQueue.get(-1)?.time) < 100) {
      const indexDelta = getLastMotionDelta(indexTipQueue);
      const handCenterMotion = getAverageMotionDelta(handCenterQueue);
      const indexMagnitude = magnitude(indexDelta);
      const handCenterMagnitude = magnitude(handCenterMotion);

      if (indexMagnitude > 15 && handCenterMagnitude < 3) {
        indexTipQueue.empty();
        handCenterQueue.empty();

        printDebug('Index: ' + indexMagnitude);
        printDebug('Hand: ' + handCenterMagnitude);

        if (Math.abs(indexDelta.x) > Math.abs(indexDelta.y)) {
          if (indexDelta.x < 0) {
            maybeEmit('swipeRight', indexDelta);
          }

          if (indexDelta.x > 0) {
            maybeEmit('swipeLeft', indexDelta);
          }
        } else {
          if (indexDelta.y < 0) {
            maybeEmit('swipeUp', indexDelta);
          }

          if (indexDelta.y > 0) {
            maybeEmit('swipeDown', indexDelta);
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

      handleGestureCursor(hands);
      handleSwipeGestures(hands);

      if (debug) {
        drawHands(document.getElementById('hands-canvas') as HTMLCanvasElement, hands);
        drawYVelocity(document.getElementById('y-canvas') as HTMLCanvasElement);
        drawXVelocity(document.getElementById('x-canvas') as HTMLCanvasElement);

        updateDebugConsole();
      }
    }
  };

  return analyzer;
}

function fillCanvasBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#00a';

  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHands(canvas: HTMLCanvasElement, hands: Hand[]) {
  const ctx = canvas.getContext('2d');

  fillCanvasBackground(canvas, ctx);

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

function drawYVelocity(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');

  fillCanvasBackground(canvas, ctx);
}

function drawXVelocity(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');

  fillCanvasBackground(canvas, ctx);
}