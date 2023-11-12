import Stage from './widget-primitives/Stage';
import Row from './widget-primitives/Row';
import Pane from './widget-primitives/Pane';
import Text3D from './widget-primitives/Text3D';
import PaneSlider from './widget-primitives/PaneSlider';
import PaneCarousel from './widget-primitives/PaneCarousel';
import PaneField from './widget-primitives/PaneField';
import { animate } from './animation';
import { multiply, rgb, toRgb } from './utilities';

const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

export function setupPanesPage() {
  const stage = new Stage({
    draggable: true
  });

  // @todo fix inverted z
  // @todo fix inverted stage origin
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
        position: { x: -200, z: -250 }
      }),
      new Pane().transform({
        position: { x: -400, z: -500 }
      }),
      new Pane().transform({
        position: { x: -600, z: -750 }
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
      new Pane({ width: 200, height: 200 }).style({ padding: '10px' }).transform({ position: { x: -50 }, rotation: { y: Math.PI * 0.3 }})
    ),
    new Text3D(`
      <p>
        They can be arranged into a draggable <strong>Slider</strong>:
      </p>
    `).style({ fontSize: '20px', paddingTop: '50px' }),
    new PaneSlider({ centeredX: false, centeredY: false })
      .addPane(new Pane())
      .addPane(new Pane({ width: 300, height: 400 }))
      .addPane(new Pane({ width: 300, height: 500 }))
      .addPane(new Pane({ width: 300, height: 600 })),
    new Text3D(`
      <p>
        ...Or a <strong>Carousel</strong>:
      </p>
    `).style({ fontSize: '20px' }),
    new PaneCarousel({ centeredY: false })
      .transform({ position: { x: -250 } })
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
        ...And even a draggable, zoomable <strong>Field</strong>:
      </p>
    `).style({ fontSize: '20px', paddingTop: '100px' }),
    new PaneField()
      .addPane(new Pane().transform({ position: { x: 200, y: 100, z: -300 } }))
      .addPane(
        new Pane()
          .transform({ position: { x: 350, y: 300, z: -500 }, rotation: { y: -Math.PI * 0.2 } })
      )
      .addPane(
        new Pane({ width: 100, height: 100 })
          .transform({ position: { x: 100, y: 0 } })
      )
      .addPane(
        new Pane({ width: 200, height: 200 })
          .transform({ position: { x: 50, y: 400 }, rotation: { y: Math.PI * 0.2 } })
      )
      .addPane(
        new Pane({ width: 250, height: 250 })
          .transform({ position: { x: 750, y: 250, z: -200 } })
      )
  );

  const title = stage.find('title');

  function animateWidgets() {
    title?.transform({
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

  // @todo temporary wheel suppression on mouseup/capturing distinct wheel gestures
  document.addEventListener('wheel', e => {
    stage.moveTargetOrigin({
      x: -e.deltaX * 2,
      y: -e.deltaY * 2
    });
  });
}