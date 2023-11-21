import { Stage, PaneCarousel, Pane, Particles, Text3D, PaneSlider } from '@panes';
import ProjectBlock from './widgets/ProjectBlock';
import { multiply, rgb, toRgb } from '../../utilities';
import { animate, tween } from '../../animation';
import { projects } from '../../layout';
import { GestureAnalyzer } from '../../gestures';
import { printDebug } from '../../debug';

function createProjectsCarousel(stage: Stage): PaneCarousel {
  const carousel = new PaneCarousel();

  for (let i = 0; i < 10; i++) {
    const project = projects[i];
    const pane = new Pane();
    const projectBlock = new ProjectBlock();

    projectBlock.setContent(project);
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
  }, opacity => projectTitle.style({
    opacity: `${opacity}`
  }));

  projectTitle.setText(projects[projectIndex].name);

  tween({
    range: [0, 1],
    duration: 0.5,
  }, opacity => projectTitle.style({
    opacity: `${opacity}`
  }));
}

export default function setup(analyzer?: GestureAnalyzer) {
  const stage = new Stage({
    draggableX: true,
    draggableY: true
  });

  const intro = stage.add(
    new Text3D('I\'m Malcolm.', { centered: true }),
    { y: -100 }
  );

  const subIntro = stage.add(
    new Text3D('I <a href="#" target="_blank">create</a> things and also <a href="#">write</a> things.', { centered: true }),
    { y: -50 }
  );

  // @todo cleanup
  subIntro.$root.querySelector('a:first-child')?.addEventListener('click', e => {
    e.preventDefault();

    stage.setTargetOrigin({
      y: 500
    });
  });

  // @todo cleanup
  subIntro.$root.querySelector('a:nth-child(2)')?.addEventListener('click', e => {
    e.preventDefault();

    // window.open('https://thisismywebsite.org/thoughts/', '_blank');

    stage.setTargetOrigin({
      y: 2000
    });
  });

  // const pane = stage.add(new Pane());

  // pane.transform({
  //   position: {
  //     y: 1200, z: -500, x: window.innerWidth / 2 - pane.$root.clientWidth / 2
  //   }
  // })

  const projectsHeading = stage.add(
    new Text3D('Cool Projects', { centered: true }),
    { y: 210 }
  );

  const projectTitle = stage.add(
    new Text3D(projects[0].name, { centered: true }),
    { y: 290 }
  );

  const particles = stage.add(
    new Particles(20),
    { z: 100 }
  );

  const projectsCarousel = stage.add(createProjectsCarousel(stage));

  const writings = new PaneSlider();

  writings.transform({
    position: {
      y: 2000
    }
  });

  writings.addPane(new Pane({ width: 600, height: 500 }));
  writings.addPane(new Pane({ width: 600, height: 500 }));
  writings.addPane(new Pane({ width: 600, height: 500 }));

  stage.add(writings);

  const writingsTitle = stage.add(new Text3D('Coming soon...', { centered: true }), { y: 1700 });

  writingsTitle.style({
    fontSize: '26px'
  });

  projectsCarousel.onIndexChange(index => {
    changeProjectTitle(projectTitle, index);
  });

  intro.style({
    fontSize: '30px'
  });

  subIntro.style({
    fontSize: '24px'
  })

  projectsHeading.style({
    fontSize: '48px'
  });

  projectTitle.style({
    fontSize: '24px'
  });

  const PROJECT_CAROUSEL_OFFSET = 500;
  const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
  const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

  analyzer?.on('swipeUp', delta => {
    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer?.on('swipeDown', delta => {
    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer?.on('swipeLeft', delta => {
    printDebug(`${delta.x}, ${delta.y}`);
  });

  analyzer?.on('swipeRight', delta => {
    printDebug(`${delta.x}, ${delta.y}`);
  });

  function animateWidgets() {
    const t = Date.now() / 1000;

    intro.transform({
      position: {
        y: Math.sin(t),
        z: 50 + 50 * Math.cos(t)
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
        z: 50 + 50 * Math.sin(t)
      },
      rotation: {
        y: Math.sin(t * 0.6) * 0.1
      }
    });

    writingsTitle.transform({
      position: {
        y: Math.sin(t) * 10,
        z: 50 + 50 * Math.sin(t)
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
        y: PROJECT_CAROUSEL_OFFSET,
      }
    });

    particles.transform({
      position: {
        x: -stage.origin.x * 0.6,
        y: -stage.origin.y * 0.4
      }
    });
  }

  function updateStageBackgroundColor() {
    const bgTop = multiply(BODY_BG_COLOR_TOP, 1 + stage.origin.y / 2000);
    const bgBottom = multiply(BODY_BG_COLOR_BOTTOM, 1 + stage.origin.y / 2000);

    stage.$root.style.background = `linear-gradient(to bottom, ${toRgb(bgTop)}, ${toRgb(bgBottom)})`;
  }

  let running = true

  animate(dt => {
    if (!running) {
      return false;
    }

    animateWidgets();
    updateStageBackgroundColor();

    stage.update(dt);
  });

  return () => {
    running = false;

    stage.destroy();
  };
}