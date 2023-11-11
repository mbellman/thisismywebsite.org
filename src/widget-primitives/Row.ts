import Widget from './Widget';

export default class Row extends Widget {
  public widgets: Widget[] = [];

  public constructor(...widgets: Widget[]) {
    super();

    this.widgets = widgets;
  }

  /**
   * @override
   */
  public getHeight(): number {
    return Math.max(...this.widgets.map(widget => widget.getHeight()));
  }

  public onAdded(): void {
    let runningOffsetX = 0;

    this.widgets.forEach(widget => {
      widget.basePosition = { ...this.basePosition };
      widget.basePosition.x += runningOffsetX;

      this.stage.add(widget, widget.basePosition);

      runningOffsetX += widget.getWidth();
    });
  }

  /**
   * @override
   */
  public update(): void {}

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    return null;
  }
}