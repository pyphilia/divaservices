import $ from "jquery";
import { saveWorkflow } from "./saveWorkflow";
import { getGraph, resetZoom, fitContent } from "./interface";
import { readWorkflow } from "./readWorkflow";

// const newWorkflow = (e) => {
//   e.preventDefault();
//   console.log("newWorkflow");
// };

const openWorkflow = e => {
  e.preventDefault();
  console.log("openWorkflow");
  readWorkflow();
};

const save = e => {
  e.preventDefault();
  console.log("saveWorkflow");
  saveWorkflow(getGraph().toJSON());
};

// const installWorkflow = e => {
//   e.preventDefault();
//   console.log("installWorkflow");
// };

const clearWorkflow = e => {
  e.preventDefault();
  console.log("clearWorkflow");
  getGraph().clear();
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

  for (const menuItem in rightSideBar) {
    console.log("TCL: buildRightSidebar -> menuItem", menuItem);
    const { action, attr } = rightSideBar[menuItem];
    const attributes = attr ? attr : {};
    const menuItemElem = $(`<a/>`, {
      class: "nav-link",
      text: menuItem,
      attr: attributes
    });
    menuItemElem.click(e => {
      action(e);
    });
    $("#right-sidebar nav").append(menuItemElem);
  }
};
