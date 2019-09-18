import { undo, redo } from "../utils/undo";
import { selectedElements, clearSelection } from "../constants/globals";
import { deleteElementsById } from "../elements/deleteElement";
import { copy, paste } from "./controls";

//** KEYBOARD */
export let ctrlDown;

export const initKeyboardEvents = () => {
  document.addEventListener(
    "keydown",
    event => {
      const evt = event || window.event; // IE support
      const keyName = evt.key;
      ctrlDown = evt.ctrlKey || evt.metaKey; // Mac support

      if (ctrlDown) {
        switch (keyName) {
          case "c": {
            copy();
            break;
          }
          case "v": {
            paste();
            break;
          }
          case "z": {
            undo();
            break;
          }
          case "y": {
            redo();
            break;
          }
          default:
        }
      } else {
        switch (keyName) {
          case "ArrowDown": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(0, 50);
              }
            }
            break;
          }
          case "ArrowUp": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(0, -50);
              }
            }
            break;
          }
          case "ArrowRight": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(50, 0);
              }
            }
            break;
          }
          case "ArrowLeft": {
            if (selectedElements.length) {
              for (const el of selectedElements) {
                el.model.translate(-50, 0);
              }
            }
            break;
          }
          case "Delete": {
            deleteElementsById(selectedElements.map(el => el.model.id));
            clearSelection();
            break;
          }
          default:
        }
      }

      // if (event.ctrlKey) {
      //   // Even though event.key is not 'Control' (e.g., 'a' is pressed),
      //   // event.ctrlKey may be true if Ctrl key is pressed at the same time.
      //   alert(`Combination of ctrlKey + ${keyName}`);
      // } else {
      //   alert(`Key pressed ${keyName}`);
      // }
    },
    false
  );
  document.addEventListener("keyup", event => {
    const evt = event || window.event; // IE support
    ctrlDown = evt.ctrlKey || evt.metaKey; // Mac support
  });
};
