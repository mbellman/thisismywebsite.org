import { Stage, Row, Pane, Text3D, PaneSlider, PaneCarousel, PaneField, Scrollbar } from '@panes';
import { animate } from '../../animation';
import { multiply, rgb, toRgb } from '../../utilities';
import './page.scss';

const BODY_BG_COLOR_TOP = rgb(55, 9, 129);
const BODY_BG_COLOR_BOTTOM = rgb(108, 75, 184);

function addMenu(stage: Stage) {
  interface Section {
    title: string
    visibilityOffset: number
    seen: boolean
  }

  const sections: Section[] = [
    { title: 'Panes', visibilityOffset: 0, seen: false },
    { title: 'Sizes', visibilityOffset: 450, seen: false },
    { title: 'Color themes', visibilityOffset: 900, seen: false },
    { title: 'Depth', visibilityOffset: 1250, seen: false },
    { title: 'Rotation', visibilityOffset: 1700, seen: false },
    { title: 'Slider', visibilityOffset: 2000, seen: false },
    { title: 'Carousel', visibilityOffset: 2750, seen: false },
    { title: 'Field', visibilityOffset: 3300, seen: false }
  ];

  let offset = 20;

  for (const section of sections) {
    const item = stage.add(
      new Text3D(section.title).name(section.title)
    );

    item.$root.classList.add('menu-link');

    item.transform({
      position: {
        x: 25,
        y: offset,
        z: -10
      }
    });

    item.$root.addEventListener('click', () => {
      if (section.seen) {
        stage.setTargetOrigin({
          y: section.visibilityOffset + 1
        });
      }
    });

    offset += 42;
  }

  animate(dt => {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const item = stage.find(section.title);

      item.basePosition = {
        x: stage.origin.x,
        y: stage.origin.y,
        z: stage.origin.z
      };

      if (stage.origin.y > section.visibilityOffset) {
        item.$root.classList.add('visible');

        section.seen = true;
      }

      if (section.seen) {
        if (
          stage.origin.y > section.visibilityOffset && 
          stage.origin.y < (sections[i + 1]?.visibilityOffset || section.visibilityOffset + 500)
        ) {
          item.$root.classList.add('focused');
        } else {
          item.$root.classList.remove('focused');
        }
      }
    }
  });
}

export default function setup() {
  const stage = new Stage({
    draggableX: false,
    draggableY: true,
    scrollableX: false,
    scrollableY: true,
  });

  stage.add(new Scrollbar({
    range: { y: 4000 }
  }));

  addMenu(stage);

  stage.addGroup(
    { x: 250, y: 20},
    new Text3D('PANES').name('title').style({ fontSize: '50px', fontWeight: '900', letterSpacing: '10px' }),
    new Text3D(`
      <p>
        Modern computers are fantastically powerful, and much of the<br>
        web development space leaves the medium woefully under-utilized.<br>
        <strong>Panes</strong> is a design system which breathes creative life into the form.
      </p>
      <p>
        We'll start with a single <strong>Pane</strong>, our fundamental primitive.
      </p>
    `).style({ fontSize: '20px' }),
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
      new Pane({ width: 100, height: 100 }).style({ paddingRight: '20px' }),
      new Pane({ width: 200, height: 200 }).style({ paddingRight: '20px' }),
      new Pane({ width: 300, height: 300 }).style({ paddingRight: '20px' }),
      new Pane({ width: 400, height: 400 }).style({ paddingRight: '20px' }),
    ),
    new Text3D(`
      <p>
        They also feature several color themes:
      </p>
    `).style({ fontSize: '20px' }),
    new Row(
      new Pane({ width: 200, height: 200 }).theme('light').style({ paddingRight: '20px' }),
      new Pane({ width: 200, height: 200 }).theme('dark').style({ paddingRight: '20px' })
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
      new Pane().style({ paddingRight: '20px' }),
      new Pane().transform({
        position: { x: -200, z: 250 }
      }),
      new Pane().transform({
        position: { x: -400, z: 500 }
      }),
      new Pane().transform({
        position: { x: -600, z: 750 }
      })
    ),
    new Text3D(`
      <p>
        They can be <strong>rotated</strong>:
      </p>
    `).style({ fontSize: '20px', paddingTop: '100px' }),
    new Row(
      new Pane({ width: 200, height: 200 }).style({ paddingRight: '20px' }),
      new Pane({ width: 200, height: 200 }).style({ paddingRight: '20px' }).transform({ rotation: { y: Math.PI * 0.1 }}),
      new Pane({ width: 200, height: 200 }).style({ paddingRight: '20px' }).transform({ rotation: { y: Math.PI * 0.2 }}),
      new Pane({ width: 200, height: 200 }).style({ paddingRight: '20px' }).transform({ position: { x: -50 }, rotation: { y: Math.PI * 0.3 }})
    ),
    new Text3D(`
      <p>
        They can be arranged into a draggable <strong>Slider</strong>:
      </p>
    `).style({ fontSize: '20px', paddingTop: '50px' }),
    new PaneSlider({ centeredX: false, centeredY: false, gutter: 30 })
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
    `).style({ fontSize: '20px', paddingTop: '200px' }),
    new PaneField()
      .addPane(new Pane().transform({ position: { x: 200, y: 100, z: 300 } }))
      .addPane(
        new Pane()
          .transform({ position: { x: 350, y: 300, z: 500 }, rotation: { y: -Math.PI * 0.2 } })
      )
      .addPane(
        new Pane({ width: 100, height: 100 })
          .transform({ position: { x: 100, y: 0 } })
      )
      .addPane(
        new Pane({ width: 150, height: 150 })
          .transform({ position: { x: 150, y: 100, z: 100 } })
      )
      .addPane(
        new Pane({ width: 120, height: 120 })
          .transform({ position: { x: 600, y: 170 } })
      )
      .addPane(
        new Pane({ width: 200, height: 200 })
          .transform({ position: { x: 50, y: 400 }, rotation: { y: Math.PI * 0.2 } })
      )
      .addPane(
        new Pane({ width: 250, height: 250 })
          .transform({ position: { x: 750, y: 250, z: 200 } })
      )
      .addPane(
        new Pane({ width: 150, height: 150 })
          .transform({ position: { x: 200, y: 400, z: 600 }, rotation: { y: Math.PI * 0.2 } })
      )
      .addPane(
        new Pane({ width: 200, height: 200 })
          .transform({ position: { x: 150, y: 250, z: 500 } })
      )
      .addPane(
        new Pane({ width: 300, height: 300 })
          .transform({ position: { x: 800, y: 300, z: 700 }, rotation: { y: -Math.PI * 0.2 } })
      )
      .addPane(
        new Pane({ width: 200, height: 200 })
          .transform({ position: { x: 250, y: 200, z: 800 } })
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
    const bgTop = multiply(BODY_BG_COLOR_TOP, 1 + stage.origin.y / 2000);
    const bgBottom = multiply(BODY_BG_COLOR_BOTTOM, 1 + stage.origin.y / 2000);

    stage.$root.style.background = `linear-gradient(to bottom, ${toRgb(bgTop)}, ${toRgb(bgBottom)})`;
  }

  animate(dt => {
    animateWidgets();
    updateStageBackgroundColor();

    stage.update(dt);
  });
}