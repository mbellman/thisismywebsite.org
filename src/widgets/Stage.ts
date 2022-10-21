import './Stage.scss';

export default class Stage {
  private element = document.createElement('div');

  public constructor() {
    this.element.classList.add('w-stage');

    document.body.appendChild(this.element);
  }

  public append(child: Element) {
    this.element.appendChild(child);
  }
}