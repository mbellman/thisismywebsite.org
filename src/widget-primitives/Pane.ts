import Widget, { Transform, defaultVec3 } from './Widget';
import './Pane.scss';

export default class Pane extends Widget {
  public get $frame(): HTMLDivElement {
    return this.root.querySelector<HTMLDivElement>('.w-pane--frame');
  }

  public append(element: HTMLElement): void {
    this.$frame.appendChild(element);
  }

  public onClick(fn: () => void): void {
    this.$frame.addEventListener('click', fn);
  }

  /**
   * @override
   */
  public update(): void {
    const { basePosition, offsetPosition, rotation } = this;
    const origin = defaultVec3(this.stage.origin);

    const translation = {
      x: origin.x + basePosition.x + offsetPosition.x,
      y: origin.y + basePosition.y + offsetPosition.y,
      z: origin.z + basePosition.z + offsetPosition.z
    };

    const rX = rotation.x * (180 / Math.PI);
    const rY = rotation.y * (180 / Math.PI);
    const rZ = rotation.z * (180 / Math.PI);

    this.root.style.transform = `translate3d(${translation.x}px, ${translation.y}px, ${translation.z}px) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg)`;
    this.root.style.zIndex = `${500 + Math.round(basePosition.z + offsetPosition.z)}`;
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
}