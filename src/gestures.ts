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

  public forEachReversed(handler: (record: PointRecord) => void) {
    for (let i = this.queue.length - 1; i >= 0; i--) {
      handler(this.queue[i]);
    }
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

  const cursorQueue = new PointRecordQueue(4);
  let dominantHandName: string;

  function getActiveHand(hands: Hand[]): Hand {
    switch (hands.length) {
      case 0:
        return null;
      case 1:
        dominantHandName = hands[0].handedness;

        return hands[0];
      case 2:
        return hands.find(hand => hand.handedness === dominantHandName) || hands[0];
    }
  }

  function handleGestureCursor(hands: Hand[]) {
    const hand = getActiveHand(hands);

    if (!hand) {
      cursor.element.style.opacity = '0';

      return;
    }

    const { keypoints3D } = hand;
    const pageWidth2 = window.innerWidth / 2;
    const pageHeight2 = window.innerHeight / 2;
    
    const indexBase = keypoints3D[5];
    const indexTip = keypoints3D[8];

    const v: Point3D = normalize({
      x: indexTip.x - indexBase.x,
      y: indexTip.y - indexBase.y,
      z: indexTip.z - indexBase.z
    });

    let bias =  1.5 - 0.5 * Math.abs(Math.abs(v.x) - Math.abs(v.y));
    if (bias < 1) bias = 1;

    v.x *= bias;
    v.y *= bias;

    const sx = (pageWidth2 - v.x * pageWidth2);
    const sy = (pageHeight2 + v.y * pageHeight2);

    const lastX = cursorQueue.get(-1)?.x || sx;
    const lastY = cursorQueue.get(-1)?.y || sy;

    const cx = (sx * 0.25 + (lastX || sx) * 1.75) / 2;
    const cy = (sy * 0.25 + (lastY || sy) * 1.75) / 2;

    cursor.position.x = Math.round(cx);
    cursor.position.y = Math.round(cy);

    cursor.element.style.opacity = '1';
    cursor.element.style.left = `${cursor.position.x}px`;
    cursor.element.style.top = `${cursor.position.y}px`;

    cursorQueue.add({
      x: cursor.position.x,
      y: cursor.position.y,
      time: Date.now()
    });

    printDebug(`${dominantHandName}: ${cursor.position.x}, ${cursor.position.y}`);
  }

  // @todo use finger index
  function addToFingerQueue({ keypoints }: Hand, fingerName: string, queue: PointRecordQueue) {
    const tip = keypoints.find(point => point.name === fingerName);
    const last = queue.get(-1);
    const wx = (tip.x * 0.25 + (last?.x || tip.x) * 1.75) / 2;
    const wy = (tip.y * 0.25 + (last?.y || tip.y) * 1.75) / 2;

    queue.add({
      x: Math.round(wx),
      y: Math.round(wy),
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

  const indexTipQueue = new PointRecordQueue(20);
  const palmCenterQueue = new PointRecordQueue(5);
  const deltaQueue = new PointRecordQueue(90);

  function handleSwipeGestures(hands: Hand[]) {
    const hand = getActiveHand(hands);

    if (!hand) {
      indexTipQueue.empty();
      palmCenterQueue.empty();

      deltaQueue.add({
        x: 0,
        y: 0,
        time: timeSince(deltaQueue.get(-1)?.time || Date.now())
      });
    } else {
      // Track index tip motion
      // @todo use finger index
      addToFingerQueue(hand, 'index_finger_tip', indexTipQueue);

      // Track x/y/time deltas
      const dx = indexTipQueue.get(-1).x - indexTipQueue.get(-2).x;
      const dy = indexTipQueue.get(-1).y - indexTipQueue.get(-2).y;
      const dt = indexTipQueue.get(-1).time - indexTipQueue.get(-2).time;

      deltaQueue.add({
        x: dx,
        y: dy,
        time: dt
      });

      // Track general hand motion
      const palmCenter: PointRecord = {
        x: 0,
        y: 0,
        time: Date.now()
      };

      const palmPoints = [
        hand.keypoints[0],
        hand.keypoints[5],
        hand.keypoints[9],
        hand.keypoints[13],
        hand.keypoints[17]
      ];

      for (const { x, y } of palmPoints) {
        palmCenter.x += x;
        palmCenter.y += y;
      }

      palmCenter.x /= palmPoints.length;
      palmCenter.y /= palmPoints.length;

      palmCenterQueue.add(palmCenter)
    }

    if (timeSince(indexTipQueue.get(-1)?.time) < 100) {
      const indexDelta = getLastMotionDelta(indexTipQueue);
      const palmCenterMotion = getAverageMotionDelta(palmCenterQueue);
      const indexMagnitude = magnitude(indexDelta);
      const palmCenterMagnitude = magnitude(palmCenterMotion);

      if (indexMagnitude > 15 && palmCenterMagnitude < 2) {
        // indexTipQueue.empty();
        palmCenterQueue.empty();

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
        const mainCanvas = document.getElementById('hands-canvas') as HTMLCanvasElement
        drawHands(mainCanvas, hands);
        drawPath(mainCanvas, indexTipQueue);
        drawDeltas(deltaQueue);

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

function drawPath(canvas: HTMLCanvasElement, path: PointRecordQueue) {
  const ctx = canvas.getContext('2d');

  ctx.strokeStyle = '#f0f';
  ctx.lineWidth = 2;

  ctx.beginPath();

  path.forEach(record => {
    ctx.lineTo(record.x, record.y);
  });

  ctx.stroke();
}

function drawDeltas(queue: PointRecordQueue) {
  const xCanvas = document.getElementById('x-canvas') as HTMLCanvasElement;
  const yCanvas = document.getElementById('y-canvas') as HTMLCanvasElement;
  const xCtx = xCanvas.getContext('2d');
  const yCtx = yCanvas.getContext('2d');
  const midpoint = xCanvas.height / 2;

  fillCanvasBackground(xCanvas, xCtx);
  fillCanvasBackground(yCanvas, yCtx);

  {
    xCtx.strokeStyle = '#ff0';
    xCtx.lineWidth = 1;

    xCtx.beginPath();
    xCtx.lineTo(0, midpoint + 15);
    xCtx.lineTo(yCanvas.width, midpoint + 15);
    xCtx.stroke();
  
    xCtx.beginPath();
    xCtx.lineTo(0, midpoint - 15);
    xCtx.lineTo(yCanvas.width, midpoint - 15);
    xCtx.stroke();
  }

  {
    yCtx.strokeStyle = '#ff0';
    yCtx.lineWidth = 1;

    yCtx.beginPath();
    yCtx.lineTo(0, midpoint + 15);
    yCtx.lineTo(yCanvas.width, midpoint + 15);
    yCtx.stroke();
  
    yCtx.beginPath();
    yCtx.lineTo(0, midpoint - 15);
    yCtx.lineTo(yCanvas.width, midpoint - 15);
    yCtx.stroke();
  }

  let x = xCanvas.width - 2;

  xCtx.strokeStyle = '#f00';
  xCtx.lineWidth = 2;

  yCtx.strokeStyle = '#f00';
  yCtx.lineWidth = 2;

  xCtx.beginPath();
  yCtx.beginPath();

  queue.forEachReversed(record => {
    xCtx.lineTo(x, midpoint + record.x);
    yCtx.lineTo(x, midpoint + record.y);

    x -= 4;
  });

  xCtx.stroke();
  yCtx.stroke();
}