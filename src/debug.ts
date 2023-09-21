let printQueue: string[] = [];

export function initializeDebugConsole() {
  const container = document.createElement('div');

  container.style.width = '320px';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.right = '0';
  container.style.fontWeight = 'bold';
  container.style.pointerEvents = 'none';
  container.style.color = '#fff';
  container.style.zIndex = '10';

  container.setAttribute('id', 'debug-console');

  document.body.appendChild(container);
}

export function printDebug(text: string | number) {
  if (printQueue.length === 25) {
    printQueue.shift();
  }

  printQueue.push(String(text));
}

export function updateDebugConsole() {
  const output = document.getElementById('debug-console');

  if (output) {
    output.innerHTML = printQueue.join('<br />');
  }
}