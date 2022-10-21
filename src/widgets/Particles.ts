import { mod, multiply, rgb, toRgb } from '../utilities';
import './Particles.scss';

export default class Particles {
  private root = document.createElement('div');
  private particles: HTMLDivElement[] = [];

  public constructor(total: number) {
    document.body.appendChild(this.root);

    for (let i = 0; i < total; i++) {
      this.createParticle();
    }

    this.updateParticles();
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  private createParticle(): void {
    const particle = document.createElement('div');

    particle.classList.add('w-particle');

    this.root.appendChild(particle);

    this.particles.push(particle);
  }

  private updateParticles(): void {
    const t = Date.now() / 1000;
    const baseColor = rgb(57, 176, 255);
    const windowWidth = window.innerWidth;
    const halfWindowWidth = windowWidth / 2;
    const quarterWindowWidth = halfWindowWidth / 2;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      const baseSize = 5 + Math.sin(i * 1.8) * 3;
      const speedFactor = 0.6 + 0.4 * (baseSize / 8);
      const ySpeed = (0.1 + Math.sin(i * 1.7) * 0.02) * speedFactor;

      const startX = halfWindowWidth + Math.sin(i * 1.1) * quarterWindowWidth;
      const startY = 300 + Math.cos(i * 2.3) * window.innerHeight;
      const x = startX + Math.sin(t + i * 1.3) * 30;
      const y = mod(startY - Date.now() * ySpeed, window.innerHeight);

      const heightRatio = y / window.innerHeight;
      const decay = 1 + heightRatio;
      const oscillation = 0.8 + Math.sin(i) * 0.2;
      const diameter = baseSize * decay * oscillation;
      const color = toRgb(multiply(baseColor, 0.5 + heightRatio * oscillation));

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${diameter}px`;
      particle.style.height = `${diameter}px`;
      particle.style.opacity = `${diameter / 5}`;
      particle.style.backgroundColor = `${color}`;
      particle.style.zIndex = `${Math.round(diameter)}`;
    }

    window.requestAnimationFrame(() => this.updateParticles());
  }
}