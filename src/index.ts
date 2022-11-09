import Stage from './widgets/Stage';
import PaneCarousel from './widgets/PaneCarousel';
import Pane from './widgets/Pane';
import Particles from './widgets/Particles';
import Text3D from './widgets/Text3D';
import { animate, debounce, lerp } from './utilities';

import './page.scss';

function createDemoBlock(): string {
  return `
    <div class="demo-block">
      Demo!
    </div>
  `;
}

function createDemoCarousel(): PaneCarousel {
  const carousel = new PaneCarousel();

  for (let i = 0; i < 10; i++) {
    const pane = new Pane();

    pane.insert(createDemoBlock());

    carousel.addPane(pane);
  }

  carousel.setOffset({ x: 0, y: 0, z: 0 });
  carousel.setRadius(800);

  return carousel;
}

function main(): void {
  const stage = new Stage();
  const title = new Text3D('This is some text!');
  const particles = new Particles(100);
  const demoCarousel = createDemoCarousel();

  title.appendTo(stage.$root);
  demoCarousel.appendTo(stage.$root);
  particles.appendTo(stage.$root);

  title.setSize(30);
  title.setTransform({ x: 0, y: -220, z: 0 });

  let slideIndex = 0;
  let currentYOffset = 0;

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