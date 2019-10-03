import Vue from "vue";
import * as $ from "jquery";
import { copy } from "../../events/controls";
import { ACTION_ADD_ELEMENTS } from "../../constants/actions";
import { graph } from "../interface";

const FileMenu = Vue.component("FileMenu", {
  props: [
    "existSelection",
    "existFuture",
    "existHistory",
    "selection",
    "copiedEls",
    "redoFunc",
    "undoFunc",
    "addActionFunc"
  ],
  data: function() {
    return {
      // selection: this.selectedElements,
      copyEls: this.copiedElements,
      menu: {
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
              this.addActionFunc(ACTION_ADD_ELEMENTS, [...this.copiedEls]);
            },
            requireSelection: true
          },
          {
            name: "Cut",
            action: () => {
              copy(this.selection);
              console.log("and i should delete but i am not implemented");
            },
            requireSelection: true
          },
          { name: "separator" },
          {
            name: "Clear",
            action: () => {
              graph.clear();
            }
          },
          {
            name: "Undo",
            action: () => {
              this.undoFunc();
            },
            requireHistory: true
          },
          {
            name: "Redo",
            action: () => {
              this.redoFunc();
            },
            requireFuture: true
          },
          { name: "separator" },
          { name: "Select All", action: () => {} },
          { name: "Unselect", action: () => {}, requireSelection: true },
          { name: "separator" },
          { name: "Zoom In", action: () => {} },
          { name: "Zoom Out", action: () => {} },
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
      }
    };
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
  <a v-for="{name, action, requireSelection, requireHistory, requireFuture} in item" v-if="name != 'separator'" @click="action"
  :class="{'dropdown-item':true, disabled:  (requireSelection && !existSelection) || (requireHistory &&!existHistory) || (requireFuture && !existFuture)} " href="#">{{name}}</a>
  <div v-else class="dropdown-divider"></div>
  </div>
  </li>
  
  </ul>
  </div>
  </nav>
  `
});

export default FileMenu;
