/**
 * Toolsbar component
 * gather all operations on paper and elements
 */
import Vue from "vue";
import * as $ from "jquery";
import {
  MAX_SCALE,
  MIN_SCALE,
  Shortcuts,
  ICON_DELETE,
  ICON_DUPLICATE,
  ICON_UNDO,
  ICON_REDO,
  ICON_ZOOM_IN,
  ICON_ZOOM_OUT,
  ICON_RESIZE,
  ICON_SETTINGS,
  ICON_SEARCH,
  ICON_INSTALL,
  ICON_SAVE
} from "../../constants/constants";
import { mapState, mapActions } from "vuex";
import UndoRedoHistory from "../../store/plugins/UndoRedoHistory";
import { app } from "../../app";
import { TOOLSBAR } from "../../constants/selectors";
import { shortcutToString } from "../../utils/utils";
import { getElementByBoxId } from "../utils";
import { saveWorkflow } from "../../workflows/saveWorkflow";
import { fireAlert } from "../../utils/alerts";
import { MESSAGE_SAVE_SUCCESS } from "../../constants/messages";
import { API } from "divaservices-utils";

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
      this.$deleteElements({ elements: this.selectedElements });
    },
    duplicateAction() {
      this.$duplicateElements({ elements: this.selectedElements });
    },
    toggleLeftSidebar() {
      this.$root.$refs.leftsidebar.toggle();
    },
    ...mapActions("Interface", ["$duplicateElements", "$deleteElements"])
  },
  computed: {
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
            icon: ICON_DELETE,
            id: "delete",
            enabledCondition: this.existSelection,
            shortcut: Shortcuts.DELETE
          },
          duplicate: {
            action: this.duplicateAction,
            icon: ICON_DUPLICATE,
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
            icon: ICON_UNDO,
            enabledCondition: UndoRedoHistory.canUndo(),
            shortcut: Shortcuts.UNDO
          },
          redo: {
            action: () => {
              UndoRedoHistory.redo();
            },
            // classNames: "disabled",
            id: "redo",
            icon: ICON_REDO,
            enabledCondition: UndoRedoHistory.canRedo(),
            shortcut: Shortcuts.REDO
          }
        },
        {
          "zoom in": {
            action: () => {
              app.zoomInFromApp();
            },
            icon: ICON_ZOOM_IN,
            enabledCondition: this.scale < MAX_SCALE
          },
          "zoom out": {
            action: () => {
              app.zoomOutFromApp();
            },
            icon: ICON_ZOOM_OUT,
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
            icon: ICON_RESIZE,
            enabledCondition: this.selectedElements.length === 1
          }
        },
        {
          settings: {
            action: () => {
              $("#exampleModal").modal("show");
            },
            icon: ICON_SETTINGS,
            enabledCondition: true
          }
        },
        {
          search: {
            action: () => {
              console.log(app.$refs);
              app.$refs.searchElements.openSearch();
            },
            icon: ICON_SEARCH,
            enabledCondition: true
          }
        },
        {
          save: {
            action: async () => {
              // @TODO receive response and fire correct alert
              await saveWorkflow(app.graph.toJSON());
              fireAlert("success", MESSAGE_SAVE_SUCCESS);
            },
            icon: ICON_SAVE,
            enabledCondition: true
          },
          "save and install": {
            action: async () => {
              await saveWorkflow(app.graph.toJSON(), true);
              top.window.location.href = API.getWorkflowExecutionViewUrl(
                app.workflowId
              );
            },
            icon: ICON_INSTALL,
            enabledCondition: true
          }
        }
      ];
    },
    sliderValue() {
      return Math.ceil(this.scale * 100);
    }
  },
  // @TODO search done twice because of a
  template: `
  <div id="${TOOLSBAR}">
    <div v-for="group in toolsbarIcons" class="group">

      <a v-for="({id, action, icon, element, shortcut, model, enabledCondition}, name) in group" 
      :id="id" :title="name + ' ' + shortcutToString(shortcut)" @click="enabledCondition ? action($event) : $event.preventDefault()"
      :class="{disabled: !enabledCondition}">
      
        <div v-if="name === 'zoom slider'" class="dropdown">
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
          
      </a>
    </div>
  </div>`
});

export default Toolsbar;
