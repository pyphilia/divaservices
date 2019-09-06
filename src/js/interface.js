/* eslint-disable no-unused-vars */
import "select2";
import * as $ from "jquery";
import * as joint from "jointjs";
import { THEME } from "./constants";
import {
  INTERFACE_ROOT,
  PORT_SELECTOR,
  ATTR_TYPE_ALLOWED,
  ATTR_TYPE,
  TRASH_SELECTOR,
  IN_PORT_CLASS
} from "./selectors";
import { setPaperEvents, setThemeOptions } from "./theme";

let paper;
const graph = new joint.dia.Graph();
let lastTranslate = { tx: 0, ty: 0 };

export const getGraph = () => {
  return graph;
};

export const getPaper = () => {
  return paper;
};

export const fitContent = () => {
  paper.scaleContentToFit({
    padding: 20
  });
  lastTranslate = paper.translate();
};

const validateConnectionFunc = (vS, mS, vT, mT, end, lV) => {
  if (!mT) {
    return false;
  }
  if (vS === vT) {
    return false;
  }
  if (mT.getAttribute("port-group") !== IN_PORT_CLASS) {
    return false;
  }

  // input accept only one source
  const usedInPorts = vT.model.getUsedInPorts();
  const matchId = usedInPorts.find(({ id }) => id === mT.getAttribute("port"));
  if (matchId) {
    return false;
  }

  // allow only same input-output type
  if (
    mT.getAttribute(ATTR_TYPE) === undefined ||
    mS.getAttribute(ATTR_TYPE) === undefined
  ) {
    return false;
  }

  // check allowed type
  const allowedS = mS.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const allowedT = mT.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const commonType = allowedS.filter(value => -1 !== allowedT.indexOf(value));
  if (commonType.length == 0) {
    return false;
  }

  return true;
};

export const resetZoom = () => {
  const bcr = paper.svg.getBoundingClientRect();
  const paperLocalRect = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });
  changeZoom(
    1,
    paperLocalRect.x + paperLocalRect.width / 2,
    paperLocalRect.y + paperLocalRect.height / 2,
    true
  );
};

const changeZoom = (delta, x, y, reset) => {
  let newScale;
  if (!reset) {
    newScale = paper.scale().sx + delta / 35; // the current paper scale changed by delta
  } else {
    newScale = 1;
  }
  if (newScale <= 1) {
    // newScale > 0.4 &&
    paper.translate(lastTranslate.tx, lastTranslate.ty);
    paper.scale(newScale, newScale, x, y);
  }
};

const initPaper = () => {
  paper = new joint.dia.Paper({
    el: $(INTERFACE_ROOT),
    model: graph,
    width: "100%",
    height: 800,
    gridSize: 15,
    drawGrid: {
      name: "fixedDot"
    },
    linkPinning: false,
    snapLinks: true,
    defaultLink: new joint.shapes.standard.Link({ z: 20 }),
    defaultConnector: { name: "smooth" },
    defaultConnectionPoint: { name: "boundary" },
    markAvailable: true,
    /*eslint no-unused-vars: ["error", { "args": "none" }]*/
    validateConnection: validateConnectionFunc
  });

  paper.options.highlighting.magnetAvailability =
    THEME.magnetAvailabilityHighlighter;

  paper.on("element:pointerup", e => {
    if ($(TRASH_SELECTOR).is(":hover")) {
      if (confirm("Are you sure you want to delete this element?")) {
        e.model.remove();
      } else {
        // @TODO replace where it was before moving
      }
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
    dragStartPosition = { x: x, y: y };
    move = true;
  });

  paper.on("cell:pointerup blank:pointerup", () => {
    lastTranslate = paper.translate();
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

  /*************/

  setPaperEvents(paper);

  /*-----------------------*/

  paper.on("blank:contextmenu", () => {});
};

const transformWorkflowToGraph = workflow => {
  console.log("TCL: transformWorkflowToGraph");
};

const buildGraph = async workflow => {
  initPaper();
  setThemeOptions();

  if (workflow) {
    // const webservices = transformWorkflowToGraph(workflow);
    // webservices.forEach(function(e) {
    //   addElement(e);
    // });
  }

  console.log($(INTERFACE_ROOT));
};

export { buildGraph };
