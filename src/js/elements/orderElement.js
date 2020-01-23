import { app } from "../app";
import * as joint from "jointjs";
import { fireAlert } from "../utils/alerts";
import { MESSAGE_LOOP } from "../constants/messages";

/**
 * order graph elements from source to target
 *
 * @param {graph} graph
 */
export const orderGraph = graph => {
  let i = 100;
  let j = i;
  const x = 100;
  const margin = 700;
  const verticalMargin = 300;

  app.$unSelectAllElements(); // disable position onmove event on selected elements

  // source elements or not linked elements
  const sources = graph.getSources();
  for (const source of sources) {
    source.position(x, i);
    let children = graph.getNeighbors(source, { outbound: true });

    let level = 1;

    while (children.length) {
      j = i;
      let allChildren = [];
      for (const child of children) {
        child.position(x + margin * level, j);
        j += 300;
        allChildren = allChildren.concat(
          graph.getNeighbors(child, { outbound: true })
        );
      }

      level += 1;
      children = allChildren;
    }

    i += verticalMargin;
    // as long as successors is part of preceding sources
  }

  app.$fitContent(app.paper);
};

/**
 * get elements in order, from source to target
 * if a loop is found, it still orders the element
 * and return isLoop set to true
 */
export const getOrderedElements = graph => {
  const order = [];
  let isLoop = false;

  const addedBoxId = [];

  let subgraph = new joint.dia.Graph();
  subgraph.addCells(graph.getCells());

  do {
    let sources = subgraph.getSources();

    // if no root is found, but there are still elements
    // it means there is a loop
    if (!sources.length) {
      sources = [subgraph.getElements()[0]];
      fireAlert("danger", MESSAGE_LOOP);
      isLoop = true;
    }

    for (const source of sources) {
      order.push(source);
      addedBoxId.push(source.attributes.boxId);
    }

    let remainingEls = subgraph
      .getElements()
      .filter(el => !sources.includes(el));
    let remainingCells = subgraph.getSubgraph(remainingEls);

    // if already added elements are in the graph again, there is a loop
    if (
      remainingCells.filter(el => addedBoxId.includes(el.attributes.boxId))
        .length
    ) {
      fireAlert("danger", MESSAGE_LOOP);
      isLoop = true;
    }

    remainingCells = remainingCells.filter(
      el => !addedBoxId.includes(el.attributes.boxId)
    );
    subgraph = new joint.dia.Graph();
    subgraph.addCells(remainingCells);
  } while (subgraph.getElements().length);

  return { elements: order, isLoop };
};
