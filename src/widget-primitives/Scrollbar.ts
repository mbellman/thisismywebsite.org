import { DragManager } from '../dragging';
import Pane from './Pane';
import Widget, { Vec2, createVec2, defaultVec3 } from './Widget';

interface ScrollbarConfig {
  range?: Partial<Vec2>;
}

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

  public update(): void {
    this.bar.basePosition.x = -this.stage.origin.x + window.innerWidth;
    this.bar.basePosition.y = -this.stage.origin.y;
    this.bar.basePosition.z = -this.stage.origin.z + 10;

    this.bar.offsetPosition.y = (window.innerHeight - 300) * (-this.stage.origin.y / this.range.y);
  }

  public onAdded(): void {
    this.bar = new Pane({ width: 20, height: 300 })
      .transform({ position: { x: -40, y: 20 } });

    this.stage.add(this.bar);

    this.drag.bindDragStart(this.bar.$root, e => {
      // ...
    });

    this.drag.bindStaticDragEvents({
      onDrag: (e, delta) => {
        this.stage.moveTargetOrigin({
          // @todo track total delta and set the target origin accordingly
          y: -delta.y * 5
        });
      },
      onDragEnd: (e, delta) => {
        // ...
      }
    });
  }

  protected createRoot(): HTMLDivElement {
    return null;
  }
}