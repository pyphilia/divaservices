/**
 * Initialize the main interface area
 */
import * as joint from "jointjs";
import {
  INTERFACE_ROOT,
  ATTR_TYPE_ALLOWED,
  ATTR_TYPE,
  IN_PORT_CLASS
} from "../constants/selectors";
import { initPaperEvents } from "../events/paperEvents";
import { initKeyboardEvents } from "../events/keyboard";

export const graph = new joint.dia.Graph();
export let paper;

// matching algorithm for ports to be linked and highlighted
/* eslint-disable-next-line no-unused-vars */
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
  const usedInPorts = vT.model.attributes.getUsedInPorts();
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

const buildGraph = async workflow => {
  paper = new joint.dia.Paper({
    el: document.querySelector(INTERFACE_ROOT),
    model: graph,
    width: "100%",
    height: 800,
    gridSize: 15,
    drawGrid: {
      name: "dot"
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

  initPaperEvents();
  initKeyboardEvents();

  if (workflow) {
    // const webservices = transformWorkflowToGraph(workflow);
    // webservices.forEach(function(e) {
    //   addElement(e);
    // });
  }

  console.log(document.querySelector(INTERFACE_ROOT));
};

export { buildGraph };
