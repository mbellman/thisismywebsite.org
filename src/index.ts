import Stage from './widget-primitives/Stage';
import PaneCarousel from './widget-primitives/PaneCarousel';
import Pane from './widget-primitives/Pane';
import Particles from './widget-primitives/Particles';
import Text3D from './widget-primitives/Text3D';
import ProjectBlock from './widgets/ProjectBlock';
import { debounce, lerp, multiply, rgb, toRgb } from './utilities';
import { animate, tween } from './animation';
import { projects } from './layout';

import './page.scss';

function createProjectsCarousel(): PaneCarousel {
  const carousel = new PaneCarousel();

  for (let i = 0; i < 10; i++) {
    const project = projects[i];
    const pane = new Pane();
    const projectBlock = new ProjectBlock();

    projectBlock.update(project);
    pane.append(projectBlock.$root);
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
  const intro = new Text3D('I\'m Malcolm.');
  const subIntro = new Text3D('I <a href="#" target="_blank">create</a> things and also <a href="#">write</a> things.');
  const projectsHeading = new Text3D('Cool Projects');
  const projectTitle = new Text3D(projects[0].name);
  const particles = new Particles(20);
  const projectsCarousel = createProjectsCarousel();

  subIntro.$root.querySelector('a:first-child').addEventListener('click', e => {
    e.preventDefault();

    setTimeout(() => {
      slideIndex = 1;
    }, 100);
  });

  subIntro.$root.querySelector('a:nth-child(2)').addEventListener('click', e => {
    e.preventDefault();

    setTimeout(() => {
      slideIndex = 2;
    }, 100);
  });

  projectsCarousel.onFocus(index => {
    changeProjectTitle(projectTitle, index);
  });

  intro.appendTo(stage.$root);
  subIntro.appendTo(stage.$root);
  projectsHeading.appendTo(stage.$root);
  projectTitle.appendTo(stage.$root);
  projectsCarousel.appendTo(stage.$root);
  particles.appendTo(stage.$root);

  intro.setStyle({
    fontSize: '30px'
  });

  subIntro.setStyle({
    fontSize: '24px'
  })

  projectsHeading.setStyle({
    fontSize: '48px'
  });

  projectTitle.setStyle({
    fontSize: '24px'
  });

  let slideIndex = 0;
  let currentYOffset = 0;

  const INTRO_Y = -100;
  const SUB_INTRO_Y = -50;
  const PROJECTS_HEADING_Y = 210;
  const PROJECT_NAME_Y = 290;
  const PROJECT_CAROUSEL_OFFSET = 500;
  const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
  const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

  const goToSlide = debounce((index: number) => {
    if (index < 0) index = 0;

    slideIndex = index;
  }, 500);

  animate(dt => {
    const t = Date.now() / 1000;

    currentYOffset = lerp(currentYOffset, -slideIndex * 500, dt * 5);

    intro.setTransform({
      x: 0,
      y: INTRO_Y + Math.sin(t) + currentYOffset,
      z: 0
    }, Math.sin(t) * 0.1)

    subIntro.setTransform({
      x: 0,
      y: SUB_INTRO_Y + Math.sin(t) + currentYOffset,
      z: 0
    }, Math.cos(t) * 0.1)

    projectsHeading.setTransform({
      x: 0,
      y: PROJECTS_HEADING_Y + Math.sin(t) * 10 + currentYOffset,
      z: 0
    }, Math.sin(t * 0.8) * 0.1);

    projectTitle.setTransform({
      x: 0,
      y: PROJECT_NAME_Y + Math.sin(t + 3) * 5 + currentYOffset,
      z: 0
    }, Math.sin(t * 0.8 + 2) * 0.1);

    projectsCarousel.setOffset({
      x: 0,
      y: PROJECT_CAROUSEL_OFFSET + currentYOffset,
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