import "select2js";
import { Constants } from "divaservices-utils";
const { Types } = Constants;
import { TOOLTIP_BREAK_LINE } from "../constants/constants";
import {
  IN_PORT_CLASS,
  OUT_PORT_CLASS,
  ATTR_TYPE_ALLOWED,
  ATTR_TYPE
} from "../constants/selectors";

const minWidth = 400;
const titleFontSize = 18;
const paramHeight = 43;
const defaultHeight = 100;
const titleHeightOneLine = 60;
const titleHeightTwoLine = 80;
const titleHeightThreeLine = 110;

export const shortenString = (string, maxLength = 15) => {
  if (string.length > maxLength) {
    const short = string.substr(0, maxLength);
    return short + "...";
  }
  return string;
};

// export const getElementByBoxId = (graph, id) => {
//   return graph.getElements().find(el => el.attributes.boxId == id);
// };

export const generateUniqueId = () => {
  return Math.random()
    .toString(36)
    .substr(2, 9);
};

/**
 * return whether the input is of type parameter
 * useful to differentiate from inputs and ports parameters
 *
 * @param {*} input
 */
export const isParamInput = input => {
  const validParameterTypes = [
    Types.SELECT.type,
    Types.NUMBER.type,
    Types.TEXT.type
  ];
  if (input.type) {
    return validParameterTypes.includes(input.type);
  }

  return validParameterTypes.map(type => input[type]).includes(true);
};

// export const isPort = el => {
//   if (el.type) {
//     return el.type === Types.FILE.type || el.type === Types.FOLDER.type;
//   }
//   return el[Types.FILE.type] || el[Types.FOLDER.type];
// };

/**
 * return whether the element is of port
 * useful to differentiate from inputs and ports parameters
 *
 * @param {*} input
 */
export const isPortUserdefined = input => {
  const validPortTypes = [Types.FILE.type, Types.FOLDER.type];
  if (input.type) {
    return validPortTypes.includes(input.type);
    // && input.userdefined
  }
  return validPortTypes.map(type => input[type]).includes(true); //&& el[Object.keys(el)[0]].userdefined
};

/**
 * transform object to a readable string
 * use to format values constraints (min, max, default, ...)
 *
 * @param {object} obj
 */
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
  const titleWidth = minWidth - 100; // 80 is the icon's + tooltip's width
  const titleWidth2 = titleWidth * 1.5;
  let titleHeight = titleHeightOneLine;
  let value = titleLength * titleFontSize;
  if (value > titleWidth && value < titleWidth2) {
    value = titleWidth;
    titleHeight = titleHeightTwoLine;
  } else if (value > titleWidth && value > titleWidth2) {
    value = titleWidth2;
    titleHeight = titleHeightThreeLine;
  }
  return {
    value,
    titleHeight
  };
};

export const computeBoxWidth = (el, fromSVG = false) => {
  const nameLength = computeTitleLength(el, fromSVG).value;

  return Math.max(Math.max(nameLength) + 100, minWidth); // 200 = button and stuff width
};

export const computeBoxHeight = (el, fromSVG = false) => {
  const { attributes, params, ports } = el;

  let nbParam;
  let portsItems;
  if (fromSVG) {
    nbParam =
      Object.keys(attributes.defaultParams[Types.SELECT.type]).length +
      Object.keys(attributes.defaultParams[Types.NUMBER.type]).length;
    portsItems = attributes.ports.items;
  } else {
    nbParam = params.filter(x => isParamInput(x)).length;
    portsItems = ports.items;
  }
  const inputsHeight = nbParam * paramHeight;

  const inPorts = portsItems.length
    ? portsItems.filter(x => x.group === IN_PORT_CLASS)
    : [];
  const outPorts = portsItems.length
    ? portsItems.filter(x => x.group === OUT_PORT_CLASS)
    : [];

  const maxPortEntry = Math.max(inPorts.length, outPorts.length);
  // @TODO count input + output port
  return Math.max(
    defaultHeight,
    maxPortEntry * 60,
    inputsHeight + computeTitleLength(el, fromSVG).titleHeight
  );
};

/**
 * matching algorithm to validate port connection
 */
/* eslint-disable-next-line no-unused-vars */
export const validateConnection = (vS, mS, vT, mT, end, lV) => {
  if (!mT) {
    return false;
  }
  if (vS === vT) {
    return false;
  }
  if (mT.getAttribute("port-group") !== IN_PORT_CLASS) {
    return false;
  }

  // input accept only one source
  const usedInPorts = vT.model.attributes.getUsedInPorts();
  const matchId = usedInPorts.find(({ id }) => id === mT.getAttribute("port"));
  if (matchId) {
    return false;
  }

  // allow only same input-output type
  if (
    mT.getAttribute(ATTR_TYPE) === undefined ||
    mS.getAttribute(ATTR_TYPE) === undefined
  ) {
    return false;
  }

  // check allowed type
  const allowedS = mS.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const allowedT = mT.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const commonType = allowedS.filter(value => -1 !== allowedT.indexOf(value));
  if (commonType.length === 0) {
    return false;
  }

  return true;
};
