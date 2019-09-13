// we import jquery as below for test to work
import jQuery from "jquery";
const $ = jQuery;
global.$ = global.jQuery = $;

import "select2";
import {
  TOOLTIP_BREAK_LINE,
  Inputs,
  PARAM_COL,
  NAME_COL,
  TOOLTIP_HTML,
  RESET_COL,
  MimeTypes,
  DEFAULT_OPTIONS
} from "./constants";
import {
  PARAM_NAME_CLASS,
  PORT_SELECTOR,
  INFO_TOOLTIP_CLASS,
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  RESET_BUTTON_CLASS,
  IN_PORT_CLASS,
  OUT_PORT_CLASS,
  TOOLTIP_CLASS,
  NO_PARAMETER_CLASS,
  PARAMETER_SELECTS,
  PARAMETER_INPUTS
} from "./selectors";
import { moveAllSelected } from "./events";

let { showPortDetails, showParameters, showPorts } = DEFAULT_OPTIONS;

const maxWidth = 650;
const titleFontSize = 18;
const paramHeight = 55;
const defaultHeight = 40;
const titleHeightOneLine = 60;
const titleHeightTwoLine = 80;

export const isParamInput = input => {
  if (input.type) {
    return input.type == Inputs.SELECT.type || input.type == Inputs.NUMBER.type;
  }

  return input[Inputs.SELECT.type] || input[Inputs.NUMBER.type];
};

export const isPort = el => {
  if (el.type) {
    return el.type == Inputs.FILE.type || el.type == Inputs.FOLDER.type;
  }
  return el[Inputs.FILE.type] || el[Inputs.FOLDER.type];
};

export const isPortUserdefined = el => {
  if (el.type) {
    return (
      (el.type == Inputs.FILE.type || el.type == Inputs.FOLDER.type) &&
      el.userdefined
    );
  }
  return (
    (el[Inputs.FILE.type] || el[Inputs.FOLDER.type]) &&
    el[Object.keys(el)[0]].userdefined
  );
};

export const getWebServiceFromUrl = async url => {
  const data = await fetch(url);
  const json = await data.json();
  return json;
};

export const objectToString = obj => {
  let str = "";
  for (let p in obj) {
    str += "- " + p + " : " + obj[p] + TOOLTIP_BREAK_LINE;
  }
  return str;
};

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

export const computeBoxWidth = (el, showParameters, fromSVG = false) => {
  const { attributes, params } = el;
  let getNameLengths;
  if (fromSVG) {
    getNameLengths = Object.keys(attributes.params).map(name => name.length);
  } else {
    getNameLengths = params
      ? params
          .filter(x => isParamInput(x))
          .map(param => (param.name ? param.name.length : 0))
      : [0];
  }
  const paramNameLength = showParameters ? getNameLengths : [0];

  const inputDefaultWidth = Math.max(...paramNameLength) * 25;

  const nameLength = computeTitleLength(el, fromSVG).value;

  return Math.min(Math.max(nameLength, inputDefaultWidth) + 200, maxWidth); // 200 = button and stuff width
};

export const computeBoxHeight = (el, showParameters, fromSVG = false) => {
  const { attributes, params, ports } = el;

  let nbParam;
  let portsItems;
  if (fromSVG) {
    nbParam = Object.keys(attributes.params).length;
    portsItems = attributes.ports.items;
  } else {
    nbParam = params.filter(x => isParamInput(x)).length;
    portsItems = ports.items;
  }
  const inputsHeight = showParameters ? nbParam * paramHeight : 0;

  const inPorts = portsItems.length
    ? portsItems.filter(x => x.group == IN_PORT_CLASS)
    : [];
  const outPorts = portsItems.length
    ? portsItems.filter(x => x.group == OUT_PORT_CLASS)
    : [];

  const maxPortEntry = Math.max(inPorts.length, outPorts.length);
  // @TODO count input + output port
  return Math.max(defaultHeight, maxPortEntry * 50, inputsHeight);
};

