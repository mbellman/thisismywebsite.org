import './Pane.scss';

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