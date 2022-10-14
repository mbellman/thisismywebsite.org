import './ui.scss';

interface Color {
  r: number;
  g: number;
  b: number;
}

function createPaneRoot(): HTMLDivElement {
  const pane = document.createElement('div');
  const frame = document.createElement('div');
  const shimmer = document.createElement('div');

  pane.classList.add('w-pane');
  frame.classList.add('w-pane--frame');
  shimmer.classList.add('w-pane--shimmer');

  pane.appendChild(frame);
  frame.appendChild(shimmer);

  return pane;
}

function lerp(a: number, b: number, alpha: number): number {
  return a + (b - a) * alpha;
}

function clerp(a: number, b: number, alpha: number): number {
  const range = b - a;

  if (range > 180) {
    a += 360;
  } else if (range < -180) {
    a -= 360;
  }

  return lerp(a, b, alpha);
}

function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function colorToRgb({ r, g, b }: Color): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export class Pane {
  private element = createPaneRoot();

  public constructor(root: Element, index: number) {
    root.appendChild(this.element);
  }

  public onClick(fn: () => void): void {
    this.element.querySelector('.w-pane--frame').addEventListener('click', fn);
  }

  public revolve(degrees: number): void {
    degrees %= 360;

    const frame = this.element.querySelector<HTMLDivElement>('.w-pane--frame');
    const shimmer = this.element.querySelector<HTMLDivElement>('.w-pane--shimmer');

    const radians = degrees * (Math.PI / 180);
    const scale = Math.pow(0.8 + Math.cos(radians) * 0.2, 2);
    const zIndex = Math.round(180 - Math.sin(radians / 2) * 180);

    this.element.style.left = `${50 + Math.sin(radians) * 50}%`;
    this.element.style.zIndex = `${zIndex}`;

    const sunAngle = 60;
    const sunAngleDelta = Math.abs(degrees - sunAngle);
    const sunAngleDeltaInRadians = degreesToRadians(sunAngleDelta);
    const sunFactor = Math.pow(Math.cos(sunAngleDeltaInRadians), 5) * 0.5;

    frame.style.transform = `rotate3d(0, 1, 0, ${degrees}deg) scale(${scale})`;
    // shimmer.style.opacity = String(sunFactor);
  }
}

export class PaneCarousel {
  private root = document.createElement('div');
  private panes: Pane[] = [];
  private rotation = 0;
  private currentIndex = 0;
  private nextAnimationFrame: number = null;

  public constructor(total: number, width: number) {
    for (let i = 0; i < total; i++) {
      const pane = new Pane(this.root, i);

      pane.onClick(() => this.focusByIndex(i));

      this.panes.push(pane);
    }

    this.root.classList.add('w-pane-carousel');
    this.root.style.width = `${width}px`;

    document.body.appendChild(this.root);

    this.revolve(0);
  }

  public focusByIndex(index: number): void {
    this.currentIndex = mod(index, this.panes.length);

    this.revolveToTargetRotation();
  }

  private get targetRotation(): number {
    return 360 - (this.currentIndex / this.panes.length) * 360;
  }

  private revolve(degrees: number): void {
    const total = this.panes.length;

    for (let i = 0; i < total; i++) {
      const rotation = (i / total) * 360 + degrees;

      this.panes[i].revolve(rotation);
    }
  }

  private revolveToTargetRotation(): void {
    if (Math.abs(this.rotation - this.targetRotation) < 0.1) {
      this.rotation = this.targetRotation;
    } else {
      window.cancelAnimationFrame(this.nextAnimationFrame);

      this.rotation = clerp(this.rotation, this.targetRotation, 0.1);
      this.nextAnimationFrame = window.requestAnimationFrame(() => this.revolveToTargetRotation());
    }

    this.revolve(this.rotation);
  }
}