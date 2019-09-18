import "select2";
import { TOOLTIP_BREAK_LINE, Inputs } from "../constants/constants";
import { IN_PORT_CLASS, OUT_PORT_CLASS } from "../constants/selectors";

const maxWidth = 650;
const titleFontSize = 18;
const paramHeight = 55;
const defaultHeight = 40;
const titleHeightOneLine = 60;
const titleHeightTwoLine = 80;

export const getWebServiceFromUrl = async url => {
  const data = await fetch(url);
  const json = await data.json();
  return json;
};

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
      el.type == Inputs.FILE.type || el.type == Inputs.FOLDER.type
      // && el.userdefined
    );
  }
  return (
    el[Inputs.FILE.type] || el[Inputs.FOLDER.type] //&& el[Object.keys(el)[0]].userdefined
  );
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

export const computeDisplayOffset = (el, { height, width }) => {
  const mainPosition = document.querySelector("#main").getBoundingClientRect();

  const sPosition = el.offset();
  const dist = {
    x: (sPosition.left - mainPosition.x + width) * 0.1,
    y: (sPosition.top - mainPosition.y + height) * 0.09,
    elementOffset: sPosition
  };
  return dist;
};
