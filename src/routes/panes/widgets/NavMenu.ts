import { Text3D, Widget } from '@panes';
import './NavMenu.scss';

interface MenuItem {
  title: string
  visibilityOffset: number
  seen: boolean
}

const menuItems: MenuItem[] = [
  { title: 'Panes', visibilityOffset: 0, seen: false },
  { title: 'Sizes', visibilityOffset: 450, seen: false },
  { title: 'Color themes', visibilityOffset: 900, seen: false },
  { title: 'Depth', visibilityOffset: 1250, seen: false },
  { title: 'Rotation', visibilityOffset: 1700, seen: false },
  { title: 'Slider', visibilityOffset: 2000, seen: false },
  { title: 'Carousel', visibilityOffset: 2750, seen: false },
  { title: 'Field', visibilityOffset: 3300, seen: false }
]

export default class NavMenu extends Widget {
  /**
   * @override
   */
  public onAdded(): void {
    let offset = 20;

    for (const menuItem of menuItems) {
      const link = this.stage.add(
        new Text3D(menuItem.title).name(menuItem.title)
      );
  
      link.$root.classList.add('nav-menu__link');
  
      link.transform({
        position: {
          x: 25,
          y: offset,
          z: -10
        }
      });
  
      link.$root.addEventListener('click', () => {
        if (menuItem.seen) {
          this.stage.setTargetOrigin({
            y: menuItem.visibilityOffset + 1
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
    for (let i = 0; i < menuItems.length; i++) {
      const section = menuItems[i];
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
          this.stage.origin.y < (menuItems[i + 1]?.visibilityOffset || section.visibilityOffset + 500)
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