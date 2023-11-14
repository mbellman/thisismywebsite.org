import Pane, { Size } from './Pane';
import Widget, { Vec2, createVec2, createVec3 } from './Widget';
import { DragManager } from '../dragging';
import { distance, lerp, wrap } from '../utilities';

interface Volume {
  width: number;
  height: number;
  depth: number;
}

export default class PaneField extends Widget {
  private panes: Pane[] = [];
  private drag = new DragManager();
  private dragStartOffset = createVec3();
  private currentOffset = createVec3();
  private targetOffset = createVec3();
  private lastSlideToTargetOffsetTime: number = null;

  private fieldVolume: Volume = {
    width: 0,
    height: 0,
    depth: 0
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
    let maxZ = 0;

    for (const pane of this.panes) {
      const right = pane.offsetPosition.x + pane.getWidth();
      const bottom = pane.offsetPosition.y + pane.getHeight();

      if (right > maxX) {
        maxX = right;
      }

      if (bottom > maxY) {
        maxY = bottom;
      }

      if (pane.offsetPosition.z > maxZ) {
        maxZ = pane.offsetPosition.z;
      }
    }

    this.fieldVolume.width = maxX;
    this.fieldVolume.height = maxY;
    this.fieldVolume.depth = maxZ * 1.5;

    for (const pane of this.panes) {
      const buffer = pane.offsetPosition.z / 5;
      const topEdge = 0 - buffer;
      const leftEdge = 0 - buffer;
      const rightEdge = this.fieldVolume.width + buffer;
      const bottomEdge = this.fieldVolume.height + buffer;
      const wrappedOffsetX = wrap(this.currentOffset.x + pane.offsetPosition.x, leftEdge, rightEdge);
      const wrappedOffsetY = wrap(this.currentOffset.y + pane.offsetPosition.y, topEdge, bottomEdge);
      const wrappedOffsetZ = wrap(this.currentOffset.z + pane.offsetPosition.z, -250, this.fieldVolume.depth);

      pane.basePosition.x = this.basePosition.x - pane.offsetPosition.x + wrappedOffsetX - buffer;
      pane.basePosition.y = this.basePosition.y - pane.offsetPosition.y + wrappedOffsetY - buffer;
      pane.basePosition.z = -(this.basePosition.z + wrappedOffsetZ);

      const closestDistanceToEdge = Math.min(
        distance(wrappedOffsetX, leftEdge),
        distance(wrappedOffsetY, topEdge),
        distance(wrappedOffsetX, rightEdge),
        distance(wrappedOffsetY, bottomEdge),
        distance(wrappedOffsetZ, -250),
        distance(wrappedOffsetZ, this.fieldVolume.depth)
      );

      const opacity = Math.min(1, closestDistanceToEdge / 50);

      pane.$frame.style.filter = `opacity(${opacity})`;
    }
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    return null;
  }

  private bindPaneEvents(pane: Pane, index: number): void {
    this.drag.bindDragStart(pane.$frame, e => {
      this.dragStartOffset = { ...this.currentOffset };

      window.cancelAnimationFrame(this.nextAnimationFrame);
    });
  }

  private bindStaticEvents(): void {
    document.addEventListener('wheel', e => {
      const mouse: Vec2 = {
        x: e.clientX,
        y: e.clientY
      };

      if (this.isMouseInBounds(mouse)) {
        this.targetOffset.z += e.deltaY * 2;

        this.slideToTargetOffset();

        e.stopPropagation();
      }
    });

    this.drag.bindStaticDragEvents({
      onDrag: (e, delta) => {
        const totalDelta: Vec2 = {
          x: e.clientX - this.drag.start.x,
          y: e.clientY - this.drag.start.y
        };

        this.currentOffset.x = this.dragStartOffset.x + totalDelta.x;
        this.currentOffset.y = this.dragStartOffset.y + totalDelta.y;

        this.targetOffset.x = this.currentOffset.x;
        this.targetOffset.y = this.currentOffset.y;
      },
      onDragEnd: (e, delta) => {
        this.targetOffset.x += delta.x * 20;
        this.targetOffset.y += delta.y * 20;

        this.slideToTargetOffset();
      }
    });
  }

  private isMouseInBounds({ x, y }: Vec2): boolean {
    const top = this.basePosition.y + this.offsetPosition.y + this.stage.origin.y;
    const left = this.basePosition.x + this.offsetPosition.x + this.stage.origin.x;

    return (
      x > left &&
      x < left + this.fieldVolume.width &&
      y > top &&
      y < top + this.fieldVolume.height
    );
  }

  private slideToTargetOffset(): void {
    window.cancelAnimationFrame(this.nextAnimationFrame);

    const dt = Math.min(0.025, (Date.now() - this.lastSlideToTargetOffsetTime) / 1000);
    const _dt = Math.min(1, dt * 5)

    this.lastSlideToTargetOffsetTime = Date.now();

    this.currentOffset.x = lerp(this.currentOffset.x, this.targetOffset.x, _dt);
    this.currentOffset.y = lerp(this.currentOffset.y, this.targetOffset.y, _dt);
    this.currentOffset.z = lerp(this.currentOffset.z, this.targetOffset.z, _dt);

    this.nextAnimationFrame = requestAnimationFrame(() => this.slideToTargetOffset());
  }
}