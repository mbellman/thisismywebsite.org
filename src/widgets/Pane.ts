import './Pane.scss';

// @todo move elsewhere
export interface Position3d {
  x: number;
  y: number;
  z: number;
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

export default class Pane {
  private element = createPaneRoot();

  public get $root(): Readonly<HTMLDivElement> {
    return this.element;
  }

  public onClick(fn: () => void): void {
    this.$frame.addEventListener('click', fn);
  }

  public update({ x, y, z }: Position3d, yAxisRotation: number): void {
    this.element.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${yAxisRotation * (180 / Math.PI)}deg)`;
    this.element.style.zIndex = `${500 + Math.round(z)}`;
  }

  private get $frame(): HTMLDivElement {
    return this.element.querySelector<HTMLDivElement>('.w-pane--frame');
  }
}