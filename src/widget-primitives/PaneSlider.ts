import { lerp } from '../utilities';
import Pane, { Size } from './Pane';
import Widget, { Vec2, Vec3, createVec2, createVec3 } from './Widget';
import { DragManager } from '../dragging';

interface PaneSliderConfig {
  centeredX?: boolean;
  centeredY?: boolean;
}

export default class PaneSlider extends Widget {
  private panes: Pane[] = [];
  private centeredX = true;
  private centeredY = true;
  private drag = new DragManager();
  private dragStartOffset = createVec2();
  private sliderOffset = createVec2();
  private targetSliderOffset = createVec2();
  private nextAnimationFrame: number = null;
  private lastSlideToTargetOffsetTime: number = null;

  private sliderArea: Size = {
    width: 0,
    // @todo compute slider area height in update()
    height: 0
  };

  public constructor({ centeredX = true, centeredY = true }: PaneSliderConfig = {}) {
    super();

    this.centeredX = centeredX;
    this.centeredY = centeredY;

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
  public getHeight(): number {
    return Math.max(...this.panes.map(pane => pane.getHeight())) + window.innerHeight / 4 * (this.centeredY ? 1 : 0);
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
      x: this.basePosition.x + this.offsetPosition.x + halfWindowWidth * (this.centeredX ? 1 : 0),
      y: this.basePosition.y + this.offsetPosition.y + halfWindowHeight * (this.centeredY ? 1 : 0),
      z: this.basePosition.z + this.offsetPosition.z
    };

    const halfFirstPaneWidth = this.panes[0].$root.clientWidth / 2;
    const halfLastPaneWidth = this.panes.at(-1).$root.clientWidth / 2;
    let runningOffsetX = 0;

    // @todo make configurable
    const SLIDE_MARGIN = 100;

    for (let i = 0; i < this.panes.length; i++) {
      const pane = this.panes[i];
      const halfPaneHeight = pane.$root.clientHeight / 2;
      const offsetX = this.sliderOffset.x + runningOffsetX;

      pane.basePosition = {
        x: root.x + offsetX - halfFirstPaneWidth * (this.centeredX ? 1 : 0),
        y: root.y - halfPaneHeight * (this.centeredY ? 1 : 0),
        z: root.z
      };

      runningOffsetX += pane.$root.clientWidth + SLIDE_MARGIN;
    }

    // @todo compute slider area height
    this.sliderArea.width = runningOffsetX - halfLastPaneWidth * 2 - SLIDE_MARGIN;
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    return null;
  }

  private bindPaneEvents(pane: Pane, index: number): void {
    pane.$frame.addEventListener('click', e => {
      if (
        Math.abs(e.clientX - this.drag.start.x) < 5 &&
        Math.abs(e.clientY - this.drag.start.y) < 5
      ) {
        this.focusByIndex(index);
      }
    });

    this.drag.bindDragStart(pane.$frame, () => {
      this.dragStartOffset = { ...this.sliderOffset };

      window.cancelAnimationFrame(this.nextAnimationFrame);
    });
  }

  private bindStaticEvents(): void {
    this.drag.bindStaticDragEvents({
      onDrag: e => {
        const totalDelta: Vec2 = {
          x: e.clientX - this.drag.start.x,
          y: e.clientY - this.drag.start.y
        };

        // @todo allow for y-axis sliders
        this.sliderOffset.x = this.dragStartOffset.x + totalDelta.x;
      },
      onDragEnd: (e, delta) => {
        this.targetSliderOffset.x = this.sliderOffset.x + delta.x * 20;

        this.keepSliderInBounds(1 / 60);
        this.slideToTargetOffset();
      }
    });
  }

  private focusByIndex(index: number): void {
    // @todo
  }

  private keepSliderInBounds(dt: number): void {
    if (this.sliderOffset.x < -this.sliderArea.width) {
      this.targetSliderOffset.x = lerp(this.targetSliderOffset.x, -this.sliderArea.width, Math.min(1, dt * 20));
    }

    if (this.sliderOffset.x > 0) {
      this.targetSliderOffset.x = lerp(this.targetSliderOffset.x, 0, Math.min(1, dt * 20));
    }
  }

  private slideToTargetOffset(): void {    
    window.cancelAnimationFrame(this.nextAnimationFrame);

    const dt = Math.min(0.025, (Date.now() - this.lastSlideToTargetOffsetTime) / 1000);
    const isInBounds = this.targetSliderOffset.x < 0 && this.targetSliderOffset.x > -this.sliderArea.width;

    this.lastSlideToTargetOffsetTime = Date.now();

    if (isInBounds && Math.abs(this.targetSliderOffset.x - this.sliderOffset.x) < 1) {
      this.sliderOffset = { ...this.targetSliderOffset };
    } else {
      this.sliderOffset.x = lerp(this.sliderOffset.x, this.targetSliderOffset.x, Math.min(1, dt * 5));

      this.keepSliderInBounds(dt);

      this.nextAnimationFrame = requestAnimationFrame(() => this.slideToTargetOffset());
    }
  }
}