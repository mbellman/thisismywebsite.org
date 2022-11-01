import Widget from './Widget';
import Pane, { Position3D } from './Pane';
import { clerp, mod } from '../utilities';
import './PaneCarousel.scss';

export default class PaneCarousel extends Widget {
  private panes: Pane[] = [];
  private radius = 600;
  private rotation = 0;

  private offset: Position3D = {
    x: 0,
    y: 0,
    z: 0
  };

  private currentIndex = 0;
  private nextAnimationFrame: number = null;

  public constructor(total: number) {
    super();

    for (let i = 0; i < total; i++) {
      const pane = new Pane();

      pane.onClick(() => this.focusByIndex(i));

      this.panes.push(pane);
    }

    this.revolve(0);
  }

  /**
   * @override
   */
  public appendTo(element: HTMLDivElement): void {
    for (const pane of this.panes) {
      element.appendChild(pane.$root);
    }
  }

  public focusByIndex(index: number): void {
    this.currentIndex = mod(index, this.panes.length);

    this.revolveToTargetRotation();
  }

  public setOffset(offset: Position3D): void {
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
      const pane = this.panes[i];
      const halfPaneWidth = pane.$root.clientWidth / 2;
      const halfPaneHeight = pane.$root.clientHeight / 2;
      const yAxisRotationDegrees = i / this.panes.length * 360 + degrees;
      const yAxisRotation = yAxisRotationDegrees % 360 * (Math.PI / 180);
      const rotation = mod(yAxisRotation, Math.PI * 2);

      const position = {
        x: this.offset.x + Math.sin(rotation) * this.radius + halfBodyWidth - halfPaneWidth,
        y: this.offset.y + window.innerHeight / 2 - halfPaneHeight,
        z: this.offset.z + Math.cos(rotation) * this.radius - this.radius
      };

      pane.update(position, yAxisRotation);
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