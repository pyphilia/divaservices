import { addElement } from "../src/js/theme";
import * as theme_utils from "../src/js/theme_utils";
import { Inputs } from "../src/js/constants";
import { IN_PORT_CLASS, OUT_PORT_CLASS } from "../src/js/selectors";

import { correctAlgorithms, ocropusBinarization } from "./algorithms";

const position = {
  x: 0,
  y: 0
};

describe("addElement corner cases", () => {
  beforeEach(() => {});

  test.each([{}])("no box is created on incorrect element", e => {
    expect(addElement(e, position)).toBeFalsy();
  });

  test.each(correctAlgorithms)(
    "one box is created with correct elements",
    e => {
      expect(addElement(e, position)).toBeTruthy();
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

    const el = addElement(ocropusBinarization, position, defaultParams);
    expect(el).toBeTruthy();
    expect(el.attributes.params.maxskew).toEqual(defaultParams.maxskew);
  });
});

describe.each(correctAlgorithms)("test real algorithms layout", e => {
  let createSelectSpy, createInputSpy;

  beforeAll(() => {
    createInputSpy = jest.spyOn(theme_utils, "createInput");
    createSelectSpy = jest.spyOn(theme_utils, "createSelect");
  });

  afterEach(() => {
    createInputSpy.mockClear();
    createSelectSpy.mockClear();
  });

  test("element contains correct number of parameters (input, select)", () => {
    const nbInput = e.params.filter(param => param.type == Inputs.NUMBER.type)
      .length;

    const nbSelect = e.params.filter(param => param.type == Inputs.SELECT.type)
      .length;

    const el = addElement(e, position);

    // params are tracked in element
    expect(Object.keys(el.attributes.params).length).toEqual(e.params.length);
    expect(createInputSpy).toHaveBeenCalledTimes(nbInput);
    expect(createSelectSpy).toHaveBeenCalledTimes(nbSelect);
  });

  test("element has correct ports", () => {
    const el = addElement(e, position);
    const resPorts = el.getPorts();
    expect(resPorts.length).toEqual(e.ports.items.length);
    expect(resPorts.filter(port => port.group == IN_PORT_CLASS).length).toEqual(
      e.ports.items.filter(port => port.group == IN_PORT_CLASS).length
    );
    expect(
      resPorts.filter(port => port.group == OUT_PORT_CLASS).length
    ).toEqual(
      e.ports.items.filter(port => port.group == OUT_PORT_CLASS).length
    );
  });
});
