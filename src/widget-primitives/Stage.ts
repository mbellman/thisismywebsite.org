import Widget from './Widget';
import { Vector3 } from './Pane';
import './Stage.scss';

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
}