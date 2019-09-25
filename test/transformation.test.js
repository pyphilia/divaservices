import { IN_PORT_CLASS, OUT_PORT_CLASS } from "../src/js/constants/selectors";
import { transformWebserviceForGraph } from "../src/js/elements/addElement";
import { Inputs } from "../src/js/constants/constants";

// @TODO ---- le json a changé.......

const none = {};
const empty = {
  general: {},
  inputs: [],
  outputs: []
};

const correctFileInput = {
  name: "input",
  type: Inputs.FILE.type,
  description: "desc",
  required: true,
  mimeTypes: {
    allowed: ["image/png"]
  },
  userdefined: "true"
};

const correctFileOutput = {
  name: "output",
  type: Inputs.FILE.type,
  description: "desc",
  mimeTypes: {
    allowed: ["image/png"]
  }
};

const noGeneral = {
  inputs: [correctFileOutput],
  outputs: [correctFileOutput]
};

const noInput = {
  name: "noInput",
  outputs: [correctFileOutput]
};

const noOutput = {
  name: "noOutput",
  inputs: [correctFileInput]
};

const onlyGeneral = {
  affiliation: "affiliation",
  author: "author",
  description: "description",
  developer: "developer",
  email: "email",
  executions: "executions",
  expectedRuntime: "expectedRuntime",
  license: "license",
  name: "name",
  ownsCopyright: "ownsCopyright",
  type: "type"
};

describe("transform", () => {
  test.each([none, empty, noGeneral, noInput, noOutput, onlyGeneral])(
    "transformWebserviceForGraph always returns",
    e => {
      expect(transformWebserviceForGraph(e)).toBeTruthy();
    }
  );

  test("only general webservice results in no port", () => {
    const json = transformWebserviceForGraph(onlyGeneral);
    expect(json.params.length).toEqual(0);
    expect(json.ports.items.length).toEqual(0);
  });

  test("userdefined input result in input port", () => {
    const onlyInput = { ...onlyGeneral };
    onlyInput.inputs = [{ ...correctFileInput, userdefined: true }];

    const json = transformWebserviceForGraph(onlyInput);

    expect(json.params.length).toEqual(0);
    expect(json.ports.items.length).toEqual(1);
    expect(json.ports.items[0].group).toEqual(IN_PORT_CLASS);
  });

  //  @TODO - reset userdefined param
  // test("not userdefined input result in no input port", () => {
  //   const onlyInput = { ...onlyGeneral };
  //   const userdefinedInput = { ...correctFileInput };
  //   userdefinedInput.userdefined = false;
  //   onlyInput.inputs.push(userdefinedInput);

  //   const json = transformWebserviceForGraph(onlyInput);

  //   expect(json.params.length).toEqual(0);
  //   expect(json.ports.items.length).toEqual(0);
  // });

  test("output result in output port", () => {
    const onlyOutput = { ...onlyGeneral };
    onlyOutput.outputs = [correctFileOutput];

    const json = transformWebserviceForGraph(onlyOutput);

    expect(json.params.length).toEqual(0);
    expect(json.ports.items.length).toEqual(1);
    expect(json.ports.items[0].group).toEqual(OUT_PORT_CLASS);
  });

  test.todo("test with diff type inputs");

  test.todo("test with diff type outputs");
});
