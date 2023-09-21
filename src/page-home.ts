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

export function setupPage(analyzer: GestureAnalyzer) {
  const stage = new Stage();

  // const { intro, subIntro } = stage.set({
  //   intro: {
  //     widget: new Text3D('I\'m Malcolm.'),
  //     position: { y: -100 }
  //   },
  //   subIntro: {
  //     widget: new Text3D('I <a href="#" target="_blank">create</a> things and also <a href="#">write</a> things.'),
  //     position: { y: -50 }
  //   }
  // });

  const { intro, subIntro } = stage.set({
    intro: {
      widget: new Text3D('Dummy text'),
      position: { y: -100 }
    },
    subIntro: {
      widget: new Text3D('More dummy text down here, doesn\'t particularly matter what it says'),
      position: { y: -50 }
    }
  });

  const projectsHeading = stage.add(
    new Text3D('Cool Projects')
  );

  const projectTitle = stage.add(
    new Text3D(projects[0].name)
  );
    
  projectsHeading.basePosition.y = 210;
  projectTitle.basePosition.y = 290;

  const particles = stage.add(
    new Particles(20)
  );

  const projectsCarousel = createProjectsCarousel(stage);

  subIntro.$root.querySelector('a:first-child')?.addEventListener('click', e => {
    e.preventDefault();

    setTimeout(() => {
      levelIndex = 1;
    }, 100);
  });

  subIntro.$root.querySelector('a:nth-child(2)')?.addEventListener('click', e => {
    e.preventDefault();

    setTimeout(() => {
      levelIndex = 2;
    }, 100);
  });

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
  let currentYOffset = 0;

  const PROJECT_CAROUSEL_OFFSET = 500;
  const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
  const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

  const goToLevel = debounce((level: number) => {
    if (level < 0) level = 0;

    levelIndex = level;
  }, 500);

  analyzer.on('swipeUp', delta => {
    goToLevel(levelIndex + 1);

    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer.on('swipeDown', delta => {
    goToLevel(levelIndex - 1);

    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer.on('swipeLeft', delta => {
    if (levelIndex === 1) {
      projectsCarousel.focusByIndex(projectsCarousel.getCurrentIndex() + 1);
    }

    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer.on('swipeRight', delta => {
    if (levelIndex === 1) {
      projectsCarousel.focusByIndex(projectsCarousel.getCurrentIndex() - 1);
    }

    printDebug(`${delta.x}, ${delta.y}`);
  });

  animate(dt => {
    const t = Date.now() / 1000;

    currentYOffset = lerp(currentYOffset, -levelIndex * 500, dt * 5);
    stage.origin.y = currentYOffset;

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

    projectsCarousel.setOffset({
      x: 0,
      y: PROJECT_CAROUSEL_OFFSET,
      z: 0
    });

    particles.setYOffset(currentYOffset * 0.4);

    const bgTop = multiply(BODY_BG_COLOR_TOP, 1 + -currentYOffset / 2000);
    const bgBottom = multiply(BODY_BG_COLOR_BOTTOM, 1 + -currentYOffset / 2000);

    document.body.style.background = `linear-gradient(to bottom, ${toRgb(bgTop)}, ${toRgb(bgBottom)})`;
  });

  document.addEventListener('wheel', e => {
    if (e.deltaY > 15) {
      goToLevel(levelIndex + 1);
    } else if (e.deltaY < -15) {
      goToLevel(levelIndex - 1);
    }
  });
}