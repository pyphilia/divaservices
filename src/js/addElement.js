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

const createBox = (e, id, position) => {
  const {
    category,
    label,
    ports: { items }
  } = e;
  const size = {
    width: computeBoxWidth(e, showParameters),
    height: computeBoxHeight(e, showParameters)
  };
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
export const addElement = (e, position, defaultParams = {}) => {
  const { label } = e;

  if (!label) {
    return;
  }

  const id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  const element = createBox(e, id, position);

  setParametersInForeignObject(element, { id, ...e }, defaultParams);

  return element;
};

export const addElementToGraph = (webservice, category, defaultParams = {}) => {
  console.log("TCL: addElementToGraph -> defaultParams", defaultParams);
  const transformedWebservice = transformWebserviceForGraph(
    webservice,
    category
  );

  const bcr = paper.svg.getBoundingClientRect();
  const paperLocalRect = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });

  let { position } = defaultParams;
  if (!position) {
    position = { x: paperLocalRect.x + 100, y: paperLocalRect.y + 100 };
  }

  const element = addElement(transformedWebservice, position, defaultParams);
  return element;
};

export const addLinkToGraph = link => {
  const linkEl = new joint.shapes.standard.Link(link);

  linkEl.addTo(graph);
};
