import * as $ from "jquery";
import {
  PARAMETER_SELECTS,
  PARAMETER_INPUTS,
  TOOLTIP_CLASS,
  OPTION_PORT_DETAILS,
  OPTION_PARAMETERS,
  OPTION_PORTS,
  OPTION_TOOLTIPS,
  NO_PARAMETER_CLASS
} from "../constants/selectors";
import { graph } from "./interface";

import { computeBoxWidth, computeTitleLength, computeBoxHeight } from "./utils";
import {
  getLayoutOptions,
  changeShowPortDetails,
  changeShowParameters,
  changeShowPorts,
  changeShowTooltips
} from "../constants/globals";
import { resetHighlight } from "../events/selections";

const changePortDetails = () => {
  const { showPortDetails } = getLayoutOptions();
  const prop = showPortDetails ? "block" : "none";
  for (const el of graph.getElements()) {
    for (const { id } of el.getPorts()) {
      el.portProp(id, "attrs/text/display", prop);
    }
  }
};

const changePorts = () => {
  const { showPorts } = getLayoutOptions();
  const prop = showPorts ? "block" : "none";
  // show prop details
  for (const el of graph.getElements()) {
    for (const { id } of el.getPorts()) {
      el.portProp(id, "attrs/circle/display", prop);
    }
  }
};

const changeTooltips = () => {
  const { showTooltips } = getLayoutOptions();
  if (showTooltips) {
    // show prop details
    $(`.${TOOLTIP_CLASS}`).show();
  } else {
    // hide prop details
    $(`.${TOOLTIP_CLASS}`).hide();
  }
};

const changeParameters = () => {
  const { showParameters } = getLayoutOptions();
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

export const initThemeOptions = () => {
  let {
    showPortDetails,
    showParameters,
    showPorts,
    showTooltips
  } = getLayoutOptions();

  $(`#${OPTION_PORT_DETAILS}`).prop("checked", showPortDetails);
  $(`#${OPTION_PORT_DETAILS}`).change(function() {
    changeShowPortDetails($(this).prop("checked"));
    changePortDetails();
    resetHighlight();
  });

  $(`#${OPTION_PARAMETERS}`).prop("checked", showParameters);
  $(`#${OPTION_PARAMETERS}`).change(function() {
    changeShowParameters($(this).prop("checked"));
    changeParameters();
    resetHighlight();
  });
  $(`#${OPTION_PORTS}`).prop("checked", showPorts);
  $(`#${OPTION_PORTS}`).change(function() {
    changeShowPorts($(this).prop("checked"));
    changePorts();
    resetHighlight();
  });
  $(`#${OPTION_TOOLTIPS}`).prop("checked", showTooltips);
  $(`#${OPTION_TOOLTIPS}`).change(function() {
    changeShowTooltips($(this).prop("checked"));
    changeTooltips();
    resetHighlight();
  });
};
