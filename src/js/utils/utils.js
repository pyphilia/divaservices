import { getElementByBoxId, getLinkBySourceTarget } from "../layout/utils";

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

// build regex to take into account capital letters
export const buildSearchRegex = query => {
  let regex = "";
  for (const letter of query) {
    regex += `[${letter}${letter.toUpperCase()}]`;
  }
  return new RegExp(regex);
};
