/**
 * This file contains all events on joint.js paper
 */

import * as $ from "jquery";
import * as joint from "jointjs";
import Vue from "vue";
import { Constants } from "divaservices-utils";
const { Types } = Constants;
import { THEME } from "../constants/constants";
import {
  INTERFACE_ROOT,
  PORT_SELECTOR,
  CONTEXT_MENU_PAPER,
  CONTEXT_MENU_ELEMENT
} from "../constants/selectors";
import { spaceDown, ctrlDown } from "./keyboardEvents";

import { app } from "../app";
import { moveAllElements } from "../elements/moveElement";

let changePosition = false;
/**
 * Initialize paper events, such as zoom, pan and
 * links management
 */
export const initPaperEvents = () => {
  const { paper, graph } = app;
  const contextMenu = app.$refs.contextmenu;

  document.addEventListener("click", function() {
    contextMenu.hideContextMenus();
  });

  // /*------------ZOOM */

  paper.on("blank:mousewheel", (evt, x, y, delta) => {
    Vue.prototype.$changeZoom(delta, x, y);
  });

  paper.on("element:mousewheel", (e, evt, x, y, delta) => {
    Vue.prototype.$changeZoom(delta, x, y);
  });

  // /*------------PAN */

  let move = false;
  let dragStartPosition;

  paper.on("blank:pointerdown", (event, x, y) => {
    dragStartPosition = { x: x, y: y };
    move = spaceDown;

    if (!ctrlDown) {
      app.$unSelectAllElements();
    }
    // unfocus inputs when clicks
    const focusedInput = document.querySelector("input:focus");
    if (focusedInput) {
      focusedInput.blur();
    }

    // init area selection
    if (!spaceDown && !app.$resizing) {
      app.$initAreaSelection(event);
    }

    if (!app.$resizing) {
      // remove resizer if exists
      app.$removeResizer();
    }
  });

  paper.on("cell:pointerup blank:pointerup", () => {
    move = false;

    if (!spaceDown) {
      app.$endAreaSelection(paper);
    }

    if (app.$resizing) {
      Vue.prototype.$endResize(paper);
    }
  });

  // /*------------MOVE */

  document
    .querySelector(INTERFACE_ROOT)
    .addEventListener("mousemove", event => {
      if (move) {
        const currentScale = paper.scale();
        const newX = event.offsetX / currentScale.sx - dragStartPosition.x;
        const newY = event.offsetY / currentScale.sy - dragStartPosition.y;
        app.translate(newX, newY);
      }

      // area selection
      if (!spaceDown && app.$areaSelection.active) {
        app.$computeAreaSelection();
      }
    });

  // /*------------LINK EVENTS */

  paper.on("link:mouseenter", linkView => {
    const tools = new joint.dia.ToolsView({
      tools: [
        new joint.linkTools.TargetArrowhead(),
        new joint.linkTools.Remove({
          distance: -30,
          action: function() {
            this.model.remove({ ui: true, tool: this.cid });
            app.deleteLinkFromApp({ link: this.model });
          }
        })
      ]
    });
    linkView.addTools(tools);
  });

  paper.on("link:mouseleave", linkView => {
    linkView.removeTools();
  });

  paper.on("link:connect", linkView => {
    app.addLinkFromApp({ link: linkView.model.attributes });
  });

  paper.on("link:connect link:disconnect", (linkView, evt, elementView) => {
    const element = elementView.model;
    element.attributes.getInPorts(element).forEach(function(port) {
      const portNode = elementView.findPortNode(port.id, PORT_SELECTOR);
      elementView.unhighlight(portNode, {
        highlighter: THEME.magnetAvailabilityHighlighter
      });
    });
  });

  /**SELECTION*/

  paper.on("element:pointerdown", (cellView, e) => {
    if (cellView.model.attributes.class != "resizer") {
      // if control key is not hold, a different
      // the current selection is reset

      if (!ctrlDown) {
        app.$unSelectAllElements();
      }

      app.addElementToSelection(cellView);
    } else {
      app.$initResize(e);
    }
  });

  paper.on("element:pointerup", () => {
    if (changePosition) {
      changePosition = false;
      app.$moveSelectedElements({ graph });
    }
  });

  // /**CONTEXT MENU*/

  paper.on("element:contextmenu", (cellView, evt, x, y) => {
    evt.preventDefault();

    // if control key is not hold, a different
    // the current selection is reset
    if (!ctrlDown) {
      app.$unSelectAllElements();
    }

    app.addElementToSelection(cellView);
    contextMenu.setPositionToContextMenu(CONTEXT_MENU_ELEMENT, { x, y });
    return false;
  });

  paper.on("blank:contextmenu", (evt, x, y) => {
    evt.preventDefault();

    contextMenu.setPositionToContextMenu(CONTEXT_MENU_PAPER, { x, y });
    return false;
  });
};

/**
 * Utility function to clear interactions on the paper
 */
const clearInteractions = () => {
  // close select manually
  const allSelect = $(`${INTERFACE_ROOT} .select ${Types.SELECT.tag}`);
  allSelect.select2("close");

  // remove resizer
  app.$removeResizer();
};

/**
 * move operation callback
 * support multiple elements moving
 *
 * @param {*} stopPropagation if true, avoid movements propagation callback (avoid infinite loop)
 */
export const elementOnChangePosition = (
  el,
  newPosition,
  { stopPropagation }
) => {
  changePosition = true;

  clearInteractions();

  const { selectedElements } = app;
  // need to move all elements at the same time
  if (!stopPropagation && selectedElements.length) {
    // move all elements except current moved element
    const { boxId: currentBoxId } = el.attributes;
    const { position: oldPosition } = selectedElements.find(
      el => el.boxId === currentBoxId
    );
    const deltaPosition = {
      x: newPosition.x - oldPosition.x,
      y: newPosition.y - oldPosition.y
    };
    moveAllElements(
      selectedElements.filter(el => el.boxId != currentBoxId),
      deltaPosition
    );
  }
};
