import * as joint from "jointjs";

class Graph {
  constructor() {
    this._graph = new joint.dia.Graph();
  }

  get graph() {
    return this._graph;
  }

  getElementByBoxId(boxId) {
    return this._graph.getElements().find(el => el.attributes.boxId == boxId);
  }

  /**
   * return elements which exist in the graph
   *
   * @param {array} arr array of elements
   */
  getElementsInGraph(arr) {
    return arr.filter(el => this.getElementByBoxId(el.boxId));
  }

  /**
   * return elements which don't exist in graph, but do in arr
   *
   * @param {array} arr elements
   */
  getNewElements(arr) {
    return arr.filter(({ boxId }) => !this.getElementByBoxId(boxId));
  }

  /**
   * return links which exist in links, but not in the graph
   *
   * @param {array} links array of links
   */
  getNewLinks(links) {
    return links.filter(
      ({ source, target }) => !this.getLinkBySourceTarget(source, target)
    );
  }

  getLinkBySourceTarget(source, target) {
    return this._graph.getLinks().find(link => {
      const s = link.source();
      const t = link.target();

      const sourceCell = this._graph.getCell(s.id);
      const targetCell = this._graph.getCell(t.id);

      if (!sourceCell || !targetCell) {
        return false;
      }
      const sourceBoxId = sourceCell.attributes.boxId;
      const sPortId = s.port;
      const sPortName = sourceCell.getPort(sPortId).name;

      const targetBoxId = targetCell.attributes.boxId;
      const tPortId = t.port;
      const tPortName = targetCell.getPort(tPortId).name;

      return (
        sourceBoxId == source.boxId &&
        targetBoxId == target.boxId &&
        sPortName === source.portName &&
        tPortName === target.portName
      );
    });
  }
}

export default new Graph();
