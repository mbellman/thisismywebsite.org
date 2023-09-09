import Widget from './Widget';
import { Vector3 } from './Pane';
import './Stage.scss';

type WidgetConfig = {
  widget: Widget;
  position: Partial<Vector3>;
};

export default class Stage {
  public origin: Partial<Vector3> = {};
  private root = document.createElement('div');

  public constructor() {
    this.root.classList.add('w-stage');

    document.body.appendChild(this.root);
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public add<W extends Widget>(widget: W): W {
    this.root.appendChild(widget.$root);

    widget.stage = this;

    return widget;
  }

  public set<S extends Record<string, WidgetConfig>, K extends keyof S>(setup: S): Record<K, S[K]['widget']> {
    const widgetMap: Record<string, Widget> = {};

    for (const key in setup) {
      const { widget, position = {} } = setup[key];

      widgetMap[key] = widget;
      widget.basePosition = { x: 0, y: 0, z: 0, ...position };

      this.add(widget);
    }

    return widgetMap as any;
  }
}