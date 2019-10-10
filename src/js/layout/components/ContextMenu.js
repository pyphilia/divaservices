import Vue from "vue";
import {
  CONTEXT_MENU_ELEMENT,
  CONTEXT_MENU_PAPER
} from "../../constants/selectors";
import { app } from "../../app";
import { copy } from "../../events/controls";
import { mapActions } from "vuex";

const ContextMenus = Vue.component("ContextMenus", {
  props: ["selectedElements", "copiedElements", "paper"],
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
  computed: {},
  methods: {
    ...mapActions("Interface", ["duplicateElements", "deleteElements"]),
    setPositionToContextMenu(menuName, { x, y }) {
      const screenPos = this.paper.localToClientPoint(x, y);
      const offset = this.paper.clientOffset();

      const left = screenPos.x - offset.x;
      const top = screenPos.y - offset.y;

      const menu = document.querySelector(this.contextMenus[menuName].el);
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      this.showContextMenu(this.contextMenus[menuName]);
    },
    showContextMenu(menuObj) {
      this.hideContextMenus();
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
        copy(this.selectedElements);
      });

    document
      .querySelector(`${CONTEXT_MENU_ELEMENT} .duplicate`)
      .addEventListener("click", async () => {
        if (app.selectedElements.length) {
          this.duplicateElements({
            elements: this.selectedElements
          });
        }
      });

    document
      .querySelector(`${CONTEXT_MENU_ELEMENT} .delete`)
      .addEventListener("click", () => {
        this.deleteElements({
          elements: this.selectedElements
        });
      });

    document
      .querySelector(`${CONTEXT_MENU_PAPER} .paste`)
      .addEventListener("click", async () => {
        this.duplicateElements({
          elements: this.copiedElements
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

export default ContextMenus;
