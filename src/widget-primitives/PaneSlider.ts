import { lerp } from '../utilities';
import Pane, { Size } from './Pane';
import Widget, { Vec2, Vec3, createVec2, createVec3 } from './Widget';

interface PaneSliderConfig {
  centeredX?: boolean;
  centeredY?: boolean;
}

export default class PaneSlider extends Widget {
  private panes: Pane[] = [];
  private centeredX = true;
  private centeredY = true;
  private dragging = false;
  private dragStart = createVec2();
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

      const position = {
        x: root.x + offsetX - halfFirstPaneWidth * (this.centeredX ? 1 : 0),
        y: root.y - halfPaneHeight * (this.centeredY ? 1 : 0),
        z: root.z
      };
      
      pane.transform({ position });

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
        Math.abs(e.clientX - this.dragStart.x) < 5 &&
        Math.abs(e.clientY - this.dragStart.y) < 5
      ) {
        this.focusByIndex(index);
      }
    });

    pane.$frame.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.dragStartOffset = { ...this.sliderOffset };

      window.cancelAnimationFrame(this.nextAnimationFrame);

      e.preventDefault();
      e.stopPropagation();
    });
  }

  private bindStaticEvents(): void {
    let previousMouse = createVec2();
    let lastDelta = createVec2();

    document.addEventListener('mousemove', e => {
      if (this.dragging) {
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

        const totalDelta: Vec2 = {
          x: e.clientX - this.dragStart.x,
          y: e.clientY - this.dragStart.y
        };

        // @todo allow for y-axis sliders
        this.sliderOffset.x = this.dragStartOffset.x + totalDelta.x;
      }
    });

    document.addEventListener('mouseup', e => {
      this.dragging = false;

      this.targetSliderOffset.x = this.sliderOffset.x + lastDelta.x * 20;

      this.keepSliderInBounds(1 / 60);
      this.slideToTargetOffset();

      previousMouse = createVec2();
      lastDelta = createVec2();
    });
  }

  private focusByIndex(index: number): void {
    const pane = this.panes[index];

    pane.slideIntoView();
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