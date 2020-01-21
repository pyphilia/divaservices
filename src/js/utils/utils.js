import { getElementByBoxId, getLinkBySourceTarget } from "../layout/utils";

/**
 * utility function to check whether a and b are equal in content
 * @param {object} a
 * @param {object} b
 */
export const equalObjects = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

/**
 * transform the given shortcut to comprehensible shortcut string
 *
 * @param {string} shortcut shortcut to transform
 */
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

/**
 * clear text selection
 * might be useful when the user select the interface by mistake
 */
export const clearSelection = () => {
  // older browsers
  if (document.selection) {
    document.selection.empty();
  }

  // other browsers
  window.getSelection().removeAllRanges();
};

/**
 * compare two arrays of objects by a given parameter
 *
 * @param {array} a array of objects
 * @param {array} b array of objects
 * @param {string} param parameter name to compare a's and b's objects
 */
export const findDifferenceBy = (a, b, param) => {
  return a.filter(el => {
    const v = b.find(e => e.boxId == el.boxId);
    return v && !equalObjects(v[param], el[param]);
  });
};

/**
 * return elements which don't exist in graph, but do in arr
 *
 * @param {array} arr elements
 */
export const getNewElements = (graph, arr) => {
  return arr.filter(({ boxId }) => !getElementByBoxId(graph, boxId));
};

/**
 * compare arr and newArr and return deleted elements (which do not exist in newArr)
 * @param {array} arr
 * @param {array} newArr
 */
export const getDeletedElements = (arr, newArr) => {
  return arr.filter(el => !newArr.find(v => v.boxId == el.boxId));
};

/**
 * return links which exist in links, but not in the graph
 *
 * @param {array} links array of links
 */
export const getNewLinks = links => {
  return links.filter(
    ({ source, target }) => !getLinkBySourceTarget(source, target)
  );
};

/**
 * return elements which exist in the graph
 *
 * @param {array} arr array of elements
 */
export const getElementsInGraph = (graph, arr) => {
  return arr.filter(el => getElementByBoxId(graph, el.boxId));
};

/**
 * build regex to take into account capital letters
 *
 * @param {string} query
 */
export const buildSearchRegex = query => {
  let regex = "";
  for (const letter of query) {
    regex += `[${letter}${letter.toUpperCase()}]`;
  }
  return new RegExp(regex);
};
