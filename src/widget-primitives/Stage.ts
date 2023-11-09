import Widget, { Vec3, defaultVec3 } from './Widget';
import './Stage.scss';

export default class Stage {
  private widgets: Widget[] = [];

  public origin: Vec3 = {
    x: 0,
    y: 0,
    z: 0
  };

  private root = document.createElement('div');

  public constructor() {
    this.root.classList.add('w-stage');

    document.body.appendChild(this.root);
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public add<W extends Widget>(widget: W, position: Partial<Vec3> = {}): W {
    if (widget.$root) {
      this.root.appendChild(widget.$root);
    }

    widget.stage = this;
    widget.basePosition = defaultVec3(position);

    this.widgets.push(widget);

    return widget;
  }

  public update() {
    for (const widget of this.widgets) {
      widget.update();
    }
  }
}