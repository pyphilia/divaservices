/**
 * Add an element
 * note: jointjs is its own id to track the element
 * for undo/redo purpose, we need to keep track of added-deleted item with a boxId
 * (in jointjs a deleted-recreated element is not the same)
 */
import * as joint from "jointjs";
import { app } from "../app";
import { getWebserviceByName } from "../constants/globals";
import {
  THEME,
  BOX_TITLE_HTML_TAG,
  ICON_COL,
  TITLE_COL,
  Inputs,
  CATEGORY_SERVICE,
  PORT_MARKUP,
  PORT_LABEL_MARKUP
} from "../constants/constants";
import {
  isParamInput,
  isPortUserdefined,
  computeBoxWidth,
  computeBoxHeight,
  generateUniqueId,
  getElementByBoxId,
  findEmptyPosition
} from "../layout/utils";
import { setParametersInForeignObject } from "../layout/inputs";
import { createPort } from "../layout/utils";
import {
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  FOREIGN_CLASS,
  IN_PORT_CLASS,
  OUT_PORT_CLASS
} from "../constants/selectors";
import { layoutSettingsApp } from "../layoutSettings";

const createBox = (
  e,
  { position, size, boxId, defaultParams = {}, ports: { items }, serviceId }
) => {
  const { graph } = app;
  const { category, label, description, params = {} } = e;

  if (!size) {
    size = { width: 100, height: 100 };
  }

  // we do not add inputs and select in the markup because of the
  // missing input declaration '/' (valid for HTML but not XML/SVG)
  const template = `<g class="scalable"><rect></rect></g>
    <foreignObject class="${FOREIGN_CLASS}" x="0" y="0" boxId="${boxId}" 
    width="${size.width}" height="${size.height}" style="">
    <body xmlns="http://www.w3.org/1999/xhtml" class="${category}">
    <div class="${BOX_CONTAINER_CLASS} no-gutters p-0">
    <div class="${TITLE_ROW_CLASS} ${category} row justify-content-start"> 
    <div class="${ICON_COL} icon"></div>
    <${BOX_TITLE_HTML_TAG} class="${TITLE_COL} align-middle" title="${label}">${label}</${BOX_TITLE_HTML_TAG}>
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
    serviceId,
    category: CATEGORY_SERVICE,
    position,
    size,
    ports: {
      groups: THEME.groups,
      items
    },
    description,
    originalParams: params,
    defaultParams,
    portMarkup: PORT_MARKUP,
    portLabelMarkup: PORT_LABEL_MARKUP,

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

export const buildDefaultParameters = params => {
  const defaultParams = { select: {}, number: {} };
  for (const p of params) {
    let { type, name, defaultValue, values } = p;
    if (type == Inputs.SELECT.type) {
      defaultValue = values[defaultValue];
    }
    defaultParams[type][name] = { value: defaultValue, defaultValue, values };
  }
  return defaultParams;
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

  // build default parameters object
  const defaultParams = buildDefaultParameters(params);

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

const createPortsFromInputOutput = (inputs, outputs) => {
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
  return ports;
};

export const buildElementFromName = name => {
  // find webservice given name
  const webservice = getWebserviceByName(name);
  const { outputs = [], inputs = [], id } = webservice;

  const el = transformWebserviceForGraph(webservice);

  // handle ports
  const ports = createPortsFromInputOutput(inputs, outputs);
  el.ports = ports;

  const boxId = generateUniqueId();
  const { defaultParams } = el;

  const showParameter = layoutSettingsApp.isShowParametersChecked();
  const size = {
    width: computeBoxWidth(el, showParameter),
    height: computeBoxHeight(el, showParameter)
  };

  const position = position ? position : findEmptyPosition(size);

  return {
    serviceId: id,
    category: CATEGORY_SERVICE,
    boxId,
    defaultParams,
    size,
    position,
    type: name,
    ports
  };
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
  const algo = getWebserviceByName(name);
  if (algo) {
    addElementToGraphFromServiceDescription(algo, defaultParams);
  } else {
    console.error(`${name} doesnt exist`);
  }
};

/*ADD LINKS*/

export const addLinkFromJSON = link => {
  const { graph } = app;
  const linkEl = new joint.shapes.standard.Link(link);
  graph.addCell(linkEl);
};

export const addLinkFromLink = link => {
  const { source, target, id } = link;

  const s = getElementByBoxId(source.boxId);
  const t = getElementByBoxId(target.boxId);

  const sPort = s.getPorts().find(p => p.name == source.portName).id;
  const tPort = t.getPorts().find(p => p.name == target.portName).id;

  const newLink = {
    id,
    source: { id: s.id, port: sPort },
    target: { id: t.id, port: tPort }
  };

  return addLinkFromJSON(newLink);
};
