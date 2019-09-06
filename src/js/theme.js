/* eslint-disable no-unused-vars */
// we import jquery as below for test to work
import jQuery from "jquery";
const $ = jQuery;
global.$ = global.jQuery = $;

import "select2";
import * as joint from "jointjs";
import {
  TOOLTIP_HTML,
  THEME,
  BOX_TITLE_HTML_TAG,
  TOOLTIP_OPTIONS,
  RESET_COL,
  TOOLTIP_COL,
  ICON_COL,
  TOOLTIP_BOX_COL,
  TITLE_COL,
  Inputs,
  MimeTypes,
  DEFAULT_OPTIONS
} from "./constants";
import { isParamInput, isPort, isPortUserdefined } from "./utils";
import {
  PORT_SELECTOR,
  INFO_TOOLTIP_CLASS,
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  FOREIGN_CLASS,
  RESET_BUTTON_CLASS,
  IN_PORT_CLASS,
  OUT_PORT_CLASS,
  TOOLTIP_CLASS,
  NO_PARAMETER_CLASS,
  OPTION_PORT_DETAILS,
  OPTION_PARAMETERS,
  OPTION_PORTS,
  OPTION_TOOLTIPS,
  PARAMETER_SELECTS,
  PARAMETER_INPUTS
} from "./selectors";
import { getPaper, getGraph } from "./interface";
import {
  resetValue,
  createInput,
  createSelect,
  checkInputValue,
  setSelectValueInElement,
  setInputValueInElement,
  computeBoxWidth,
  computeTitleLength,
  computeBoxHeight
} from "./theme_utils";

export let {
  showPortDetails,
  showParameters,
  showPorts,
  showTooltips
} = DEFAULT_OPTIONS;

const changePortDetails = () => {
  if (showPortDetails) {
    // show prop details
    for (const el of getGraph().getElements()) {
      for (const { id } of el.getPorts()) {
        el.portProp(id, "attrs/text/display", "block");
      }
    }
  } else {
    // hide prop details
    for (const el of getGraph().getElements()) {
      for (const { id } of el.getPorts()) {
        el.portProp(id, "attrs/text/display", "none");
      }
    }
  }
};

