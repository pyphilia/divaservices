import { app } from "../app";

export const orderGraph = graph => {
  let i = 100;
  let j = i;
  const x = 100;
  const margin = 700;
  const verticalMargin = 300;

  app.unSelectAllElements(); // disable position onmove event on selected elements

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
