import Pane from './Pane';
import Widget, { Vec2, Vec3, createVec2, createVec3 } from './Widget';

export default class PaneSlider extends Widget {
  private panes: Pane[] = [];
  private dragging = false;
  private dragStart = createVec2();
  private dragStartOffset = createVec2();
  private offset = createVec2();

  public constructor() {
    super()

    this.bindStaticEvents();
  }

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
      this.dragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.dragStartOffset = { ...this.offset };

      e.preventDefault();
      e.stopPropagation();
    });
  }

  private bindStaticEvents(): void {
    let previousMouse = createVec2();
    let lastDelta = createVec2();

    document.addEventListener('mousemove', e => {
      if (this.dragging) {
        const totalDelta: Vec2 = {
          x: e.clientX - this.dragStart.x,
          y: e.clientY - this.dragStart.y
        };

        const delta: Vec2 = {
          x: e.clientX - previousMouse.x,
          y: e.clientY - previousMouse.y
        };

        if (Math.abs(delta.x) > 0 && previousMouse.x > 0) {
          lastDelta.x = e.clientX - previousMouse.x;
        }

        if (Math.abs(delta.y) > 0 && previousMouse.y > 0) {
          lastDelta.y = e.clientY - previousMouse.y;
        }

        previousMouse.x = e.clientX;
        previousMouse.y = e.clientY;

        console.log(totalDelta);

        // this.rotationAngle = mod(this.dragStartRotation + totalDeltaX * 0.05, 360);
      }
    });

    document.addEventListener('mouseup', e => {
      this.dragging = false;

      if (lastDelta.x !== 0) {
        // this.revolveWithMomentum(lastDeltaX * 0.1);
      }

      previousMouse = createVec2();
      lastDelta = createVec2();
    });
  }

  private focusByIndex(index: number): void {
    const pane = this.panes[index];

    pane.slideIntoView();
  }
}