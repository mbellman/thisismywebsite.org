import Pane from './Pane';
import Widget, { Vec3 } from './Widget';

export default class PaneSlider extends Widget {
  private panes: Pane[] = [];

  public addPane(pane: Pane): void {
    this.bindPaneEvents(pane, this.panes.length);

    this.panes.push(pane);
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
    const halfWindowWidth = window.innerWidth / 2;
    const halfWindowHeight = window.innerHeight / 2;

    const root: Vec3 = {
      x: this.basePosition.x + this.offsetPosition.x + halfWindowWidth,
      y: this.basePosition.y + this.offsetPosition.y + halfWindowHeight,
      z: this.basePosition.z + this.offsetPosition.z
    };

    for (let i = 0; i < this.panes.length; i++) {
      const pane = this.panes[i];
      const halfPaneWidth = pane.$root.clientWidth / 2;
      const halfPaneHeight = pane.$root.clientHeight / 2;

      // @todo make configurable
      const offsetX = i * 500;

      const position = {
        x: root.x + offsetX - halfPaneWidth,
        y: root.y - halfPaneHeight,
        z: root.z
      };

      pane.transform({ position });
    }
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    return null;
  }

  private bindPaneEvents(pane: Pane, index: number): void {
    pane.$frame.addEventListener('click', () => {
      this.focusByIndex(index);
    });

    pane.$frame.addEventListener('mousedown', (e) => {
      // this.dragging = true;
      // this.dragStartX = e.clientX;
      // this.dragStartRotation = this.rotationAngle;

      e.preventDefault();
      e.stopPropagation();
    });
  }

  private focusByIndex(index: number): void {
    const pane = this.panes[index];

    pane.slideIntoView();
  }
}