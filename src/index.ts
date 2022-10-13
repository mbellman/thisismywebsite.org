import { PaneCarousel } from './ui';

import './page.scss';

class AppState {
  public carousel = new PaneCarousel(5, 800);
  public degrees = 0;
}

function main(): void {
  const state = new AppState();
  let index = 0;

  document.body.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      state.carousel.focusByIndex(++index);
    } else if (e.key === 'ArrowLeft') {
      state.carousel.focusByIndex(--index);
    }
  })
}

main();