import './ui.scss';

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

function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

export class Pane {
  private element = createPaneRoot();

  public constructor(root: Element) {
    root.appendChild(this.element);
  }

  public revolve(degrees: number): void {
    degrees %= 360;

    const frame = this.element.querySelector<HTMLDivElement>('.w-pane--frame');
    const shimmer = this.element.querySelector<HTMLDivElement>('.w-pane--shimmer');

    const radians = degrees * (Math.PI / 180);
    const scale = 0.75 + Math.cos(radians) * 0.25;
    const zIndex = Math.round(180 - Math.sin(radians / 2) * 180);

    this.element.style.left = `${50 + Math.sin(radians) * 50}%`;
    this.element.style.zIndex = `${zIndex}`;

    frame.style.transform = `rotate3d(0, 1, 0, ${degrees}deg) scale(${scale})`;
    shimmer.style.marginTop = `${-1000 + degrees * 20}px`;
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
      const pane = new Pane(this.root);

      this.panes.push(pane);
    }

    this.root.classList.add('w-pane-carousel');
    this.root.style.width = `${width}px`;

    document.body.appendChild(this.root);

    this.revolve(0);
  }

  public focusByIndex(index: number): void {
    this.currentIndex = mod(index, this.panes.length);

    console.log(this.currentIndex);

    this.revolveToTargetRotation();
  }

  private get targetRotation(): number {
    return (this.currentIndex / this.panes.length) * 360;
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

      this.rotation = lerp(this.rotation, this.targetRotation, 0.1);
      this.nextAnimationFrame = window.requestAnimationFrame(() => this.revolveToTargetRotation());
    }

    this.revolve(this.rotation)
  }
}