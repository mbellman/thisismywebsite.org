import Stage from './widget-primitives/Stage';
import PaneCarousel from './widget-primitives/PaneCarousel';
import Pane from './widget-primitives/Pane';
import Particles from './widget-primitives/Particles';
import Text3D from './widget-primitives/Text3D';
import ProjectBlock from './widgets/ProjectBlock';
import { debounce, lerp, multiply, rgb, toRgb } from './utilities';
import { animate, tween } from './animation';
import { projects } from './layout';
import { GestureAnalyzer } from './gestures';
import { printDebug } from './debug';
import { Vec2, Vec3 } from './widget-primitives/Widget';
import './page-home.scss';

function createProjectsCarousel(stage: Stage): PaneCarousel {
  const carousel = new PaneCarousel();

  for (let i = 0; i < 10; i++) {
    const project = projects[i];
    const pane = new Pane();
    const projectBlock = new ProjectBlock();

    stage.add(pane);

    projectBlock.update(project);
    pane.append(projectBlock.$root);
    carousel.addPane(pane);
  }

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

export function setupPage(analyzer?: GestureAnalyzer) {
  const stage = new Stage();

  const intro = stage.add(new Text3D('I\'m Malcolm.'), { y: -100 });
  const subIntro = stage.add(new Text3D('I <a href="#" target="_blank">create</a> things and also <a href="#">write</a> things.'), { y: -50 });

  subIntro.$root.querySelector('a:first-child')?.addEventListener('click', e => {
    e.preventDefault();

    targetStageOrigin.x = 0;
    targetStageOrigin.y = -500;
    targetStageOrigin.z = 0;

    setTimeout(() => {
      levelIndex = 1;
    }, 100);
  });

  subIntro.$root.querySelector('a:nth-child(2)')?.addEventListener('click', e => {
    e.preventDefault();

    window.open('https://thisismywebsite.org/thoughts/', '_blank')

    // targetStageOrigin.x = 0;
    // targetStageOrigin.y = -1000;
    // targetStageOrigin.z = 0;

    // setTimeout(() => {
    //   levelIndex = 2;
    // }, 100);
  });

  // const pane = stage.add(new Pane(), { y: 1200, z: -500, x: 0 });

  const projectsHeading = stage.add(
    new Text3D('Cool Projects'),
    { y: 210 }
  );

  const projectTitle = stage.add(
    new Text3D(projects[0].name),
    { y: 290 }
  );

  const particles = stage.add(
    new Particles(20)
  );

  const projectsCarousel = stage.add(createProjectsCarousel(stage));

  projectsCarousel.onIndexChange(index => {
    changeProjectTitle(projectTitle, index);
  });

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

  let levelIndex = 0;

  const targetStageOrigin: Vec3 = {
    x: 0,
    y: 0,
    z: 0
  }

  const PROJECT_CAROUSEL_OFFSET = 500;
  const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
  const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

  const goToLevel = debounce((level: number) => {
    if (level < 0) level = 0;

    levelIndex = level;
  }, 500);

  analyzer?.on('swipeUp', delta => {
    goToLevel(levelIndex + 1);

    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer?.on('swipeDown', delta => {
    goToLevel(levelIndex - 1);

    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer?.on('swipeLeft', delta => {
    if (levelIndex === 1) {
      projectsCarousel.focusByIndex(projectsCarousel.getCurrentIndex() + 1);
    }

    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer?.on('swipeRight', delta => {
    if (levelIndex === 1) {
      projectsCarousel.focusByIndex(projectsCarousel.getCurrentIndex() - 1);
    }

    printDebug(`${delta.x}, ${delta.y}`);
  });

  let dragging = false;
  let lastClientX = 0;
  let lastClientY = 0;

  const lastDelta: Vec2 = {
    x: 0,
    y: 0
  };

  stage.$root.addEventListener('mousedown', e => {
    dragging = true;

    lastClientX = e.clientX;
    lastClientY = e.clientY;

    targetStageOrigin.x = stage.origin.x;
    targetStageOrigin.y = stage.origin.y;
    targetStageOrigin.z = stage.origin.z;

    document.body.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (dragging) {
      lastDelta.x = e.clientX - lastClientX;
      lastDelta.y = e.clientY - lastClientY;

      targetStageOrigin.x += lastDelta.x;
      targetStageOrigin.y += lastDelta.y;

      stage.origin.x = targetStageOrigin.x;
      stage.origin.y = targetStageOrigin.y;
      stage.origin.z = targetStageOrigin.z;

      lastClientX = e.clientX;
      lastClientY = e.clientY;
    }
  });

  document.addEventListener('mouseup', () => {
    if (dragging) {
      targetStageOrigin.x += lastDelta.x * 20;
      targetStageOrigin.y += lastDelta.y * 20;
    }

    dragging = false;

    document.body.style.cursor = 'grab';
  });

  animate(dt => {
    const t = Date.now() / 1000;

    stage.origin.x = lerp(stage.origin.x, targetStageOrigin.x, dt * 5);
    stage.origin.y = lerp(stage.origin.y, targetStageOrigin.y, dt * 5);
    stage.origin.z = lerp(stage.origin.z, targetStageOrigin.z, dt * 5);

    // const pageWidth = window.innerWidth;

    // pane.update({
    //   ...pane.basePosition,
    //   x: pane.basePosition.x + pageWidth / 2 - pane.$root.clientWidth / 2
    // }, { x: 0, y: 0, z: 0 });

    intro.transform({
      position: {
        y: Math.sin(t),
        z: -50 + 50 * Math.cos(t)
      },
      rotation: {
        y: Math.sin(t) * 0.1,
      }
    })

    subIntro.transform({
      position: {
        y: Math.sin(t)
      },
      rotation: {
        y: Math.cos(t) * 0.1
      }
    });

    projectsHeading.transform({
      position: {
        y: Math.sin(t) * 10,
        z: -50 + 50 * Math.sin(t)
      },
      rotation: {
        y: Math.sin(t * 0.6) * 0.1
      }
    });

    projectTitle.transform({
      position: {
        y: Math.sin(t + 3) * 5,
      },
      rotation: {
        y: Math.sin(t * 0.8 + 2) * 0.1
      }
    });

    projectsCarousel.transform({
      position: {
        x: 0,
        y: PROJECT_CAROUSEL_OFFSET,
        z: 0
      }
    });

    particles.transform({
      position: {
        x: stage.origin.x * 0.6,
        y: stage.origin.y * 0.4
      }
    });

    const bgTop = multiply(BODY_BG_COLOR_TOP, 1 + -stage.origin.y / 2000);
    const bgBottom = multiply(BODY_BG_COLOR_BOTTOM, 1 + -stage.origin.y / 2000);

    document.body.style.background = `linear-gradient(to bottom, ${toRgb(bgTop)}, ${toRgb(bgBottom)})`;

    stage.update();
  });

  document.addEventListener('wheel', e => {
    if (e.deltaY > 15) {
      goToLevel(levelIndex + 1);

      targetStageOrigin.y -= 500;
    } else if (e.deltaY < -15) {
      goToLevel(levelIndex - 1);

      targetStageOrigin.y += 500;
    }
  });
}