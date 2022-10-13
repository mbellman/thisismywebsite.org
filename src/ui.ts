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

  public constructor(total: number, width: number) {
    for (let i = 0; i < total; i++) {
      const pane = new Pane(this.root);
      const rotation = (i / total) * 360;

      pane.revolve(rotation);

      this.panes.push(pane);
    }

    this.root.classList.add('w-pane-carousel');
    this.root.style.width = `${width}px`;

    document.body.appendChild(this.root);
  }

  public focusByIndex(index: number): void {

  }

  public revolve(degrees: number): void {
    const total = this.panes.length;

    for (let i = 0; i < total; i++) {
      const rotation = (i / total) * 360 + degrees;

      this.panes[i].revolve(rotation);
    }
  }
}