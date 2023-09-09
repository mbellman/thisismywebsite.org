import Widget from './Widget';
import { Vector3 } from './Pane';
import './Text3D.scss';

type CSSStyleDeclarationKeys = Exclude<keyof CSSStyleDeclaration, number | 'length' | 'parentRule'>;

type StyleProperties = Record<CSSStyleDeclarationKeys, string>;

interface Transform {
  position?: Partial<Vector3>;
  rotation?: Partial<Vector3>;
}

export default class Text3D extends Widget {
  public constructor(text: string) {
    super();

    this.root.innerHTML = text;
  }

  public setText(text: string): void {
    this.root.innerHTML = text;
  }

  public transform({ position = {}, rotation = {} }: Transform): void {
    // Set defaults
    position = { x: 0, y: 0, z: 0, ...position };
    rotation = { x: 0, y: 0, z: 0, ...rotation };

    const origin = { x: 0, y: 0, z: 0, ...this.stage.origin };

    const pageWidth = window.innerWidth;
    const halfWidth = this.$root.clientWidth / 2;
    const halfHeight = this.$root.clientHeight / 2;
    const yRotationDegrees = (rotation.y * 180 / Math.PI) % 360;

    const translation: Vector3 = {
      x: origin.x + this.basePosition.x + position.x + (pageWidth / 2) - halfWidth,
      y: origin.y + this.basePosition.y + position.y + window.innerHeight / 2 - halfHeight,
      z: origin.z + this.basePosition.z + position.z
    };

    this.root.style.transform = `translate3d(${translation.x}px, ${translation.y}px, ${translation.z}px) rotateY(${yRotationDegrees}deg)`;
    this.root.style.zIndex = `${500 + Math.round(translation.z)}`;
  }

  public setStyle(styles: Partial<StyleProperties>): void {
    Object.keys(styles).forEach((key: CSSStyleDeclarationKeys) => {
      (this.root.style[key] as string) = styles[key];
    });
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    const root = document.createElement('div');

    root.classList.add('w-text3d');

    return root;
  }
}