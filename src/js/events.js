import * as $ from "jquery";
import * as joint from "jointjs";
import { BOX_HIGHLIGHTER, THEME, MIN_SCALE, MAX_SCALE } from "./constants";
import { TRASH_SELECTOR, INTERFACE_ROOT, PORT_SELECTOR } from "./selectors";
import { paper } from "./interface";
import { addWebservice } from "./leftSidebar";
import { fireAlert } from "./alerts";
import {
  MESSAGE_COPY_ERROR,
  MESSAGE_COPY_SUCCESS,
  MESSAGE_PASTE_SUCCESS,
  MESSAGE_PASTE_ERROR
} from "./messages";

let currentSelection;
let currentCopy;

const deleteElement = e => {
  if (confirm("Are you sure you want to delete this element?")) {
    e.model.remove();
  } else {
    // @TODO replace where it was before moving
  }
};

export const resetZoom = () => {
  const bcr = paper.svg.getBoundingClientRect();
  const localRect1 = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });
  const localCenter = localRect1.center();
  changeZoom(1, localCenter.x, localCenter.y, true);
};

// zoom algorithm: https://github.com/clientIO/joint/issues/1027
const changeZoom = (delta, x, y, reset) => {
  const nextScale = !reset
    ? paper.scale().sx + delta / 75 // the current paper scale changed by delta
    : 1;

  if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
    const currentScale = paper.scale().sx;

    const beta = currentScale / nextScale;

    const ax = x - x * beta;
    const ay = y - y * beta;

    const translate = paper.translate();

    const nextTx = translate.tx - ax * nextScale;
    const nextTy = translate.ty - ay * nextScale;

    paper.translate(nextTx, nextTy);

    const ctm = paper.matrix();

    ctm.a = nextScale;
    ctm.d = nextScale;

    paper.matrix(ctm);
  }
};

/** PAPER EVENTS */

export const setPaperEvents = () => {
  console.log("SET PAPER EVENTS");

  paper.options.highlighting.magnetAvailability =
    THEME.magnetAvailabilityHighlighter;

  paper.on("element:pointerup", e => {
    if ($(TRASH_SELECTOR).is(":hover")) {
      deleteElement(e);
    }
  });

  /**********ZOOM*/

  paper.on("blank:mousewheel", (evt, x, y, delta) => {
    changeZoom(delta, x, y);
  });

  paper.on("element:mousewheel", (e, evt, x, y, delta) => {
    changeZoom(delta, x, y);
  });

  /*------------PAN */
  let move = false;
  let dragStartPosition;

  paper.on("blank:pointerdown", (event, x, y) => {
    hideMenus();
    dragStartPosition = { x: x, y: y };
    move = true;
    unHighlightCurrentSelection();

    // unfocus inputs when clicks
    $("input:focus").blur();
  });

  paper.on("cell:pointerup blank:pointerup", () => {
    move = false;
  });

  $(INTERFACE_ROOT).mousemove(event => {
    if (move) {
      const currentScale = paper.scale();
      const newX = event.offsetX / currentScale.sx - dragStartPosition.x;
      const newY = event.offsetY / currentScale.sy - dragStartPosition.y;
      paper.translate(newX * currentScale.sx, newY * currentScale.sy);
    }
  });

  /*******LINK***/

  paper.on("link:mouseenter", linkView => {
    const tools = new joint.dia.ToolsView({
      tools: [
        new joint.linkTools.TargetArrowhead(),
        new joint.linkTools.Remove({ distance: -30 })
      ]
    });
    linkView.addTools(tools);
  });

  paper.on("link:mouseleave", linkView => {
    linkView.removeTools();
  });

  paper.on("link:connect link:disconnect", (linkView, evt, elementView) => {
    const element = elementView.model;
    element.getInPorts().forEach(function(port) {
      const portNode = elementView.findPortNode(port.id, PORT_SELECTOR);
      elementView.unhighlight(portNode, {
        highlighter: THEME.magnetAvailabilityHighlighter
      });
    });
  });

  /*-----------------------*/

  paper.on("blank:contextmenu", () => {});
};

/** CONTEXT MENUS */
const contextMenus = {
  element: {
    visible: false,
    el: document.querySelector("#contextmenu-element")
  },
  paper: {
    visible: false,
    el: document.querySelector("#contextmenu-paper")
  }
};

const copyCurrentSelection = () => {
  if (currentSelection) {
    currentCopy = currentSelection;
    fireAlert("success", MESSAGE_COPY_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_COPY_ERROR);
  }
};

const pasteCurrentSelection = async webservices => {
  if (currentCopy) {
    const { params, type } = currentCopy.model.attributes;
    await addWebservice(webservices, type, {
      params
    });
    fireAlert("success", MESSAGE_PASTE_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_PASTE_ERROR);
  }
};

