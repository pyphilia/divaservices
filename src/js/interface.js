/* eslint-disable */
import "select2";
import * as $ from "jquery";
import * as joint from "jointjs";
import { saveWorkflow } from "./saveWorkflow";
import {
  TOOLTIP_HTML,
  THEME,
  colorType,
  BOX_TITLE_HTML_TAG,
  TOOLTIP_OPTIONS,
  TOOLTIP_BREAK_LINE,
  NAME_COL,
  RESET_COL,
  TOOLTIP_COL,
  PARAM_COL,
  TOOLTIP_BOX_COL,
  TITLE_COL,
  Inputs
} from "./constants";
import {
  getWebServiceFromUrl,
  computeBoxWidth,
  computeBoxHeight,
  objectToString,
  computeTitleLength
} from "./utils";
import {
  INTERFACE_ROOT,
  PORT_SELECTOR,
  INFO_TOOLTIP_CLASS,
  PARAM_NAME_CLASS,
  TITLE_ROW_CLASS,
  BOX_CONTAINER_CLASS,
  FOREIGN_CLASS,
  RESET_BUTTON_CLASS,
  ATTR_TYPE_ALLOWED,
  ATTR_TYPE,
  TRASH_SELECTOR,
  IN_PORT_CLASS,
  OUT_PORT_CLASS
} from "./selectors";

let paper;
const graph = new joint.dia.Graph();
let currentScale = 1;

const setSelectValueInElement = (element, select) => {
  const selectedValue = select.find(":selected").attr("value");
  element.attributes.params[select.parent().attr("name")] = selectedValue;
};

const setInputValueInElement = (element, input) => {
  const value = input.val();
  element.attributes.params[input.attr("name")] = value;
};

