import * as joint from "jointjs";
import { THEME } from "../constants/constants";
import { INTERFACE_ROOT, PORT_SELECTOR } from "../constants/selectors";
import { spaceDown, ctrlDown } from "./keyboardEvents";

import { app } from "../app";
/**
 * Initialize paper events, such as zoom, pan and
 * links management
 */
export const initPaperEvents = () => {
  const { paper, graph } = app;

  // paper.on("element:pointerup", () => {
  //   // const trash = document.querySelector(TRASH_SELECTOR);
  //   // if (trash.parentElement.querySelector(":hover") === trash) {
  //   //   addAction(ACTION_DELETE_ELEMENTS, { elements: selectedElements });
  //   //   clearSelection();
  //   // }
  // });

  // /*------------ZOOM */

  paper.on("blank:mousewheel", (evt, x, y, delta) => {
    app.CHANGE_ZOOM({ delta, x, y });
  });

  paper.on("element:mousewheel", (e, evt, x, y, delta) => {
    app.CHANGE_ZOOM({ delta, x, y });
  });

  // /*------------PAN */

  let move = false;
  let dragStartPosition;

  paper.on("blank:pointerdown", (event, x, y) => {
    // ContextMenuApp.hideContextMenus();
    dragStartPosition = { x: x, y: y };

    move = spaceDown;

    if (!ctrlDown) {
      app.unSelectAllElements();
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
      app.endAreaSelection({ paper, graph });
    }
  });

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
      if (!spaceDown && app.areaSelection.active) {
        app.computeAreaSelection();
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
            // app.addAction(ACTION_DELETE_LINK, { linkView: this });
          }
        })
      ]
    });
    linkView.addTools(tools);
  });

  paper.on("link:mouseleave", linkView => {
    linkView.removeTools();
  });

  // paper.on("link:connect", linkView => {
  //   app.addAction(ACTION_ADD_LINK, { linkView }, false);
  // });

  paper.on("link:connect link:disconnect", (linkView, evt, elementView) => {
    const element = elementView.model;
    element.attributes.getInPorts(element).forEach(function(port) {
      const portNode = elementView.findPortNode(port.id, PORT_SELECTOR);
      elementView.unhighlight(portNode, {
        highlighter: THEME.magnetAvailabilityHighlighter
      });
    });
  });

  // graph.on("change:position add remove", () => {
  //   // @TODO change callbacks if find some
  //   app.activity = true;
  // });

  /**SELECTION*/

  /**
   * Initialize the element selection feature
   * It also handles the highlight effect of the elements
   */

  paper.on("element:pointerdown", (cellView /*, evt, x, y*/) => {
    // ContextMenuApp.hideContextMenus();
    // if control key is not hold, a different
    // the current selection is reset
    if (!ctrlDown) {
      app.unSelectAllElements();
    }

    app.addElementToSelection(cellView);
  });

  // on key up, if it was a translation, it will have
  // different positions values
  // paper.on("element:pointerup", () => {
  //   saveElementsPositionFromCellView(app.selectedElements);
  // });

  // /**CONTEXT MENU*/

  // paper.on("blank:contextmenu", () => {});

  // paper.on("element:contextmenu", (cellView, evt, x, y) => {
  //   evt.preventDefault();
  //   ContextMenuApp.hideContextMenus();

  //   // if control key is not hold, a different
  //   // the current selection is reset
  //   if (!ctrlDown) {
  //     app.unSelectAll();
  //   }
  //   app.addCellViewToSelection(cellView);

  //   const screenPos = paper.localToClientPoint(x, y);
  //   const origin = {
  //     left: screenPos.x,
  //     top: screenPos.y
  //   };
  //   ContextMenuApp.setPositionToContextMenu("element", origin);
  //   return false;
  // });

  // paper.on("blank:contextmenu", (evt, x, y) => {
  //   evt.preventDefault();

  //   ContextMenuApp.hideContextMenus();

  //   const screenPos = paper.localToClientPoint(x, y);
  //   const origin = {
  //     left: screenPos.x,
  //     top: screenPos.y
  //   };
  //   ContextMenuApp.setPositionToContextMenu("paper", origin);
  //   return false;
  // });
};
