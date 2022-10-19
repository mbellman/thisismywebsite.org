import PaneCarousel from './widgets/PaneCarousel';
import Particles from './widgets/Particles';

import './page.scss';

function main(): void {
  new PaneCarousel(7, '80%');
  new Particles(100);
}

main();