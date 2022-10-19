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

function rgb(r: number, g: number, b: number): Color {
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255
  };
}

function toRgb(color: Color): string {
  return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
}

function multiply(color: Color, factor: number): Color {
  return {
    r: color.r * factor,
    g: color.g * factor,
    b: color.b * factor
  };
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
    const radians = degrees * (Math.PI / 180);
    const scale = Math.pow(0.8 + Math.cos(radians) * 0.2, 2);
    const zIndex = Math.round(180 - Math.sin(radians / 2) * 180);

    this.element.style.left = `${50 + Math.sin(radians) * 50}%`;
    this.element.style.zIndex = `${zIndex}`;
    frame.style.transform = `rotate3d(0, 1, 0, ${degrees}deg) scale(${scale})`;
  }
}

export class PaneCarousel {
  private root = document.createElement('div');
  private panes: Pane[] = [];
  private rotation = 0;
  private currentIndex = 0;
  private nextAnimationFrame: number = null;

  public constructor(total: number, widthStyle: string) {
    for (let i = 0; i < total; i++) {
      const pane = new Pane(this.root, i);

      pane.onClick(() => this.focusByIndex(i));

      this.panes.push(pane);
    }

    this.root.classList.add('w-pane-carousel');
    this.root.style.width = widthStyle;

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

      this.rotation = clerp(this.rotation, this.targetRotation, 0.075);
      this.nextAnimationFrame = window.requestAnimationFrame(() => this.revolveToTargetRotation());
    }

    this.revolve(this.rotation);
  }
}

export class Particles {
  private root = document.createElement('div');
  private particles: HTMLDivElement[] = [];

  public constructor(total: number) {
    document.body.appendChild(this.root);

    for (let i = 0; i < total; i++) {
      this.createParticle();
    }

    this.updateParticles();
  }

  private createParticle(): void {
    const particle = document.createElement('div');

    particle.classList.add('w-particle');

    this.root.appendChild(particle);

    this.particles.push(particle);
  }

  private updateParticles(): void {
    const t = Date.now() / 1000;
    const baseColor = rgb(57, 176, 255);

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      const baseSize = 5 + Math.sin(i * 1.8) * 3;
      const speedFactor = 0.6 + 0.4 * (baseSize / 8);
      const ySpeed = (0.1 + Math.sin(i * 1.7) * 0.02) * speedFactor;

      const startX = 600 + Math.sin(i * 1.1) * 300;
      const startY = 300 + Math.cos(i * 2.3) * window.innerHeight;
      const x = startX + Math.sin(t + i * 1.3) * 30;
      const y = mod(startY - Date.now() * ySpeed, window.innerHeight);

      const heightRatio = y / window.innerHeight;
      const decay = 1 + heightRatio;
      const oscillation = 0.8 + Math.sin(i) * 0.2;
      const diameter = baseSize * decay * oscillation;
      const color = toRgb(multiply(baseColor, 0.5 + heightRatio * oscillation));

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${diameter}px`;
      particle.style.height = `${diameter}px`;
      particle.style.opacity = `${diameter / 5}`;
      particle.style.backgroundColor = `${color}`;
      particle.style.zIndex = `${Math.round(diameter)}`;
    }

    window.requestAnimationFrame(() => this.updateParticles());
  }
}