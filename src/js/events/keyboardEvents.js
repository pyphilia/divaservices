import { copy } from "./controls";
import { app } from "../app";
import UndoRedoHistory from "../store/plugins/UndoRedoHistory";
import { getElementByBoxId } from "../layout/utils";

export let ctrlDown;
export let spaceDown;

/**
 * Initialize keyboard events
 * */

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
            copy(app.selectedElements);
            break;
          }
          case "v": {
            app.duplicateElements({ elements: app.copiedElements });
            break;
          }
          case "z": {
            UndoRedoHistory.undo();
            // prevent default ctrl+z operations
            event.preventDefault();
            return false;
          }
          case "y": {
            UndoRedoHistory.redo();
            break;
          }
          default:
        }
      } else {
        switch (keyName) {
          case "ArrowDown": {
            for (const { boxId } of app.selectedElements) {
              getElementByBoxId(boxId).translate(0, 50);
              app.moveSelectedElements();
            }
            break;
          }
          case "ArrowUp": {
            for (const { boxId } of app.selectedElements) {
              getElementByBoxId(boxId).translate(0, -50);
              app.moveSelectedElements();
            }
            break;
          }
          case "ArrowRight": {
            for (const { boxId } of app.selectedElements) {
              getElementByBoxId(boxId).translate(50, 0);
              app.moveSelectedElements();
            }
            break;
          }
          case "ArrowLeft": {
            for (const { boxId } of app.selectedElements) {
              getElementByBoxId(boxId).translate(-50, 0);
              app.moveSelectedElements();
            }
            break;
          }
          case "Delete": {
            // do not delete element if an input is focused
            const focusedInput = document.querySelector("input:focus");
            if (!focusedInput) {
              app.deleteElements({ elements: app.selectedElements });
            }
            break;
          }
          case " ": {
            spaceDown = true;
            event.preventDefault();
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
    if (event.key == " ") {
      spaceDown = false;
    }
  });
};
