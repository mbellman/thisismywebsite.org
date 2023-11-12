import Pane, { Size } from './Pane';
import Widget, { Vec2, createVec2, createVec3 } from './Widget';
import { DragManager } from '../dragging';
import { lerp, mod } from '../utilities';

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

    for (const pane of this.panes) {
      const wrappedOffsetX = mod(this.currentOffset.x + pane.offsetPosition.x, this.fieldArea.width);
      const wrappedOffsetY = mod(this.currentOffset.y + pane.offsetPosition.y, this.fieldArea.height);

      pane.basePosition.x = this.basePosition.x + wrappedOffsetX - pane.offsetPosition.x;
      pane.basePosition.y = this.basePosition.y + wrappedOffsetY - pane.offsetPosition.y;
      // @todo wrap z
      pane.basePosition.z = this.basePosition.z;

      // @todo check distance to right/bottom edge
      const distanceToEdge = Math.min(wrappedOffsetX, wrappedOffsetY);
      const opacity = Math.min(1, distanceToEdge / 40);

      pane.$root.style.opacity = `${opacity}`;
    }
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

        // this.keepFieldInBounds(1 / 60);
        this.slideToTargetOffset();
      }
    });
  }

  private slideToTargetOffset(): void {
    window.cancelAnimationFrame(this.nextAnimationFrame);

    const dt = Math.min(0.025, (Date.now() - this.lastSlideToTargetOffsetTime) / 1000);
    const _dt = Math.min(1, dt * 5)

    this.lastSlideToTargetOffsetTime = Date.now();

    this.currentOffset.x = lerp(this.currentOffset.x, this.targetOffset.x, _dt);
    this.currentOffset.y = lerp(this.currentOffset.y, this.targetOffset.y, _dt);
    // @todo handle z

    this.nextAnimationFrame = requestAnimationFrame(() => this.slideToTargetOffset());
  }
}