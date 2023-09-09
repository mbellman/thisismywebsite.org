import Stage from './Stage';

export default abstract class Widget {
  public stage: Stage = null;
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