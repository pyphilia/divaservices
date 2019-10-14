/**
 * Add an element
 * note: jointjs is its own id to track the element
 * for undo/redo purpose, we need to keep track of added-deleted item with a boxId
 * (in jointjs a deleted-recreated element is not the same)
 */
import * as joint from "jointjs";
import { app } from "../app";
import { webservices } from "../constants/globals";
import {
  THEME,
  BOX_TITLE_HTML_TAG,
  ICON_COL,
  TITLE_COL,
  BOX_MARGIN
} from "../constants/constants";
import {
  isParamInput,
  isPortUserdefined,
  computeBoxWidth,
  computeBoxHeight,
  computeTitleLength,
  generateUniqueId,
  getElementByBoxId
} from "../layout/utils";
import { setParametersInForeignObject, createPort } from "../layout/inputs";
import {
  PORT_SELECTOR,
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  FOREIGN_CLASS,
  IN_PORT_CLASS,
  OUT_PORT_CLASS
} from "../constants/selectors";
import { layoutSettingsApp } from "../layoutSettings";

const createBox = (
  e,
  { position, size, boxId, defaultParams = {}, ports: { items } }
) => {
  const { graph } = app;
  const { category, label, description, params = {} } = e;
  const { titleHeight } = computeTitleLength(e);

  if (!size) {
    size = { width: 100, height: 100 };
  }

  const template = `<g class="scalable"><rect></rect></g>
  <foreignObject class="${FOREIGN_CLASS}" x="0" boxId="${boxId}"
  y="-${titleHeight}" width="${size.width}" height="${size.height +
    titleHeight}">
    <body xmlns="http://www.w3.org/1999/xhtml">
    <div class="${BOX_CONTAINER_CLASS} no-gutters p-0">
    <div class="${TITLE_ROW_CLASS} ${category} row justify-content-start" style="height:${titleHeight}px">
    <div class="${ICON_COL} icon"></div>
    <${BOX_TITLE_HTML_TAG} class="${TITLE_COL} align-middle">${label}</${BOX_TITLE_HTML_TAG}>
    </div>
    </div>
    </body>
    </foreignObject>`;

  const Box = joint.shapes.basic.Rect.define(label, {
    markup: template,
    attrs: {
      root: {
        magnet: false
      },
      body: THEME.body,
      rect: { ...THEME.rect, ...size }
    },
    boxId,
    position,
    size,
    ports: {
      groups: THEME.groups,
      items
    },
    description,
    originalParams: params,
    defaultParams,
    portMarkup: [{ tagName: "circle", selector: PORT_SELECTOR }],

    getGroupPorts: function(model, group) {
      return model.getPorts().filter(port => {
        return port.group === group;
      });
    },

    getInPorts: function(model) {
      return this.getGroupPorts(model, IN_PORT_CLASS);
    },

    getUsedInPorts: function() {
      const graph = this.graph;
      if (!graph) return [];
      const connectedLinks = graph.getConnectedLinks(this, { inbound: true });
      return connectedLinks.map(link => {
        return this.getPort(link.target().port);
      });
    }
  });

  const element = new Box();
  element.addTo(graph);
  return element;
};

export const transformWebserviceForGraph = webservice => {
  if (!webservice.name) {
    alert("problem with ", webservice);
    return {};
  }
  const {
    name: label,
    description,
    inputs = [],
    type: category,
    ports
  } = webservice;

  // handle params
  const params = inputs.filter(inp => isParamInput(inp));

  // build default parameters from
  const defaultParams = { select: {}, number: {} };
  for (const p of params) {
    let { type, name, defaultValue, values } = p;
    if (type == "select") {
      defaultValue = values[defaultValue];
    }
    defaultParams[type][name] = { value: defaultValue, defaultValue };
  }

  const ret = {
    name,
    description,
    defaultParams,
    label,
    params,
    ports,
    category
  };
  return ret;
};

// Create a custom element.
// ------------------------
export const addElementFromTransformedJSON = (e, parameters = {}) => {
  const { label } = e;

  if (!label) {
    return;
  }

  const { boxId = generateUniqueId() } = parameters;

  const element = createBox(e, { ...parameters, boxId });

  setParametersInForeignObject(element, parameters.defaultParams);

  return element;
};

