import PaneCarousel from './widgets/PaneCarousel';
import Particles from './widgets/Particles';

import './page.scss';

function main(): void {
  const carousel = new PaneCarousel(7);
  new Particles(100);

  let m = 0;

  document.addEventListener('wheel', e => {
    m += e.deltaY * 0.2;

    document.body.style.marginTop = `${m}px`;

    carousel.update();
  });
}

main();