import Vue from "vue";
import {
  CONTEXT_MENU_ELEMENT,
  CONTEXT_MENU_PAPER
} from "./constants/selectors";
import { app } from "./main";
import {
  ACTION_ADD_ELEMENTS,
  ACTION_DELETE_ELEMENTS
} from "./constants/actions";
import { copy } from "./events/controls";

export const ContextMenuApp = new Vue({
  el: "#contextMenus",
  data: {
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
    window.addEventListener("click", () => {
      for (let [, value] of Object.entries(this.contextMenus)) {
        if (value.visible) {
          this.hideContextMenu(value);
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

    document
      .querySelector(`${CONTEXT_MENU_ELEMENT}`)
      .addEventListener("click", () => {
        this.hideContextMenus();
      });

    document
      .querySelector(`${CONTEXT_MENU_ELEMENT} .copy`)
      .addEventListener("click", () => {
        copy(app.selectedElements);
      });

    document
      .querySelector(`${CONTEXT_MENU_ELEMENT} .duplicate`)
      .addEventListener("click", async () => {
        if (app.selectedElements.length) {
          app.addAction(ACTION_ADD_ELEMENTS, {
            elements: app.selectedElements
          });
        }
      });

    document
      .querySelector(`${CONTEXT_MENU_ELEMENT} .delete`)
      .addEventListener("click", () => {
        app.addAction(ACTION_DELETE_ELEMENTS, {
          elements: app.selectedElements
        });
      });

    document
      .querySelector(`${CONTEXT_MENU_PAPER} .paste`)
      .addEventListener("click", async () => {
        app.addAction(ACTION_ADD_ELEMENTS, {
          elements: [...app.copiedElements]
        });
      });
  },
  template: `
    <div>
    <div class="contextmenu" id="contextmenu-element">
    <span class="copy">Copy</span>
    <span class="duplicate">Duplicate</span>
    <span class="delete">Delete</span>
    </div>
    
    <div class="contextmenu" id="contextmenu-paper">
    <span class="paste">Paste</span>
    <span class="delete">Clear</span>
    </div>
    </div>
    `
});
