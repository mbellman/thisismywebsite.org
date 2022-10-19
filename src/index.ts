import { PaneCarousel, Particles } from './ui';

import './page.scss';

class AppState {
  public carousel = new PaneCarousel(7, '80%');
  public particles = new Particles(100);
  public degrees = 0;
}

function main(): void {
  const state = new AppState();
}

main();