const setContextMenuItemEvents = webservices => {
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
    .querySelector("#contextmenu-element .copy")
    .addEventListener("click", () => {
      copyCurrentSelection();
    });

  document
    .querySelector("#contextmenu-element .duplicate")
    .addEventListener("click", async () => {
      const { params, type } = currentSelection.model.attributes;
      await addWebservice(webservices, type, {
        params
      });
    });

  document
    .querySelector("#contextmenu-element .delete")
    .addEventListener("click", () => {
      deleteElement(currentSelection);
    });

  document
    .querySelector("#contextmenu-paper .paste")
    .addEventListener("click", async () => {
      await pasteCurrentSelection(webservices);
    });
};

const showMenu = menuObj => {
  const menu = menuObj.el;
  menu.style.display = "block";
  menuObj.visible = !menuObj.visible;
};

const hideMenu = menuObj => {
  const menu = menuObj.el;
  menu.style.display = "none";
  menuObj.visible = !menuObj.visible;
};

const hideMenus = () => {
  for (const [, menu] of Object.entries(contextMenus)) {
    hideMenu(menu);
  }
};

const setPosition = (menuObj, { top, left }) => {
  const menu = menuObj.el;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  showMenu(menuObj);
};

export const setContextMenu = webservices => {
  window.addEventListener("click", () => {
    for (let [, value] of Object.entries(contextMenus)) {
      if (value.visible) {
        hideMenu(value);
      }
    }
  });

  paper.on("element:contextmenu", (cellView, evt, x, y) => {
    evt.preventDefault();
    hideMenu(contextMenus.paper);

    highlightCurrentSelection(cellView);

    const screenPos = paper.localToClientPoint(x, y);
    const origin = {
      left: screenPos.x,
      top: screenPos.y
    };
    setPosition(contextMenus.element, origin);
    return false;
  });

  paper.on("blank:contextmenu", (evt, x, y) => {
    evt.preventDefault();

    hideMenu(contextMenus.element);

    const screenPos = paper.localToClientPoint(x, y);
    const origin = {
      left: screenPos.x,
      top: screenPos.y
    };
    setPosition(contextMenus.paper, origin);
    return false;
  });

  setContextMenuItemEvents(webservices);
};

//** SELECTION */

export const setSelection = () => {
  paper.on("element:pointerdown", (cellView /*, evt, x, y*/) => {
    hideMenus();
    unHighlightCurrentSelection();
    highlightCurrentSelection(cellView);
  });
};

export const highlightCurrentSelection = cellView => {
  if (cellView) {
    currentSelection = cellView;
    cellView.highlight(null, BOX_HIGHLIGHTER);
  }
};

export const unHighlightCurrentSelection = () => {
  if (currentSelection) {
    currentSelection.unhighlight(null, BOX_HIGHLIGHTER);
    currentSelection = null;
  }
};

export const resetHighlight = () => {
  if (currentSelection) {
    unHighlightCurrentSelection();
    highlightCurrentSelection(currentSelection);
  }
};

//** KEYBOARD */

export const setKeyboardEvents = webservices => {
  document.addEventListener(
    "keydown",
    event => {
      const evt = event || window.event; // IE support
      const keyName = evt.key;
      const ctrlDown = evt.ctrlKey || evt.metaKey; // Mac support

      if (ctrlDown) {
        switch (keyName) {
          case "c": {
            copyCurrentSelection();

            break;
          }
          case "v": {
            pasteCurrentSelection(webservices);
            break;
          }
          default:
        }
      } else {
        switch (keyName) {
          case "ArrowDown": {
            if (currentSelection) {
              currentSelection.model.translate(0, 50);
            }
            break;
          }
          case "ArrowUp": {
            if (currentSelection) {
              currentSelection.model.translate(0, -50);
            }
            break;
          }
          case "ArrowRight": {
            if (currentSelection) {
              currentSelection.model.translate(50, 0);
            }
            break;
          }
          case "ArrowLeft": {
            if (currentSelection) {
              currentSelection.model.translate(-50, 0);
            }
            break;
          }
          case "Delete": {
            if (currentSelection) {
              deleteElement(currentSelection);
              currentSelection = null;
            }
            break;
          }
          default:
        }
      }

      // if (event.ctrlKey) {
      //   // Even though event.key is not 'Control' (e.g., 'a' is pressed),
      //   // event.ctrlKey may be true if Ctrl key is pressed at the same time.
      //   alert(`Combination of ctrlKey + ${keyName}`);
      // } else {
      //   alert(`Key pressed ${keyName}`);
      // }
    },
    false
  );
};
