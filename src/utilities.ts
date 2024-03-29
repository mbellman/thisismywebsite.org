// @todo move this file into panes

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

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function wrap(a: number, min: number, max: number): number {
  return mod((a - min), (max - min)) + min;
}

export function distance(a: number, b: number): number {
  return Math.abs(a - b);
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