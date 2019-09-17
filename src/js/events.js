import * as $ from "jquery";
import * as joint from "jointjs";
import { BOX_HIGHLIGHTER, THEME, MIN_SCALE, MAX_SCALE } from "./constants";
import { TRASH_SELECTOR, INTERFACE_ROOT, PORT_SELECTOR } from "./selectors";
import { paper, graph } from "./interface";
import { addWebservice } from "./addElement";
import { fireAlert } from "./alerts";
import {
  MESSAGE_COPY_ERROR,
  MESSAGE_COPY_SUCCESS,
  MESSAGE_PASTE_SUCCESS,
  MESSAGE_PASTE_ERROR,
  MESSAGE_DELETE_CONFIRM
} from "./messages";
import {
  undo,
  redo,
  addAction,
  ACTION_ADD_ALL_ELEMENTS,
  ACTION_DELETE_ELEMENT,
  ACTION_DELETE_ALL_ELEMENTS
} from "./undo";

let selectedElements = [];
let copiedElements = [];

export const deleteElement = (id, setHistory = true) => {
  const cell = graph.getCell(id);
  const name = cell.attributes.type;
  console.log("TCL: cell", cell);
  const defaultParams = cell.attributes.params;
  cell.remove();
  const cellInfo = { name, defaultParams, id };
  if (setHistory) {
    addAction(ACTION_DELETE_ELEMENT, cellInfo);
  }
  return cellInfo;
};

export const deleteAllSelected = (els = []) => {
  const ids = els.length ? els : selectedElements.map(el => el.model.id);
  const elements = [];
  if (ids.length) {
    if (confirm(MESSAGE_DELETE_CONFIRM)) {
      for (const id of ids) {
        const info = deleteElement(id, false);
        elements.push(info);
      }
      if (!ids.length) {
        selectedElements = [];
      }
      addAction(ACTION_DELETE_ALL_ELEMENTS, { elements, ids });
    } else {
      // @TODO replace where it was before moving
    }
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
let allPositions = [];
const saveAllSelectedPosition = () => {
  for (const [el, i] of selectedElements.map((el, i) => [el.model, i])) {
    allPositions[i] = el.position();
  }
};

export const setPaperEvents = () => {
  paper.options.highlighting.magnetAvailability =
    THEME.magnetAvailabilityHighlighter;

  paper.on("element:pointerup", () => {
    if ($(TRASH_SELECTOR).is(":hover")) {
      deleteAllSelected();
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
    unHighlightAllSelected();

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

export const addSelectedElements = async (els = [], setHistory = true) => {
  const elements = els.length ? els : copiedElements;
  // const el = graph.getCell(elements[0].model.id);
  // console.log(elements[0].model);
  // const newEl = el.clone()
  // graph.addCell(newEl)
  // const {type: label, params, description} = elements[0].model;
  // setParametersInForeignObject(
  //   el,
  //   { foreignId: 12345, description, params, label },
  //   defaultParams
  // );
  const ids = [];
  for (const el of elements) {
    const { params, type } = el.model.attributes;
    const id = await addWebservice(
      type,
      {
        params
      },
      false
    );
    ids.push(id);
  }
  if (setHistory) {
    addAction(ACTION_ADD_ALL_ELEMENTS, { ids, elements });
  }
  return ids;
};

const copy = () => {
  if (selectedElements.length) {
    copiedElements = selectedElements;
    fireAlert("success", MESSAGE_COPY_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_COPY_ERROR);
  }
};

const paste = async () => {
  if (copiedElements.length) {
    await addSelectedElements();
    fireAlert("success", MESSAGE_PASTE_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_PASTE_ERROR);
  }
};

const setContextMenuItemEvents = () => {
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
      copy();
    });

  document
    .querySelector("#contextmenu-element .duplicate")
    .addEventListener("click", async () => {
      if (selectedElements.length) {
        await addSelectedElements();
      }
    });

  document
    .querySelector("#contextmenu-element .delete")
    .addEventListener("click", () => {
      deleteAllSelected();
    });

  document
    .querySelector("#contextmenu-paper .paste")
    .addEventListener("click", async () => {
      await paste();
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

export const setContextMenu = () => {
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

    highlightSelection(cellView);

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

  setContextMenuItemEvents();
};

//** SELECTION */

export const setSelection = () => {
  paper.on("element:pointerdown", (cellView /*, evt, x, y*/) => {
    hideMenus();
    if (!ctrlDown) {
      unHighlightAllSelected();
    }
    highlightSelection(cellView);
    saveAllSelectedPosition();
  });
};

export const highlightSelection = cellView => {
  if (cellView) {
    if (!ctrlDown) {
      unHighlightAllSelected();
    }
    addToSelection(cellView);
    cellView.highlight(null, BOX_HIGHLIGHTER);
  }
};

const addToSelection = el => {
  if (selectedElements.indexOf(el) == -1) {
    selectedElements.push(el);
  }
};

export const highlightAllSelected = () => {
  if (selectedElements.length) {
    for (const el of selectedElements) {
      highlightSelection(el);
    }
  }
};

export const unHighlightAllSelected = () => {
  // do not use unHighlightSelection to remove the array once
  if (selectedElements.length) {
    for (const el of selectedElements) {
      el.unhighlight(null, BOX_HIGHLIGHTER);
    }
    selectedElements = [];
  }
};

export const unHighlightSelection = cellView => {
  cellView.unhighlight(null, BOX_HIGHLIGHTER);
  selectedElements.splice(selectedElements.indexOf(cellView), 1);
};

export const resetHighlight = () => {
  if (selectedElements.length) {
    selectedElements = [];
    unHighlightAllSelected();
    highlightAllSelected();
  }
};

export const moveAllSelected = (current, position) => {
  const selectModels = selectedElements.map(el => el.model);
  const currentElementIndex = selectModels.indexOf(current);
  const previousCurrentPosition = allPositions[currentElementIndex];
  for (const [i, el] of selectModels.filter(el => el != current).entries()) {
    const { x: previousX, y: previousY } = allPositions[i];
    const deltaTranslation = {
      x: position.x - previousCurrentPosition.x,
      y: position.y - previousCurrentPosition.y
    };
    el.position(
      previousX + deltaTranslation.x,
      previousY + deltaTranslation.y,
      { multitranslate: true }
    );
  }
};

//** KEYBOARD */
let ctrlDown;
export const setKeyboardEvents = () => {
  document.addEventListener(
    "keydown",
    event => {
      const evt = event || window.event; // IE support
      const keyName = evt.key;
      ctrlDown = evt.ctrlKey || evt.metaKey; // Mac support

      if (ctrlDown) {
        switch (keyName) {
          case "c": {
            copy();

            break;
          }
          case "v": {
            paste();
            break;
          }
          case "z": {
            undo();
            break;
          }
          case "y": {
            redo();
            break;
          }
          default:
        }
      } else {
        switch (keyName) {
          case "ArrowDown": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(0, 50);
              }
            }
            break;
          }
          case "ArrowUp": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(0, -50);
              }
            }
            break;
          }
          case "ArrowRight": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(50, 0);
              }
            }
            break;
          }
          case "ArrowLeft": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(-50, 0);
              }
            }
            break;
          }
          case "Delete": {
            deleteAllSelected();

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
  document.addEventListener("keyup", event => {
    const evt = event || window.event; // IE support
    ctrlDown = evt.ctrlKey || evt.metaKey; // Mac support
  });
};
