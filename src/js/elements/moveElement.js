import { getElementByBoxId } from "../layout/utils";
import { ACTION_MOVE_ELEMENT } from "../constants/actions";
import { app } from "../main";

let allPositions = {};
export const saveElementsPositionFromCellView = cellViews => {
  const newPositions = {};
  for (const el of cellViews.map(el => el.model)) {
    newPositions[el.attributes.boxId] = el.position();
  }
  // build distance maps
  const distances = {};
  for (const [key, value] of Object.entries(newPositions)) {
    // if the element was moved, it should be present in both
    // arrays
    if (key in allPositions) {
      const distObj = {
        x: allPositions[key].x - value.x,
        y: allPositions[key].y - value.y
      };
      const distString = JSON.stringify(distObj);

      if (!(distString in distances)) {
        distances[distString] = [key];
      } else {
        distances[distString].push(key);
      }
    }
  }
  const keys = Object.keys(distances);
  if (keys.length) {
    const distance = JSON.parse(keys[0]);
    if (distance.x != 0 || distance.y != 0) {
      app.addAction(ACTION_MOVE_ELEMENT, {
        currentPositions: { ...allPositions },
        newPositions: { ...newPositions },
        elementBoxIds: distances[keys[0]]
      });
    }
  }

  allPositions = newPositions;
};

export const moveElementsByBoxId = (elementBoxIds, positions) => {
  for (const id of elementBoxIds) {
    const el = getElementByBoxId(id);
    const { x, y } = positions[id];
    el.position(x, y, { multitranslate: true });
  }
};

// currentElement is the element which the user clicked on to move the other ones
export const moveAllElements = (elements, currentElement, position) => {
  const selectModels = elements.map(el => el.model);
  const previousCurrentPosition = allPositions[currentElement.attributes.boxId];
  for (const el of selectModels.filter(el => el != currentElement)) {
    const { x: previousX, y: previousY } = allPositions[el.attributes.boxId];
    const deltaTranslation = {
      x: position.x - previousCurrentPosition.x,
      y: position.y - previousCurrentPosition.y
    };
    el.position(
      previousX + deltaTranslation.x,
      previousY + deltaTranslation.y,
      { multitranslate: true }
    );
  }
};
