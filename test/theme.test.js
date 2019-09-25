/*
// we import jquery as below for test to work
import jQuery from "jquery";
const $ = jQuery;
global.$ = global.jQuery = $;
*/
import { addElementFromTransformedJSON } from "../src/js/elements/addElement";
import { Inputs } from "../src/js/constants/constants";

import { correctAlgorithms, ocropusBinarization } from "./algorithms";

const position = {
  x: 0,
  y: 0
};

describe("addElementFromTransformedJSON corner cases", () => {
  test.each([{}])("no box is created on incorrect element", e => {
    expect(addElementFromTransformedJSON(e, { position })).toBeFalsy();
  });

  test.each(correctAlgorithms)(
    "one box is created with correct elements",
    e => {
      expect(addElementFromTransformedJSON(e, { position })).toBeTruthy();
    }
  );
});

describe("test default parameters", () => {
  beforeEach(() => {});
  test("box is initialized with default parameters", () => {
    const defaultParams = {
      enableSkew: "true",
      maxskew: "2",
      skewsteps: "3"
    };

    const el = addElementFromTransformedJSON(
      ocropusBinarization,
      position,
      defaultParams
    );
    expect(el).toBeTruthy();
  });
});

// note: cannot use jest.spyOn on createInput and createSelect because it is not directly call by the tested method
describe.each(correctAlgorithms)("test real algorithms layout", e => {
  // test("element has correct ports", () => {
  //   const el = addElementFromTransformedJSON(e);
  //   const resPorts = el.getPorts();
  //   expect(resPorts.length).toEqual(e.ports.items.length);
  //   expect(resPorts.filter(port => port.group == IN_PORT_CLASS).length).toEqual(
  //     e.ports.items.filter(port => port.group == IN_PORT_CLASS).length
  //   );
  //   expect(
  //     resPorts.filter(port => port.group == OUT_PORT_CLASS).length
  //   ).toEqual(
  //     e.ports.items.filter(port => port.group == OUT_PORT_CLASS).length
  //   );
  // });

  test(
    e.label +
      " - element contains correct number of parameters (input, select)",
    () => {
      const nbInput = e.params.filter(param => param.type == Inputs.NUMBER.type)
        .length;

      const nbSelect = e.params.filter(
        param => param.type == Inputs.SELECT.type
      ).length;

      const el = addElementFromTransformedJSON(e);

      // params are tracked in element
      expect(el.attributes.originalParams.length).toEqual(e.params.length);
      expect(Object.keys(el.attributes.defaultParams).length).toEqual(
        e.params.length
      );
    }
  );
});
