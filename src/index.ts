import Stage from './widgets/Stage';
import PaneCarousel from './widgets/PaneCarousel';
import Particles from './widgets/Particles';
import Text3D from './widgets/Text3D';

import './page.scss';

function main(): void {
  const stage = new Stage();
  const carousel = new PaneCarousel(7);
  const particles = new Particles(100);
  const title = new Text3D('This is my website!');

  carousel.appendTo(stage.$root);
  particles.appendTo(stage.$root);
  title.appendTo(stage.$root);

  title.setSize(30);
  title.setTransform({ x: 0, y: -220, z: 0 });

  function animateText() {
    const t = Date.now() / 1000;

    title.setTransform({
      x: 0,
      y: -220 + Math.sin(t) * 10,
      z: 0
    }, Math.sin(t * 0.8) * 0.1);

    requestAnimationFrame(animateText);
  }

  animateText();

  let y = 0;

  carousel.setOffset({ x: 0, y, z: 0 });

  document.addEventListener('wheel', e => {
    y -= e.deltaY * 0.2;

    carousel.setOffset({ x: 0, y, z: 0 });
  });
}

main();