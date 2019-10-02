/**
 * Initialize toolsbar
 */
import Vue from "vue";
import { app } from "../../main";
import { setZoomToScale, zoomOut, zoomIn } from "../../events/zoom";
import { MAX_SCALE, MIN_SCALE } from "../../constants/constants";
import { ACTION_DELETE_ELEMENT, ACTION_PASTE } from "../../constants/actions";

export const updateZoomSlider = scale => {
  document.querySelector("#zoomDropdownButton").innerHTML = scale + "%";
  const slider = document.querySelector("#zoomSlider");
  slider.value = scale;
};

const undoVue = () => {
  app.undo();
};

const redoVue = () => {
  app.redo();
};

const zoomInVue = () => {
  zoomIn();
};

const zoomOutVue = () => {
  zoomOut();
};

const deleteAction = () => {
  app.addAction(ACTION_DELETE_ELEMENT, { elements: app.selectedElements });
};
const duplicateAction = () => {
  app.addAction(ACTION_PASTE, { elements: app.selectedElements });
};

const toolsbarIcons = [
  {
    delete: {
      action: deleteAction,
      icon: "fas fa-trash",
      id: "delete",
      requireSelection: true
    },
    duplicate: {
      action: duplicateAction,
      icon: "fas fa-clone",
      id: "duplicate",
      requireSelection: true
    }
  },
  {
    undo: {
      action: undoVue,
      id: "undo",
      classNames: "disabled",
      icon: "fas fa-undo",
      requireHistory: true
    },
    redo: {
      action: redoVue,
      classNames: "disabled",
      id: "redo",
      icon: "fas fa-redo",
      requireFuture: true
    }
  },
  {
    "zoom in": {
      action: zoomInVue,
      icon: "fas fa-search-plus"
    },
    "zoom out": {
      action: zoomOutVue,
      icon: "fas fa-search-minus"
    },
    "zoom slider": {
      action: () => {},
      element: `
      <div class="dropdown">
      <button class="btn btn-secondary btn-sm  dropdown-toggle" type="button" id="zoomDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      100%
      </button>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="zoomDropdown">
      <div class="slidecontainer">
      <input type="range" min="${Math.ceil(MIN_SCALE * 100)}" max="${Math.ceil(
        MAX_SCALE * 100
      )}" value="100" class="slider" id="zoomSlider">
          </div>
          </div>
          </div>`
    }
  }
];

const Toolsbar = Vue.component("Toolsbar", {
  props: ["existSelection", "existHistory", "existFuture"],
  data: function() {
    return {
      toolsbarIcons
    };
  },
  mounted() {
    const dropdown = document.getElementById("zoomDropdown");
    const slider = dropdown.querySelector("#zoomSlider");
    slider.oninput = function() {
      setZoomToScale(this.value / 100);
    };
  },
  template: `<div id="toolsbar">
      <div v-for="group in toolsbarIcons" class="group">
      <a v-for="({id, action, icon, element, requireHistory, requireFuture, requireSelection}, name) in group" :id="id" :title="name" @click="action($event, {})"
       :class="{disabled: (requireSelection && !existSelection) || (requireHistory &&!existHistory) || (requireFuture && !existFuture)}">
      
      <i v-if="icon" :class="icon"></i>

      <div v-if="element" v-html="element"></div>
      </a>
      </div>
      </div>`
});

export default Toolsbar;
