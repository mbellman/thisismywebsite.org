import Stage from './widget-primitives/Stage';
import PaneCarousel from './widget-primitives/PaneCarousel';
import Pane from './widget-primitives/Pane';
import Particles from './widget-primitives/Particles';
import Text3D from './widget-primitives/Text3D';
import { debounce, lerp, multiply, rgb, toRgb } from './utilities';
import { animate, tween } from './animation';
import { projects, Project } from './layout';

import './page.scss';

function createProjectBlock({ name, imageUrl, description }: Partial<Project> = {}): string {
  return `
    <div class="project-block">
      <div class="project-block--image">
        <img src="${imageUrl}">
      </div>
      <div class="project-block--description">
        ${description}
      </div>
    </div>
  `;
}

function createProjectsCarousel(): PaneCarousel {
  const carousel = new PaneCarousel();

  for (let i = 0; i < 10; i++) {
    const pane = new Pane();
    const project = projects[i];

    pane.insert(createProjectBlock(project));

    carousel.addPane(pane);
  }

  carousel.setOffset({ x: 0, y: 0, z: 0 });
  carousel.setRadius(800);

  return carousel;
}

async function changeProjectTitle(projectTitle: Text3D, projectIndex: number): Promise<void> {
  await tween({
    range: [1, 0],
    duration: 0.5
  }, opacity => projectTitle.setStyle({
    opacity: `${opacity}`
  }));

  projectTitle.setText(projects[projectIndex].name);

  tween({
    range: [0, 1],
    duration: 0.5
  }, opacity => projectTitle.setStyle({
    opacity: `${opacity}`
  }));
}

function main(): void {
  const stage = new Stage();
  const title = new Text3D('Cool Projects');
  const projectTitle = new Text3D(projects[0].name);
  const particles = new Particles(100);
  const projectsCarousel = createProjectsCarousel();

  projectsCarousel.onFocus(index => {
    changeProjectTitle(projectTitle, index);
  });

  title.appendTo(stage.$root);
  projectTitle.appendTo(stage.$root);
  projectsCarousel.appendTo(stage.$root);
  particles.appendTo(stage.$root);

  title.setStyle({
    fontSize: '48px'
  });

  projectTitle.setStyle({
    fontSize: '24px'
  });

  let slideIndex = 0;
  let currentYOffset = 0;

  const PAGE_TITLE_Y = -275;
  const PROJECT_TITLE_Y = -190;
  const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
  const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

  const goToSlide = debounce((index: number) => {
    if (index < 0) index = 0;

    slideIndex = index;
  }, 500);

  animate(dt => {
    const t = Date.now() / 1000;

    currentYOffset = lerp(currentYOffset, -slideIndex * 500, dt * 5);

    title.setTransform({
      x: 0,
      y: PAGE_TITLE_Y + Math.sin(t) * 10 + currentYOffset * 0.8,
      z: 0
    }, Math.sin(t * 0.8) * 0.1);

    projectTitle.setTransform({
      x: 0,
      y: PROJECT_TITLE_Y + Math.sin(t + 3) * 5 + currentYOffset * 0.8,
      z: 0
    }, Math.sin(t * 0.8 + 2) * 0.1);

    projectsCarousel.setOffset({
      x: 0,
      y: currentYOffset,
      z: 0
    });

    particles.setYOffset(currentYOffset * 0.4);

    const bgTop = multiply(BODY_BG_COLOR_TOP, 1 + -currentYOffset / 2000);
    const bgBottom = multiply(BODY_BG_COLOR_BOTTOM, 1 + -currentYOffset / 2000);

    document.body.style.background = `linear-gradient(to bottom, ${toRgb(bgTop)}, ${toRgb(bgBottom)})`;
  });

  document.addEventListener('wheel', e => {
    if (e.deltaY > 15) {
      goToSlide(slideIndex + 1);
    } else if (e.deltaY < -15) {
      goToSlide(slideIndex - 1);
    }
  });
}

main();