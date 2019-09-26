import * as joint from "jointjs";
import { THEME } from "../constants/constants";
import { INTERFACE_ROOT, PORT_SELECTOR } from "../constants/selectors";
import { paper } from "../layout/interface";
import { hideContextMenus } from "./contextMenu";
import { unSelectAll } from "./selections";
import { addAction } from "../utils/undo";
import { ACTION_ADD_LINK, ACTION_DELETE_LINK } from "../constants/actions";
import { updateMinimap } from "../layout/minimap";
import { spaceDown, ctrlDown } from "./keyboard";
import {
  initAreaSelection,
  endAreaSelection,
  computeAreaSelection
} from "./areaSelection";
import { changeZoom } from "./zoom";

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
    hideContextMenus();
    dragStartPosition = { x: x, y: y };

    move = spaceDown;

    if (!ctrlDown) {
      unSelectAll();
    }
    // unfocus inputs when clicks
    const focusedInput = document.querySelector("input:focus");
    if (focusedInput) {
      focusedInput.blur();
    }

    // init area selection
    if (!spaceDown) {
      initAreaSelection();
    }
  });

  paper.on("cell:pointerup blank:pointerup", () => {
    move = false;

    if (!spaceDown) {
      endAreaSelection();
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
        updateMinimap();
      }

      // area selection
      if (!spaceDown) {
        computeAreaSelection();
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
            addAction(ACTION_DELETE_LINK, { linkView: this });
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
    addAction(ACTION_ADD_LINK, { linkView }, false);
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
};
