export default abstract class Widget {
  protected root: HTMLDivElement = null;

  public constructor() {
    this.root = this.createRoot();

    this.init();
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public appendTo(element: HTMLDivElement): void {
    element.appendChild(this.$root);
  }

  protected init(): void {}

  protected abstract createRoot(): HTMLDivElement;
}