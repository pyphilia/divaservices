import $ from "jquery";

const menu = {
  File: [{ name: "New", action: () => {} }, { name: "Open", action: () => {} }],
  Edit: [
    { name: "Copy", action: () => {} },
    { name: "Paste", action: () => {} },
    { name: "Cut", action: () => {} },
    { name: "separator" },
    { name: "Clear", action: () => {} },
    { name: "Undo", action: () => {} },
    { name: "Redo", action: () => {} },
    { name: "separator" },
    { name: "Select All", action: () => {} },
    { name: "Unselect", action: () => {} },
    { name: "separator" },
    { name: "Zoom In", action: () => {} },
    { name: "Zoom Out", action: () => {} },
    { name: "Reset Zoom", action: () => {} },
    { name: "Fit Content", action: () => {} }
  ],
  Workflow: [{ name: "Install", action: () => {} }],
  Settings: []
};

export const buildFileMenu = () => {
  const root = $("ul.navbar-nav");

  const menuItems = [];
  for (const item in menu) {
    const menuItem = $('<li class="nav-item dropdown"></li>');
    const menuTitle = $(
      `<a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${item}</a>`
    );
    menuItem.append(menuTitle);

    const dropdown = $(
      '<div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink"></div>'
    );
    const subitems = [];
    for (const subitem of menu[item]) {
      const { name } = subitem;
      let dropdownItem;
      if (name != "separator") {
        dropdownItem = $('<a class="dropdown-item" href="#"></a>');
        dropdownItem.text(name);
      } else {
        dropdownItem = '<div class="dropdown-divider"></div>';
      }
      subitems.push(dropdownItem);
    }
    dropdown.append(subitems);
    menuItem.append(dropdown);
    menuItems.push(menuItem);
  }
  root.append(menuItems);
  console.log(document.querySelector("ul.navbar-nav"));
};
