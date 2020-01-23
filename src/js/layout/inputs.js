/**
 * Input and select parameters-related functions
 */

// we import jquery as below for test to work
import jQuery from "jquery";
const $ = jQuery;
global.$ = global.jQuery = $;

import "select2js";
import {
  TOOLTIP_BREAK_LINE,
  PARAM_COL,
  NAME_COL,
  TOOLTIP_HTML,
  RESET_COL,
  TOOLTIP_OPTIONS
} from "../constants/constants";
import {
  PARAM_NAME_CLASS,
  INFO_TOOLTIP_CLASS,
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  RESET_BUTTON_CLASS,
  TOOLTIP_CLASS,
  NO_PARAMETER_CLASS,
  PARAMETER_SELECTS,
  PARAMETER_INPUTS,
  INTERFACE_ROOT,
  PARAMETER_TEXTS
} from "../constants/selectors";
import { objectToString } from "./utils";
import { Validation, Constants, API } from "divaservices-utils";
import { NO_PARAMETER_TEXT } from "../constants/messages";
const { Types } = Constants;

export const closeSelects = () => {
  const allSelect = $(`${INTERFACE_ROOT} .select ${Types.SELECT.tag}`);
  allSelect.select2("close");
};

/**
 * set select value in DOM
 *
 * @param {string} boxId
 * @param {object} defaultParams
 */
// export const setSelectValueInElement = ({ boxId, defaultParams }) => {
//   for (const [key, { value }] of Object.entries(
//     defaultParams[Types.SELECT.type]
//   )) {
//     // we need to precise paper root because of the minimap duplicate elements
//     const el = $(
//       `${INTERFACE_ROOT} foreignObject[boxId="${boxId}"] .select[name="${key}"] ${Types.SELECT.tag}`
//     );
//     if (el.find(":selected").val() != value) {
//       $(el)
//         .val(value)
//         .trigger("change.select2");
//     }
//   }
// };

/**
 * set input value in DOM
 *
 * @param {string} boxId
 * @param {string} type
 * @param {object} defaultParams
 */
// export const setInputValueInElement = ({
//   boxId,
//   type: boxName,
//   defaultParams
// }) => {
//   for (const [key, { value }] of Object.entries(
//     defaultParams[Types.NUMBER.type]
//   )) {
//     // we need to precise paper root because of the minimap duplicate elements
//     const el = $(
//       `${INTERFACE_ROOT} foreignObject[boxId="${boxId}"] ${Types.NUMBER.tag}[name="${key}"]`
//     );
//     el.val(value);
//     checkInputValue(el, { boxId, boxName });
//   }
// };

/**
 * reset value of input or select element
 *
 * @param {event} event
 */
export function resetValue(event) {
  const el = event.target;
  const defaultValue = el.dataset.value;
  switch (el.dataset.parent) {
    case Types.SELECT.tag: {
      const select = el.parentNode.querySelector(Types.SELECT.tag);
      // use jquery because of select2
      $(select)
        .val(defaultValue)
        .trigger("change");
      break;
    }
    case Types.NUMBER.tag:
      $(el.parentNode.querySelector(Types.NUMBER.tag))
        .val(defaultValue)
        .trigger("blur");
      break;
    default:
      alert("error");
  }
}

/**
 * create select DOM element, with
 * - name
 * - select tag
 * - reset button
 * - information
 *
 * @param {*} element element to append select
 * @param {*} param parameter data
 * @param {*} resetButton reset button html element
 * @param {*} defaultTooltip default tooltip html element
 * @param {*} defaultValue default value
 */
