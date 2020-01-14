import { app } from "../app";
import * as joint from "jointjs";

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
 */
export const getOrderedElements = () => {
  const order = [];
  const { graph } = app;

  const addedBoxId = [];

  let subgraph = new joint.dia.Graph();
  subgraph.addCells(graph.getCells());

  do {
    const sources = subgraph.getSources();
    for (const source of sources) {
      order.push(source);
      addedBoxId.push(source.attributes.boxId);
    }
    let remainingEls = subgraph
      .getElements()
      .filter(el => !sources.includes(el));
    let remainingCells = subgraph.getSubgraph(remainingEls);
    subgraph = new joint.dia.Graph();
    subgraph.addCells(remainingCells);
  } while (subgraph.getElements().length);

  return order;
};
