/**
 * Add an element
 * note: jointjs uses its own id to track the element
 * for undo/redo purpose, we need to keep track of added-deleted item with a boxId
 * (in jointjs a deleted-recreated element is not the same)
 */
import * as joint from "jointjs";
import { app } from "../app";
import { getWebserviceByName } from "../constants/globals";
import { Constants } from "divaservices-utils";
const { Types } = Constants;
import {
  THEME,
  BOX_TITLE_HTML_TAG,
  ICON_COL,
  TITLE_COL,
  CATEGORY_SERVICE,
  PORT_MARKUP,
  PORT_LABEL_MARKUP,
  DEFAULT_BOX_SIZE
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
import { createParametersInForeignObject } from "../layout/inputs";
import { createPort } from "../layout/utils";
import {
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  FOREIGN_CLASS,
  IN_PORT_CLASS,
  OUT_PORT_CLASS
} from "../constants/selectors";
import { layoutSettingsApp } from "../layoutSettings";

/**
 * create graphical and element object with given parameters
 */
const createBox = (
  e,
  { position, size, boxId, defaultParams = {}, ports: { items }, serviceId }
) => {
  const { graph } = app;
  const { category, label, description, params = {} } = e;

  if (!size) {
    size = DEFAULT_BOX_SIZE;
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

/**
 * build default parameters for an element
 *
 * @param {object} params
 */
export const buildDefaultParameters = params => {
  const defaultParams = { select: {}, number: {} };
  for (const p of params) {
    let { type, name, defaultValue, values } = p;
    if (type === Types.SELECT.type) {
      defaultValue = values[defaultValue];
    }
    defaultParams[type][name] = { value: defaultValue, defaultValue, values };
  }
  return defaultParams;
};

/**
 * construct corresponding object for webservice
 * compute all necessary data to create a graphical box
 *
 * @param {object} webservice
 */
export const constructServiceObject = webservice => {
  if (!webservice.name) {
    throw "webservice " + webservice + " has name '" + name + "'";
  }
  const { name: label, description, inputs = [], category, ports } = webservice;

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

/**
 * create a custom element from an object element
 *
 * @param {object} e element as object
 * @param {object} parameters default parameters
 */
export const addElementFromServiceObject = (e, parameters = {}) => {
  const { label } = e;

  if (!label) {
    return;
  }

  const { boxId = generateUniqueId() } = parameters;

  const element = createBox(e, { ...parameters, boxId });

  createParametersInForeignObject(element, parameters.defaultParams);

  return element;
};

/**
 * create ports description from inputs and outputs
 *
 * @param {array} inputs
 * @param {array} outputs
 */
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

/**
 * create element object from service name
 *
 * @param {string} name
 */
export const createElementObjectFromName = name => {
  // find webservice given name
  const webservice = getWebserviceByName(name);
  const { outputs = [], inputs = [], id } = webservice;

  const el = constructServiceObject(webservice);

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
export const addElementFromService = (webservice, defaultParameters = {}) => {
  const serviceObj = constructServiceObject(webservice);

  let { position, size } = defaultParameters;
  // avoid adding overlapping elements
  defaultParameters.position = findEmptyPosition(size, position);

  const element = addElementFromServiceObject(serviceObj, {
    size,
    ...defaultParameters
  });

  return element;
};

/**
 * add element given a name
 */
export const addElementFromName = (name, defaultParams = {}) => {
  const algo = getWebserviceByName(name);
  if (algo) {
    addElementFromService(algo, defaultParams);
  } else {
    console.error(`${name} doesnt exist`);
  }
};

/*ADD LINKS*/

/**
 * add link from link jointjs description object
 *
 * @param {link} link
 */
export const addLinkFromJSON = link => {
  const { graph } = app;
  const linkEl = new joint.shapes.standard.Link(link);
  graph.addCell(linkEl);
};

/**
 * add link from link description
 *
 * @param {link} link
 */
export const addLinkFromLink = link => {
  const { source, target, id } = link;

  const s = getElementByBoxId(source.boxId);
  const t = getElementByBoxId(target.boxId);

  const sPort = s.getPorts().find(p => p.name === source.portName).id;
  const tPort = t.getPorts().find(p => p.name === target.portName).id;

  const newLink = {
    id,
    source: { id: s.id, port: sPort },
    target: { id: t.id, port: tPort }
  };

  return addLinkFromJSON(newLink);
};
