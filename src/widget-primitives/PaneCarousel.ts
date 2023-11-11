import Widget, { Transform, Vec2, Vec3 } from './Widget';
import Pane from './Pane';
import { clerp, mod } from '../utilities';
import { DragManager } from '../dragging';
import './PaneCarousel.scss';

type IndexChangeHandler = (index: number) => void;

interface PaneCarouselConfig {
  centeredX?: boolean;
  centeredY?: boolean;
}

export default class PaneCarousel extends Widget {
  private panes: Pane[] = [];
  private centeredX = true;
  private centeredY = true;
  private radius = 600;
  private rotationAngle = 0;
  private indexChangeHandler: IndexChangeHandler = null;
  private currentIndex = 0;
  private lastRevolveToTargetTime = 0;
  private nextAnimationFrame: number = null;
  private drag = new DragManager();
  private dragStartRotation = 0;

  public constructor({ centeredX = true, centeredY = true }: PaneCarouselConfig = {}) {
    super()

    this.centeredX = centeredX;
    this.centeredY = centeredY;

    this.bindStaticEvents();
  }

  public addPane(pane: Pane): this {
    this.bindPaneEvents(pane, this.panes.length);

    this.panes.push(pane);
    this.revolve(0);

    return this;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * @override
   */
  public getHeight(): number {
    return Math.max(...this.panes.map(pane => pane.getHeight())) + window.innerHeight / 4 * (this.centeredY ? 1 : 0);
  }

  public focusByIndex(index: number): void {
    const didChangeIndex = index !== this.currentIndex;

    this.currentIndex = mod(index, this.panes.length);

    for (let i = 0; i < this.panes.length; i++) {
      const pane = this.panes[i];

      if (i === this.currentIndex) {
        pane.$root.classList.add('active');
      } else {
        pane.$root.classList.remove('active');
      }
    }

    this.revolveToTargetRotation();

    if (didChangeIndex) {
      this.indexChangeHandler?.(this.currentIndex);
    }
  }

  /**
   * @override
   */
  public onAdded(): void {
    this.panes.forEach(pane => this.stage.add(pane));
  }

  public onIndexChange(indexChangeHandler: IndexChangeHandler): void {
    this.indexChangeHandler = indexChangeHandler;
  }

  public setRadius(radius: number): this {
    this.radius = radius;

    return this;
  }

  /**
   * @override
   */
  public update(): void {
    this.revolve(this.rotationAngle);
  }

  /**
   * @override
   */
  protected createRoot(): HTMLDivElement {
    // The pane carousel has no root element; we simply
    // append the panes directly in appendTo()
    return null;
  }

  private get targetRotation(): number {
    return 360 - (this.currentIndex / this.panes.length) * 360;
  }

  private bindPaneEvents(pane: Pane, index: number): void {
    pane.$frame.addEventListener('click', e => {
      if (Math.abs(e.clientX - this.drag.start.x) < 5) {
        this.focusByIndex(index);
      }
    });

    this.drag.bindDragStart(pane.$frame, e => {
      this.dragStartRotation = this.rotationAngle;

      window.cancelAnimationFrame(this.nextAnimationFrame);
    });
  }

  private bindStaticEvents(): void {
    this.drag.bindStaticDragEvents({
      onDrag: (e) => {
        const totalDeltaX = e.clientX - this.drag.start.x;

        this.rotationAngle = mod(this.dragStartRotation + totalDeltaX * 0.05, 360);
      },
      onDragEnd: (e, delta) => {
        if (delta.x !== 0) {
          this.revolveWithMomentum(delta.x * 0.1);
        }
      }
    });
  }

  private revolve(degrees: number): void {
    const halfWindowWidth = window.innerWidth / 2;
    const halfWindowHeight = window.innerHeight / 2;

    const root: Vec3 = {
      x: this.basePosition.x + this.offsetPosition.x + halfWindowWidth * (this.centeredX ? 1 : 0),
      y: this.basePosition.y + this.offsetPosition.y + halfWindowHeight * (this.centeredY ? 1 : 0),
      z: this.basePosition.z + this.offsetPosition.z - this.radius
    };

    for (let i = 0; i < this.panes.length; i++) {
      const oscillation = Math.sin(Date.now() / 1000 + i * 2);
      const pane = this.panes[i];
      const halfPaneWidth = pane.$root.clientWidth / 2;
      const halfPaneHeight = pane.$root.clientHeight / 2;
      const yAxisRotationDegrees = i / this.panes.length * 360 + degrees;
      const baseYAxisRotation = yAxisRotationDegrees % 360 * (Math.PI / 180);

      const rotation = {
        x: 0,
        y: mod(baseYAxisRotation, Math.PI * 2) + oscillation * 0.05,
        z: 0
      };

      const position = {
        x: root.x + Math.sin(baseYAxisRotation) * this.radius - halfPaneWidth,
        y: root.y - halfPaneHeight * (this.centeredY ? 1 : 0) + oscillation * 5,
        z: root.z + Math.cos(baseYAxisRotation) * this.radius
      };

      pane.basePosition = position;

      pane.transform({ rotation });

      // @todo first-class support for blur on widgets with farther z values
      const blur = Math.round(5 * -position.z / (-position.z + 1500));

      pane.$frame.style.filter = `blur(${blur}px`;
    }
  }

  private revolveToTargetRotation(): void {
    const dt = Math.min(0.025, (Date.now() - this.lastRevolveToTargetTime) / 1000);

    this.lastRevolveToTargetTime = Date.now();

    if (Math.abs(this.rotationAngle - this.targetRotation) < 0.1) {
      this.rotationAngle = this.targetRotation;
    } else {
      window.cancelAnimationFrame(this.nextAnimationFrame);

      this.rotationAngle = clerp(this.rotationAngle, this.targetRotation, dt * 5);
      this.nextAnimationFrame = window.requestAnimationFrame(() => this.revolveToTargetRotation());
    }
  }

  private revolveWithMomentum(momentum: number): void {
    window.cancelAnimationFrame(this.nextAnimationFrame);

    if (Math.abs(momentum) < 0.025) {
      const index = Math.round((mod(-this.rotationAngle, 360) / 360) * this.panes.length);

      this.focusByIndex(index);

      return;
    }

    this.rotationAngle = mod(this.rotationAngle + momentum, 360);
    this.nextAnimationFrame = window.requestAnimationFrame(() => this.revolveWithMomentum(momentum * 0.975));
  }
}