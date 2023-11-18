import Widget from '../widget-primitives/Widget';
import type { Project } from '../layout';

import './ProjectBlock.scss';

export default class ProjectBlock extends Widget {
  private project: Partial<Project>;

  public setContent(project: Partial<Project> = {}): void {
    this.project = project;

    this.$image.src = project.imageUrl;
    this.$description.innerHTML = project.description;

    if (!project.githubUrl) {
      this.$githubButton.remove();
    }

    if (!project.demoUrl) {
      this.$demoButton.remove();
    }
  }

  /**
   * @override
   */
  public update(): void {}

  protected init(): void {
    this.$image.addEventListener('load', () => {
      this.$block.style.opacity = '1';
    });

    this.$githubButton?.addEventListener('click', () => {
      window.open(this.project.githubUrl, '_blank');
    });

    this.$demoButton?.addEventListener('click', () => {
      window.open(this.project.demoUrl, '_blank');
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
        <div class="project-block--links">
          <button class="project-block--github-button">
            GitHub
          </button>
          <button class="project-block--demo-button">
            Demo
          </button>
        </div>
      </div>
    `;

    return root;
  }

  private get $block(): HTMLDivElement {
    return this.$root.querySelector('.project-block');
  }

  private get $githubButton(): HTMLButtonElement {
    return this.$root.querySelector('.project-block--github-button');
  }

  private get $demoButton(): HTMLButtonElement {
    return this.$root.querySelector('.project-block--demo-button');
  }

  private get $image(): HTMLImageElement {
    return this.$root.querySelector('img');
  }

  private get $description(): HTMLDivElement {
    return this.$root.querySelector('.project-block--description');
  }
}