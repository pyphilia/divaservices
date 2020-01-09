/**
 * This file contains the configuration of the tutorial tour
 * state: on develpment
 */

import Shepherd from "shepherd.js";
import {
  INTERFACE_ROOT,
  LEFT_SIDEBAR,
  FILE_MENU,
  MINIMAP_PAPER_ID,
  ALGO_ITEM_CLASS
} from "../constants/selectors";

export const initTour = () => {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: "shadow-md bg-purple-dark",
      scrollTo: true,
      styleVariables: {
        shepherdElementZIndex: 10,
        shepherdThemePrimary: "#00213b",
        shepherdThemeSecondary: "#e5e5e5"
      }
    }
  });

  const clickFunction = () => {
    tour.next();
  };

  const nextButton = {
    text: "Next",
    action: tour.next
  };
  const backButton = {
    text: "Back",
    action: tour.back
  };
  const doneButton = {
    text: "Done",
    action: tour.complete
  };
  const buttons = [doneButton, backButton, nextButton];

  const steps = [
    {
      id: "welcome",
      text: "Welcome on divaservices guided tour!",
      classes: "example-step-extra-class",
      buttons
    },
    {
      id: "left",
      text:
        "The left sidebar displays all available webservices you can use to construct your workflow.<br><br>Choose one to begin your working on your workflow.",
      attachTo: {
        element: `#${LEFT_SIDEBAR}`,
        on: "right"
      },
      when: {
        show: () => {
          for (const algoItem of document.querySelectorAll(
            `.${ALGO_ITEM_CLASS}`
          )) {
            algoItem.addEventListener("click", clickFunction);
          }
        },
        inactive: () => {
          for (const algoItem of document.querySelectorAll(
            `.${ALGO_ITEM_CLASS}`
          )) {
            algoItem.removeEventListener("click", clickFunction, false);
          }
        }
      },
      classes: "example-step-extra-class",
      buttons
    },
    {
      id: "mainarea",
      text:
        "Here is the main area, where the webservices will be added<br><br>Webservices are represented as boxes. Their parameters are customizable and linkeable.",
      attachTo: {
        element: INTERFACE_ROOT,
        on: "right"
      },
      classes: "example-step-extra-class",
      buttons
    },
    {
      id: "mainarea",
      text:
        "You can also navigate using the minimap, really useful when dealing with consequent workflow",
      attachTo: {
        element: `#${MINIMAP_PAPER_ID}`,
        on: "right"
      },
      classes: "example-step-extra-class",
      buttons
    },
    {
      id: "filemenu",
      text:
        "And the right sidebar offers various workflow operations, the most important ones being saving and installing them.",
      attachTo: {
        element: FILE_MENU,
        on: "left"
      },
      classes: "example-step-extra-class",
      buttons
    },
    {
      id: "keyboard",
      text:
        "That's it! <br><br>Remember that keyboard shortcuts are available as well, such as ctrl+c, ctrl+v, etc...",
      buttons
    }
  ];

  tour.addSteps(steps);

  tour.start();
};
