import { lerp } from './utilities';

type AnimationFunction = (dt: number) => boolean | void;

interface TweenConfig {
  range: [number, number];
  duration: number;
  easing?: (n: number) => number;
}

export function animate(fn: AnimationFunction, start: number = Date.now()): void {
  const now = Date.now();
  const dt = (now - start) / 1000;

  if (fn(dt) !== false) {
    requestAnimationFrame(() => animate(fn, now));
  }
}

export function tween(config: TweenConfig, handler: (n: number) => void): Promise<void> {
  const [ start, end ] = config.range;

  const {
    duration,
    easing = t => t
  } = config;

  let runningTime = 0;

  return new Promise(resolve => {
    animate(dt => {
      if (runningTime >= duration) {
        handler(end);
        resolve();
  
        return false;
      }
  
      const t = easing(runningTime / duration);
  
      handler(lerp(start, end, t));
  
      runningTime += dt;
    });
  });
}