import Widget, { Vec3, defaultVec3 } from './Widget';
import './Text3D.scss';

type CSSStyleDeclarationKeys = Exclude<keyof CSSStyleDeclaration, number | 'length' | 'parentRule'>;

type StyleProperties = Record<CSSStyleDeclarationKeys, string>;

interface Text3DConfig {
  centered?: boolean
}

export default class Text3D extends Widget {
  private centered = true;

  public constructor(text: string, { centered = false }: Text3DConfig = {}) {
    super();

    this.centered = centered;
    this.root.innerHTML = text;
  }

  public setText(text: string): void {
    this.root.innerHTML = text;
  }

  /**
   * @override
   */
  public update(): void {
    const { basePosition, offsetPosition, rotation } = this;
    const origin = defaultVec3(this.stage.origin);
    const centeringFactor = this.centered ? 1 : 0;

    // @todo handle x/z rotation
    const yRotationDegrees = (rotation.y * 180 / Math.PI) % 360;

    const translation: Vec3 = {
      x: origin.x + basePosition.x + offsetPosition.x + (window.innerWidth / 2 - this.$root.clientWidth / 2) * centeringFactor,
      y: origin.y + basePosition.y + offsetPosition.y + (window.innerHeight / 2 - this.$root.clientHeight / 2) * centeringFactor,
      z: origin.z + basePosition.z - offsetPosition.z
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