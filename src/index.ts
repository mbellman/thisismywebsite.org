import Stage from './widgets/Stage';
import PaneCarousel from './widgets/PaneCarousel';
import Particles from './widgets/Particles';

import './page.scss';

function main(): void {
  const stage = new Stage();
  const carousel = new PaneCarousel(7);
  const particles = new Particles(100);

  carousel.addToStage(stage);
  stage.append(particles.$root);

  let y = 0;// window.innerHeight / 2;

  carousel.setOffset({ x: 0, y, z: 0 });

  document.addEventListener('wheel', e => {
    y += e.deltaY * 0.2;

    carousel.setOffset({ x: 0, y, z: 0 });
  });
}

main();