export const setSelectValueInElement = (element, select) => {
  const s = select.find(":selected");
  const selectEl = select.parent();
  const value = s.attr("value");
  const defaultValue = selectEl.data("default");
  const attr = selectEl.attr("name");

  element.attributes.params[attr] = { value, defaultValue };
};

export const setInputValueInElement = (element, input) => {
  const value = input.val();
  const attr = input.attr("name");
  const defaultValue = input.data("default");
  element.attributes.params[attr] = { value, defaultValue };
};

export function resetValue(event) {
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
      $(el.parentNode.getElementsByTagName(Inputs.NUMBER.tag)[0])
        .val(defaultValue)
        .trigger("change");
      break;
    default:
      alert("error");
  }
}

export const createSelect = (
  param,
  resetButton,
  defaultTooltip,
  defaultValue = null
) => {
  const { name, userdefined, options, description } = param;
  const { default: defaultOption, values } = options;

  // wrapper
  const newSelect = $("<div/>", {
    name,
    class: "select row"
  });

  // select
  const selectEl = $(`<${Inputs.SELECT.tag}/>`, {
    class: PARAM_COL,
    attr: {
      "data-default": param.options.values[param.options.default]
    },
    prop: {
      disabled: !userdefined
    }
  });

  // param name
  const nameEl = $("<span/>", {
    class: `${PARAM_NAME_CLASS} ${NAME_COL}`,
    text: name
  });

  // param options, select the default value or the read value of the workflow
  let selectedId;
  if (defaultValue) {
    selectedId = param.options.values.indexOf(defaultValue);
    if (selectedId < 0) {
      alert("an error in field ", name, " with value ", defaultValue);
    }
  } else {
    selectedId = defaultOption;
  }

  const valuesEls = [];
  for (const [i, value] of values.entries()) {
    const valueEl = $("<option/>", {
      text: value,
      attr: { value },
      prop: { selected: i == selectedId }
    });
    valuesEls.push(valueEl);
  }
  selectEl.append(valuesEls);

  // reset
  const reset = resetButton.clone(true).attr({
    "data-parent": "select",
    "data-value": values[defaultOption]
  });

  // add tooltip
  let tooltip = $();
  if (description) {
    tooltip = defaultTooltip.clone(true).attr("data-title", description);
  }

  newSelect.append(nameEl, selectEl, reset, tooltip);
  return newSelect;
};

export const createInput = (
  param,
  resetButton,
  defaultTooltip,
  defaultValue
) => {
  const { name, options, userdefined, description } = param;

  // wrapper
  const newInput = $("<div/>", { class: "input row" });

  // param name
  const nameEl = $("<span/>", {
    class: `${PARAM_NAME_CLASS} ${NAME_COL}`,
    text: name
  });

  // param input
  const { required, min, max, steps, default: defaultOption } = options;
  const inputEl = $(`<${Inputs.NUMBER.tag} />`, {
    class: `${PARAM_COL} form-control`,
    prop: { disabled: !userdefined, required },
    attr: {
      type: "text",
      name,
      "data-min": min,
      "data-max": max,
      "data-steps": steps,
      "data-default": defaultOption,
      value: defaultValue ? defaultValue : defaultOption
    }
  });

  // reset
  const resetButtonNumber = resetButton.clone(true).attr({
    "data-parent": "input",
    "data-value": defaultOption
  });

  // add tooltip
  let tooltip = $();
  if (description || options.length) {
    const tooltipText = `${description}${TOOLTIP_BREAK_LINE}${objectToString(
      options
    )}`;
    tooltip = defaultTooltip.attr("data-title", tooltipText);
  }
  newInput.append(nameEl, inputEl, resetButtonNumber, tooltip);
  return newInput;
};

export const checkInputValue = input => {
  const currentVal = input.val();
  const { min, max, steps } = input.data();

  const minCondition = min ? currentVal >= min : true;
  const maxCondition = max ? currentVal <= max : true;

  // because of js inconsistency with float computations
  // we transform it to a string, round it to the the least precision
  // and check if it is a integer, so whether it matches the step
  const sepNumber = steps.toString().split(".");
  let precision = 0;
  if (sepNumber.length == 1) {
    precision = 0;
  } else {
    precision = sepNumber[1].length + 1;
  }
  const stepCondition = steps
    ? Number.isInteger(+parseFloat(currentVal / steps).toFixed(precision))
    : true;
  const isValid = minCondition && maxCondition && stepCondition;

  input.toggleClass("is-invalid", !isValid);
};

