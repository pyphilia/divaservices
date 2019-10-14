import { BOX_HIGHLIGHTER } from "../../constants/constants";

export function highlightSelection(cellView) {
  if (cellView) {
    cellView.highlight(null, BOX_HIGHLIGHTER);
  }
}

export function unHighlight(cellView) {
  cellView.unhighlight(null, BOX_HIGHLIGHTER);
}

export function unHighlightAllElements(elements) {
  for (const el of elements) {
    unHighlight(el);
  }
}
