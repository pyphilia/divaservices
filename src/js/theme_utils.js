// we import jquery as below for test to work
import jQuery from "jquery";
const $ = jQuery;
global.$ = global.jQuery = $;

import "select2";
import { TOOLTIP_BREAK_LINE, NAME_COL, PARAM_COL, Inputs } from "./constants";
import { objectToString } from "./utils";
import { IN_PORT_CLASS, OUT_PORT_CLASS, PARAM_NAME_CLASS } from "./selectors";
import { isParamInput } from "./utils";

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
  const selectedValue = select.find(":selected").attr("value");
  element.attributes.params[select.parent().attr("name")] = selectedValue;
};

export const setInputValueInElement = (element, input) => {
  const value = input.val();
  element.attributes.params[input.attr("name")] = value;
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
    tooltip = defaultTooltip.clone(true).data("title", description);
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
    tooltip = defaultTooltip.data("title", tooltipText);
  }
  newInput.append(nameEl, inputEl, resetButtonNumber, tooltip);
  return newInput;
};

export const checkInputValue = input => {
  const currentVal = input.val();
  const { min, max, steps } = input.data();

  const minCondition = min ? currentVal >= min : true;
  const maxCondition = max ? currentVal <= max : true;
  const stepCondition = steps ? Number.isInteger(currentVal / steps) : true;

  const isValid = minCondition && maxCondition && stepCondition;

  input.toggleClass("is-invalid", !isValid);
};
