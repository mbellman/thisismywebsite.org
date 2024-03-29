import { DragManager } from '../dragging';
import { clamp } from '../utilities';
import Pane from './Pane';
import Widget, { Vec2, createVec2, defaultVec3 } from './Widget';

const EDGE_MARGIN = 10;

interface ScrollbarConfig {
  range?: Partial<Vec2>;
}

// @todo support horizontal scrollbars
// @todo depth scrolling?
export default class Scrollbar extends Widget {
  private bar: Pane = null;
  private drag = new DragManager();
  private range = createVec2();

  constructor({ range }: ScrollbarConfig = {}) {
    super();

    this.range = {
      x: range?.x || 0,
      y: range?.y || 0
    };
  }

  /**
   * @override
   */
  public destroy(): void {
    this.drag.removeDocumentEventListeners();    
  }

  /**
   * @override
   */
  public onAdded(): void {
    this.bar = new Pane({ width: 20, height: 300 })
      .transform({ position: { x: -40, y: 20 } });

    this.stage.add(this.bar);

    // @todo apply x range
    this.stage.yRange = { start: 0, end: this.range.y };
    // @todo apply z range

    let startBarY: number;

    this.drag.bindDragStart(this.bar.$root, e => {
      startBarY = this.bar.offsetPosition.y;
    });

    this.drag.bindStaticDragEvents({
      onDrag: e => {
        const totalDelta: Vec2 = {
          x: e.clientX - this.drag.start.x,
          y: e.clientY - this.drag.start.y
        };

        const targetBarY = clamp(startBarY + totalDelta.y, EDGE_MARGIN, window.innerHeight - 300 - 2 * EDGE_MARGIN);
        const yRangeRatio = (targetBarY - EDGE_MARGIN) / (window.innerHeight - 300 - 2 * EDGE_MARGIN);

        this.stage.setTargetOrigin({
          x: this.stage.origin.x,
          y: this.range.y * yRangeRatio,
          z: this.stage.origin.z
        });
      },
      onDragEnd: (e, delta) => {
        // ...
      }
    });
  }

  /**
   * @override
   */
  public update(): void {
    // Keep the scroll bar fixed to the window area
    this.bar.basePosition.x = this.stage.origin.x + window.innerWidth;
    this.bar.basePosition.y = this.stage.origin.y;

    // Position the bar above other elements
    // @todo force the z-index instead?
    this.bar.basePosition.z = -this.stage.origin.z + 10;

    this.bar.offsetPosition.y = (window.innerHeight - 300 - EDGE_MARGIN) * (this.stage.origin.y / this.range.y) + EDGE_MARGIN;
  }

  protected createRoot(): HTMLDivElement {
    return null;
  }
}