import Stage from './Stage';

export interface Transform {
  position?: Partial<Vec3>;
  rotation?: Partial<Vec3>;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 extends Vec2 {
  z: number;
}

export function createVec2(): Vec2 {
  return { x: 0, y: 0 };
}

export function createVec3(): Vec3 {
  return { x: 0, y: 0, z: 0 };
}

export function defaultVec3(vec3: Partial<Vec3>): Vec3 {
  return { x: 0, y: 0, z: 0, ...vec3 };
}

type CSSStyleDeclarationKeys = Exclude<keyof CSSStyleDeclaration, number | 'length' | 'parentRule'>;

type StyleProperties = Record<CSSStyleDeclarationKeys, string>;

export default abstract class Widget {
  public stage: Stage = null;
  public basePosition: Vec3 = createVec3();
  public offsetPosition: Vec3 = createVec3();
  public rotation: Vec3 = createVec3();
  public widgetName: string;

  protected root: HTMLDivElement = null;

  public constructor() {
    this.root = this.createRoot();

    this.init();
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public destroy(): void {}

  public getHeight(): number {
    return this.root?.clientHeight || 0;
  }

  public getWidth(): number {
    return this.root?.clientWidth || 0;
  }

  public name(name: string): this {
    this.widgetName = name;

    if (this.stage) {
      // If the widget has already been added to a Stage, store it
      this.stage.store(this, name);
    }

    return this;
  }

  public onAdded(): void {}

  public slideIntoView() {
    const halfWindowWidth = window.innerWidth / 2;
    const halfWindowHeight = window.innerHeight / 2;
    const halfRootWidth = (this.$root?.scrollWidth || 0) / 2;
    const halfRootHeight = (this.$root?.scrollHeight || 0) / 2;

    this.stage?.setTargetOrigin({
      x: -(this.basePosition.x + this.offsetPosition.x) + halfWindowWidth - halfRootWidth,
      y: -(this.basePosition.y + this.offsetPosition.y) + halfWindowHeight - halfRootHeight,
      z: -(this.basePosition.z + this.offsetPosition.z)
    });
  }

  public style(styles: Partial<StyleProperties>): this {
    if (this.root) {
      Object.keys(styles).forEach((key: CSSStyleDeclarationKeys) => {
        (this.root.style[key] as string) = styles[key];
      });
    }

    return this;
  }
  
  public transform(transform: Transform): this {
    this.offsetPosition = defaultVec3(transform.position);
    this.rotation = defaultVec3(transform.rotation);

    return this;
  }

  public abstract update(): void;

  protected init(): void {}

  protected abstract createRoot(): HTMLDivElement;
}