const createBox = (e, id) => {
  const margin = 30;

  const size = {
    width: computeBoxWidth(e),
    height: computeBoxHeight(e)
  };

  const titleHeight = computeTitleLength(e).isCut ? 120 : 60;

  const template = `<rect></rect>
  <foreignObject class="${FOREIGN_CLASS}" id="${id}" x="0" y="-${titleHeight}" width="${
    size.width
  }" height="${size.height + titleHeight}">
  <body xmlns="http://www.w3.org/1999/xhtml">
  <div class="${BOX_CONTAINER_CLASS} no-gutters p-0">
  <div class="${TITLE_ROW_CLASS} row">
  <${BOX_TITLE_HTML_TAG} class="${TITLE_COL} align-middle">${
    e.label
  }</${BOX_TITLE_HTML_TAG}>
  </div>
  </div>
  </body>
  </foreignObject>`;

  const paperPosition = paper.translate();
  const position = { x: -paperPosition.tx + 100, y: -paperPosition.ty + 100 };

  return joint.shapes.basic.Rect.define(
    e.label,
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
};

function resetValue(event) {
  const el = event.target;
  const defaultValue = el.dataset.value;
  switch (el.dataset.parent) {
    case Inputs.SELECT.tag: {
      const select = el.parentNode.getElementsByTagName(Inputs.SELECT.tag)[0];
      $(select)
        .val(defaultValue)
        .trigger("change");
      break;
    }
    case Inputs.NUMBER.tag:
      el.parentNode.getElementsByTagName(
        Inputs.NUMBER.tag
      )[0].value = defaultValue;
      break;
    default:
      alert("error");
  }
}

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

  const resetButton = $("<button></button>")
    .addClass(`${RESET_BUTTON_CLASS} btn ${RESET_COL}`)
    .text("Reset")
    .on("click", resetValue);

  e.params.forEach(param => {
    const name = param.name;
    const defaultTooltip = $(TOOLTIP_HTML)
      .addClass(`${INFO_TOOLTIP_CLASS} ${TOOLTIP_COL}`)
      .data("id", name)
      .data("param", e.label)
      .data("toggle", "tooltip")
      .data("placement", "right");

    switch (param.type) {
      case Inputs.SELECT.type: {
        // wrapper
        const newSelect = $("<div></div>")
          .addClass("select row")
          .attr("name", name);

        // select
        const selectEl = $(`<${Inputs.SELECT.tag}/>`)
          .addClass(PARAM_COL)
          .prop("disabled", !param.userdefined);

        // param name
        const nameEl = $("<span></span>")
          .addClass(`${PARAM_NAME_CLASS} ${NAME_COL}`)
          .text(name);

        // param options
        param.options.values.forEach((values, i) => {
          $("<option></option>")
            .text(values)
            .attr("value", values)
            .prop("selected", i == param.options.default)
            .appendTo(selectEl);
        });

        newSelect
          .append(nameEl)
          .append(selectEl)
          .appendTo(selects);

        // reset
        resetButton
          .clone(true)
          .attr("data-parent", "select")
          .attr("data-value", param.options.values[param.options.default])
          .appendTo(newSelect);

        // add tooltip
        if (param.description) {
          defaultTooltip
            .clone(true)
            .data("title", param.description)
            .appendTo(newSelect)
            .tooltip(TOOLTIP_OPTIONS);
        }
        break;
      }
      case Inputs.NUMBER.type: {
        // wrapper
        const newInput = $("<div></div>")
          .addClass("input row")
          .appendTo(inputs);

        // param name
        const nameEl = $("<span></span>")
          .addClass(`${PARAM_NAME_CLASS} ${NAME_COL}`)
          .text(name);

        // param input
        const inputEl = $(`<${Inputs.NUMBER.tag} />`)
          .addClass(PARAM_COL)
          .prop("disabled", !param.userdefined)
          .attr("type", "text")
          .attr("name", name)
          .attr("value", param.options.default);

        // reset
        const resetButtonNumber = resetButton.clone(true);
        resetButtonNumber
          .attr("data-parent", "input")
          .attr("data-value", param.options.default);

        newInput
          .append(nameEl)
          .append(inputEl)
          .append(resetButtonNumber)
          .appendTo(inputs);

        // add tooltip
        if (param.description || param.options.length) {
          const tooltipText = `${
            param.description
          }${TOOLTIP_BREAK_LINE}${objectToString(param.options)}`;
          defaultTooltip
            .data("title", tooltipText)
            .appendTo(newInput)
            .tooltip(TOOLTIP_OPTIONS);
        }

        break;
      }
      default:
    }
  });

  // add params to boxes
  const foreignObject = $(`foreignObject#${id} body`);
  foreignObject
    .find(`.${BOX_CONTAINER_CLASS}`)
    .append(inputs)
    .append(selects);

  // main tooltip
  if (e.description) {
    $(TOOLTIP_HTML)
      .addClass(`tooltip-box ${TOOLTIP_BOX_COL}`)
      .data("title", e.description)
      .data("toggle", "tooltip")
      .data("placement", "right")
      .appendTo(foreignObject.find(`.${TITLE_ROW_CLASS}`))
      .tooltip(TOOLTIP_OPTIONS);
  }

  // SELECT EVENTS
  const allSelects = selects.find(Inputs.SELECT.tag);

  // add select2 on elements
  // avoid select click bug
  allSelects.each(function() {
    $(this).select2({
      minimumResultsForSearch: -1 // hide search box
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

  // NUMBER EVENTS
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
  if (mT.getAttribute("port-group") !== IN_PORT_CLASS) {
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
    mT.getAttribute(ATTR_TYPE) === undefined ||
    mS.getAttribute(ATTR_TYPE) === undefined
  ) {
    return false;
  }

  // check allowed type
  const allowedS = mS.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const allowedT = mT.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const commonType = allowedS.filter(value => -1 !== allowedT.indexOf(value));
  if (commonType.length == 0) {
    return false;
  }

  return true;
};

const changeZoom = scale => {
  /** 
        var bcr = paper.svg.getBoundingClientRect();
        var localRect1 = paper.clientToLocalRect({ x: bcr.left, y: bcr.top, width: bcr.width, height: bcr.height });*/
  const paperPosition = paper.translate();
  let tx = -paperPosition.tx + 400 * currentScale;
  let ty = -paperPosition.ty + 400 * currentScale;
  paper.scale(scale, scale, tx, ty);
  currentScale = scale;
};

const initPaper = () => {
  paper = new joint.dia.Paper({
    el: $(INTERFACE_ROOT),
    model: graph,
    width: "100%",
    height: 800,
    gridSize: 15,
    drawGrid: {
      name: "fixedDot"
    },
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

  paper.on("element:pointerup", e => {
    if ($(TRASH_SELECTOR).is(":hover")) {
      if (confirm("Are you sure you want to delete this element?")) {
        e.model.remove();
      } else {
        // @TODO replace where it was before moving
      }
    }
  });

  /**********ZOOM*/

  const onMouseWheel = e => {
    e.preventDefault();
    e = e.originalEvent;

    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail)) / 50;
    var newScale = currentScale + delta; // the current paper scale changed by delta

    if (newScale > 0.4 && newScale < 1) {
      // paper.setOrigin(-paper.translate().tx, -paper.translate().ty); // reset the previous viewport translation
      changeZoom(newScale);
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

  // unfocus inputs when clicks
  paper.on("blank:pointerdown", () => {
    $("input").each(function() {
      $(this).blur();
    });
  });

  /*-----------------------*/

  paper.on("blank:contextmenu", () => {});
};

const transformWorkflowToGraph = workflow => {
  console.log("TCL: transformWorkflowToGraph");
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

const createPort = (param, group) => {
  let port = {};
  const obj = param[Object.keys(param)[0]];
  if (group == OUT_PORT_CLASS || obj.userdefined) {
    // always create out port, check userdefined for inputs

    let typeAllowed;
    let type;

    // folder case
    if (param.folder) {
      typeAllowed = ["folder"]; // use options allowed types, otherwise it is a folder
      type = "folder";
    } else {
      // @TODO display !userdefined ports ?
      typeAllowed = obj.options.mimeTypes.allowed;
      type = typeAllowed[0].substr(
        //@TODO diff types ?
        0,
        typeAllowed[0].indexOf("/")
      );
    }

    port = {
      group,
      attrs: {
        [PORT_SELECTOR]: {
          fill: colorType(type),
          type,
          typeAllowed
        },
        text: { text: `${obj.name}\n${typeAllowed}` }
      }
    };
  }
  return port;
};

const transformWebserviceForGraph = webservice => {
  const label = webservice.general.name;
  const description = webservice.general.description;
  const information = webservice.general;

  // handle ports
  const ports = { items: [] };
  webservice.input
    .filter(input => input.file || input.folder)
    .forEach(input => ports.items.push(createPort(input, IN_PORT_CLASS)));

  webservice.output
    .filter(output => output.file || output.folder)
    .forEach(output => ports.items.push(createPort(output, OUT_PORT_CLASS)));

  // handle params
  const params = [];
  webservice.input.forEach(input => {
    const type = Object.keys(input)[0];
    const obj = input[type];
    const param = {
      type: type,
      name: obj.name,
      options: obj.options,
      description: obj.description,
      userdefined: obj.userdefined
    };
    params.push(param);
  });

  const ret = {
    description,
    label,
    params,
    ports,
    information
  };
  console.log("webservice", webservice);
  console.log("return", ret);
  return ret;
};

const addElementToGraph = async url => {
  const webservice = await getWebServiceFromUrl(url);
  const transformedWebservice = transformWebserviceForGraph(webservice);
  addElement(transformedWebservice);
};

const clearWorkflow = () => {
  graph.clear();
};

$("#save").click(() => saveWorkflow(graph.toJSON()));
$("#clear").click(() => clearWorkflow());
$("#resetZoom").click(() => changeZoom(1));

console.log($(INTERFACE_ROOT));

export { buildGraph, addElementToGraph };
