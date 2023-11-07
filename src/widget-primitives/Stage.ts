import Widget from './Widget';
import { Vector3 } from './Pane';
import './Stage.scss';

type WidgetConfig = {
  widget: Widget;
  position: Partial<Vector3>;
};

export default class Stage {
  public origin: Vector3 = {
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

  public add<W extends Widget>(widget: W, position: Partial<Vector3> = {}): W {
    this.root.appendChild(widget.$root);

    widget.stage = this;
    widget.basePosition = { x: 0, y: 0, z: 0, ...position };

    return widget;
  }
}