import { addLinkFromLink, addElement } from "../../elements/addElement";
import {
  deleteLinkById,
  deleteElementByBoxId
} from "../../elements/deleteElement";

const ElementPlugin = store => {
  store.subscribe(({ type, payload }) => {
    // @TODO optimize with only changed values
    switch (type) {
      case "Interface/ADD_ELEMENT": {
        addElement(payload);
        break;
      }
      case "Interface/ADD_ELEMENTS": {
        for (const el of payload.elements) {
          addElement(el);
        }
        break;
      }
      case "Interface/DELETE_ELEMENTS": {
        for (const el of payload.elements) {
          deleteElementByBoxId(el.boxId);
        }
        break;
      }
      case "Interface/ADD_LINK": {
        addLinkFromLink(payload.link);
        break;
      }
      case "Interface/DELETE_LINK": {
        deleteLinkById(payload.link);
        break;
      }
      case "Interface/OPEN_WORKFLOW": {
        const { elements, links } = payload;
        for (const el of elements) {
          addElement(el);
        }
        for (const link of links) {
          addLinkFromLink(link);
        }
        break;
      }
      default:
        break;
    }
  });
};

export default ElementPlugin;
