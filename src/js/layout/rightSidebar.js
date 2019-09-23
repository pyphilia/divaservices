/**
 * Initialize the right sidebar
 */

import { saveWorkflow } from "../workflows/saveWorkflow";
import { graph, paper } from "../layout/interface";
import { resetZoom } from "../events/zoom";
import { readWorkflow } from "../workflows/readWorkflow";

// const newWorkflow = (e) => {
//   e.preventDefault();
//   console.log("newWorkflow");
// };

const fitContent = () => {
  paper.scaleContentToFit({
    padding: 20
  });
};

const openWorkflow = e => {
  e.preventDefault();
  console.log("openWorkflow");
  readWorkflow();
};

const save = e => {
  e.preventDefault();
  console.log("saveWorkflow");
  saveWorkflow(graph.toJSON());
};

// const installWorkflow = e => {
//   e.preventDefault();
//   console.log("installWorkflow");
// };

const clearWorkflow = e => {
  e.preventDefault();
  console.log("clearWorkflow");
  graph.clear();
};

const openSettings = () => {
  console.log("openSettings");
};

export const buildRightSidebar = () => {
  const rightSideBar = {
    // New: newWorkflow,
    Open: {
      action: openWorkflow
    },
    Save: { action: save },
    // Install: { action: installWorkflow },
    Clear: { action: clearWorkflow },
    "Reset Zoom": { action: resetZoom },
    "Fit Content": { action: fitContent },
    Settings: {
      action: openSettings,
      attr: {
        "data-toggle": "modal",
        "data-target": "#exampleModal",
        href: "#exampleModal"
      }
    }
  };

  const rightSidebar = document.querySelector("#right-sidebar nav");
  for (const menuItem in rightSideBar) {
    const { action, attr } = rightSideBar[menuItem];

    const menuItemElem = document.createElement(`a`);
    menuItemElem.classList.add("nav-link");
    menuItemElem.innerHTML = menuItem;
    menuItemElem.addEventListener("click", e => {
      action(e, {});
    });
    if (attr) {
      for (const [key, value] of Object.entries(attr)) {
        menuItemElem.setAttribute(key, value);
      }
    }
    rightSidebar.appendChild(menuItemElem);
  }
};
