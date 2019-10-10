/**
 * Initialize toolsbar
 */
import Vue from "vue";
import { MAX_SCALE, MIN_SCALE } from "../../constants/constants";
import { mapState, mapActions } from "vuex";
import UndoRedoHistory from "../../store/plugins/UndoRedoHistory";
import { app } from "../../app";

const Toolsbar = Vue.component("Toolsbar", {
  props: ["selectedElements", "paper"],
  methods: {
    updateZoom(event) {
      this.setZoom({ nextScale: event.target.value / 100, paper: this.paper });
    },
    deleteAction() {
      this.deleteElements({ elements: this.selectedElements });
    },
    duplicateAction() {
      this.duplicateElements({ elements: this.selectedElements });
    },
    existHistory() {
      return UndoRedoHistory.canUndo();
    },
    existFuture() {
      return UndoRedoHistory.canRedo();
    },
    ...mapActions("Zoom", ["zoomOut", "setZoom"]),
    ...mapActions("Interface", ["duplicateElements", "deleteElements"])
  },
  computed: {
    ...mapState("Zoom", ["scale"]),
    ...mapState("Interface", ["elements"]),
    existSelection() {
      return this.selectedElements.length > 0;
    },
    toolsbarIcons() {
      return [
        {
          delete: {
            action: this.deleteAction,
            icon: "fas fa-trash",
            id: "delete",
            requireSelection: true
          },
          duplicate: {
            action: this.duplicateAction,
            icon: "fas fa-clone",
            id: "duplicate",
            requireSelection: true
          }
        },
        {
          undo: {
            action: () => {
              UndoRedoHistory.undo();
            },
            id: "undo",
            classNames: "disabled",
            icon: "fas fa-undo",
            requireHistory: true
          },
          redo: {
            action: () => {
              UndoRedoHistory.redo();
            },
            classNames: "disabled",
            id: "redo",
            icon: "fas fa-redo",
            requireFuture: true
          }
        },
        {
          "zoom in": {
            action: () => {
              app.zoomInFromApp();
            },
            icon: "fas fa-search-plus",
            requireZoom: true,
            condition: () => {
              return this.scale >= MAX_SCALE;
            }
          },
          "zoom out": {
            action: () => {
              app.zoomOutFromApp();
            },
            icon: "fas fa-search-minus",
            requireZoom: true,
            condition: () => {
              return this.scale <= MIN_SCALE;
            }
          },
          "zoom slider": {
            action: () => {},
            element: `
          `
          }
        }
      ];
    },
    sliderValue() {
      return Math.ceil(this.scale * 100);
    }
  },
  template: `<div id="toolsbar">
  <div v-for="group in toolsbarIcons" class="group">
  <a v-for="({id, action, icon, element, model, requireHistory, requireFuture, requireSelection, requireZoom, condition}, name) in group" :id="id" :title="name" @click="action()"
  :class="{disabled: (requireSelection && !existSelection) || (requireZoom && condition()) || (requireHistory &&!existHistory()) || (requireFuture && !existFuture())}">
  
  <div v-if="name == 'zoom slider'" class="dropdown">
  <button class="btn btn-secondary btn-sm  dropdown-toggle" type="button" id="zoomDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
  {{sliderValue}}%
  </button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="zoomDropdown">
  <div class="slidecontainer">
  <input type="range" :value="sliderValue" @input="updateZoom($event)" min="${Math.ceil(
    MIN_SCALE * 100
  )}" max="${Math.ceil(MAX_SCALE * 100)}" class="slider" id="zoomSlider">
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