import Pane, { Position3d } from './Pane';
import Stage from './Stage';
import { clerp, mod } from '../utilities';
import './PaneCarousel.scss';

export default class PaneCarousel {
  private panes: Pane[] = [];
  private rotation = 0;

  private offset: Position3d = {
    x: 0,
    y: 0,
    z: 0
  };

  private currentIndex = 0;
  private nextAnimationFrame: number = null;

  public constructor(total: number) {
    for (let i = 0; i < total; i++) {
      const pane = new Pane();

      pane.onClick(() => this.focusByIndex(i));

      this.panes.push(pane);
    }

    this.revolve(0);
  }

  public addToStage(stage: Stage): void {
    for (const pane of this.panes) {
      stage.append(pane.$root);
    }
  }

  public focusByIndex(index: number): void {
    this.currentIndex = mod(index, this.panes.length);

    this.revolveToTargetRotation();
  }

  public setOffset(offset: Position3d): void {
    this.offset = offset;

    this.revolveToTargetRotation();
  }

  private get targetRotation(): number {
    return 360 - (this.currentIndex / this.panes.length) * 360;
  }

  private revolve(degrees: number): void {
    const carouselWidth = document.body.clientWidth;

    for (let i = 0; i < this.panes.length; i++) {
      const pane = this.panes[i];
      const halfWidth = pane.$root.clientWidth / 2;
      const halfHeight = pane.$root.clientHeight / 2;
      const yAxisRotationDegrees = i / this.panes.length * 360 + degrees;
      const yAxisRotation = yAxisRotationDegrees % 360 * (Math.PI / 180);
      const rotation = mod(yAxisRotation, Math.PI * 2);

      const position = {
        x: (carouselWidth / 2) + Math.sin(rotation) * (carouselWidth / 2) - halfWidth,
        y: (this.offset.y + halfHeight) / window.innerHeight * 1000 - 500,
        z: -Math.sin(rotation / 2) * 1000
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