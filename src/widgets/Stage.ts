import './Stage.scss';

export default class Stage {
  private root = document.createElement('div');

  public constructor() {
    this.root.classList.add('w-stage');

    document.body.appendChild(this.root);
  }

  public get $root(): HTMLDivElement {
    return this.root;
  }

  public append(child: Element) {
    this.root.appendChild(child);
  }
}