const changePorts = () => {
  if (showPorts) {
    // show prop details
    for (const el of getGraph().getElements()) {
      for (const { id } of el.getPorts()) {
        el.portProp(id, "attrs/circle/display", "block");
      }
    }
  } else {
    // hide prop details
    for (const el of getGraph().getElements()) {
      for (const { id } of el.getPorts()) {
        el.portProp(id, "attrs/circle/display", "none");
      }
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
  for (const e of getGraph().getElements()) {
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
  });

  $(`#${OPTION_PARAMETERS}`).prop("checked", showParameters);
  $(`#${OPTION_PARAMETERS}`).change(function() {
    showParameters = $(this).prop("checked");
    changeParameters();
  });
  $(`#${OPTION_PORTS}`).prop("checked", showPorts);
  $(`#${OPTION_PORTS}`).change(function() {
    showPorts = $(this).prop("checked");
    changePorts();
  });
  $(`#${OPTION_TOOLTIPS}`).prop("checked", showTooltips);
  $(`#${OPTION_TOOLTIPS}`).change(function() {
    showTooltips = $(this).prop("checked");
    changeTooltips();
  });
};

export const setPaperEvents = paper => {
  // unfocus inputs when clicks
  paper.on("blank:pointerdown", () => {
    $("input:focus").blur();
  });
};

const createBox = (e, id, position) => {
  const {
    category,
    label,
    ports: { items }
  } = e;
  const size = {
    width: computeBoxWidth(e, showParameters),
    height: computeBoxHeight(e, showParameters)
  };
  const { titleHeight } = computeTitleLength(e);

  const template = `<g class="scalable"><rect></rect></g>
      <foreignObject class="${FOREIGN_CLASS}" id="${id}" x="0" y="-${titleHeight}" width="${
    size.width
  }" height="${size.height + titleHeight}">
      <body xmlns="http://www.w3.org/1999/xhtml">
      <div class="${BOX_CONTAINER_CLASS} no-gutters p-0">
      <div class="${TITLE_ROW_CLASS} ${category} row justify-content-start" style="height:${titleHeight}px">
      <div class="${ICON_COL} icon"></div>
      <${BOX_TITLE_HTML_TAG} class="${TITLE_COL} align-middle">${label}</${BOX_TITLE_HTML_TAG}>
      </div>
      </div>
      </body>
      </foreignObject>`;

  const Box = joint.shapes.basic.Rect.define(
    label,
    {
      markup: template,
      attrs: {
        root: {
          magnet: false
        },
        body: THEME.body,
        rect: { ...THEME.rect, ...size }
      },
      position,
      size,
      ports: {
        groups: THEME.groups,
        items
      },
      params: {}
    },
    {
      portMarkup: [{ tagName: "circle", selector: PORT_SELECTOR }],

      getGroupPorts: function(group) {
        return this.getPorts().filter(port => {
          return port.group === group;
        });
      },

      getInPorts: function() {
        return this.getGroupPorts(IN_PORT_CLASS);
      },

      getUsedInPorts: function() {
        const graph = this.graph;
        if (!graph) return [];
        const connectedLinks = graph.getConnectedLinks(this, { inbound: true });
        return connectedLinks.map(link => {
          return this.getPort(link.target().port);
        });
      }
    }
  );

  const element = new Box();
  element.addTo(getGraph());
  return element;
};

// Create a custom element.
// ------------------------
export const addElement = (e, position, defaultParams = {}) => {
  const { label, params } = e;

  if (!label) {
    return;
  }

  const id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  const element = createBox(e, id, position);

  const selectsArr = [];
  const inputsArr = [];

  const resetButton = $("<button/>", {
    class: `${RESET_BUTTON_CLASS} btn ${RESET_COL}`,
    text: "Reset",
    click: resetValue
  });

  for (const param of params) {
    const { name: paramName, type } = param;

    const defaultTooltip = $(TOOLTIP_HTML)
      .addClass(`${TOOLTIP_CLASS} ${INFO_TOOLTIP_CLASS} ${TOOLTIP_COL}`)
      .data({
        id: paramName,
        param: label,
        toggle: "tooltip",
        placement: "right"
      });

    const defaultValue = defaultParams.params
      ? defaultParams.params[paramName]
      : null;

    switch (type) {
      case Inputs.SELECT.type: {
        const newSelect = createSelect(
          param,
          resetButton,
          defaultTooltip,
          defaultValue
        );
        selectsArr.push(newSelect);
        break;
      }
      case Inputs.NUMBER.type: {
        const newInput = createInput(
          param,
          resetButton,
          defaultTooltip,
          defaultValue
        );
        inputsArr.push(newInput);
        break;
      }
      default:
        alert("not handled type : ", type);
    }
  }

  // append selects and inputs
  // add params
  const selects = $("<div/>", { class: PARAMETER_SELECTS });
  const inputs = $("<div/>", { class: PARAMETER_INPUTS });
  selects.append(selectsArr);
  inputs.append(inputsArr);

  // add params to boxes
  const foreignObject = $(`foreignObject#${id} body`);
  const container = foreignObject
    .find(`.${BOX_CONTAINER_CLASS}`)
    .append(inputs, selects);

  let noParameter = $();
  if (inputs.children().length + selects.children().length == 0) {
    noParameter = $(`<div />`, {
      class: NO_PARAMETER_CLASS,
      text: "No parameter"
    }).appendTo(container);
  }

  // hide parameters depending on theme options
  if (!showParameters) {
    selects.hide();
    inputs.hide();
    noParameter.hide();
  }

  // main tooltip
  if (e.description) {
    $(TOOLTIP_HTML)
      .addClass(`${TOOLTIP_CLASS} tooltip-box ${TOOLTIP_BOX_COL}`)
      .data({ title: e.description, toggle: "tooltip", placement: "right" })
      .appendTo(foreignObject.find(`.${TITLE_ROW_CLASS}`));
  }

  // SELECT EVENTS
  const allSelects = selects.find(Inputs.SELECT.tag);

  // add select2 on elements
  // avoid select click bug
  for (const select of allSelects) {
    const s = $(select);
    s.select2({
      minimumResultsForSearch: -1 // hide search box
    });

    // set default value
    setSelectValueInElement(element, s);

    // update param
    s.on("change", function() {
      setSelectValueInElement(element, s);
    });
  }

  // When the user clicks on a select and moves the bloc
  // the select dropdown is still displayed
  // this event closes it
  element.on("change:position", () => {
    allSelects.each(function() {
      $(this).select2("close");
    });
  });

  // NUMBER EVENTS
  const allInputs = inputs.find("input");

  // on input click, select all text
  // avoid select problem for inputs
  for (const inputEl of allInputs) {
    // set default value
    const input = $(inputEl);

    setInputValueInElement(element, input);

    // update param
    input.on({
      blur: function() {
        const el = $(this);
        setInputValueInElement(element, el);

        // check value
        // checkInputValue(el);
      },
      click: function() {
        $(this).select();
      },
      change: function() {
        checkInputValue($(this));
      }
    });
  }

  // tooltips js
  for (const tooltip of $(`.${TOOLTIP_CLASS}`)) {
    $(tooltip).tooltip(TOOLTIP_OPTIONS);
  }

  return element;
};

const createPort = (param, group) => {
  let port = {};
  const obj = param[Object.keys(param)[0]];
  const { userdefined, options, name } = obj;
  if (group == OUT_PORT_CLASS || userdefined) {
    // always create out port, check userdefined for inputs

    let typeAllowed;
    let type;

    // folder case
    if (param[Inputs.FOLDER.type]) {
      typeAllowed = [Inputs.FOLDER.type]; // use options allowed types, otherwise it is a folder
      type = Inputs.FOLDER.type;
    } else {
      // @TODO display !userdefined ports ?
      typeAllowed = options.mimeTypes.allowed;
      type = typeAllowed[0].substr(
        //@TODO diff types ?
        0,
        typeAllowed[0].indexOf("/")
      );
    }

    port = {
      group,
      name,
      attrs: {
        [PORT_SELECTOR]: {
          fill: MimeTypes[type].color,
          type,
          typeAllowed
        },
        circle: {
          display: showPorts ? "block" : "none"
        },
        text: {
          text: `${name}\n${typeAllowed}`,
          display: showPortDetails ? "block" : "none"
        }
      }
    };
  }
  return port;
};

export const transformWebserviceForGraph = (webservice, category) => {
  if (!webservice.general) {
    alert("problem with ", webservice);
    return {};
  }
  const { general, output, input } = webservice;
  const { name: label, description } = general;

  // handle ports
  const ports = { items: [] };
  input
    .filter(inp => isPortUserdefined(inp))
    .forEach(inp => {
      const port = createPort(inp, IN_PORT_CLASS);
      if (port.group) {
        ports.items.push(port);
      }
    });

  output
    .filter(out => isPort(out))
    .forEach(out => {
      const port = createPort(out, OUT_PORT_CLASS);
      if (port.group) {
        ports.items.push(port);
      }
    });

  // handle params
  const params = [];
  for (const inp of input.filter(inp => isParamInput(inp))) {
    const type = Object.keys(inp)[0];
    const param = {
      type,
      ...inp[type]
    };
    params.push(param);
  }

  const ret = {
    description,
    label,
    params,
    ports,
    information: general,
    category
  };
  return ret;
};

export const addElementToGraph = (webservice, category, defaultParams = {}) => {
  const transformedWebservice = transformWebserviceForGraph(
    webservice,
    category
  );

  const paper = getPaper();
  const bcr = paper.svg.getBoundingClientRect();
  const paperLocalRect = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });

  let { position } = defaultParams;
  if (!position) {
    position = { x: paperLocalRect.x + 100, y: paperLocalRect.y + 100 };
  }

  const element = addElement(transformedWebservice, position, defaultParams);
  return element;
};

export const addLinkToGraph = link => {
  const linkEl = new joint.shapes.standard.Link(link);

  linkEl.addTo(getGraph());
};