export const buildElementFromName = name => {
  const webservice = webservices.find(service => service.name == name);
  const { outputs = [], inputs = [] } = webservice;

  const el = transformWebserviceForGraph(webservice);

  // handle ports
  const ports = { items: [] };
  inputs
    .filter(inp => isPortUserdefined(inp))
    .forEach(inp => {
      const port = createPort(inp, IN_PORT_CLASS);
      if (port.group) {
        ports.items.push(port);
      }
    });
  outputs.forEach(out => {
    const port = createPort(out, OUT_PORT_CLASS);
    if (port.group) {
      ports.items.push(port);
    }
  });
  el.ports = ports;

  const boxId = generateUniqueId();
  const { defaultParams } = el;

  const showParameter =
    layoutSettingsApp.checkedOptions.indexOf("showParameters") != -1;
  const size = {
    width: computeBoxWidth(el, showParameter),
    height: computeBoxHeight(el, showParameter)
  };
  const position = findEmptyPosition(size);

  return { boxId, defaultParams, size, position, type: name, ports };
};

// helper function to find an empty position to add
// an element without overlapping other ones
// it tries to fill the canvas view first horizontally
// then vertically
const findEmptyPosition = (size, startingPoint) => {
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

/**
 * From a JSON description, add the webservice to the graph
 */
export const addElementToGraphFromServiceDescription = (
  webservice,
  defaultParameters = {}
) => {
  const transformedWebservice = transformWebserviceForGraph(webservice);

  let { position, size } = defaultParameters;
  // avoid adding overlapping elements
  defaultParameters.position = findEmptyPosition(size, position);

  const element = addElementFromTransformedJSON(transformedWebservice, {
    size,
    ...defaultParameters
  });

  return element;
};

// add element given a name. It will then retrieve the webservice
// info from the services xml descriptions
// returns boxId and position for undo-redo purpose
export const addElementByName = (name, defaultParams = {}) => {
  const algo = webservices.find(service => service.name == name);
  if (algo) {
    addElementToGraphFromServiceDescription(algo, defaultParams);

    // return e.attributes; //{ boxId, position };
  } else {
    console.error(`${name} doesnt exist`);
  }
};

// const addElementByCellView = (cellView, boxId) => {
//   const { graph } = app;

//   const {
//     defaultParams,
//     size,
//     boxId: currentBoxId
//   } = cellView.model.attributes;

//   const e = getElementByBoxId(currentBoxId).clone();
//   let id;
//   if (boxId) {
//     e.attributes.boxId = boxId;
//     id = boxId;
//   } else {
//     id = e.attributes.boxId;
//   }
//   // avoid cloning overlap
//   e.attributes.position = findEmptyPosition(size);

//   e.addTo(graph);
//   setParametersInForeignObject(e, defaultParams);
//   return { e, id };
// };

// return for undo purpose
// export const addElementsByCellView = (elements, ids) => {
//   const addedElements = [];
//   const boxIds = [];
//   for (const [i, el] of elements.entries()) {
//     const boxId = ids ? ids[i] : undefined;
//     const { e, id } = addElementByCellView(el, boxId);
//     addedElements.push(e);
//     boxIds.push(id);
//   }
//   return { addedElements, boxIds };
// };

/*ADD LINKS*/

export const addLinkFromJSON = link => {
  const { graph } = app;
  const linkEl = new joint.shapes.standard.Link(link);
  graph.addCell(linkEl);
};

export const addLinkFromLink = link => {
  const { source, target } = link;

  const s = getElementByBoxId(source.boxId);
  const t = getElementByBoxId(target.boxId);

  const sPort = s.getPorts().find(p => p.name == source.portname).id;
  const tPort = t.getPorts().find(p => p.name == target.portname).id;

  const newLink = {
    source: { id: s.id, port: sPort },
    target: { id: t.id, port: tPort }
  };

  return addLinkFromJSON(newLink);
};
