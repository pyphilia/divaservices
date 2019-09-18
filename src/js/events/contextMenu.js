import { paper } from "../layout/interface";
import {
  CONTEXT_MENU_ELEMENT,
  CONTEXT_MENU_PAPER
} from "../constants/selectors";
import { highlightSelection } from "./selections";
import { copy } from "./controls";
import { selectedElements, copiedElements } from "../constants/globals";
import { addElementsByCellView } from "../elements/addElement";
import { deleteElementsById } from "../elements/deleteElement";
import { addAction, ACTION_PASTE } from "../utils/undo";

/** CONTEXT MENUS */
const contextMenus = {
  element: {
    visible: false,
    el: document.querySelector(CONTEXT_MENU_ELEMENT)
  },
  paper: {
    visible: false,
    el: document.querySelector(CONTEXT_MENU_PAPER)
  }
};

const setPositionToContextMenu = (menuObj, { top, left }) => {
  const menu = menuObj.el;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  showContextMenu(menuObj);
};

const showContextMenu = menuObj => {
  const menu = menuObj.el;
  menu.style.display = "block";
  menuObj.visible = !menuObj.visible;
};

const hideContextMenu = menuObj => {
  const menu = menuObj.el;
  menu.style.display = "none";
  menuObj.visible = !menuObj.visible;
};

export const hideContextMenus = () => {
  for (const [, menu] of Object.entries(contextMenus)) {
    hideContextMenu(menu);
  }
};

export const initContextMenu = () => {
  window.addEventListener("click", () => {
    for (let [, value] of Object.entries(contextMenus)) {
      if (value.visible) {
        hideContextMenu(value);
      }
    }
  });

  paper.on("blank:contextmenu", () => {});

  paper.on("element:contextmenu", (cellView, evt, x, y) => {
    evt.preventDefault();
    hideContextMenu(contextMenus.paper);

    highlightSelection(cellView);

    const screenPos = paper.localToClientPoint(x, y);
    const origin = {
      left: screenPos.x,
      top: screenPos.y
    };
    setPositionToContextMenu(contextMenus.element, origin);
    return false;
  });

  paper.on("blank:contextmenu", (evt, x, y) => {
    evt.preventDefault();

    hideContextMenu(contextMenus.element);

    const screenPos = paper.localToClientPoint(x, y);
    const origin = {
      left: screenPos.x,
      top: screenPos.y
    };
    setPositionToContextMenu(contextMenus.paper, origin);
    return false;
  });

  initContextMenuItemEvents();
};

const initContextMenuItemEvents = () => {
  // prevent right click on custom context menus
  for (const [, menuObj] of Object.entries(contextMenus)) {
    menuObj.el.addEventListener(
      "contextmenu",
      event => {
        event.preventDefault();
      },
      false
    );
  }

  document
    .querySelector(`${CONTEXT_MENU_ELEMENT} .copy`)
    .addEventListener("click", () => {
      copy(selectedElements);
    });

  document
    .querySelector(`${CONTEXT_MENU_ELEMENT} .duplicate`)
    .addEventListener("click", async () => {
      if (selectedElements.length) {
        await addElementsByCellView(selectedElements);
      }
    });

  document
    .querySelector(`${CONTEXT_MENU_ELEMENT} .delete`)
    .addEventListener("click", () => {
      deleteElementsById(selectedElements.map(el => el.model.id));
      selectedElements = [];
    });

  document
    .querySelector(`${CONTEXT_MENU_PAPER} .paste`)
    .addEventListener("click", async () => {
      addAction(ACTION_PASTE, { elements: copiedElements });
    });
};
