import Stage from './widgets/Stage';
import PaneCarousel from './widgets/PaneCarousel';
import Pane from './widgets/Pane';
import Particles from './widgets/Particles';
import Text3D from './widgets/Text3D';
import { animate, debounce, lerp } from './utilities';

import './page.scss';

function main(): void {
  const stage = new Stage();
  const title = new Text3D('This is some text!');
  const carousel = new PaneCarousel();
  const particles = new Particles(100);

  for (let i = 0; i < 7; i++) {
    const pane = new Pane();

    pane.insert('Hello!');

    carousel.addPane(pane);
  }

  title.appendTo(stage.$root);
  carousel.appendTo(stage.$root);
  particles.appendTo(stage.$root);

  carousel.setOffset({ x: 0, y: 0, z: 0 });
  carousel.setRadius(800);

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

    carousel.setOffset({
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