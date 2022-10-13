import { createPane } from './ui';

import './page.scss';

interface AppState {
  pane: HTMLDivElement;
  rotation: number;
}

function update(dt: number, state: AppState): void {
  const frame = state.pane.querySelector('.w-pane--frame') as HTMLDivElement;

  state.rotation += 50 * dt;

  frame.style.transform = `rotate3d(0, 1, 0, ${state.rotation}deg)`;
}

function main(): void {
  const appState: AppState = {
    pane: null,
    rotation: 0
  };

  const root = document.createElement('div');
  const pane = createPane();

  appState.pane = pane;

  root.appendChild(pane);

  document.body.appendChild(root);

  let time = Date.now();

  function frame() {
    const delta = (Date.now() - time) / 1000;

    update(delta, appState);

    time = Date.now();
  
    requestAnimationFrame(frame);
  }

  frame();
}

main();