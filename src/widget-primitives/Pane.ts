import Widget from './Widget';
import './Pane.scss';

// @todo move elsewhere
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export default class Pane extends Widget {
  public append(element: HTMLElement): void {
    this.$frame.appendChild(element);
  }

  public onClick(fn: () => void): void {
    this.$frame.addEventListener('click', fn);
  }

  public update({ x, y, z }: Vector3, rotation: Vector3): void {
    const origin = { x: 0, y: 0, z: 0, ...this.stage.origin };

    const translation = {
      x: x + origin.x,
      y: y + origin.y,
      z: z + origin.z
    };

    const rX = rotation.x * (180 / Math.PI);
    const rY = rotation.y * (180 / Math.PI);
    const rZ = rotation.z * (180 / Math.PI);

    this.root.style.transform = `translate3d(${translation.x}px, ${translation.y}px, ${translation.z}px) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg)`;
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