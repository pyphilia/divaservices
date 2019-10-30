import { getElementByBoxId, getLinkBySourceTarget } from "../layout/utils";
import { Inputs } from "../constants/constants";

export const equalObjects = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const shortcutToString = shortcut => {
  if (!shortcut) {
    return "";
  }

  const { ctrl, key, shift } = shortcut;
  let string = key;
  if (shift) {
    string = "Shift+" + string;
  }
  if (ctrl) {
    string = "Ctrl+" + string;
  }
  return "(" + string + ")";
};

export const clearSelection = () => {
  // older browsers
  if (document.selection) {
    document.selection.empty();
  }

  // other browsers
  window.getSelection().removeAllRanges();
};

export const findDifferenceBy = (a, b, param) => {
  return a.filter(el => {
    const v = b.find(e => e.boxId == el.boxId);
    return v && !equalObjects(v[param], el[param]);
  });
};

export const getNewElements = arr => {
  return arr.filter(({ boxId }) => !getElementByBoxId(boxId));
};

export const getDeletedElements = (arr, newValue) => {
  return arr.filter(el => !newValue.find(v => v.boxId == el.boxId));
};

export const getNewLinks = links => {
  return links.filter(
    ({ source, target }) => !getLinkBySourceTarget(source, target)
  );
};

export const getElementsInGraph = arr => {
  return arr.filter(el => getElementByBoxId(el.boxId));
};

const checkStep = (step, currentVal) => {
  let checkStep = true;
  if (step) {
    const valueFloat = parseFloat(currentVal / step);

    // case step = 1
    if (step == 1) {
      return valueFloat == parseInt(currentVal);
    }

    const stepNumber = step.toString().split(".");
    let precision = 0;
    if (stepNumber.length == 1) {
      precision = 0;
    } else {
      precision = stepNumber[1].length + 1;
    }
    checkStep = Number.isInteger(+valueFloat.toFixed(precision));
  }
  return checkStep;
};

export const checkValue = (value, type, values) => {
  let isValid = true;
  switch (type) {
    case Inputs.NUMBER.type: {
      let { min, max, step } = values;
      min = parseFloat(min);
      max = parseFloat(max);
      const minCondition = min ? value >= min : true;
      const maxCondition = max ? value <= max : true;

      // because of js inconsistency with float computations
      // we transform it to a string, round it to the the least precision
      // and check if it is a integer, so whether it matches the step
      const stepCondition = checkStep(step, value);
      isValid = minCondition && maxCondition && stepCondition;
    }
  }
  return isValid;
};
