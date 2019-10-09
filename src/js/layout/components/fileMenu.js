import Vue from "vue";
import * as $ from "jquery";
import { copy } from "../../events/controls";
import { app } from "../../app";
import { mapActions, mapState } from "vuex";
import UndoRedoHistory from "../../store/plugins/UndoRedoHistory";
import { zoomInCondition, zoomOutCondition } from "./utils";

const FileMenu = Vue.component("FileMenu", {
  props: ["selectedElements", "copiedElements"],
  methods: {
    ...mapActions("Interface", ["duplicateElements"]),

    existHistory() {
      return UndoRedoHistory.canUndo();
    },
    existFuture() {
      return UndoRedoHistory.canRedo();
    }
  },
  computed: {
    ...mapState("Zoom", ["scale"]),
    existSelection() {
      return this.selectedElements.length > 0;
    },
    menu() {
      return {
        File: [
          { name: "New", action: () => {} },
          { name: "Open", action: () => {} }
        ],
        Edit: [
          {
            name: "Copy",
            action: () => {
              copy(this.selection);
            },
            requireSelection: true
          },
          {
            name: "Paste",
            action: () => {
              app.duplicateElements({ elements: this.copiedElements });
            },
            requireSelection: true
          },
          {
            name: "Cut",
            action: () => {
              copy(this.selectedElements);
              console.log("and i should delete but i am not implemented");
            },
            requireSelection: true
          },
          { name: "separator" },
          {
            name: "Clear",
            action: () => {
              app.graph.clear();
            }
          },
          {
            name: "Undo",
            action: () => {
              UndoRedoHistory.undo();
            },
            requireHistory: true
          },
          {
            name: "Redo",
            action: () => {
              UndoRedoHistory.redo();
            },
            requireFuture: true
          },
          { name: "separator" },
          { name: "Select All", action: () => {} },
          { name: "Unselect", action: () => {}, requireSelection: true },
          { name: "separator" },
          {
            name: "Zoom In",
            action: () => {
              app.zoomInFromApp();
            },
            requireZoom: true,
            condition: () => {
              return zoomInCondition(this.scale);
            }
          },
          {
            name: "Zoom Out",
            action: () => {
              app.zoomOutFromApp();
            },
            requireZoom: true,
            condition: () => {
              return zoomOutCondition(this.scale);
            }
          },
          { name: "Reset Zoom", action: () => {} },
          { name: "Fit Content", action: () => {} }
        ],
        Workflow: [
          {
            name: "Install",
            action: () => {}
          }
        ],
        Settings: [
          {
            name: "Layout Settings",
            action: () => {
              $("#exampleModal").modal();
            }
          }
        ]
      };
    }
  },
  template: `
  <nav id="navbar-menu" class="navbar navbar-expand-lg">
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
  <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNavDropdown">
  <ul class="navbar-nav">
  
  <li class="nav-item dropdown" v-for="(item, menuName) in menu">
  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{menuName}}</a>
  <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
  <a v-for="{name, action, condition, requireSelection, requireZoom, requireHistory, requireFuture} in item" v-if="name != 'separator'" @click="action"
  :class="{'dropdown-item':true, disabled:  (requireSelection && !existSelection) || (requireZoom && condition()) || (requireHistory && !existHistory()) || (requireFuture && !existFuture())} " href="#">{{name}}</a>
  <div v-else class="dropdown-divider"></div>
  </div>
  </li>
  
  </ul>
  </div>
  </nav>
  `
});

export default FileMenu;
