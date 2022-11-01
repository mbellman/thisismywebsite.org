interface Color {
  r: number;
  g: number;
  b: number;
}

export function lerp(a: number, b: number, alpha: number): number {
  return a + (b - a) * alpha;
}

export function clerp(a: number, b: number, alpha: number): number {
  const range = b - a;

  if (range > 180) {
    a += 360;
  } else if (range < -180) {
    a -= 360;
  }

  return lerp(a, b, alpha);
}

export function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

export function rgb(r: number, g: number, b: number): Color {
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255
  };
}

export function toRgb(color: Color): string {
  return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
}

export function multiply(color: Color, factor: number): Color {
  return {
    r: color.r * factor,
    g: color.g * factor,
    b: color.b * factor
  };
}

type AnimationFunction = (dt: number) => boolean | void;

export function animate(fn: AnimationFunction, start: number = Date.now()): void {
  const now = Date.now();
  const dt = (now - start) / 1000;

  if (fn(dt) !== false) {
    requestAnimationFrame(() => animate(fn, now));
  }
}

export function debounce<T extends any, R extends any[]>(fn: (...args: R) => T, timeout: number): (...args: R) => T {
  let lastCallTime = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastCallTime > timeout) {
      lastCallTime = now;
      return fn(...args);
    }
  };
}