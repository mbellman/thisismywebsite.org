import { SupportedModels, createDetector, HandDetector, Hand } from '@tensorflow-models/hand-pose-detection';

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
      const readout = document.createElement('div');

      readout.style.width = '320px';
      readout.style.position = 'absolute';
      readout.style.top = '240px';
      readout.style.right = '0';
      readout.style.color = '#fff';

      readout.setAttribute('id', 'readout');
  
      document.body.appendChild(readout);
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

      // @todo
    }
  };

  return analyzer;
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
    const readout = document.getElementById('readout');

    readout.innerHTML = '';

    for (const hand of hands) {
      readout.innerHTML += `${hand.handedness}:<br />`;

      for (const { name, x, y } of hand.keypoints) {
        readout.innerHTML += `${name} (${Math.round(x)}, ${Math.round(y)})<br />`;
      }
    }
  }
}