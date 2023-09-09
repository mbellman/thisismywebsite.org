import { Vector3 } from './Pane';
import Stage from './Stage';

export default abstract class Widget {
  public stage: Stage = null;

  public basePosition: Vector3 = {
    x: 0,
    y: 0,
    z: 0
  };

  protected root: HTMLDivElement = null;

  public constructor() {
    this.root = this.createRoot();

    this.init();
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  protected init(): void {}

  protected abstract createRoot(): HTMLDivElement;
}