import * as $ from "jquery";
import * as joint from "jointjs";
import { THEME, Inputs } from "../constants/constants";
import { INTERFACE_ROOT, PORT_SELECTOR } from "../constants/selectors";
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
    app.CHANGE_ZOOM({ delta, x, y });
  });

  paper.on("element:mousewheel", (e, evt, x, y, delta) => {
    app.CHANGE_ZOOM({ delta, x, y });
  });

  // /*------------PAN */

  let move = false;
  let dragStartPosition;

  paper.on("blank:pointerdown", (event, x, y) => {
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

  /**
   * Initialize the element selection feature
   * It also handles the highlight effect of the elements
   */

  paper.on("element:pointerdown", cellView => {
    // if control key is not hold, a different
    // the current selection is reset
    if (!ctrlDown) {
      app.unSelectAllElements();
    }

    app.addElementToSelection(cellView);
  });

  // /**CONTEXT MENU*/

  paper.on("blank:contextmenu", () => {});

  paper.on("element:contextmenu", (cellView, evt, x, y) => {
    evt.preventDefault();

    // if control key is not hold, a different
    // the current selection is reset
    if (!ctrlDown) {
      app.unSelectAllElements();
    }

    app.addElementToSelection(cellView);
    contextMenu.setPositionToContextMenu("element", { x, y });
    return false;
  });

  paper.on("blank:contextmenu", (evt, x, y) => {
    evt.preventDefault();

    contextMenu.setPositionToContextMenu("paper", { x, y });
    return false;
  });

  paper.on("element:pointerup", () => {
    if (changePosition) {
      changePosition = false;
      app.moveSelectedElements();
    }
  });
};

export const elementOnChangePosition = (
  el,
  newPosition,
  { multitranslate }
) => {
  changePosition = true;
  $(`.select ${Inputs.SELECT.tag}`).select2("close");

  // need to move all elements at the same time
  if (!multitranslate) {
    const { selectedElements } = app;

    // move all elements except current moved element
    const { boxId: currentBoxId } = el.attributes;
    const { position: oldPosition } = selectedElements.find(
      el => el.boxId == currentBoxId
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
