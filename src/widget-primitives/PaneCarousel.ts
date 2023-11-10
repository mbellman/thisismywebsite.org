import Widget, { Transform, Vec3 } from './Widget';
import Pane from './Pane';
import { clerp, mod } from '../utilities';
import './PaneCarousel.scss';

type IndexChangeHandler = (index: number) => void;

export default class PaneCarousel extends Widget {
  private panes: Pane[] = [];
  private radius = 600;
  private rotationAngle = 0;
  private indexChangeHandler: IndexChangeHandler = null;
  private currentIndex = 0;
  private lastRevolveToTargetTime = 0;
  private nextAnimationFrame: number = null;
  private dragging = false;
  private dragStartX = 0;
  private dragStartRotation = 0;

  public constructor() {
    super()

    this.bindStaticEvents();
  }

  public addPane(pane: Pane): void {
    this.bindPaneEvents(pane, this.panes.length);

    this.panes.push(pane);
    this.revolve(0);
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
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

  public setRadius(radius: number): void {
    this.radius = radius;
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
    pane.$frame.addEventListener('click', () => {
      this.focusByIndex(index);
    });

    pane.$frame.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.dragStartX = e.clientX;
      this.dragStartRotation = this.rotationAngle;

      e.preventDefault();
      e.stopPropagation();
    });
  }

  private bindStaticEvents(): void {
    let previousMouseX = 0;
    let lastDeltaX = 0;

    document.addEventListener('mousemove', e => {
      if (this.dragging) {
        const totalDeltaX = e.clientX - this.dragStartX;
        const deltaX = e.clientX - previousMouseX;

        if (Math.abs(deltaX) > 0 && previousMouseX > 0) {
          lastDeltaX = e.clientX - previousMouseX;
        }

        previousMouseX = e.clientX;

        this.rotationAngle = mod(this.dragStartRotation + totalDeltaX * 0.05, 360);

        this.revolve(this.rotationAngle);
      }
    });

    document.addEventListener('mouseup', e => {
      this.dragging = false;

      if (lastDeltaX !== 0) {
        this.revolveWithMomentum(lastDeltaX * 0.1);
      }

      previousMouseX = 0;
      lastDeltaX = 0;
    });
  }

  private revolve(degrees: number): void {
    const halfWindowWidth = window.innerWidth / 2;
    const halfWindowHeight = window.innerHeight / 2;

    const root: Vec3 = {
      x: this.basePosition.x + this.offsetPosition.x + halfWindowWidth,
      y: this.basePosition.y + this.offsetPosition.y + halfWindowHeight,
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
        y: root.y - halfPaneHeight + oscillation * 5,
        z: root.z + Math.cos(baseYAxisRotation) * this.radius
      };

      pane.transform({ position, rotation });

      // @temporary
      const blur = 5 * -position.z / (-position.z + 1500);

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

    if (Math.abs(momentum) < 0.01) {
      const index = Math.round((mod(-this.rotationAngle, 360) / 360) * this.panes.length);

      this.focusByIndex(index);

      return;
    }

    this.rotationAngle = mod(this.rotationAngle + momentum, 360);
    this.nextAnimationFrame = window.requestAnimationFrame(() => this.revolveWithMomentum(momentum * 0.975));
  }
}