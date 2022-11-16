export default abstract class Widget {
  protected root: HTMLDivElement = null;

  public constructor() {
    this.root = this.createRoot();
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public appendTo(element: HTMLDivElement): void {
    element.appendChild(this.$root);
  }

  protected abstract createRoot(): HTMLDivElement;
}