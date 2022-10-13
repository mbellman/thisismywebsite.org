import { PaneCarousel } from './ui';

import './page.scss';

class AppState {
  public carousel = new PaneCarousel(5, 800);
  public degrees = 0;
}

function update(dt: number, state: AppState): void {
  state.degrees += 50 * dt;

  state.carousel.revolve(state.degrees);
}

function main(): void {
  const state = new AppState();

  let time = Date.now();

  function frame() {
    const delta = (Date.now() - time) / 1000;

    update(delta, state);

    time = Date.now();
  
    requestAnimationFrame(frame);
  }

  frame();
}

main();