import { Position3D } from './Pane';
import './Text3D.scss';

export default class Text3D {
  private root = document.createElement('div');

  public constructor(text: string) {
    this.root.classList.add('w-text3d');
    this.root.innerHTML = text;
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public appendTo(element: HTMLDivElement): void {
    element.appendChild(this.$root);
  }

  public setTransform(position: Position3D, yRotation: number = 0): void {
    const pageWidth = window.innerWidth;
    const halfWidth = this.$root.clientWidth / 2;
    const halfHeight = this.$root.clientHeight / 2;
    const yRotationDegrees = (yRotation * 180 / Math.PI) % 360;

    const translation: Position3D = {
      x: (pageWidth / 2) - halfWidth + position.x,
      y: window.innerHeight / 2 - halfHeight + position.y,
      z: position.z
    };

    this.root.style.transform = `translate3d(${translation.x}px, ${translation.y}px, ${translation.z}px) rotateY(${yRotationDegrees}deg)`;
    this.root.style.zIndex = `${500 + Math.round(translation.z)}`;
  }

  public setSize(size: number): void {
    this.root.style.fontSize = `${size}px`;
  }
}