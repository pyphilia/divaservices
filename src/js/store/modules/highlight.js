import { BOX_HIGHLIGHTERS } from "../../constants/constants";
import { app } from "../../app";
const MARGIN = 15;
const HIGHLIGHT_TOOLSBAR = "highlight-toolsbar";

export const appendHighlightToolsbar = cellView => {
  const { size } = cellView.model.attributes;

  const foreignObj = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  foreignObj.setAttribute("class", HIGHLIGHT_TOOLSBAR);
  foreignObj.setAttribute("y", size.height + MARGIN);
  foreignObj.style = "width: 65px; height:40px;";

  // trash
  const icon = document.createElement("i");
  icon.setAttribute("class", "fas fa-trash icon");
  icon.addEventListener("click", () => {
    app.deleteElementByCellView(cellView);
  });
  foreignObj.appendChild(icon);

  cellView.el.appendChild(foreignObj);
};

// const removeHighlightToolsbar = (cellView) => {
//   cellView.el.querySelector(`.${HIGHLIGHT_TOOLSBAR}`).remove();
// }

export function highlightSelection(cellView) {
  if (cellView) {
    for (const highlight of BOX_HIGHLIGHTERS) {
      cellView.highlight(null, highlight);
    }

    // if(!cellView.el.querySelector(`.${HIGHLIGHT_TOOLSBAR}`)) {

    //   appendHighlightToolsbar(cellView)

    // }
  }
}

export function unHighlight(cellView) {
  for (const highlight of BOX_HIGHLIGHTERS) {
    cellView.unhighlight(null, highlight);
  }
  app.$removeResizer();
  // removeHighlightToolsbar(cellView)
}

export function unHighlightAllElements(elements) {
  for (const el of elements) {
    unHighlight(el);
  }
}

export const resetHighlight = el => {
  unHighlight(el);
  highlightSelection(el);
};

export function resetHighlightAllElements(elements) {
  for (const el of elements) {
    resetHighlight(el);
  }
}
