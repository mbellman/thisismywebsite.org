import { Vec2, createVec2 } from './panes/Widget';

type DragHandler = (e: MouseEvent, delta: Vec2) => void;

interface StaticDragEventsConfig {
  onDrag?: DragHandler;
  onDragEnd?: DragHandler;
}

export class DragManager {
  private dragging = false;

  public start: Vec2 = {
    x: 0,
    y: 0
  };

  public bindDragStart(element: HTMLElement, handler?: DragHandler): void {
    element.addEventListener('mousedown', e => {
      this.dragging = true;
      this.start.x = e.clientX;
      this.start.y = e.clientY;

      handler?.(e, { x: 0, y: 0 });

      e.preventDefault();
      e.stopPropagation();
    });
  }

  public bindStaticDragEvents({ onDrag , onDragEnd }: StaticDragEventsConfig = {}): void {
    let previousMouse = createVec2();
    let lastDelta = createVec2();

    document.addEventListener('mousemove', e => {
      if (this.dragging) {
        const delta: Vec2 = {
          x: e.clientX - previousMouse.x,
          y: e.clientY - previousMouse.y
        };

        if (Math.abs(delta.x) > 0 && previousMouse.x > 0) {
          lastDelta.x = delta.x;
        }

        if (Math.abs(delta.y) > 0 && previousMouse.y > 0) {
          lastDelta.y = delta.y;
        }

        previousMouse.x = e.clientX;
        previousMouse.y = e.clientY;

        onDrag?.(e, lastDelta);
      }
    });

    document.addEventListener('mouseup', e => {
      this.dragging = false;

      onDragEnd?.(e, lastDelta);

      previousMouse = createVec2();
      lastDelta = createVec2();
    });
  }
}