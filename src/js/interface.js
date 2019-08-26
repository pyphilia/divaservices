import * as $ from "jquery";
import * as joint from "jointjs";
import "select2";
import { TOOLTIP_HTML, THEME, colorType } from "./constants";
import {
  getWebServiceFromUrl,
  computeBoxWidth,
  computeBoxHeight
} from "./utils";
import { INTERFACE_ROOT, PORT_SELECTOR, INFO_TOOLTIP_CLASS } from "./selectors";

const graph = new joint.dia.Graph();
let currentScale = 1;

const transformWorkflowToGraph = workflow => {
  console.log("TCL: transformWorkflowToGraph");
};

const setSelectValueInElement = (element, select) => {
  const selectedValue = select.find(":selected").attr("value");
  element.attributes.params[select.parent().attr("name")] = selectedValue;
};

const setInputValueInElement = (element, input) => {
  const value = input.val();
  element.attributes.params[input.attr("name")] = value;
};

const createBox = (e, id) => {
  const template = `<rect></rect>
  <foreignObject id="${id}" x="0" y="-30" width="${e.size.width}" height="${e.size.height}">
  <body xmlns="http://www.w3.org/1999/xhtml">
  <h3>${e.label}</h3>
  </body>
  </foreignObject>`;

  return joint.shapes.basic.Rect.define(
    e.label,
    {
      markup: template,
      attrs: {
        root: {
          magnet: false
        },
        body: THEME.body,
        rect: { ...THEME.rect, width: e.size.width, height: e.size.height }
      },
      position: { x: e.position.x, y: e.position.y },
      size: { width: e.size.width, height: e.size.height },
      ports: {
        groups: THEME.groups,
        items: e.ports.items
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
        return this.getGroupPorts("in");
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
};

// Create a custom element.
// ------------------------
const addElement = e => {
  const id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  const Box = createBox(e, id);
  const element = new Box();
  element.addTo(graph);

  // add params
  const selects = $("<div></div>").addClass("selects");
  const inputs = $("<div></div>").addClass("inputs");
  e.params.forEach(param => {
    const name = param.name;
    switch (param.type) {
      case "select": {
        const newSelect = $("<div></div>")
          .addClass("select")
          .attr("name", name);
        const selectEl = $("<select></select>").prop(
          "disabled",
          !param.userdefined
        );
        param.values.forEach(option => {
          $("<option></option>")
            .text(option)
            .attr("value", option)
            .appendTo(selectEl);
        });
        newSelect.append(selectEl);
        const tooltip = $(TOOLTIP_HTML)
          .addClass(INFO_TOOLTIP_CLASS)
          .data("id", param.name)
          .data("description", param.description)
          .data("param", e.label);

        newSelect
          .append(param.name)
          .append(newSelect)
          .append(tooltip);
        selects.append(newSelect);
        break;
      }
      case "number": {
        const newInput = $("<div></div>").addClass("input");
        const inputEl = $("<input />")
          .prop("disabled", !param.userdefined)
          .attr("type", "text")
          .attr("name", param.name)
          .attr("value", param.defaultValue);

        const tooltip = $(TOOLTIP_HTML)
          .addClass(INFO_TOOLTIP_CLASS)
          .data("id", name)
          .data("description", param.description)
          .data("param", e.label);

        newInput
          .append(name)
          .append(inputEl)
          .append(tooltip);
        inputs.append(newInput);
        break;
      }
      default:
    }
  });

  // add params to boxes
  const foreignObject = $(`foreignObject#${id} body`);
  const tooltipBox = $(TOOLTIP_HTML).addClass("tooltip-box");
  foreignObject.append(tooltipBox);
  foreignObject.append(inputs).append(selects);

  foreignObject.find(`.${INFO_TOOLTIP_CLASS}`).each(function() {
    $(this).mouseenter(function() {
      const desc = $(this).data("description");
      $("#message").text(desc);
    });
  });

  // select events
  const allSelects = selects.find("select");

  // add select2 on elements
  // avoid select click bug
  allSelects.each(function() {
    $(this).select2({
      minimumResultsForSearch: -1
    });

    // set default value
    setSelectValueInElement(element, $(this));

    // update param
    $(this).on("change", function() {
      setSelectValueInElement(element, $(this));
    });
  });

  // When the user clicks on a select and moves the bloc
  // the select dropdown is still displayed
  // this event closes it
  element.on("change:position", () => {
    allSelects.each(function() {
      $(this).select2("close");
    });
  });

  // input events
  const allInputs = inputs.find("input");

  // on input click, select all text
  // avoid select problem for inputs
  allInputs.each(function() {
    // set default value
    setInputValueInElement(element, $(this));

    // update param
    $(this).on("blur", function() {
      setInputValueInElement(element, $(this));
    });

    $(this).click(function() {
      $(this).select();
    });
  });
};

const validateConnectionFunc = (vS, mS, vT, mT, end, lV) => {
  if (!mT) {
    return false;
  }
  if (vS === vT) {
    return false;
  }
  if (mT.getAttribute("port-group") !== "in") {
    return false;
  }

  // input accept only one source
  const usedInPorts = vT.model.getUsedInPorts();
  const matchId = usedInPorts.find(port => port.id === mT.getAttribute("port"));
  if (matchId) {
    return false;
  }

  // allow only same input-output type
  if (
    mT.getAttribute("type") === undefined ||
    mS.getAttribute("type") === undefined
  ) {
    return false;
  }

  // check allowed type
  const allowedS = mS.getAttribute("type-allowed").split(",");
  const allowedT = mT.getAttribute("type-allowed").split(",");
  const commonType = allowedS.filter(value => -1 !== allowedT.indexOf(value));
  if (commonType.length == 0) {
    return false;
  }

  return true;
};

const initPaper = () => {
  const paper = new joint.dia.Paper({
    el: $(INTERFACE_ROOT),
    model: graph,
    width: "100%",
    height: 800,
    gridSize: 15,
    drawGrid: true,
    linkPinning: false,
    snapLinks: true,
    defaultLink: new joint.shapes.standard.Link({ z: 20 }),
    defaultConnector: { name: "smooth" },
    defaultConnectionPoint: { name: "boundary" },
    markAvailable: true,
    /*eslint no-unused-vars: ["error", { "args": "none" }]*/
    validateConnection: validateConnectionFunc
  });

  paper.options.highlighting.magnetAvailability =
    THEME.magnetAvailabilityHighlighter;

  /**********ZOOM*/

  const onMouseWheel = e => {
    e.preventDefault();
    e = e.originalEvent;

    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail)) / 50;
    var newScale = currentScale + delta; // the current paper scale changed by delta

    if (newScale > 0.4 && newScale < 1) {
      // paper.setOrigin(-paper.translate().tx, -paper.translate().ty); // reset the previous viewport translation
      paper.scale(newScale, newScale, 0, 0);
      currentScale = newScale;
    }
  };
  paper.$el.on("mousewheel DOMMouseScroll", onMouseWheel);

  /*------------PAN */
  let move = false;
  let dragStartPosition;

  paper.on("blank:pointerdown", (event, x, y) => {
    dragStartPosition = { x: x, y: y };
    move = true;
  });

  paper.on("cell:pointerup blank:pointerup", () => {
    move = false;
  });

  $(INTERFACE_ROOT).mousemove(event => {
    if (move) {
      const newX = event.offsetX / currentScale - dragStartPosition.x;
      const newY = event.offsetY / currentScale - dragStartPosition.y;
      paper.translate(newX * currentScale, newY * currentScale);
    }
  });

  /*******LINK***/

  paper.on("link:mouseenter", linkView => {
    const tools = new joint.dia.ToolsView({
      tools: [
        new joint.linkTools.TargetArrowhead(),
        new joint.linkTools.Remove({ distance: -30 })
      ]
    });
    linkView.addTools(tools);
  });

  paper.on("link:mouseleave", linkView => {
    linkView.removeTools();
  });

  paper.on("link:connect link:disconnect", (linkView, evt, elementView) => {
    const element = elementView.model;
    element.getInPorts().forEach(function(port) {
      const portNode = elementView.findPortNode(port.id, PORT_SELECTOR);
      elementView.unhighlight(portNode, {
        highlighter: THEME.magnetAvailabilityHighlighter
      });
    });
  });

  /*************/

  // unfocus input when clicks
  paper.on("blank:pointerdown", () => {
    $("input").each(function() {
      $(this).blur();
    });
  });

  /*-----------------------*/

  paper.on("blank:contextmenu", () => {});
};

const buildGraph = async workflow => {
  initPaper();

  if (workflow) {
    const webservices = transformWorkflowToGraph(workflow);

    webservices.forEach(function(e) {
      addElement(e);
    });
  }
};

const saveWorkflow = () => {
  console.log(graph.toJSON());
};

const transformWebserviceForGraph = webservice => {
  const position = { x: 370, y: 160 };
  const size = {
    width: computeBoxWidth(webservice),
    height: computeBoxHeight(webservice)
  };
  const label = webservice.general.name;

  const ports = { items: [] };
  webservice.input
    .filter(input => input.file)
    .forEach(input => {
      const file = input.file;
      if (file.userdefined) {
        // @TODO display !userdefined ports ?
        const options = file.options;
        const typeAllowed = options.mimeTypes.allowed;
        const type = typeAllowed[0].substr(
          0,
          options.mimeTypes.allowed[0].indexOf("/")
        );
        const inPort = {
          group: `in`,
          attrs: {
            [PORT_SELECTOR]: {
              fill: colorType(type),
              type,
              typeAllowed
            },
            text: { text: `${file.name}\n${typeAllowed}` }
          }
        };
        ports.items.push(inPort);
      }
    });

  webservice.output
    .filter(output => output.file)
    .forEach(output => {
      const file = output.file;
      const options = file.options;
      const typeAllowed = options.mimeTypes.allowed;
      const type = typeAllowed[0].substr(
        0,
        options.mimeTypes.allowed[0].indexOf("/")
      );
      const outPort = {
        group: `out`,
        attrs: {
          [PORT_SELECTOR]: {
            fill: colorType(type),
            type,
            typeAllowed
          },
          text: { text: `${file.name}\n${typeAllowed}` }
        }
      };
      ports.items.push(outPort);
    });

  const params = [];
  webservice.input
    .filter(input => input.number)
    .forEach(input => {
      const number = input.number;
      const options = number.options;
      const param = {
        type: "number",
        name: number.name,
        defaultValue: options.default,
        description: number.description,
        userdefined: number.userdefined
      };
      params.push(param);
    });
  webservice.input
    .filter(input => input.select)
    .forEach(input => {
      const select = input.select;
      const options = select.options;
      const param = {
        type: "select",
        name: select.name,
        defaultValue: options.default,
        description: select.description,
        userdefined: select.userdefined,
        values: options.values
      };
      params.push(param);
    });

  const ret = { position, size, label, params, ports };
  console.log(ret);
  return ret;
};

const addElementToGraph = async url => {
  const webservice = await getWebServiceFromUrl(url);
  const transformedWebservice = transformWebserviceForGraph(webservice);
  addElement(transformedWebservice);
};

$("#save").click(() => saveWorkflow());

export { buildGraph, addElementToGraph };
