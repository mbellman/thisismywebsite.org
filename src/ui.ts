import './ui.scss';

export function createPane(): HTMLDivElement {
  const pane = document.createElement('div');
  const frame = document.createElement('div');

  pane.classList.add('w-pane');
  frame.classList.add('w-pane--frame');

  pane.appendChild(frame);

  return pane;
}