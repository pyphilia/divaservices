import $ from "jquery";

const newWorkflow = () => {
  console.log("newWorkflow");
};

const openWorkflow = () => {
  console.log("openWorkflow");
};

const saveWorkflow = () => {
  console.log("saveWorkflow");
};

const installWorkflow = () => {
  console.log("installWorkflow");
};

const clearWorkflow = () => {
  console.log("clearWorkflow");
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
};
