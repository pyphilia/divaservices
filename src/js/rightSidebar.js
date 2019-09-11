import $ from "jquery";
import { saveWorkflow } from "./saveWorkflow";
import { graph, paper } from "./interface";
import { resetZoom } from "./events";
import { readWorkflow } from "./readWorkflow";

// const newWorkflow = (e) => {
//   e.preventDefault();
//   console.log("newWorkflow");
// };

const fitContent = () => {
  paper.scaleContentToFit({
    padding: 20
  });
};

const openWorkflow = (e, webservices) => {
  e.preventDefault();
  console.log("openWorkflow");
  readWorkflow(webservices);
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

export const buildRightSidebar = webservices => {
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
    const { action, attr } = rightSideBar[menuItem];
    const menuItemElem = $(`<a/>`, {
      class: "nav-link",
      text: menuItem,
      attr: attr ? attr : {}
    });
    menuItemElem.click(e => {
      action(e, webservices);
    });
    $("#right-sidebar nav").append(menuItemElem);
  }
};
