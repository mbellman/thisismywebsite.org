import Pane from './Pane';
import { clerp, mod } from '../utilities';
import './PaneCarousel.scss';

export default class PaneCarousel {
  private root = document.createElement('div');
  private panes: Pane[] = [];
  private rotation = 0;
  private currentIndex = 0;
  private nextAnimationFrame: number = null;

  public constructor(total: number, widthStyle: string) {
    for (let i = 0; i < total; i++) {
      const pane = new Pane(this.root, i);

      pane.onClick(() => this.focusByIndex(i));

      this.panes.push(pane);
    }

    this.root.classList.add('w-pane-carousel');
    this.root.style.width = widthStyle;

    document.body.appendChild(this.root);

    this.revolve(0);
  }

  public focusByIndex(index: number): void {
    this.currentIndex = mod(index, this.panes.length);

    this.revolveToTargetRotation();
  }

  private get targetRotation(): number {
    return 360 - (this.currentIndex / this.panes.length) * 360;
  }

  private revolve(degrees: number): void {
    const total = this.panes.length;

    for (let i = 0; i < total; i++) {
      const rotation = (i / total) * 360 + degrees;

      this.panes[i].revolve(rotation);
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