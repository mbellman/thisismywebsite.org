import { animate } from './animation';
import { multiply, rgb, toRgb } from './utilities';
import Stage from './widget-primitives/Stage';
import Text3D from './widget-primitives/Text3D';
import Pane from './widget-primitives/Pane';

const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

export function setupPanesPage() {
  const stage = new Stage({
    draggable: true
  });

  const top = 20;

  const title = stage.add(new Text3D('Panes', false), {
    x: 20,
    y: top
  });

  title.setStyle({
    fontSize: '50px'
  });

  const description = stage.add(new Text3D(`
    <p>
      Modern computers are terrifically powerful, and much of the web development space leaves the medium woefully under-utilized.
      <strong>Panes</strong> is a library which breathes creative life into the form.
    </p>
    <p>
      We'll start with a single <strong>Pane</strong>, our fundamental unit.
    </p>
  `, false), {
    x: 20,
    y: top + 80
  });

  description.setStyle({
    fontSize: '20px',
    width: '700px'
  });

  const pane = stage.add(new Pane(), {
    x: 20,
    y: top + 250
  });

  function animateWidgets() {
    title.transform({
      position: {
        y: Math.sin(Date.now() / 1200) * 10,
      },
      rotation: {
        y: Math.sin(Date.now() / 900) * 0.05
      }
    });
  }

  function updateStageBackgroundColor() {
    const bgTop = multiply(BODY_BG_COLOR_TOP, 1 + -stage.origin.y / 2000);
    const bgBottom = multiply(BODY_BG_COLOR_BOTTOM, 1 + -stage.origin.y / 2000);

    stage.$root.style.background = `linear-gradient(to bottom, ${toRgb(bgTop)}, ${toRgb(bgBottom)})`;
  }

  animate(dt => {
    animateWidgets();
    updateStageBackgroundColor();

    stage.update(dt);
  });

  document.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > 15 || Math.abs(e.deltaY) > 15) {
      stage.moveTargetOrigin({
        x: -e.deltaX * 2,
        y: -e.deltaY * 2
      });
    }
  });
}