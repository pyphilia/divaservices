import * as joint from "jointjs";
import { THEME, MIN_SCALE, MAX_SCALE } from "../constants/constants";
import {
  TRASH_SELECTOR,
  INTERFACE_ROOT,
  PORT_SELECTOR
} from "../constants/selectors";
import { paper, graph } from "../layout/interface";
import { hideContextMenus } from "./contextMenu";
import { unHighlightAllSelected } from "./selections";
import { selectedElements, clearSelection } from "../constants/globals";
import { addAction } from "../utils/undo";
import {
  ACTION_DELETE_ELEMENT,
  ACTION_ADD_LINK,
  ACTION_DELETE_LINK
} from "../constants/actions";

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
/**
 * Initialize paper events, such as zoom, pan and
 * links management
 */
export const initPaperEvents = () => {
  paper.options.highlighting.magnetAvailability =
    THEME.magnetAvailabilityHighlighter;

  paper.on("element:pointerup", () => {
    const trash = document.querySelector(TRASH_SELECTOR);
    if (trash.parentElement.querySelector(":hover") === trash) {
      addAction(ACTION_DELETE_ELEMENT, { elements: selectedElements });
      clearSelection();
    }
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
    move = true;
    unHighlightAllSelected();

    // unfocus inputs when clicks
    const focusedInput = document.querySelector("input:focus");
    if (focusedInput) {
      focusedInput.blur();
    }
  });

  paper.on("cell:pointerup blank:pointerup", () => {
    move = false;
  });

  document
    .querySelector(INTERFACE_ROOT)
    .addEventListener("mousemove", event => {
      if (move) {
        const currentScale = paper.scale();
        const newX = event.offsetX / currentScale.sx - dragStartPosition.x;
        const newY = event.offsetY / currentScale.sy - dragStartPosition.y;
        paper.translate(newX * currentScale.sx, newY * currentScale.sy);
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
            console.log(linkView);
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
    // console.log(linkView.targetMagnet.nextSibling.textContent);
    const sourceCell = graph.getCell(linkView.model.source().id);
    const sourceBoxId = sourceCell.attributes.boxId;
    const sPortId = linkView.model.source().port;
    const sPortName = sourceCell.getPort(sPortId).name;

    const targetCell = graph.getCell(linkView.model.target().id);
    const targetBoxId = targetCell.attributes.boxId;
    const tPortId = linkView.model.target().port;
    const tPortName = targetCell.getPort(tPortId).name;

    addAction(
      ACTION_ADD_LINK,
      { link: linkView.model, sourceBoxId, targetBoxId, sPortName, tPortName },
      false
    );
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
