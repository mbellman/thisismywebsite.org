import { PaneCarousel } from './ui';

import './page.scss';

class AppState {
  public carousel = new PaneCarousel(8, 800);
  public degrees = 0;
}

function main(): void {
  const state = new AppState();
}

main();