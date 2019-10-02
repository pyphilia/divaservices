import {
  CONTEXT_MENU_ELEMENT,
  CONTEXT_MENU_PAPER
} from "../constants/selectors";
import { app } from "../main";

const plugin = {
  install(Vue) {
    Vue.mixin({
      data() {
        return {
          contextMenus: {
            element: {
              visible: false,
              el: CONTEXT_MENU_ELEMENT
            },
            paper: {
              visible: false,
              el: CONTEXT_MENU_PAPER
            }
          }
        };
      },
      methods: {
        setPositionToContextMenu(menuName, { top, left }) {
          const menu = document.querySelector(this.contextMenus[menuName].el);
          menu.style.left = `${left}px`;
          menu.style.top = `${top}px`;
          this.showContextMenu(this.contextMenus[menuName]);
        },
        showContextMenu(menuObj) {
          const menu = document.querySelector(menuObj.el);
          menu.style.display = "block";
          menuObj.visible = !menuObj.visible;
        },
        hideContextMenu(menuObj) {
          const menu = document.querySelector(menuObj.el);
          menu.style.display = "none";
          menuObj.visible = !menuObj.visible;
        },
        hideContextMenus() {
          for (const [, menu] of Object.entries(this.contextMenus)) {
            this.hideContextMenu(menu);
          }
        }
      },
      mounted() {
        console.log("contextmnu moutned");
        window.addEventListener("click", () => {
          for (let [, value] of Object.entries(this.contextMenus)) {
            if (value.visible) {
              app.hideContextMenu(value);
            }
          }
        });

        // prevent right click on custom context menus
        for (const [, menuObj] of Object.entries(this.contextMenus)) {
          document.querySelector(menuObj.el).addEventListener(
            "contextmenu",
            event => {
              event.preventDefault();
            },
            false
          );
        }
      }
    });
  }
};

export default plugin;
