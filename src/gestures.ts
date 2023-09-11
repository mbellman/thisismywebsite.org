import { SupportedModels, createDetector, HandDetector, Hand } from '@tensorflow-models/hand-pose-detection';

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

export function drawHands(hands: Hand[], image: HTMLVideoElement) {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f00';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const hand of hands) {
    for (const { x, y } of hand.keypoints) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }
}