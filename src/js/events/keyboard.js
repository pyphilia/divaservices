import { undo, redo, addAction } from "../utils/undo";
import {
  selectedElements,
  clearSelection,
  copiedElements
} from "../events/selections";
import { copy } from "./controls";
import { ACTION_PASTE, ACTION_DELETE_ELEMENT } from "../constants/actions";

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
            copy(selectedElements);
            break;
          }
          case "v": {
            addAction(ACTION_PASTE, { elements: copiedElements });
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
            // do not delete element if an input is focused
            const focusedInput = document.querySelector("input:focus");
            if (!focusedInput) {
              addAction(ACTION_DELETE_ELEMENT, { elements: selectedElements });
              clearSelection();
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
