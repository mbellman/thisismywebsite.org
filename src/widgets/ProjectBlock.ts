import Widget from '../widget-primitives/Widget';
import type { Project } from '../layout';

import './ProjectBlock.scss';

export default class ProjectBlock extends Widget {
  public update(project: Partial<Project> = {}): void {
    this.$image.src = project.imageUrl;
    this.$description.innerHTML = project.description;    
  }

  protected init(): void {
    this.$image.addEventListener('load', () => {
      this.$block.style.opacity = '1';
    });
  }

  protected createRoot(): HTMLDivElement {
    const root = document.createElement('div');

    root.innerHTML = `
      <div class="project-block">
        <div class="project-block--image-container">
          <img>
        </div>
        <div class="project-block--description"></div>
      </div>
    `;

    return root;
  }

  private get $block(): HTMLDivElement {
    return this.$root.querySelector('.project-block');
  }

  private get $image(): HTMLImageElement {
    return this.$root.querySelector('img');
  }

  private get $description(): HTMLDivElement {
    return this.$root.querySelector('.project-block--description');
  }
}