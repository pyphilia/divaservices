import { IN_PORT_CLASS, OUT_PORT_CLASS } from "../src/js/selectors";
import { transformWebserviceForGraph } from "../src/js/theme";

const none = {};
const empty = {
  general: {},
  input: [],
  output: []
};

const correctFileInput = {
  file: {
    name: "input",
    description: "desc",
    options: {
      required: true,
      mimeTypes: {
        allowed: ["image/png"],
        default: "ef"
      },
      userdefined: "true"
    }
  }
};

const correctFileOutput = {
  file: {
    name: "output",
    description: "desc",
    options: {
      mimeTypes: {
        allowed: ["image/png"],
        default: "ef"
      }
    }
  }
};

const noGeneral = {
  general: {},
  input: [correctFileOutput],
  output: [correctFileOutput]
};

const noInput = {
  general: { name: "noInput" },
  input: [],
  output: [correctFileOutput]
};

const noOutput = {
  general: { name: "noOutput" },
  input: [correctFileInput],
  output: []
};

const onlyGeneral = {
  general: {
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
  },
  input: [],
  output: []
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
    const userdefinedInput = { ...correctFileInput };
    userdefinedInput.file.userdefined = true;
    onlyInput.input.push(userdefinedInput);

    const json = transformWebserviceForGraph(onlyInput);

    expect(json.params.length).toEqual(0);
    expect(json.ports.items.length).toEqual(1);
    expect(json.ports.items[0].group).toEqual(IN_PORT_CLASS);
  });

  test("not userdefined input result in input port", () => {
    const onlyInput = { ...onlyGeneral };
    const userdefinedInput = { ...correctFileInput };
    userdefinedInput.file.userdefined = false;
    onlyInput.input.push(userdefinedInput);

    const json = transformWebserviceForGraph(onlyInput);

    expect(json.params.length).toEqual(0);
    expect(json.ports.items.length).toEqual(0);
  });

  test("output result in output port", () => {
    const onlyOutput = { ...onlyGeneral };
    onlyOutput.output.push(correctFileOutput);

    const json = transformWebserviceForGraph(onlyOutput);

    expect(json.params.length).toEqual(0);
    expect(json.ports.items.length).toEqual(1);
    expect(json.ports.items[0].group).toEqual(OUT_PORT_CLASS);
  });

  test.todo("test with diff type inputs");

  test.todo("test with diff type outputs");
});