const computeDisplayOffset = (el, { height, width }) => {
  const mainPosition = document.querySelector("#main").getBoundingClientRect();

  const sPosition = el.offset();
  console.log("TCL: computeDisplayOffset -> sPosition", sPosition);
  const dist = {
    x: (sPosition.left - mainPosition.x + width) * 0.1,
    y: (sPosition.top - mainPosition.y + height) * 0.09,
    elementOffset: sPosition
  };
  return dist;
};

// some errors are induced by the svg positioning, thus we have to use mouse position to display
// the tooltip
const showTooltip = (tooltip, event) => {
  const { title } = tooltip.dataset;
  const el = document.querySelector("#tooltip");
  el.innerHTML = title;
  el.style.top = event.y + 10 + "px";
  el.style.left = event.x + 10 + "px";
  // const {width, height } = tooltip.getBoundingClientRect();
  // const dist = computeDisplayOffset($(tooltip), {width,height});
  // const newTop = dist.y + dist.elementOffset.top;
  // const newLeft = dist.x + dist.elementOffset.left;
  // el.style.top = newTop+'px';
  // el.style.left = newLeft+'px';
  el.style.display = "block";
};

const hideTooltip = () => {
  const el = document.querySelector("#tooltip");
  el.style.display = "none";
};

export const setParametersInForeignObject = (
  element,
  { id, description, params, label },
  defaultParams
) => {
  const selectsArr = [];
  const inputsArr = [];

  const resetButton = $("<button/>", {
    class: `${RESET_BUTTON_CLASS} btn ${RESET_COL}`,
    text: "Reset",
    click: resetValue
  });

  for (const param of params) {
    const { name: paramName, type } = param;

    const defaultTooltip = $(`${TOOLTIP_HTML}`)
      .addClass(`${TOOLTIP_CLASS} ${INFO_TOOLTIP_CLASS}`)
      .attr({
        "data-id": paramName,
        "data-param": label,
        "data-toggle": "tooltip",
        "data-placement": "right"
      });

    const defaultValue = defaultParams.params
      ? defaultParams.params[paramName].value
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
  if (description) {
    $(TOOLTIP_HTML)
      .addClass(`${TOOLTIP_CLASS} tooltip-box`)
      .attr({
        "data-title": description,
        "data-toggle": "tooltip",
        "data-placement": "right"
      })
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

    setSelectValueInElement(element, s);

    // update param
    s.on("change", function() {
      setSelectValueInElement(element, s);
    });

    s.on("select2:open", function() {
      const width = s.next().width();
      const height = s.next().height();

      const dist = computeDisplayOffset(s, { height, width });

      let newTop = -dist.y;
      const newLeft = -dist.x;

      let container = document.querySelector(".select2-dropdown--below");

      // if the select is displayed at top
      const above = document.querySelector(
        ".select2-container--open .select2-dropdown--above"
      );
      if (above) {
        container = above;
        newTop += height;
      }

      container.style.top = newTop + "px";
      container.style.left = newLeft + "px";
    });
  }

  // When the user clicks on a select and moves the bloc
  // the select dropdown is still displayed
  // this event closes it
  element.on("change:position", (el, position, { multitranslate }) => {
    allSelects.each(function() {
      $(this).select2("close");
    });

    if (!multitranslate) {
      moveAllSelected(el, position);
    }
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
        el.trigger("change");
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

    // evaluate default parameters
    checkInputValue(input);
  }

  // tooltips js
  for (const tooltip of $(`.${TOOLTIP_CLASS}`)) {
    // $(tooltip).tooltip(TOOLTIP_OPTIONS);
    tooltip.addEventListener("mouseenter", event => {
      showTooltip(tooltip, event);
    });
    tooltip.addEventListener("mouseleave", () => {
      hideTooltip(tooltip);
    });
  }
};

export const createPort = (param, group) => {
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
