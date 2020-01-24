/**
 * Context Menu component
 */

import Vue from "vue";
import {
  CONTEXT_MENU_ELEMENT,
  CONTEXT_MENU_PAPER,
  CONTEXT_MENU_ELEMENT_SELECTOR,
  CONTEXT_MENU_PAPER_SELECTOR,
  COPY_CLASS,
  DELETE_CLASS,
  DUPLICATE_CLASS,
  PASTE_CLASS,
  CLEAR_CLASS
} from "../utils/selectors";
import { mapActions } from "vuex";
import Paper from "../classes/Paper";

const ContextMenus = Vue.component("ContextMenus", {
  props: ["selectedElements", "copiedElements", "currentElements", "copy"],
  data() {
    return {
      // define 2 context menus: for element, for paper
      contextMenus: {
        [CONTEXT_MENU_ELEMENT]: {
          visible: false,
          el: CONTEXT_MENU_ELEMENT_SELECTOR,
          menu: {
            Copy: {
              className: COPY_CLASS,
              action: () => {
                this.copy();
              }
            },
            Duplicate: {
              className: DUPLICATE_CLASS,
              action: () => {
                if (this.selectedElements.length) {
                  this.$duplicateElements({
                    elements: this.selectedElements
                  });
                }
              }
            },
            Delete: {
              className: DELETE_CLASS,
              action: () => {
                this.$deleteElements({
                  elements: this.selectedElements
                });
              }
            }
          }
        },
        [CONTEXT_MENU_PAPER]: {
          visible: false,
          el: CONTEXT_MENU_PAPER_SELECTOR,
          menu: {
            Paste: {
              className: PASTE_CLASS,
              action: () => {
                this.$duplicateElements({
                  elements: this.copiedElements
                });
              }
            },
            Clear: {
              className: CLEAR_CLASS,
              action: () => {
                this.$deleteElements({
                  elements: this.currentElements
                });
              }
            }
          }
        }
      }
    };
  },
  computed: {},
  methods: {
    ...mapActions("Interface", ["$duplicateElements", "$deleteElements"]),
    setPositionToContextMenu(menuName, { x, y }) {
      const screenPos = Paper.paper.localToClientPoint(x, y);
      const offset = Paper.paper.clientOffset();

      const left = screenPos.x - offset.x;
      const top = screenPos.y - offset.y;

      const menu = document.querySelector(`#${this.contextMenus[menuName].el}`);
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      this.showContextMenu(this.contextMenus[menuName]);
    },
    showContextMenu(menuObj) {
      this.hideContextMenus();
      const menu = document.querySelector(`#${menuObj.el}`);
      menu.style.display = "block";
      menuObj.visible = !menuObj.visible;
    },
    hideContextMenu(menuObj) {
      const menu = document.querySelector(`#${menuObj.el}`);
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
      document.querySelector(`#${menuObj.el}`).addEventListener(
        "contextmenu",
        event => {
          event.preventDefault();
        },
        false
      );
    }
  },
  template: `
    <div>
    <div v-for="menu in contextMenus" class="contextmenu" :id="menu.el" @click="hideContextMenus()">
    <span v-for="({className, action}, name) in menu.menu" :class="className" @click="action()">{{name}}</span>
    </div>
    </div>
    `
});

export default ContextMenus;
