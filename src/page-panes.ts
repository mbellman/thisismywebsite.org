import { animate } from './animation';
import { multiply, rgb, toRgb } from './utilities';
import Stage from './widget-primitives/Stage';
import Text3D from './widget-primitives/Text3D';
import Pane from './widget-primitives/Pane';
import Row from './widget-primitives/Row';
import PaneCarousel from './widget-primitives/PaneCarousel';
import PaneSlider from './widget-primitives/PaneSlider';

const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

export function setupPanesPage() {
  const stage = new Stage({
    draggable: true
  });

  stage.addGroup(
    { x: 250, y: 20},
    new Text3D('PANES').name('title').style({ fontSize: '50px', fontWeight: '900', letterSpacing: '10px' }),
    new Text3D(`
      <p>
        Modern computers are fantastically powerful, and much of the web development space leaves the medium woefully under-utilized.
        <strong>Panes</strong> is a library which breathes creative life into the form.
      </p>
      <p>
        We'll start with a single <strong>Pane</strong>, our fundamental primitive.
      </p>
    `).style({
      fontSize: '20px',
      width: '700px'
    }),
    new Pane().style({ padding: '20px 0' }),
    new Text3D(`
      <p>
        A <strong>Pane</strong> is just a block which houses content. <strong>Panes</strong> sit
        within a <strong>Stage</strong>. More on that later.
      </p>
      <p>
        They can have different sizes:
      </p>
    `).style({
      fontSize: '20px'
    }),
    new Row(
      new Pane({ width: 100, height: 100 }).style({ padding: '10px' }),
      new Pane({ width: 200, height: 200 }).style({ padding: '10px' }),
      new Pane({ width: 300, height: 300 }).style({ padding: '10px' }),
      new Pane({ width: 400, height: 400 }).style({ padding: '10px' }),
    ),
    new Text3D(`
      <p>
        They also feature several color themes:
      </p>
    `).style({
      fontSize: '20px'
    }),
    new Row(
      new Pane({ width: 200, height: 200 }).theme('light').style({ padding: '10px' }),
      new Pane({ width: 200, height: 200 }).theme('dark').style({ padding: '10px' })
    ),
    new Text3D(`
      <p>
        More interestingly, <strong>Panes</strong> can be placed in <strong>3D space</strong>:
      </p>
    `).style({
      fontSize: '20px',
      paddingTop: '100px'
    }),
    new Row(
      new Pane().style({ padding: '10px' }),
      new Pane().transform({
        position: {
          x: -200, z: -250
        }
      }),
      new Pane().transform({
        position: {
          x: -400, z: -500
        }
      })
    ),
    new Text3D(`
      <p>
        They can be <strong>rotated</strong>:
      </p>
    `).style({ fontSize: '20px', paddingTop: '100px' }),
    new Row(
      new Pane({ width: 200, height: 200 }).style({ padding: '10px' }),
      new Pane({ width: 200, height: 200 }).style({ padding: '10px' }).transform({ rotation: { y: Math.PI * 0.1 }}),
      new Pane({ width: 200, height: 200 }).style({ padding: '10px' }).transform({ rotation: { y: Math.PI * 0.2 }}),
      new Pane({ width: 200, height: 200 }).style({ padding: '10px' }).transform({ rotation: { y: Math.PI * 0.3 }})
    ),
    new Text3D(`
      <p>
        They can be arranged into a <strong>carousel</strong>:
      </p>
    `).style({ fontSize: '20px', paddingTop: '100px' }),
    new PaneCarousel({ centeredY: false })
      .transform({ position: { x: -250, y: 50 } })
      .addPane(new Pane())
      .addPane(new Pane())
      .addPane(new Pane())
      .addPane(new Pane())
      .addPane(new Pane())
      .addPane(new Pane())
      .addPane(new Pane())
      .addPane(new Pane())
      .setRadius(700),
    new Text3D(`
      <p>
        ...Or a <strong>slider</strong>:
      </p>
    `).style({ fontSize: '20px', paddingTop: '100px' }),
    new PaneSlider({ centeredX: false, centeredY: false })
      .transform({ position: { x: 0, y: 50 } })
      .addPane(new Pane({ width: 300, height: 600 }))
      .addPane(new Pane({ width: 300, height: 500 }))
      .addPane(new Pane({ width: 300, height: 400 }))
      .addPane(new Pane())
      .addPane(new Pane({ width: 50, height: 50 }))
  );

  const title = stage.find('title');

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
    stage.moveTargetOrigin({
      x: -e.deltaX * 2,
      y: -e.deltaY * 2
    });
  });
}