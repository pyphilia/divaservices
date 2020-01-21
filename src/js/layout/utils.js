import "select2js";
import { Constants } from "divaservices-utils";
const { Types } = Constants;
import {
  TOOLTIP_BREAK_LINE,
  MimeTypes,
  BOX_MARGIN
} from "../constants/constants";
import {
  IN_PORT_CLASS,
  OUT_PORT_CLASS,
  PORT_SELECTOR,
  ATTR_TYPE_ALLOWED,
  ATTR_TYPE
} from "../constants/selectors";
import { app } from "./../app";
import { layoutSettingsApp } from "../layoutSettings";

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

export const getElementByBoxId = (graph, id) => {
  return graph.getElements().find(el => el.attributes.boxId == id);
};

export const getLinkBySourceTarget = (source, target) => {
  const { graph } = app;
  return graph.getLinks().find(link => {
    const s = link.source();
    const t = link.target();

    const sourceCell = graph.getCell(s.id);
    const targetCell = graph.getCell(t.id);

    if (!sourceCell || !targetCell) {
      return false;
    }
    const sourceBoxId = sourceCell.attributes.boxId;
    const sPortId = s.port;
    const sPortName = sourceCell.getPort(sPortId).name;

    const targetBoxId = targetCell.attributes.boxId;
    const tPortId = t.port;
    const tPortName = targetCell.getPort(tPortId).name;

    return (
      sourceBoxId == source.boxId &&
      targetBoxId == target.boxId &&
      sPortName === source.portName &&
      tPortName === target.portName
    );
  });
};

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

export const computeBoxWidth = (el, showParameters, fromSVG = false) => {
  const nameLength = computeTitleLength(el, fromSVG).value;

  return Math.max(Math.max(nameLength) + 100, minWidth); // 200 = button and stuff width
};

export const computeBoxHeight = (el, showParameters, fromSVG = false) => {
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
  const inputsHeight = showParameters ? nbParam * paramHeight : 0;

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

export const buildPortAttrs = (name, type, typeAllowed) => {
  const showPortDetails = layoutSettingsApp.isShowPortsDetailsChecked();
  const showPorts = layoutSettingsApp.isShowPortsChecked();
  const typeAllowedShort = shortenString(typeAllowed.join(", "), 25);

  return {
    [PORT_SELECTOR]: {
      fill: MimeTypes[type].color,
      type,
      typeAllowed
    },
    circle: {
      display: showPorts ? "block" : "none"
    },
    mainText: {
      text: `${name}\n${typeAllowedShort}`,
      display: showPortDetails ? "block" : "none"
    }
  };
};

export const createPort = (param, group) => {
  let port = {};
  const { name, mimeTypes } = param;
  if (group) {
    //group == OUT_PORT_CLASS || userdefined) {
    // always create out port, check userdefined for inputs

    let typeAllowed;
    let type;

    // folder case
    if (param.type == Types.FOLDER.type) {
      typeAllowed = [Types.FOLDER.type]; // use options allowed types, otherwise it is a folder
      type = Types.FOLDER.type;
    } else {
      // @TODO display !userdefined ports ?
      typeAllowed = mimeTypes.allowed;
      const typeEnd =
        typeAllowed[0].indexOf("/") < 0
          ? typeAllowed[0].length
          : typeAllowed[0].indexOf("/");
      type = typeAllowed[0].substr(
        //@TODO diff types ?
        0,
        typeEnd
      );
    }

    port = {
      group,
      name,
      attrs: buildPortAttrs(name, type, typeAllowed)
    };
  }
  return port;
};

// helper function to find an empty position to add
// an element without overlapping other ones
// it tries to fill the canvas view first horizontally
// then vertically
export const findEmptyPosition = (size, startingPoint) => {
  const { paper, graph } = app;
  const { left, top, width, height } = paper.svg.getBoundingClientRect();
  const canvasDimensions = paper.clientToLocalRect({
    x: left,
    y: top,
    width,
    height
  });

  const { x: canvasX, y: canvasY, width: canvasW } = canvasDimensions;
  const position = startingPoint
    ? startingPoint
    : { x: canvasX + BOX_MARGIN, y: canvasY + BOX_MARGIN };
  const { width: sizeWidth, height: sizeHeight } = size;

  while (
    graph.findModelsInArea({
      ...position,
      width: sizeWidth + BOX_MARGIN,
      height: sizeHeight + BOX_MARGIN
    }).length
  ) {
    position.x += sizeWidth + BOX_MARGIN;
    if (canvasX + canvasW < position.x + sizeWidth) {
      position.x = canvasX + BOX_MARGIN;
      position.y += sizeHeight + BOX_MARGIN;
    }
  }

  return position;
};

export const centerBoxInPaperByBoxId = boxId => {
  const { paper, graph } = app;

  const el = getElementByBoxId(graph, boxId);
  const bbox = el.getBBox();
  const { left, top, width, height } = paper.svg.getBoundingClientRect();
  const canvasDimensions = paper.clientToLocalRect({
    x: left,
    y: top,
    width,
    height
  });
  app.translate(
    -bbox.x + canvasDimensions.width / 2 - bbox.width / 2,
    -bbox.y + canvasDimensions.height / 2 - bbox.height / 2
  );

  // highlight element
  app.$addUniqueElementToSelection(el.findView(paper));
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
