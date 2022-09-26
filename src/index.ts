function main(): void {
  const root = document.createElement('div');

  root.innerHTML = 'Hello!';

  document.body.appendChild(root);
}

main();