import { app } from "../../app";
const HIGHLIGHT_TOOLSBAR = "highlight-toolsbar";
const MARGIN = 15;

/**
 * Append a highlight toolbar
 * state: on development
 *
 * @param {cellView} cellView
 */
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
