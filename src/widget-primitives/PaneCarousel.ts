import Widget from './Widget';
import Pane, { Vector3 } from './Pane';
import { clerp, mod } from '../utilities';
import './PaneCarousel.scss';

type IndexChangeHandler = (index: number) => void;

export default class PaneCarousel extends Widget {
  private panes: Pane[] = [];
  private radius = 600;
  private rotation = 0;
  private indexChangeHandler: IndexChangeHandler = null;
  private currentIndex = 0;
  private nextAnimationFrame: number = null;

  private offset: Vector3 = {
    x: 0,
    y: 0,
    z: 0
  };

  public addPane(pane: Pane): void {
    const index = this.panes.length;

    pane.onClick(() => this.focusByIndex(index));

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

  public getRotation(): number {
    return this.rotation;
  }

  public onIndexChange(indexChangeHandler: IndexChangeHandler): void {
    this.indexChangeHandler = indexChangeHandler;
  }

  public setOffset(offset: Vector3): void {
    this.offset = offset;

    this.revolve(this.rotation);
  }

  public setRadius(radius: number): void {
    this.radius = radius;
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

  private revolve(degrees: number): void {
    const halfBodyWidth = document.body.clientWidth / 2;

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
        x: this.offset.x + Math.sin(baseYAxisRotation) * this.radius + halfBodyWidth - halfPaneWidth,
        y: this.offset.y + window.innerHeight / 2 - halfPaneHeight + oscillation * 5,
        z: this.offset.z + Math.cos(baseYAxisRotation) * this.radius - this.radius
      };

      pane.update(position, rotation);
    }
  }

  private revolveToTargetRotation(): void {
    if (Math.abs(this.rotation - this.targetRotation) < 0.1) {
      this.rotation = this.targetRotation;
    } else {
      window.cancelAnimationFrame(this.nextAnimationFrame);

      this.rotation = clerp(this.rotation, this.targetRotation, 0.075);
      this.nextAnimationFrame = window.requestAnimationFrame(() => this.revolveToTargetRotation());
    }

    this.revolve(this.rotation);
  }
}