import Widget, { Vec2, Vec3, createVec3, defaultVec3 } from './Widget';
import { lerp } from '../utilities';
import { DragManager } from '../dragging';
import './Stage.scss';

interface StageOptions {
  scrollableX?: boolean
  scrollableY?: boolean
  draggableX?: boolean
  draggableY?: boolean
}

export default class Stage {
  private widgets: Widget[] = [];
  private widgetMap: Record<string, Widget> = {};
  private targetOrigin: Vec3 = createVec3();
  private root = document.createElement('div');
  private drag = new DragManager();
  private isNextScrollActionSuppressed = false;

  public origin = createVec3();

  public constructor({
    scrollableX = true,
    scrollableY = true,
    draggableX = false,
    draggableY = false
  }: StageOptions = {}) {
    this.root.classList.add('w-stage');

    document.body.appendChild(this.root);

    if (scrollableX || scrollableY) {
      this.enableScrollableBehavior(scrollableX, scrollableY);
    }

    if (draggableX || draggableY) {
      this.enableDraggableBehavior(draggableX, draggableY);
    }
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public get height(): number {
    return this.$root.clientHeight;
  }

  public get width(): number {
    return this.$root.clientWidth;
  }

  public add<W extends Widget>(widget: W, position: Partial<Vec3> = {}): W {
    if (widget.$root) {
      this.root.appendChild(widget.$root);
    }

    widget.stage = this;
    widget.basePosition = defaultVec3(position);

    this.widgets.push(widget);

    widget.onAdded();

    if (widget.widgetName) {
      // If the widget has a custom name, store it
      this.store(widget, widget.widgetName);
    }

    return widget;
  }

  public addGroup<W extends Widget[]>(position: Partial<Vec3> = {}, ...widgets: W) {
    let runningPosition = { ...position };

    for (const widget of widgets) {
      this.add(widget, runningPosition);

      runningPosition.y += widget.getHeight() + widget.offsetPosition.y;
    }
  }

  public find<T extends Widget = Widget>(name: string): T {
    return this.widgetMap[name] as T || null;
  }

  public moveTargetOrigin(move: Partial<Vec3> = {}) {
    this.targetOrigin.x += move.x || 0;
    this.targetOrigin.y += move.y || 0;
    this.targetOrigin.z += move.z || 0;
  }

  public setTargetOrigin(target: Partial<Vec3> = {}) {
    this.targetOrigin = defaultVec3(target);
  }

  public store(widget: Widget, name: string) {
    this.widgetMap[name] = widget;
  }

  public update(dt: number) {
    for (const widget of this.widgets) {
      widget.update();
    }

    this.origin.x = lerp(this.origin.x, this.targetOrigin.x, dt * 5);
    this.origin.y = lerp(this.origin.y, this.targetOrigin.y, dt * 5);
    this.origin.z = lerp(this.origin.z, this.targetOrigin.z, dt * 5);
  }

  private enableScrollableBehavior(scrollableX: boolean, scrollableY: boolean) {
    let lastWheelTime = 0;
    let suppressed = false;

    // @bug scroll actions are sometimes suppressed on touchpads when they should not be!
    window.addEventListener('wheel', e => {
      const isNewScrollAction = (Date.now() - lastWheelTime) > 200;

      lastWheelTime = Date.now();

      if (this.isNextScrollActionSuppressed) {
        this.isNextScrollActionSuppressed = false;
        suppressed = true;

        return;
      }

      if (isNewScrollAction) {
        suppressed = false;
      }
      
      if (suppressed) {
        return;
      }

      this.moveTargetOrigin({
        x: e.deltaX * 2 * (scrollableX ? 1 : 0),
        y: e.deltaY * 2 * (scrollableY ? 1 : 0)
      });
    });
  }

  private enableDraggableBehavior(draggableX: boolean, draggableY: boolean) {
    document.body.style.cursor = 'grab';

    this.drag.bindDragStart(this.$root, e => {
      this.targetOrigin = { ...this.origin };

      document.body.style.cursor = 'grabbing';
    });

    this.drag.bindStaticDragEvents({
      onDrag: (e, delta) => {
        if (draggableX) {
          this.targetOrigin.x -= delta.x;
        }

        if (draggableY) {
          this.targetOrigin.y -= delta.y;
        }
  
        this.origin.x = this.targetOrigin.x;
        this.origin.y = this.targetOrigin.y;
        this.origin.z = this.targetOrigin.z;
      },
      onDragEnd: (e, delta) => {
        if (draggableX) {
          this.targetOrigin.x -= delta.x * 20;
        }

        if (draggableY) {
          this.targetOrigin.y -= delta.y * 20;
        }

        document.body.style.cursor = 'grab';

        this.temporarilySuppressNextScrollAction();
      }
    });
  }

  /**
   * Sets a flag to trigger suppression of the next 'scroll action',
   * defined as a continuous sequence of wheel events. The reasoning
   * behind this concerns ending a drag action on touch pads, which
   * also fire wheel (scroll) events. The end of a drag action on a
   * touch pad can 'leak' a sequence of wheel events, which we want
   * to ignore - until a nominal timeout, or a new scroll action occurs.
   */
  private temporarilySuppressNextScrollAction() {
    this.isNextScrollActionSuppressed = true;

    setTimeout(() => this.isNextScrollActionSuppressed = false, 200);
  }
}