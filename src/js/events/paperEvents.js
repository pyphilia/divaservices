import * as joint from "jointjs";
import { THEME } from "../constants/constants";
import {
  INTERFACE_ROOT,
  PORT_SELECTOR,
  CONTEXT_MENU_ELEMENT,
  CONTEXT_MENU_PAPER
} from "../constants/selectors";
import { paper, graph } from "../layout/interface";
import {
  ACTION_ADD_LINK,
  ACTION_DELETE_LINK,
  ACTION_PASTE
} from "../constants/actions";
import { spaceDown, ctrlDown } from "./keyboard";

import { changeZoom } from "./zoom";
import { app } from "../main";
import { saveElementsPositionFromCellView } from "../elements/moveElement";
import { copy } from "./controls";
import { addElementsByCellView } from "../elements/addElement";
import { deleteElementsById } from "../elements/deleteElement";

/**
 * Initialize paper events, such as zoom, pan and
 * links management
 */
export const initPaperEvents = () => {
  paper.options.highlighting.magnetAvailability =
    THEME.magnetAvailabilityHighlighter;

  paper.on("element:pointerup", () => {
    // const trash = document.querySelector(TRASH_SELECTOR);
    // if (trash.parentElement.querySelector(":hover") === trash) {
    //   addAction(ACTION_DELETE_ELEMENT, { elements: selectedElements });
    //   clearSelection();
    // }
  });

  /*------------ZOOM */

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
    app.hideContextMenus();
    dragStartPosition = { x: x, y: y };

    move = spaceDown;

    if (!ctrlDown) {
      app.unSelectAll();
    }
    // unfocus inputs when clicks
    const focusedInput = document.querySelector("input:focus");
    if (focusedInput) {
      focusedInput.blur();
    }

    // init area selection
    if (!spaceDown) {
      app.initAreaSelection(event);
    }
  });

  paper.on("cell:pointerup blank:pointerup", () => {
    move = false;

    if (!spaceDown) {
      app.endAreaSelection();
    }
  });

  document
    .querySelector(INTERFACE_ROOT)
    .addEventListener("mousemove", event => {
      if (move) {
        const currentScale = paper.scale();
        const newX = event.offsetX / currentScale.sx - dragStartPosition.x;
        const newY = event.offsetY / currentScale.sy - dragStartPosition.y;
        paper.translate(newX * currentScale.sx, newY * currentScale.sy);
        app.activity = true;
      }

      // area selection
      if (!spaceDown) {
        app.computeAreaSelection();
      }
    });

  /*------------LINK EVENTS */

  paper.on("link:mouseenter", linkView => {
    const tools = new joint.dia.ToolsView({
      tools: [
        new joint.linkTools.TargetArrowhead(),
        new joint.linkTools.Remove({
          distance: -30,
          action: function() {
            this.model.remove({ ui: true, tool: this.cid });
            app.addAction(ACTION_DELETE_LINK, { linkView: this });
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
    app.addAction(ACTION_ADD_LINK, { linkView }, false);
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

  graph.on("change:position add remove", () => {
    // @TODO change callbacks if find some
    app.activity = true;
  });

  /**SELECTION*/

  /**
   * Initialize the element selection feature
   * It also handles the highlight effect of the elements
   */

  paper.on("element:pointerdown", (cellView /*, evt, x, y*/) => {
    app.hideContextMenus();
    // if control key is not hold, a different
    // the current selection is reset
    if (!ctrlDown) {
      app.unSelectAll();
    }

    app.toggleCellViewInSelection(cellView);
  });

  // on key up, if it was a translation, it will have
  // different positions values
  paper.on("element:pointerup", () => {
    saveElementsPositionFromCellView(app.selectedElements);
  });

  /**CONTEXT MENU*/

  paper.on("blank:contextmenu", () => {});

  paper.on("element:contextmenu", (cellView, evt, x, y) => {
    evt.preventDefault();
    app.hideContextMenus();

    app.addCellViewToSelection(cellView);

    const screenPos = paper.localToClientPoint(x, y);
    const origin = {
      left: screenPos.x,
      top: screenPos.y
    };
    app.setPositionToContextMenu("element", origin);
    return false;
  });

  paper.on("blank:contextmenu", (evt, x, y) => {
    evt.preventDefault();

    app.hideContextMenus();

    const screenPos = paper.localToClientPoint(x, y);
    const origin = {
      left: screenPos.x,
      top: screenPos.y
    };
    app.setPositionToContextMenu("paper", origin);
    return false;
  });

  document
    .querySelector(`${CONTEXT_MENU_ELEMENT} .copy`)
    .addEventListener("click", () => {
      copy(app.selectedElements);
    });

  document
    .querySelector(`${CONTEXT_MENU_ELEMENT} .duplicate`)
    .addEventListener("click", async () => {
      if (app.selectedElements.length) {
        console.log(app.selectedElements);
        await addElementsByCellView(app.selectedElements);
      }
    });

  document
    .querySelector(`${CONTEXT_MENU_ELEMENT} .delete`)
    .addEventListener("click", () => {
      deleteElementsById(app.selectedElements.map(el => el.model.id));
      app.selectedElements = [];
    });

  document
    .querySelector(`${CONTEXT_MENU_PAPER} .paste`)
    .addEventListener("click", async () => {
      app.addAction(ACTION_PASTE, { elements: app.copiedElements });
    });
};
