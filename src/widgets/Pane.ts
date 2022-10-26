import Widget from './Widget';
import './Pane.scss';

// @todo move elsewhere
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export default class Pane extends Widget {
  public onClick(fn: () => void): void {
    this.$frame.addEventListener('click', fn);
  }

  public update({ x, y, z }: Position3D, yAxisRotation: number): void {
    this.root.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${yAxisRotation * (180 / Math.PI)}deg)`;
    this.root.style.zIndex = `${500 + Math.round(z)}`;
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
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

  private get $frame(): HTMLDivElement {
    return this.root.querySelector<HTMLDivElement>('.w-pane--frame');
  }
}