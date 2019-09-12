// we import jquery as below for test to work
import jQuery from "jquery";
const $ = jQuery;
global.$ = global.jQuery = $;

import "select2";
import * as joint from "jointjs";
import { paper, graph } from "./interface";
import {
  THEME,
  BOX_TITLE_HTML_TAG,
  ICON_COL,
  TITLE_COL,
  DEFAULT_OPTIONS
} from "./constants";
import {
  isParamInput,
  isPort,
  isPortUserdefined,
  computeBoxWidth,
  computeBoxHeight,
  computeTitleLength,
  createPort,
  setParametersInForeignObject
} from "./utils";
import {
  PORT_SELECTOR,
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  FOREIGN_CLASS,
  IN_PORT_CLASS,
  OUT_PORT_CLASS
} from "./selectors";

let { showParameters } = DEFAULT_OPTIONS;

const createBox = (e, id, { position, size }) => {
  const {
    category,
    label,
    ports: { items }
  } = e;
  const { titleHeight } = computeTitleLength(e);

  const template = `<g class="scalable"><rect></rect></g>
      <foreignObject class="${FOREIGN_CLASS}" id="${id}" x="0" y="-${titleHeight}" width="${
    size.width
  }" height="${size.height + titleHeight}">
      <body xmlns="http://www.w3.org/1999/xhtml">
      <div class="${BOX_CONTAINER_CLASS} no-gutters p-0">
      <div class="${TITLE_ROW_CLASS} ${category} row justify-content-start" style="height:${titleHeight}px">
      <div class="${ICON_COL} icon"></div>
      <${BOX_TITLE_HTML_TAG} class="${TITLE_COL} align-middle">${label}</${BOX_TITLE_HTML_TAG}>
      </div>
      </div>
      </body>
      </foreignObject>`;

  const Box = joint.shapes.basic.Rect.define(
    label,
    {
      markup: template,
      attrs: {
        root: {
          magnet: false
        },
        body: THEME.body,
        rect: { ...THEME.rect, ...size }
      },
      position,
      size,
      ports: {
        groups: THEME.groups,
        items
      },
      params: {}
    },
    {
      portMarkup: [{ tagName: "circle", selector: PORT_SELECTOR }],

      getGroupPorts: function(group) {
        return this.getPorts().filter(port => {
          return port.group === group;
        });
      },

      getInPorts: function() {
        return this.getGroupPorts(IN_PORT_CLASS);
      },

      getUsedInPorts: function() {
        const graph = this.graph;
        if (!graph) return [];
        const connectedLinks = graph.getConnectedLinks(this, { inbound: true });
        return connectedLinks.map(link => {
          return this.getPort(link.target().port);
        });
      }
    }
  );

  const element = new Box();
  element.addTo(graph);
  return element;
};

export const transformWebserviceForGraph = (webservice, category) => {
  if (!webservice.general) {
    alert("problem with ", webservice);
    return {};
  }
  const { general, output, input } = webservice;
  const { name: label, description } = general;

  // handle ports
  const ports = { items: [] };
  input
    .filter(inp => isPortUserdefined(inp))
    .forEach(inp => {
      const port = createPort(inp, IN_PORT_CLASS);
      if (port.group) {
        ports.items.push(port);
      }
    });

  output
    .filter(out => isPort(out))
    .forEach(out => {
      const port = createPort(out, OUT_PORT_CLASS);
      if (port.group) {
        ports.items.push(port);
      }
    });

  // handle params
  const params = [];
  for (const inp of input.filter(inp => isParamInput(inp))) {
    const type = Object.keys(inp)[0];
    const param = {
      type,
      ...inp[type]
    };
    params.push(param);
  }

  const ret = {
    description,
    label,
    params,
    ports,
    information: general,
    category
  };
  return ret;
};

// Create a custom element.
// ------------------------
export const addElement = (e, parameters, defaultParams = {}) => {
  const { label } = e;

  if (!label) {
    return;
  }

  const id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  const element = createBox(e, id, parameters);

  setParametersInForeignObject(element, { id, ...e }, defaultParams);

  return element;
};

// helper function to find an empty position to add
// an element without overlapping other ones
// it tries to fill the canvas view first horizontally
// then vertically
const findEmptyPosition = size => {
  const bcr = paper.svg.getBoundingClientRect();
  const canvasDimensions = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });

  const position = { x: canvasDimensions.x + 100, y: canvasDimensions.y + 100 };

  while (
    graph.findModelsInArea({
      ...position,
      width: size.width + 100,
      height: size.height + 100
    }).length
  ) {
    position.x += size.width + 100;
    if (canvasDimensions.x + canvasDimensions.width < position.x + size.width) {
      position.x = canvasDimensions.x + 100;
      position.y += size.height + 100;
    }
  }

  return position;
};

export const addElementToGraph = (webservice, category, defaultParams = {}) => {
  const transformedWebservice = transformWebserviceForGraph(
    webservice,
    category
  );

  const size = {
    width: computeBoxWidth(transformedWebservice, showParameters),
    height: computeBoxHeight(transformedWebservice, showParameters)
  };

  let { position } = defaultParams;
  if (!position) {
    // avoid adding overlapping elements
    position = findEmptyPosition(size);
  }

  const element = addElement(
    transformedWebservice,
    { position, size },
    defaultParams
  );
  return element;
};

export const addLinkToGraph = link => {
  const linkEl = new joint.shapes.standard.Link(link);

  linkEl.addTo(graph);
};
