import Stage from './widgets/Stage';
import PaneCarousel from './widgets/PaneCarousel';
import Pane from './widgets/Pane';
import Particles from './widgets/Particles';
import Text3D from './widgets/Text3D';
import { animate, debounce, lerp, multiply, rgb, toRgb } from './utilities';
import { projects, Project } from './layout';

import './page.scss';

function createProjectBlock({ name, imageUrl, description }: Partial<Project> = {}): string {
  return `
    <div class="creation-block">
      <h2 class="creation-block--title">
        ${name || 'Demo!'}
      </h2>
      <div class="creation-block--image">
        <img src="${imageUrl}">
      </div>
      <div class="creation-block--description">
        ${description}
      </div>
    </div>
  `;
}

function createDemoCarousel(): PaneCarousel {
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

function main(): void {
  const stage = new Stage();
  const title = new Text3D('Cool Projects');
  const particles = new Particles(100);
  const demoCarousel = createDemoCarousel();

  title.appendTo(stage.$root);
  demoCarousel.appendTo(stage.$root);
  particles.appendTo(stage.$root);

  title.setSize(30);
  title.setTransform({ x: 0, y: -220, z: 0 });

  let slideIndex = 0;
  let currentYOffset = 0;

  const bodyBgColorTop = rgb(55, 9, 129);
  const bodyBgColorBottom = rgb(108, 75, 184);

  const goToSlide = debounce((index: number) => {
    if (index < 0) index = 0;

    slideIndex = index;
  }, 500);

  animate(dt => {
    const t = Date.now() / 1000;

    currentYOffset = lerp(currentYOffset, -slideIndex * 500, dt * 5);

    title.setTransform({
      x: 0,
      y: -220 + Math.sin(t) * 10 + currentYOffset * 0.8,
      z: 0
    }, Math.sin(t * 0.8) * 0.1);

    demoCarousel.setOffset({
      x: 0,
      y: currentYOffset,
      z: 0
    });

    particles.setYOffset(currentYOffset * 0.4);

    const bgTop = multiply(bodyBgColorTop, 1 + -currentYOffset / 2000);
    const bgBottom = multiply(bodyBgColorBottom, 1 + -currentYOffset / 2000);

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