export const createSelect = (
  element,
  param,
  resetButton,
  defaultTooltip,
  commit,
  defaultValue = null
) => {
  const { name, defaultValue: defaultOption, values = [], description } = param;

  // if there is no values-options, no need for a select element
  if (!values.length) {
    return;
  }

  // wrapper
  const newSelect = $("<div/>", {
    name,
    class: "select row"
  });

  // select
  const wrapperSelect = $("<div/>", { class: `${PARAM_COL} p-0 mr-1` });
  const dataDefault = values[defaultOption]
    ? values[defaultOption].toString()
    : "";
  const selectEl = $(`<${Types.SELECT.tag}/>`, {
    style: "width:100%;margin:0",
    attr: {
      "data-default": dataDefault
    },
    prop: {
      disabled: false // @TODO userdefined
    }
  }).appendTo(wrapperSelect);

  // init select2
  selectEl.select2({
    minimumResultsForSearch: -1 // hide search box
  });
  // add class col-4 to container

  // param name
  const nameEl = $("<span/>", {
    class: `${PARAM_NAME_CLASS} ${NAME_COL}`,
    text: name,
    title: name
  });

  // param options, select the default value or the read value of the workflow
  let selectedId;
  if (defaultValue) {
    selectedId = values.indexOf(defaultValue);
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

  newSelect.append(nameEl, wrapperSelect, reset, tooltip);

  // update param
  selectEl.on("change", function() {
    const select = $(this);
    const s = select.find(":selected");
    const value = s.attr("value");

    commit({ element, attr: name, value });
  });

  selectEl.on("select2:open", function() {
    // if the select is displayed at top
    const above = document.querySelector(
      ".select2-container--open .select2-dropdown--above"
    );
    if (above) {
      $(above)
        .find(".select2-results li")
        .height();
      above.style.top = 36 + "px";
    }
  });

  return newSelect;
};

/**
 * create input DOM element, with
 * - name
 * - input tag
 * - reset button
 * - information
 *
 * @param {*} element element to append select
 * @param {*} param parameter data
 * @param {*} resetButton reset button html element
 * @param {*} defaultTooltip default tooltip html element
 * @param {*} givenDefaultValue default value
 */
export const createInput = (
  element,
  param,
  resetButton,
  defaultTooltip,
  commit,
  givenDefaultValue
) => {
  const {
    name,
    values = {},
    defaultValue: defaultOption,
    description,
    $: attributes
  } = param;

  // wrapper
  const newInput = $("<div/>", { class: "input row" });

  // param name
  const nameEl = $("<span/>", {
    class: `${PARAM_NAME_CLASS} ${NAME_COL}`,
    text: name,
    title: name
  });

  // param input
  let required = false;
  if (attributes && attributes.Status === "required") {
    required = true;
  }
  const { min, max, step } = values;
  const def = givenDefaultValue
    ? givenDefaultValue
    : defaultOption
    ? defaultOption
    : min
    ? min
    : max
    ? max
    : 0;
  const inputEl = $(`<${Types.NUMBER.tag} />`, {
    class: `${PARAM_COL} form-control mr-1`,
    prop: { disabled: false, required }, // userdefined?
    attr: {
      type: "text",
      name,
      "data-min": min,
      "data-max": max,
      "data-step": step,
      "data-default": defaultOption,
      value: def
    }
  });

  // update param
  inputEl.on({
    blur: function() {
      const input = $(this);
      const value = input.val();
      const attr = input.attr("name");
      commit({ element, attr, value });
      checkInputValue(input);
    },
    click: function() {
      $(this).select();
    },
    input: function() {
      // do not save each time you write, or it would be annoying
    }
  });

  // evaluate default parameters
  checkInputValue(inputEl);

  // reset
  const resetButtonNumber = resetButton.clone(true).attr({
    "data-parent": "input",
    "data-value": defaultOption
  });

  // add tooltip
  let tooltip = $();
  if (description || values.length) {
    const tooltipText = `${description}${TOOLTIP_BREAK_LINE}${objectToString({
      default: defaultOption,
      ...values
    })}`;
    tooltip = defaultTooltip.attr("data-title", tooltipText);
  }

  newInput.append(nameEl, inputEl, resetButtonNumber, tooltip);
  return newInput;
};

/**
 * check input value
 * if there is an error, report it in log
 *
 * @param {*} input
 * @param {*} boxName
 * @param {*} boxId
 */
export const checkInputValue = input => {
  const currentVal = input.val();
  const { min, max, step } = input.data();

  let isValid = false;
  try {
    isValid = Validation.checkValue(currentVal, Types.NUMBER.type, {
      min,
      max,
      step
    });
  } catch (e) {
    console.log(e);
  }
  input.toggleClass("is-invalid", !isValid);
};

/**
 * create text DOM element, with
 * - name
 * - text tag
 * - reset button
 * - information
 *
 * @param {*} element element to append select
 * @param {*} param parameter data
 * @param {*} resetButton reset button html element
 * @param {*} defaultTooltip default tooltip html element
 * @param {*} givenDefaultValue default value
 */
export const createText = (
  element,
  param,
  resetButton,
  defaultTooltip,
  commit,
  givenDefaultValue
) => {
  const {
    name,
    values = {},
    defaultValue: defaultOption,
    description,
    $: attributes
  } = param;

  // wrapper
  const newText = $("<div/>", { class: "input row" });

  // param name
  const nameEl = $("<span/>", {
    class: `${PARAM_NAME_CLASS} ${NAME_COL}`,
    text: name,
    title: name
  });

  // param input
  let required = false;
  if (attributes && attributes.Status === "required") {
    required = true;
  }

  const inputEl = $(`<${Types.TEXT.tag} />`, {
    class: `${PARAM_COL} form-control mr-1`,
    prop: { disabled: false, required }, // userdefined?
    attr: {
      type: "text",
      name,
      "data-default": defaultOption,
      value: givenDefaultValue ? givenDefaultValue : defaultOption
    }
  });

  // update param
  inputEl.on({
    blur: function() {
      const input = $(this);
      const value = input.val();
      const attr = input.attr("name");
      commit({ element, attr, value });
    },
    click: function() {
      $(this).select();
    },
    input: function() {
      // do not save each time you write, or it would be annoying
    }
  });

  // reset
  const resetButtonNumber = resetButton.clone(true).attr({
    "data-parent": "input",
    "data-value": defaultOption
  });

  // add tooltip
  let tooltip = $();
  if (description || values.length) {
    const tooltipText = `${description}${TOOLTIP_BREAK_LINE}${objectToString({
      default: defaultOption,
      ...values
    })}`;
    tooltip = defaultTooltip.attr("data-title", tooltipText);
  }

  newText.append(nameEl, inputEl, resetButtonNumber, tooltip);
  return newText;
};

/**
 * create and append parameters in foreign object of element
 *
 * @param {element} element
 * @param {objet} defaultParams
 */
// cannot merge defaultParams in element, because element needs to be "pure"
// in order to modify it with jointjs functions
export const createParametersInForeignObject = (
  element,
  { inputCommit, selectCommit, textCommit },
  defaultParams = {}
) => {
  const {
    description,
    type: label,
    originalParams,
    serviceId
  } = element.attributes;

  const selectsArr = [];
  const inputsArr = [];
  const textsArr = [];

  // create reset button
  const resetButton = $("<button/>", {
    class: `${RESET_BUTTON_CLASS} btn ${RESET_COL}`,
    text: "Reset",
    click: resetValue
  });

  for (const param of originalParams) {
    const { name: paramName, type } = param;

    // default tooltip button
    const defaultTooltip = $(`${TOOLTIP_HTML}`)
      .addClass(`${INFO_TOOLTIP_CLASS}`)
      .attr({
        "data-id": paramName,
        "data-param": label
      });

    // define default value
    const defaultValue = defaultParams[type][paramName]
      ? defaultParams[type][paramName].value || defaultParams[type][paramName]
      : null;

    switch (type) {
      case Types.SELECT.type: {
        const newSelect = createSelect(
          element,
          param,
          resetButton,
          defaultTooltip,
          selectCommit,
          defaultValue
        );
        selectsArr.push(newSelect);
        break;
      }
      case Types.NUMBER.type: {
        const newInput = createInput(
          element,
          param,
          resetButton,
          defaultTooltip,
          inputCommit,
          defaultValue
        );
        inputsArr.push(newInput);
        break;
      }
      case Types.TEXT.type: {
        const newText = createText(
          element,
          param,
          resetButton,
          defaultTooltip,
          textCommit,
          defaultValue
        );
        textsArr.push(newText);
        break;
      }
      default:
        throw "Type " + type + " not handled";
    }
  }

  // append selects and inputs
  const selects = $("<div/>", { class: PARAMETER_SELECTS });
  const inputs = $("<div/>", { class: PARAMETER_INPUTS });
  const texts = $("<div/>", { class: PARAMETER_TEXTS });
  selects.append(selectsArr);
  inputs.append(inputsArr);
  texts.append(textsArr);
  const parameters = [selects, inputs, texts];

  // add params to boxes
  const foreignObject = $(
    `g[model-id=${element.attributes.id}] foreignObject body`
  );
  const container = foreignObject
    .find(`.${BOX_CONTAINER_CLASS}`)
    .append(parameters);

  // create text if no parameter
  if (
    inputs.children().length +
      selects.children().length +
      texts.children().length ===
    0
  ) {
    $(`<div/>`, {
      class: NO_PARAMETER_CLASS,
      text: NO_PARAMETER_TEXT
    }).appendTo(container);
  }

  // main tooltip
  if (description) {
    $(TOOLTIP_HTML)
      .addClass(`tooltip-box`)
      .attr({
        "data-title": description
      })
      .on("click", function() {
        const win = window.open(API.getServiceViewUrl(serviceId), "_blank");
        win.focus();
      })
      .appendTo(foreignObject.find(`.${TITLE_ROW_CLASS}`));
  }

  // apply tooltip bootstrap js
  // and layout option
  for (const tooltip of $(`.${TOOLTIP_CLASS}`)) {
    const t = $(tooltip);
    t.tooltip(TOOLTIP_OPTIONS);
  }
};
