import Widget, { Vec2, Vec3, createVec3, defaultVec3 } from './Widget';
import './Stage.scss';
import { lerp } from '../utilities';

interface StageOptions {
  draggable?: boolean
}

export default class Stage {
  private widgets: Widget[] = [];
  private targetOrigin: Vec3 = createVec3();
  private root = document.createElement('div');

  public origin: Vec3 = createVec3();

  public constructor({
    draggable = false
  }: StageOptions = {}) {
    this.root.classList.add('w-stage');

    document.body.appendChild(this.root);

    if (draggable) {
      this.bindDragEvents();
    }
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

  public setTargetOrigin(target: Partial<Vec3> = {}) {
    this.targetOrigin = defaultVec3(target);
  }

  public moveTargetOrigin(move: Partial<Vec3> = {}) {
    this.targetOrigin.x += move.x || 0;
    this.targetOrigin.y += move.y || 0;
    this.targetOrigin.z += move.z || 0;
  }

  public update(dt: number) {
    for (const widget of this.widgets) {
      widget.update();
    }

    this.origin.x = lerp(this.origin.x, this.targetOrigin.x, dt * 5);
    this.origin.y = lerp(this.origin.y, this.targetOrigin.y, dt * 5);
    this.origin.z = lerp(this.origin.z, this.targetOrigin.z, dt * 5);
  }

  private bindDragEvents() {
    let dragging = false;
    let lastClientX = 0;
    let lastClientY = 0;
  
    const lastDelta: Vec2 = {
      x: 0,
      y: 0
    };

    document.body.style.cursor = 'grab';

    this.$root.addEventListener('mousedown', e => {
      dragging = true;
  
      lastClientX = e.clientX;
      lastClientY = e.clientY;

      this.targetOrigin = { ...this.origin };
  
      document.body.style.cursor = 'grabbing';
    });
  
    document.addEventListener('mousemove', e => {
      if (dragging) {
        lastDelta.x = e.clientX - lastClientX;
        lastDelta.y = e.clientY - lastClientY;
  
        this.targetOrigin.x += lastDelta.x;
        this.targetOrigin.y += lastDelta.y;
  
        this.origin.x = this.targetOrigin.x;
        this.origin.y = this.targetOrigin.y;
        this.origin.z = this.targetOrigin.z;
  
        lastClientX = e.clientX;
        lastClientY = e.clientY;
      }
    });
  
    document.addEventListener('mouseup', () => {
      if (dragging) {
        this.targetOrigin.x += lastDelta.x * 20;
        this.targetOrigin.y += lastDelta.y * 20;
      }
  
      dragging = false;
  
      document.body.style.cursor = 'grab';
    });
  }
}