import { addElementFromName, addLinkFromLink } from "../../elements/addElement";
import { addDataBox } from "../../elements/addDataElement";
import { CATEGORY_SERVICE, CATEGORY_DATATEST } from "../../constants/constants";
import { deleteLinkById } from "../../elements/deleteElement";

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
      case "Interface/ADD_LINK": {
        addLinkFromLink(payload.link);
        break;
      }
      case "Interface/DELETE_LINK": {
        deleteLinkById(payload.link);
        break;
      }
      case "Interface/OPEN_WORKFLOW": {
        console.log(payload);
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

const addElement = el => {
  const { type, category } = el;
  switch (category) {
    case CATEGORY_SERVICE:
      addElementFromName(type, el);
      break;
    case CATEGORY_DATATEST:
      addDataBox(el);
      break;
    default:
      console.log("ERROR ADDING EL");
  }
};

export default ElementPlugin;
