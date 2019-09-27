import { setZoomToScale, zoomOut, zoomIn } from "../events/zoom";
import { MAX_SCALE, MIN_SCALE } from "../constants/constants";
import {
  undo,
  redo,
  isHistoryEmpty,
  isFutureEmpty,
  addAction
} from "../utils/undo";
import { selectedElements } from "../events/selections";
import { ACTION_DELETE_ELEMENT, ACTION_PASTE } from "../constants/actions";

/**
 * Initialize toolsbar
 */

export const updateSelectionTools = () => {
  const selectionExists = selectedElements.length;
  document.getElementById("delete").className = selectionExists
    ? ""
    : "disabled";
  document.getElementById("duplicate").className = selectionExists
    ? ""
    : "disabled";
};

export const updateZoomTools = () => {
  const undoTool = document.getElementById("undo");
  const redoTool = document.getElementById("redo");
  undoTool.className = isHistoryEmpty() ? "disabled" : "";
  redoTool.className = isFutureEmpty() ? "disabled" : "";
};

export const updateZoomSlider = scale => {
  document.querySelector("#zoomDropdownButton").innerHTML = scale + "%";
  const slider = document.querySelector("#zoomSlider");
  slider.value = scale;
};

const deleteAction = () => {
  addAction(ACTION_DELETE_ELEMENT, { elements: selectedElements });
};
const duplicateAction = () => {
  addAction(ACTION_PASTE, { elements: selectedElements });
};

export const buildToolsbar = () => {
  const toolsbarIcons = [
    {
      delete: {
        action: deleteAction,
        icon: "fas fa-trash",
        id: "delete",
        classNames: "disabled"
      },
      duplicate: {
        action: duplicateAction,
        icon: "fas fa-clone",
        id: "duplicate",
        classNames: "disabled"
      }
    },
    {
      undo: {
        action: undo,
        id: "undo",
        classNames: "disabled",
        icon: "fas fa-undo"
      },
      redo: {
        action: redo,
        classNames: "disabled",
        id: "redo",
        icon: "fas fa-redo"
      }
    },
    {
      "zoom in": {
        action: zoomIn,
        icon: "fas fa-search-plus"
      },
      "zoom out": {
        action: zoomOut,
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
        <input type="range" min="${Math.ceil(
          MIN_SCALE * 100
        )}" max="${Math.ceil(
          MAX_SCALE * 100
        )}" value="100" class="slider" id="zoomSlider">
        </div>
        </div>
        </div>`,
        events: () => {
          const dropdown = document.getElementById("zoomDropdown");
          const slider = dropdown.querySelector("#zoomSlider");
          slider.oninput = function() {
            setZoomToScale(this.value / 100);
          };
        }
      }
    }
  ];

  const toolsbar = document.querySelector("#toolsbar");
  for (const group of toolsbarIcons) {
    // add separator before each group
    if (toolsbarIcons.indexOf(group) != 0) {
      const separator = document.createElement("div");
      separator.className = "separator";
      toolsbar.appendChild(separator);
    }
    for (const name in group) {
      const { action, id, classNames, icon, element, events } = group[name];

      const menuItemElem = document.createElement(`a`);
      menuItemElem.title = name;
      menuItemElem.id = id;
      menuItemElem.className = classNames;

      // add icon
      if (icon) {
        var i = document.createElement("i");
        i.className = icon;
        menuItemElem.appendChild(i);
      }
      // add html element
      else if (element) {
        menuItemElem.innerHTML = element;
      }

      // trigger event on click
      menuItemElem.addEventListener("click", e => {
        action(e, {});
      });
      toolsbar.appendChild(menuItemElem);

      // other events
      if (events) {
        events();
      }
    }
  }
};
