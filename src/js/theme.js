/* eslint-disable */
import "select2";
import * as $ from "jquery";
import * as joint from "jointjs";
import {
  TOOLTIP_HTML,
  THEME,
  colorType,
  BOX_TITLE_HTML_TAG,
  TOOLTIP_OPTIONS,
  TOOLTIP_BREAK_LINE,
  NAME_COL,
  RESET_COL,
  TOOLTIP_COL,
  PARAM_COL,
  ICON_COL,
  TOOLTIP_BOX_COL,
  TITLE_COL,
  Inputs,
  DEFAULT_OPTIONS
} from "./constants";
import {
  getWebServiceFromUrl,
  objectToString,
  isParamInput,
  isPort,
  isPortUserdefined
} from "./utils";
import {
  PORT_SELECTOR,
  INFO_TOOLTIP_CLASS,
  PARAM_NAME_CLASS,
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

let {
  showPortDetails,
  showParameters,
  showPorts,
  showTooltips
} = DEFAULT_OPTIONS;

const maxWidth = 650;
const titleFontSize = 18;
const paramHeight = 55;
const defaultHeight = 40;
const titleHeightOneLine = 60;
const titleHeightTwoLine = 80;

export const computeTitleLength = (el, fromSVG = false) => {
  let titleLength;
  if (fromSVG) {
    titleLength = el.attributes.type.length;
  } else {
    titleLength = el.label.length;
  }
  const value = Math.min(titleLength * titleFontSize, maxWidth);
  return {
    value,
    titleHeight:
      titleLength * titleFontSize > maxWidth
        ? titleHeightTwoLine
        : titleHeightOneLine
  };
};

const computeBoxWidth = (el, fromSVG = false) => {
  let getNameLengths;
  if (fromSVG) {
    getNameLengths = Object.keys(el.attributes.params).map(name => name.length);
  } else {
    getNameLengths = el.params
      .filter(x => isParamInput(x))
      .map(param => (param.name ? param.name.length : 0));
  }
  const paramNameLength = showParameters ? getNameLengths : [0];

  const inputDefaultWidth = Math.max(...paramNameLength) * 25;

  const nameLength = computeTitleLength(el, fromSVG).value;

  return Math.min(Math.max(nameLength, inputDefaultWidth) + 200, maxWidth); // 200 = button and stuff width
};

const computeBoxHeight = (el, fromSVG = false) => {
  let nbParam;
  let ports;
  if (fromSVG) {
    nbParam = Object.keys(el.attributes.params).length;
    ports = el.attributes.ports.items;
  } else {
    nbParam = el.params.filter(x => isParamInput(x)).length;
    ports = el.ports.items;
  }
  const inputsHeight = showParameters ? nbParam * paramHeight : 0;

  const inPorts = ports.length
    ? ports.filter(x => x.group == IN_PORT_CLASS)
    : [];
  const outPorts = ports.length
    ? ports.filter(x => x.group == OUT_PORT_CLASS)
    : [];

  const maxPortEntry = Math.max(inPorts.length, outPorts.length);
  // @TODO count input + output port
  return Math.max(defaultHeight, maxPortEntry * 50, inputsHeight);
};

const changePortDetails = () => {
  if (showPortDetails) {
    // show prop details
    for (const el of getGraph().getElements()) {
      for (const port of el.getPorts()) {
        el.portProp(port.id, "attrs/text/display", "block");
      }
    }
  } else {
    // hide prop details
    for (const el of getGraph().getElements()) {
      for (const port of el.getPorts()) {
        el.portProp(port.id, "attrs/text/display", "none");
      }
    }
  }
};

const changePorts = () => {
  if (showPorts) {
    // show prop details
    for (const el of getGraph().getElements()) {
      for (const port of el.getPorts()) {
        el.portProp(port.id, "attrs/circle/display", "block");
      }
    }
  } else {
    // hide prop details
    for (const el of getGraph().getElements()) {
      for (const port of el.getPorts()) {
        el.portProp(port.id, "attrs/circle/display", "none");
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

const changeParameters = el => {
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
    const newWidth = computeBoxWidth(e, true);
    const newHeight = computeBoxHeight(e, true);
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
    console.log("TCL: setThemeOptions -> showPortDetails", showPortDetails);
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

const createBox = (e, id) => {
  const size = {
    width: computeBoxWidth(e),
    height: computeBoxHeight(e)
  };
  const { titleHeight } = computeTitleLength(e);

  const template = `<g class="scalable"><rect></rect></g>
    <foreignObject class="${FOREIGN_CLASS}" id="${id}" x="0" y="-${titleHeight}" width="${
    size.width
  }" height="${size.height + titleHeight}">
    <body xmlns="http://www.w3.org/1999/xhtml">
    <div class="${BOX_CONTAINER_CLASS} no-gutters p-0">
    <div class="${TITLE_ROW_CLASS} ${
    e.category
  } row justify-content-start" style="height:${titleHeight}px">
    <div class="${ICON_COL} icon"></div>
    <${BOX_TITLE_HTML_TAG} class="${TITLE_COL} align-middle">${
    e.label
  }</${BOX_TITLE_HTML_TAG}>
    </div>
    </div>
    </body>
    </foreignObject>`;

  const paper = getPaper();
  const bcr = paper.svg.getBoundingClientRect();
  const paperLocalRect = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });
  const position = { x: paperLocalRect.x + 100, y: paperLocalRect.y + 100 };

  return joint.shapes.basic.Rect.define(
    e.label,
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
        items: e.ports.items
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
};

const setSelectValueInElement = (element, select) => {
  const selectedValue = select.find(":selected").attr("value");
  element.attributes.params[select.parent().attr("name")] = selectedValue;
};

const setInputValueInElement = (element, input) => {
  const value = input.val();
  element.attributes.params[input.attr("name")] = value;
};

function resetValue(event) {
  const el = event.target;
  const defaultValue = el.dataset.value;
  switch (el.dataset.parent) {
    case Inputs.SELECT.tag: {
      const select = el.parentNode.getElementsByTagName(Inputs.SELECT.tag)[0];
      $(select)
        .val(defaultValue)
        .trigger("change");
      break;
    }
    case Inputs.NUMBER.tag:
      el.parentNode.getElementsByTagName(
        Inputs.NUMBER.tag
      )[0].value = defaultValue;
      break;
    default:
      alert("error");
  }
}

// Create a custom element.
// ------------------------
export const addElement = e => {
  const id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  const Box = createBox(e, id);
  const element = new Box();

  element.addTo(getGraph());

  // add params
  const selects = $("<div></div>").addClass(PARAMETER_SELECTS);
  const inputs = $("<div></div>").addClass(PARAMETER_INPUTS);

  const resetButton = $("<button></button>")
    .addClass(`${RESET_BUTTON_CLASS} btn ${RESET_COL}`)
    .text("Reset")
    .on("click", resetValue);

  for (const param of e.params) {
    const name = param.name;
    const defaultTooltip = $(TOOLTIP_HTML)
      .addClass(`${TOOLTIP_CLASS} ${INFO_TOOLTIP_CLASS} ${TOOLTIP_COL}`)
      .data({
        id: name,
        param: e.label,
        toggle: "tooltip",
        placement: "right"
      });

    switch (param.type) {
      case Inputs.SELECT.type: {
        // wrapper
        const newSelect = $("<div></div>")
          .addClass("select row")
          .attr("name", name);

        // select
        const selectEl = $(`<${Inputs.SELECT.tag}/>`)
          .addClass(PARAM_COL)
          .prop("disabled", !param.userdefined);

        // param name
        const nameEl = $("<span></span>")
          .addClass(`${PARAM_NAME_CLASS} ${NAME_COL}`)
          .text(name);

        // param options
        for (const [i, values] of param.options.values.entries()) {
          $("<option></option>")
            .text(values)
            .attr("value", values)
            .prop("selected", i == param.options.default)
            .appendTo(selectEl);
        }

        newSelect.append(nameEl, selectEl).appendTo(selects);

        // reset
        resetButton
          .clone(true)
          .attr({
            "data-parent": "select",
            "data-value": param.options.values[param.options.default]
          })
          .appendTo(newSelect);

        // add tooltip
        if (param.description) {
          defaultTooltip
            .clone(true)
            .data("title", param.description)
            .appendTo(newSelect)
            .tooltip(TOOLTIP_OPTIONS);
        }
        break;
      }
      case Inputs.NUMBER.type: {
        // wrapper
        const newInput = $("<div></div>")
          .addClass("input row")
          .appendTo(inputs);

        // param name
        const nameEl = $("<span></span>")
          .addClass(`${PARAM_NAME_CLASS} ${NAME_COL}`)
          .text(name);

        const options = param.options;
        // param input
        const inputEl = $(`<${Inputs.NUMBER.tag} />`)
          .addClass(`${PARAM_COL} form-control`)
          .prop({ disabled: !param.userdefined, required: options.required })
          .attr({
            type: "text",
            name: name,
            "data-min": options.min,
            "data-max": options.max,
            "data-steps": options.steps,
            "data-default": options.default,
            value: options.default
          });

        // reset
        const resetButtonNumber = resetButton.clone(true);
        resetButtonNumber.attr({
          "data-parent": "input",
          "data-value": param.options.default
        });

        newInput.append(nameEl, inputEl, resetButtonNumber).appendTo(inputs);

        // add tooltip
        if (param.description || param.options.length) {
          const tooltipText = `${
            param.description
          }${TOOLTIP_BREAK_LINE}${objectToString(param.options)}`;
          defaultTooltip
            .data("title", tooltipText)
            .appendTo(newInput)
            .tooltip(TOOLTIP_OPTIONS);
        }

        break;
      }
      default:
        alert("not handled type : ", param.type);
    }
  }

  // add params to boxes
  const foreignObject = $(`foreignObject#${id} body`);
  const container = foreignObject
    .find(`.${BOX_CONTAINER_CLASS}`)
    .append(inputs, selects);

  let noParameter = $();
  if (inputs.children().length + selects.children().length == 0) {
    noParameter = $(`<div class="${NO_PARAMETER_CLASS}"></div>`)
      .text("No parameter")
      .appendTo(container);
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
      .appendTo(foreignObject.find(`.${TITLE_ROW_CLASS}`))
      .tooltip(TOOLTIP_OPTIONS);
  }

  // SELECT EVENTS
  const allSelects = selects.find(Inputs.SELECT.tag);

  // add select2 on elements
  // avoid select click bug
  allSelects.each(function() {
    $(this).select2({
      minimumResultsForSearch: -1 // hide search box
    });

    // set default value
    setSelectValueInElement(element, $(this));

    // update param
    $(this).on("change", function() {
      setSelectValueInElement(element, $(this));
    });
  });

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
  allInputs.each(function() {
    // set default value
    setInputValueInElement(element, $(this));

    // update param
    $(this).on("blur", function() {
      setInputValueInElement(element, $(this));

      // check value
      const currentVal = $(this).val();
      const { min, max, steps } = $(this).data();

      const minCondition = min ? currentVal >= min : true;
      const maxCondition = max ? currentVal <= max : true;
      const stepCondition = steps ? Number.isInteger(currentVal / steps) : true;

      const isValid = minCondition && maxCondition && stepCondition;

      $(this).toggleClass("is-invalid", !isValid);
    });

    $(this).click(function() {
      $(this).select();
    });
  });
};

const createPort = (param, group) => {
  let port = {};
  const obj = param[Object.keys(param)[0]];
  if (group == OUT_PORT_CLASS || obj.userdefined) {
    // always create out port, check userdefined for inputs

    let typeAllowed;
    let type;

    // folder case
    if (param[Inputs.FOLDER.type]) {
      typeAllowed = [Inputs.FOLDER.type]; // use options allowed types, otherwise it is a folder
      type = Inputs.FOLDER.type;
    } else {
      // @TODO display !userdefined ports ?
      typeAllowed = obj.options.mimeTypes.allowed;
      type = typeAllowed[0].substr(
        //@TODO diff types ?
        0,
        typeAllowed[0].indexOf("/")
      );
    }

    port = {
      group,
      name: obj.name,
      attrs: {
        [PORT_SELECTOR]: {
          fill: colorType(type),
          type,
          typeAllowed
        },
        text: {
          text: `${obj.name}\n${typeAllowed}`,
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

  const { name: label, description } = webservice.general;

  // handle ports
  const ports = { items: [] };
  webservice.input
    .filter(input => isPortUserdefined(input))
    .forEach(input => {
      const port = createPort(input, IN_PORT_CLASS);
      if (port.group) {
        ports.items.push(port);
      }
    });

  webservice.output
    .filter(output => isPort(output))
    .forEach(output => {
      const port = createPort(output, OUT_PORT_CLASS);
      if (port.group) {
        ports.items.push(port);
      }
    });

  // handle params
  const params = [];
  webservice.input
    .filter(input => isParamInput(input))
    .forEach(input => {
      const type = Object.keys(input)[0];
      const param = {
        type,
        ...input[type]
      };
      params.push(param);
    });

  const ret = {
    description,
    label,
    params,
    ports,
    information: webservice.general,
    category
  };
  console.log("webservice", webservice);
  console.log("return", ret);
  return ret;
};

export const addElementToGraph = async (url, category) => {
  const webservice = await getWebServiceFromUrl(url);
  const transformedWebservice = transformWebserviceForGraph(
    webservice,
    category
  );
  addElement(transformedWebservice);
};
