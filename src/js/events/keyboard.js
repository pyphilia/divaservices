import { copy } from "./controls";
import {
  ACTION_ADD_ELEMENTS,
  ACTION_DELETE_ELEMENTS
} from "../constants/actions";
import { app } from "../main";

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
            app.addAction(ACTION_ADD_ELEMENTS, {
              elements: [...app.copiedElements]
            });
            break;
          }
          case "z": {
            app.undo();
            // prevent default ctrl+z operations
            event.preventDefault();
            return false;
          }
          case "y": {
            app.redo();
            break;
          }
          default:
        }
      } else {
        switch (keyName) {
          case "ArrowDown": {
            for (const el of app.selectedElements) {
              el.model.translate(0, 50);
            }
            break;
          }
          case "ArrowUp": {
            for (const el of app.selectedElements) {
              el.model.translate(0, -50);
            }
            break;
          }
          case "ArrowRight": {
            for (const el of app.selectedElements) {
              el.model.translate(50, 0);
            }
            break;
          }
          case "ArrowLeft": {
            for (const el of app.selectedElements) {
              el.model.translate(-50, 0);
            }
            break;
          }
          case "Delete": {
            // do not delete element if an input is focused
            const focusedInput = document.querySelector("input:focus");
            if (!focusedInput) {
              app.addAction(ACTION_DELETE_ELEMENTS, {
                elements: app.selectedElements
              });
              app.clearSelection();
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
