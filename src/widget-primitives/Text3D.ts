import Widget, { Vec3, defaultVec3 } from './Widget';
import './Text3D.scss';

type CSSStyleDeclarationKeys = Exclude<keyof CSSStyleDeclaration, number | 'length' | 'parentRule'>;

type StyleProperties = Record<CSSStyleDeclarationKeys, string>;

export default class Text3D extends Widget {
  public constructor(text: string) {
    super();

    this.root.innerHTML = text;
  }

  public setText(text: string): void {
    this.root.innerHTML = text;
  }

  public setStyle(styles: Partial<StyleProperties>): void {
    Object.keys(styles).forEach((key: CSSStyleDeclarationKeys) => {
      (this.root.style[key] as string) = styles[key];
    });
  }

  /**
   * @override
   */
  public update(): void {
    const { basePosition, offsetPosition, rotation } = this;
    const origin = defaultVec3(this.stage.origin);

    // @todo handle x/z rotation
    const yRotationDegrees = (rotation.y * 180 / Math.PI) % 360;

    const translation: Vec3 = {
      x: origin.x + basePosition.x + offsetPosition.x + window.innerWidth / 2 - this.$root.clientWidth / 2,
      y: origin.y + basePosition.y + offsetPosition.y + window.innerHeight / 2 - this.$root.clientHeight / 2,
      z: origin.z + basePosition.z + offsetPosition.z
    };

    // @todo handle x/z rotation
    this.root.style.transform = `translate3d(${translation.x}px, ${translation.y}px, ${translation.z}px) rotateY(${yRotationDegrees}deg)`;
    this.root.style.zIndex = `${500 + Math.round(translation.z)}`;
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