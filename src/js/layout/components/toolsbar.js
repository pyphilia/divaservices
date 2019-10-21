/**
 * Initialize toolsbar
 */
import Vue from "vue";
import { MAX_SCALE, MIN_SCALE, Shortcuts } from "../../constants/constants";
import { mapState, mapActions } from "vuex";
import UndoRedoHistory from "../../store/plugins/UndoRedoHistory";
import { app } from "../../app";
import { TOOLSBAR } from "../../constants/selectors";
import { shortcutToString } from "../../utils/utils";
import { getElementByBoxId } from "../utils";

const Toolsbar = Vue.component("Toolsbar", {
  props: ["selectedElements", "paper", "scale"],
  methods: {
    shortcutToString(shortcut) {
      return shortcutToString(shortcut);
    },
    updateZoom(event) {
      this.$setZoom(event.target.value / 100, this.paper);
    },
    deleteAction() {
      this.deleteElements({ elements: this.selectedElements });
    },
    duplicateAction() {
      this.duplicateElements({ elements: this.selectedElements });
    },
    toggleLeftSidebar() {
      this.$root.$refs.leftsidebar.toggle();
    },
    ...mapActions("Interface", ["duplicateElements", "deleteElements"])
  },
  computed: {
    isLeftsidebarOpen() {
      return this.$root.$refs.leftsidebar.open;
    },
    ...mapState("Interface", ["elements"]),
    existSelection() {
      return this.selectedElements.length > 0;
    },
    toolsbarIcons() {
      return [
        {
          collapse: {
            action: this.toggleLeftSidebar,
            icon: "fas fa-caret-square-left",
            id: "collapseLeftSidebar",
            enabledCondition: true
          }
        },
        {
          delete: {
            action: this.deleteAction,
            icon: "fas fa-trash",
            id: "delete",
            enabledCondition: this.existSelection,
            shortcut: Shortcuts.DELETE
          },
          duplicate: {
            action: this.duplicateAction,
            icon: "fas fa-clone",
            id: "duplicate",
            enabledCondition: this.existSelection
          }
        },
        {
          undo: {
            action: () => {
              UndoRedoHistory.undo();
            },
            id: "undo",
            // classNames: "disabled",
            icon: "fas fa-undo",
            enabledCondition: UndoRedoHistory.canUndo(),
            shortcut: Shortcuts.UNDO
          },
          redo: {
            action: () => {
              UndoRedoHistory.redo();
            },
            // classNames: "disabled",
            id: "redo",
            icon: "fas fa-redo",
            enabledCondition: UndoRedoHistory.canRedo(),
            shortcut: Shortcuts.REDO
          }
        },
        {
          "zoom in": {
            action: () => {
              app.zoomInFromApp();
            },
            icon: "fas fa-search-plus",
            enabledCondition: this.scale < MAX_SCALE
          },
          "zoom out": {
            action: () => {
              app.zoomOutFromApp();
            },
            icon: "fas fa-search-minus",
            enabledCondition: this.scale > MIN_SCALE
          },
          "zoom slider": {
            action: () => {},
            element: ""
          }
        },
        {
          resize: {
            action: () => {
              const cellView = getElementByBoxId(
                this.selectedElements[0].boxId
              ).findView(app.paper);
              app.$createResizer(cellView);
            },
            icon: "fas fa-expand",
            enabledCondition: this.selectedElements.length == 1
          }
        }
      ];
    },
    sliderValue() {
      return Math.ceil(this.scale * 100);
    }
  },
  template: `
  <div id="${TOOLSBAR}">
    <div v-for="group in toolsbarIcons" class="group">

      <a v-for="({id, action, icon, element, shortcut, model, enabledCondition}, name) in group" 
      :id="id" :title="name + ' ' + shortcutToString(shortcut)" @click="enabledCondition ? action($event) : $event.preventDefault()"
      :class="{disabled: !enabledCondition}">
      
        <div v-if="name == 'zoom slider'" class="dropdown">
          <button class="btn btn-secondary btn-sm  dropdown-toggle" type="button" id="zoomDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {{sliderValue}}%
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="zoomDropdown">
              <div class="slidecontainer">
                <input type="range" :value="sliderValue" @input="updateZoom($event)" 
                min="${Math.ceil(MIN_SCALE * 100)}" 
                max="${Math.ceil(MAX_SCALE * 100)}" 
                class="slider" id="zoomSlider">
              </div>
          </div>
        </div>
          
        <i v-if="icon" :class="icon"></i>
          
        <div v-if="element" v-html="element"></div>
      </a>
    </div>
  </div>`
});

export default Toolsbar;
