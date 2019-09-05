import $ from "jquery";
import { saveWorkflow } from "./saveWorkflow";
import { getGraph, resetZoom, fitContent } from "./interface";
import { readWorkflow } from "./readWorkflow";

const newWorkflow = () => {
  console.log("newWorkflow");
};

const openWorkflow = () => {
  console.log("openWorkflow");
};

const save = () => {
  console.log("saveWorkflow");
  saveWorkflow(getGraph().toJSON());
};

const installWorkflow = () => {
  console.log("installWorkflow");
};

const clearWorkflow = () => {
  console.log("clearWorkflow");
  getGraph().clear();
};

const openSettings = () => {
  console.log("openSettings");
};

export const buildRightSidebar = () => {
  const rightSideBar = {
    New: newWorkflow,
    Open: openWorkflow,
    Save: saveWorkflow,
    Install: installWorkflow,
    Clear: clearWorkflow,
    Settings: openSettings
  };

  for (const menuItem in rightSideBar) {
    const menuItemElem = $(`<a class="nav-link" href="#">${menuItem}</a>`);
    menuItemElem.click(e => {
      e.preventDefault();
      rightSideBar[menuItem]();
    });
    $("#right-sidebar nav").append(menuItemElem);
  }

  $("#save").click(() => save());
  $("#clear").click(() => clearWorkflow());
  $("#resetZoom").click(() => resetZoom());
  $("#fitContent").click(() => fitContent());
  $("#read").click(() => readWorkflow());
};
