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
  MimeTypes
} from "../constants/constants";
import {
  PARAM_NAME_CLASS,
  PORT_SELECTOR,
  INFO_TOOLTIP_CLASS,
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  RESET_BUTTON_CLASS,
  TOOLTIP_CLASS,
  NO_PARAMETER_CLASS,
  PARAMETER_SELECTS,
  PARAMETER_INPUTS
} from "../constants/selectors";
import { objectToString } from "./utils";
import { moveAllElements } from "../elements/moveElement";
import { getLayoutOptions } from "../constants/globals";
import { selectedElements, addCellViewToSelection } from "../events/selections";
import { paper } from "./interface";

export const setSelectValueInElement = (element, select) => {
  const s = select.find(":selected");
  const selectEl = select.parent().parent();
  const value = s.attr("value");
  const defaultValue = select.data("default");
  const attr = selectEl.attr("name");

  element.attributes.defaultParams[attr] = { value, defaultValue };
};

export const setInputValueInElement = (element, input) => {
  const value = input.val();
  const attr = input.attr("name");
  const defaultValue = input.data("default");
  element.attributes.defaultParams[attr] = { value, defaultValue };
};

export function resetValue(event) {
  const el = event.target;
  const defaultValue = el.dataset.value;
  switch (el.dataset.parent) {
    case Inputs.SELECT.tag: {
      const select = el.parentNode.querySelector(Inputs.SELECT.tag);
      // use jquery because of select2
      $(select)
        .val(defaultValue)
        .trigger("change");
      break;
    }
    case Inputs.NUMBER.tag:
      $(el.parentNode.querySelector(Inputs.NUMBER.tag))
        .val(defaultValue)
        .trigger("input");
      break;
    default:
      alert("error");
  }
}

export const createSelect = (
  element,
  param,
  resetButton,
  defaultTooltip,
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
  const wrapperSelect = $("<div/>", { class: PARAM_COL });
  const dataDefault = values[defaultOption]
    ? values[defaultOption].toString()
    : "";
  const selectEl = $(`<${Inputs.SELECT.tag}/>`, {
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
    text: name
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

  // add select2 on elements
  // avoid select click bug
  setSelectValueInElement(element, selectEl);

  // update param
  selectEl.on("change", function() {
    setSelectValueInElement(element, selectEl);
  });

  // fix dropdown position
  // selectEl.on("select2:open", function() {
  //   const s = $(this);
  //   const width = s.next().width();
  //   const height = s.next().height();

  //   const dist = computeDisplayOffset(s, { height, width });

  //   let newTop = -dist.y;
  //   const newLeft = -dist.x;

  //   let container = document.querySelector(".select2-dropdown--below");

  //   // if the select is displayed at top
  //   const above = document.querySelector(
  //     ".select2-container--open .select2-dropdown--above"
  //   );
  //   if (above) {
  //     container = above;
  //     newTop += height;
  //   }

  //   container.style.top = newTop + "px";
  //   container.style.left = newLeft + "px";
  // });

  return newSelect;
};

export const createInput = (
  element,
  param,
  resetButton,
  defaultTooltip,
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
    text: name
  });

  // param input
  let required = false;
  if (attributes && attributes.Status == "required") {
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
  const inputEl = $(`<${Inputs.NUMBER.tag} />`, {
    class: `${PARAM_COL} form-control`,
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
      const el = $(this);
      setInputValueInElement(element, el);
      el.trigger("input");
    },
    click: function() {
      $(this).select();
    },
    input: function() {
      const el = $(this);
      setInputValueInElement(element, el);
      checkInputValue($(this));
    }
  });

  setInputValueInElement(element, inputEl);

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

export const checkInputValue = input => {
  const currentVal = input.val();
  const { min, max, step } = input.data();

  const minCondition = min ? currentVal >= min : true;
  const maxCondition = max ? currentVal <= max : true;

  // because of js inconsistency with float computations
  // we transform it to a string, round it to the the least precision
  // and check if it is a integer, so whether it matches the step
  let stepCondition = true;
  if (step) {
    const sepNumber = step.toString().split(".");
    let precision = 0;
    if (sepNumber.length == 1) {
      precision = 0;
    } else {
      precision = sepNumber[1].length + 1;
    }
    stepCondition = Number.isInteger(
      +parseFloat(currentVal / step).toFixed(precision)
    );
  }
  const isValid = minCondition && maxCondition && stepCondition;

  input.toggleClass("is-invalid", !isValid);
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

export const setParametersInForeignObject = element => {
  const {
    description,
    type: label,
    originalParams,
    defaultParams
  } = element.attributes;
  const { showParameters } = getLayoutOptions();

  const selectsArr = [];
  const inputsArr = [];

  const resetButton = $("<button/>", {
    class: `${RESET_BUTTON_CLASS} btn ${RESET_COL}`,
    text: "Reset",
    click: resetValue
  });

  for (const param of originalParams) {
    const { name: paramName, type } = param;

    const defaultTooltip = $(`${TOOLTIP_HTML}`)
      .addClass(`${TOOLTIP_CLASS} ${INFO_TOOLTIP_CLASS}`)
      .attr({
        "data-id": paramName,
        "data-param": label,
        "data-toggle": "tooltip",
        "data-placement": "right"
      });

    const defaultValue = defaultParams[paramName]
      ? defaultParams[paramName].value || defaultParams[paramName]
      : null;
    // const defaultValue = defaultParams.params
    //   ? defaultParams.params[paramName].value
    //   : null;

    switch (type) {
      case Inputs.SELECT.type: {
        const newSelect = createSelect(
          element,
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
          element,
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
  const foreignObject = $(
    `g[model-id=${element.attributes.id}] foreignObject body`
  );
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

  // ELEMENT EVENTS

  // When the user clicks on a select and moves the bloc
  // the select dropdown is still displayed
  // this event closes it
  element.on("change:position", (el, position, { multitranslate }) => {
    for (const select of document.querySelectorAll(Inputs.SELECT.tag)) {
      $(select).select2("close");
    }
    if (!multitranslate) {
      // fix ctrl + click on element + drag, select again the current element
      // induces a small delay in position from the other selected elements
      if (selectedElements.indexOf(paper.findViewByModel(el)) == -1) {
        addCellViewToSelection(paper.findViewByModel(el));
      }
      moveAllElements(selectedElements, el, position);
    }
  });

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
  const { showPorts, showPortDetails } = getLayoutOptions();

  let port = {};
  const { name, mimeTypes } = param;
  if (group) {
    //group == OUT_PORT_CLASS || userdefined) {
    // always create out port, check userdefined for inputs

    let typeAllowed;
    let type;

    // folder case
    if (param.type == Inputs.FOLDER.type) {
      typeAllowed = [Inputs.FOLDER.type]; // use options allowed types, otherwise it is a folder
      type = Inputs.FOLDER.type;
    } else {
      // @TODO display !userdefined ports ?
      typeAllowed = mimeTypes.allowed;
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
