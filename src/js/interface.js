import * as $ from "jquery";
import * as joint from "jointjs";
import "select2";
import { TOOLTIP_HTML, THEME } from "./constants";
import { INTERFACE_ROOT, PORT_SELECTOR, INFO_TOOLTIP_CLASS } from "./selectors";

const graph = new joint.dia.Graph();
let currentScale = 1;

const transformWorkflowToGraph = workflow => {
  return [
    {
      position: { x: 80, y: 80 },
      size: { width: 430, height: 160 },
      label: "I am HTML",
      params: [
        {
          type: "number",
          name: "in1",
          defaultValue: "1",
          description: "hwesdjnk"
        },
        {
          type: "number",
          name: "in2",
          defaultValue: "2",
          description: "nhtgrfe"
        }
      ],
      ports: {
        items: [
          {
            attrs: { description: "wef", text: { text: "23456" } },
            group: "in"
          },
          {
            group: "out",
            attrs: { text: { text: "out1" } }
          }
        ]
      }
    },
    {
      position: { x: 370, y: 160 },
      size: { width: 270, height: 200 },
      label: "Me too",
      params: [
        {
          type: "select",
          name: "in3",
          defaultValue: "1.3",
          description: "jzhrtgrfe",
          options: ["a", "b", "c"]
        },
        {
          type: "number",
          name: "in4",
          defaultValue: "24",
          description: "67utzhfg"
        }
      ],
      ports: {
        items: [
          { attrs: { text: { text: "in1\n<div>wef</div>" } }, group: "in" },
          {
            group: "out",
            attrs: { text: { text: "out1" } }
          }
        ]
      }
    }
  ];
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
  ${e.label}<br/>
  </body>
  </foreignObject>`;

  return joint.shapes.basic.Rect.define(
    "example",
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
        const selectEl = $("<select></select>");
        param.options.forEach(option => {
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
  const usedInPorts = vT.model.getUsedInPorts();
  const matchId = usedInPorts.find(port => {
    return port.id === mT.getAttribute("port");
  });
  if (matchId) {
    return false;
  }

  return true;
};

const initPaper = () => {
  const paper = new joint.dia.Paper({
    el: $(INTERFACE_ROOT),
    model: graph,
    width: 1400,
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

  paper.on("blank:contextmenu", () => {
    const elele = {
      position: { x: 370, y: 160 },
      size: { width: 270, height: 200 },
      label: "Me too",
      params: [
        { type: "select", name: "in3", defaultValue: "1.3" },
        { type: "number", name: "in4", defaultValue: "24" }
      ],
      ports: {
        items: [
          { attrs: { text: { text: "in1\n<div>wef</div>" } }, group: "in" },
          {
            group: "out",
            attrs: { text: { text: "out1" } }
          }
        ]
      }
    };
    addElement(elele);
  });
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

$("#save").click(() => saveWorkflow());

export { buildGraph };
