import { Text3D, Widget } from '@panes';
import './NavMenu.scss';

interface MenuItem {
  title: string
  visibilityOffset: number
  seen?: boolean
}

export default class NavMenu extends Widget {
  private items: MenuItem[];

  public constructor(items: MenuItem[]) {
    super();

    this.items = items;
  }

  /**
   * @override
   */
  public onAdded(): void {
    let offset = 20;

    for (const item of this.items) {
      const link = this.stage.add(
        new Text3D(item.title).name(item.title)
      );
  
      link.$root.classList.add('nav-menu__link');

      if (item.seen) {
        link.$root.classList.add('visible');
      }
  
      link.transform({
        position: {
          x: 25,
          y: offset,
          z: -10
        }
      });
  
      link.$root.addEventListener('click', () => {
        if (item.seen) {
          this.stage.setTargetOrigin({
            y: item.visibilityOffset + 1
          });
        }
      });
  
      offset += 42;
    }
  }

  /**
   * @override
   */
  public update(): void {
    for (let i = 0; i < this.items.length; i++) {
      const section = this.items[i];
      const link = this.stage.find(section.title);

      link.basePosition = {
        x: this.stage.origin.x,
        y: this.stage.origin.y,
        z: this.stage.origin.z
      };

      if (this.stage.origin.y > section.visibilityOffset) {
        link.$root.classList.add('visible');

        section.seen = true;
      }

      if (section.seen) {
        if (
          this.stage.origin.y > section.visibilityOffset && 
          this.stage.origin.y < (this.items[i + 1]?.visibilityOffset || section.visibilityOffset + 500)
        ) {
          link.$root.classList.add('focused');
        } else {
          link.$root.classList.remove('focused');
        }
      }
    }
  }

  protected createRoot(): HTMLDivElement {
    return null;
  }
}