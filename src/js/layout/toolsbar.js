import { setZoomToScale } from "../events/zoom";

/**
 * Initialize toolsbar
 */

export const updateZoomSlider = scale => {
  document.querySelector("#zoomDropdownButton").innerHTML = scale + "%";
  const slider = document.querySelector("#zoomSlider");
  slider.value = scale;
};

export const buildToolsbar = () => {
  const toolsbarIcons = [
    {
      delete: {
        action: () => {},
        icon: "fas fa-trash"
      },
      duplicate: {
        action: () => {},
        icon: "fas fa-clone"
      }
    },
    {
      undo: {
        action: () => {},
        icon: "fas fa-undo"
      },
      redo: {
        action: () => {},
        icon: "fas fa-redo"
      }
    },
    {
      "zoom in": {
        action: () => {},
        icon: "fas fa-search-plus"
      },
      "zoom out": {
        action: () => {},
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
            <input type="range" min="1" max="200" value="100" class="slider" id="zoomSlider">
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
      const { action, icon, element, events } = group[name];

      const menuItemElem = document.createElement(`a`);
      menuItemElem.title = name;

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
