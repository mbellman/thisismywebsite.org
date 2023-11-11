import Pane, { Size } from './Pane';
import Widget, { Vec2, createVec2, createVec3 } from './Widget';
import { DragManager } from '../dragging';
import { lerp } from '../utilities';

export default class PaneField extends Widget {
  private panes: Pane[] = [];
  private drag = new DragManager();
  private dragStartOffset = createVec3();
  private currentOffset = createVec3();
  private targetOffset = createVec3();
  private lastSlideToTargetOffsetTime: number = null;

  private fieldArea: Size = {
    width: 0,
    height: 0
  };

  private nextAnimationFrame: number = null;

  public constructor() {
    super();

    this.bindStaticEvents();
  }

  public addPane(pane: Pane): this {
    this.bindPaneEvents(pane, this.panes.length);

    this.panes.push(pane);

    return this;
  }

  /**
   * @override
   */
  public onAdded(): void {
    this.panes.forEach(pane => this.stage.add(pane, this.basePosition));
  }

  /**
   * @override
   */
  public update(): void {
    let maxX = 0;
    let maxY = 0;

    for (const pane of this.panes) {
      pane.basePosition.x = this.basePosition.x + this.currentOffset.x;
      pane.basePosition.y = this.basePosition.y + this.currentOffset.y;
      pane.basePosition.z = this.basePosition.z + this.currentOffset.z;

      const right = pane.offsetPosition.x + pane.getWidth();
      const bottom = pane.offsetPosition.y + pane.getHeight();

      if (right > maxX) {
        maxX = right;
      }

      if (bottom > maxY) {
        maxY = bottom;
      }
    }

    // @todo @fix subtract by highest X/Y pane width/height
    this.fieldArea.width = maxX;
    this.fieldArea.height = maxY;
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    return null;
  }

  private bindPaneEvents(pane: Pane, index: number): void {
    // @todo
    this.drag.bindDragStart(pane.$frame, e => {
      this.dragStartOffset = { ...this.currentOffset };

      window.cancelAnimationFrame(this.nextAnimationFrame);
    });
  }

  private bindStaticEvents(): void {
    this.drag.bindStaticDragEvents({
      onDrag: (e, delta) => {
        const totalDelta: Vec2 = {
          x: e.clientX - this.drag.start.x,
          y: e.clientY - this.drag.start.y
        };

        this.currentOffset.x = this.dragStartOffset.x + totalDelta.x;
        this.currentOffset.y = this.dragStartOffset.y + totalDelta.y;
        // @todo handle z

        this.targetOffset.x = this.currentOffset.x;
        this.targetOffset.y = this.currentOffset.y;
        // @todo handle z
      },
      onDragEnd: (e, delta) => {
        this.targetOffset.x += delta.x * 20;
        this.targetOffset.y += delta.y * 20;
        // @todo handle z

        this.keepFieldInBounds(1 / 60);
        this.slideToTargetOffset();
      }
    });
  }

  private keepFieldInBounds(dt: number): void {
    const _dt = Math.min(1, dt * 20);

    if (this.targetOffset.x > 0) {
      this.targetOffset.x = lerp(this.targetOffset.x, 0, _dt);
    }

    if (this.targetOffset.y > 0) {
      this.targetOffset.y = lerp(this.targetOffset.y, 0, _dt);
    }

    if (this.targetOffset.x < -this.fieldArea.width) {
      this.targetOffset.x = lerp(this.targetOffset.x, -this.fieldArea.width, _dt);
    }

    if (this.targetOffset.y < -this.fieldArea.height) {
      this.targetOffset.y = lerp(this.targetOffset.y, -this.fieldArea.height, _dt);
    }
  }

  private slideToTargetOffset(): void {
    window.cancelAnimationFrame(this.nextAnimationFrame);

    const dt = Math.min(0.025, (Date.now() - this.lastSlideToTargetOffsetTime) / 1000);

    const isInBounds = (
      this.targetOffset.x < 0 && this.targetOffset.x > -this.fieldArea.width &&
      this.targetOffset.y < 0 && this.targetOffset.y > -this.fieldArea.height
      // @todo handle z
    );

    this.lastSlideToTargetOffsetTime = Date.now();

    if (isInBounds && Math.abs(this.targetOffset.x - this.currentOffset.x) < 1) {
      this.currentOffset.x = this.targetOffset.x;
      this.currentOffset.y = this.targetOffset.y;
      // @todo handle z
    } else {
      const _dt = Math.min(1, dt * 5)

      this.currentOffset.x = lerp(this.currentOffset.x, this.targetOffset.x, _dt);
      this.currentOffset.y = lerp(this.currentOffset.y, this.targetOffset.y, _dt);
      // @todo handle z

      this.keepFieldInBounds(dt);

      this.nextAnimationFrame = requestAnimationFrame(() => this.slideToTargetOffset());
    }
  }
}