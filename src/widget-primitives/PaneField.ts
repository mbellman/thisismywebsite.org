import Pane from './Pane';
import Widget from './Widget';
import { DragManager } from '../dragging';

export default class PaneField extends Widget {
  private panes: Pane[] = [];
  private drag = new DragManager();

  public addPane(pane: Pane): this {
    this.bindPaneEvents(pane, this.panes.length);

    this.panes.push(pane);

    return this;
  }

  /**
   * @override
   */
  public onAdded(): void {
    this.panes.forEach(pane => this.stage.add(pane));
  }

  /**
   * @override
   */
  public update(): void {
    // @todo
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    return null;
  }

  private bindPaneEvents(pane: Pane, index: number): void {
    // @todo
  }

  private bindStaticEvents(): void {
    this.drag.bindStaticDragEvents({
      onDrag: (e) => {
        // @todo
      },
      onDragEnd: (e, delta) => {
        // @todo
      }
    });
  }
}