import Widget, { Transform, Vec2, defaultVec3 } from './Widget';
import './Pane.scss';

export interface Size {
  width: number
  height: number
}

const DEFAULT_SIZE: Size = {
  width: 300,
  height: 300
};

type Theme = 'light' | 'dark';

export default class Pane extends Widget {
  public constructor({ width, height }: Size = DEFAULT_SIZE) {
    super();

    this.$root.style.width = `${width}px`;
    this.$root.style.height = `${height}px`;
  }

  public get $frame(): HTMLDivElement {
    return this.root.querySelector<HTMLDivElement>('.w-pane--frame');
  }

  public append(element: HTMLElement): void {
    this.$frame.appendChild(element);
  }

  public onClick(fn: () => void): void {
    this.$frame.addEventListener('click', fn);
  }

  public theme(theme: Theme): this {
    this.$root.classList.add(theme);

    return this;
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
      z: origin.z + basePosition.z - offsetPosition.z
    };

    const toDegrees = 180 / Math.PI;
    const rX = rotation.x * toDegrees;
    const rY = rotation.y * toDegrees;
    const rZ = rotation.z * toDegrees;

    this.root.style.transform = `translate3d(${translation.x}px, ${translation.y}px, ${translation.z}px) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg)`;
    this.root.style.zIndex = `${Math.round(basePosition.z - offsetPosition.z)}`;
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