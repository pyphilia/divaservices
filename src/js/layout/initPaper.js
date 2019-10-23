import * as joint from "jointjs";
import { THEME } from "../constants/constants";
import { INTERFACE_ROOT } from "../constants/selectors";
import { validateConnection } from "./components/utils";

export const initPaper = graph => {
  const paper = new joint.dia.Paper({
    el: document.querySelector(INTERFACE_ROOT),
    model: graph,
    width: "100%",
    height: 800,
    gridSize: 15,
    drawGrid: {
      name: "dot"
    },
    linkPinning: false,
    snapLinks: true,
    defaultLink: new joint.shapes.standard.Link({ z: 20 }),
    defaultConnector: { name: "smooth" },
    defaultConnectionPoint: { name: "boundary" },
    markAvailable: true,
    validateConnection
  });

  paper.options.highlighting.magnetAvailability =
    THEME.magnetAvailabilityHighlighter;

  return paper;
};
