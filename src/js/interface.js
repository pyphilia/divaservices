/* eslint-disable no-unused-vars */
import "select2";
import * as $ from "jquery";
import * as joint from "jointjs";
import { DEFAULT_OPTIONS } from "./constants";
import {
  TOOLTIP_CLASS,
  NO_PARAMETER_CLASS,
  OPTION_PORT_DETAILS,
  OPTION_PARAMETERS,
  OPTION_PORTS,
  OPTION_TOOLTIPS,
  PARAMETER_SELECTS,
  PARAMETER_INPUTS,
  INTERFACE_ROOT,
  ATTR_TYPE_ALLOWED,
  ATTR_TYPE,
  IN_PORT_CLASS
} from "./selectors";
import {
  resetHighlight,
  setSelection,
  setKeyboardEvents,
  setContextMenu,
  setPaperEvents
} from "./events";

import { computeBoxWidth, computeTitleLength, computeBoxHeight } from "./utils";

let {
  showPortDetails,
  showParameters,
  showPorts,
  showTooltips
} = DEFAULT_OPTIONS;

export let graph;
export let paper;

const changePortDetails = () => {
  const prop = showPortDetails ? "block" : "none";
  for (const el of graph.getElements()) {
    for (const { id } of el.getPorts()) {
      el.portProp(id, "attrs/text/display", prop);
    }
  }
};

const changePorts = () => {
  const prop = showPorts ? "block" : "none";
  // show prop details
  for (const el of graph.getElements()) {
    for (const { id } of el.getPorts()) {
      el.portProp(id, "attrs/circle/display", prop);
    }
  }
};

const changeTooltips = () => {
  if (showTooltips) {
    // show prop details
    $(`.${TOOLTIP_CLASS}`).show();
  } else {
    // hide prop details
    $(`.${TOOLTIP_CLASS}`).hide();
  }
};

const changeParameters = () => {
  if (showParameters) {
    $(
      `.${PARAMETER_INPUTS}, .${PARAMETER_SELECTS}, .${NO_PARAMETER_CLASS}`
    ).show();
  } else {
    $(
      `.${PARAMETER_INPUTS}, .${PARAMETER_SELECTS}, .${NO_PARAMETER_CLASS}`
    ).hide();
  }
  for (const e of graph.getElements()) {
    const newWidth = computeBoxWidth(e, showParameters, true);
    const newHeight = computeBoxHeight(e, showParameters, true);
    e.resize(newWidth, newHeight);
    $(`g[model-id=${e.id}] foreignObject`).attr({
      width: newWidth,
      height: newHeight + computeTitleLength(e, true).titleHeight
    });
  }
};

export const setThemeOptions = () => {
  $(`#${OPTION_PORT_DETAILS}`).prop("checked", showPortDetails);
  $(`#${OPTION_PORT_DETAILS}`).change(function() {
    showPortDetails = $(this).prop("checked");
    changePortDetails();
    resetHighlight();
  });

  $(`#${OPTION_PARAMETERS}`).prop("checked", showParameters);
  $(`#${OPTION_PARAMETERS}`).change(function() {
    showParameters = $(this).prop("checked");
    changeParameters();
    resetHighlight();
  });
  $(`#${OPTION_PORTS}`).prop("checked", showPorts);
  $(`#${OPTION_PORTS}`).change(function() {
    showPorts = $(this).prop("checked");
    changePorts();
    resetHighlight();
  });
  $(`#${OPTION_TOOLTIPS}`).prop("checked", showTooltips);
  $(`#${OPTION_TOOLTIPS}`).change(function() {
    showTooltips = $(this).prop("checked");
    changeTooltips();
    resetHighlight();
  });
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

const transformWorkflowToGraph = workflow => {
  console.log("TCL: transformWorkflowToGraph");
};

const buildGraph = async (webservices, workflow) => {
  graph = new joint.dia.Graph();
  paper = new joint.dia.Paper({
    el: $(INTERFACE_ROOT),
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

  setPaperEvents();
  setContextMenu(webservices);
  setKeyboardEvents(webservices);
  setSelection();

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
