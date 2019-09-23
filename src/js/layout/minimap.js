import * as joint from "jointjs";
import { graph, paper } from "./interface";
import {
  MINIMAP_NAVIGATOR_SELECTOR,
  MINIMAP_PAPER_ID
} from "../constants/selectors";
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from "../constants/constants";

const SCALE_CONTENT_PADDING = 10;
const navigator = document.querySelector(MINIMAP_NAVIGATOR_SELECTOR);

let mapScale = 0.5;
let minimapPaper;

let fitContentPaddingX;
let fitContentPaddingY;

export const updateMinimap = () => {
  minimapPaper.scaleContentToFit({ padding: SCALE_CONTENT_PADDING });
  mapScale = minimapPaper.scale().sx;

  // keep track of padding : scale content to fit induce some padding from origin (0,0)
  const mbcr = minimapPaper.svg.getBoundingClientRect();
  const mCoords = minimapPaper.clientToLocalRect({
    x: mbcr.left,
    y: mbcr.top,
    width: mbcr.width,
    height: mbcr.height
  });
  fitContentPaddingX = mCoords.x + SCALE_CONTENT_PADDING;
  fitContentPaddingY = mCoords.y + SCALE_CONTENT_PADDING;

  const bcr = paper.svg.getBoundingClientRect();
  const { x, y, width, height } = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });

  const newLeft = (-fitContentPaddingX + x) * mapScale;
  const newTop = (-fitContentPaddingY + y) * mapScale;
  navigator.style.top = `${newTop}px`;
  navigator.style.left = `${newLeft}px`;
  navigator.style.width = `${width * mapScale}px`;
  navigator.style.height = `${height * mapScale}px`;
};

export const initMinimap = () => {
  minimapPaper = new joint.dia.Paper({
    el: document.getElementById(MINIMAP_PAPER_ID),
    model: graph,
    width: MINIMAP_WIDTH,
    height: MINIMAP_HEIGHT,
    gridSize: 1,
    interactive: false
  });

  minimapPaper.scaleContentToFit();
  mapScale = minimapPaper.scale().sx;

  initMinimapEvents();

  updateMinimap();
};

let mapDragFlag = false;
let defaultPositionx = 0;
let defaultPositiony = 0;

const initMinimapEvents = () => {
  navigator.addEventListener("mousedown", e => {
    const { clientY, clientX } = e;
    const top = parseInt(navigator.style.top);
    const left = parseInt(navigator.style.left);
    mapDragFlag = true;
    defaultPositionx = clientX - left;
    defaultPositiony = clientY - top;
  });
  document.addEventListener("mouseup", () => {
    mapDragFlag = false;
  });

  document.addEventListener("mousemove", e => {
    if (mapDragFlag) {
      const { clientY, clientX } = e;
      const newY = (clientY - defaultPositiony) / mapScale;
      const newX = (clientX - defaultPositionx) / mapScale;

      const xScale = newX * mapScale;
      const yScale = newY * mapScale;
      navigator.style.top = `${yScale}px`;
      navigator.style.left = `${xScale}px`;

      const paperScale = paper.scale().sx;

      paper.translate(
        -fitContentPaddingX - newX * paperScale,
        -fitContentPaddingY - newY * paperScale
      );
    }
  });
};
