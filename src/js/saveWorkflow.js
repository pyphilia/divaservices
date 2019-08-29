import xml2js from "xml2js";
import fs from "fs";

export const saveWorkflow = jsonGraph => {
  const steps = { step: [] };
  // NODE
  jsonGraph.cells
    .filter(cell => cell.type != "standard.Link")
    .forEach(box => {
      const id = box.id;
      const name = box.type;
      const service = "";
      const params = { parameter: [] };
      for (const param in box.params) {
        const p = {
          name: param,
          value: box.params[param]
        };
        params.parameter.push(p);
      }
      const inputs = params;
      const step = { id, name, service, inputs };
      steps.step.push(step);
    });

  // LINK
  jsonGraph.cells.filter(cell => cell.type == "standard.Link");
  // .forEach(link => {});

  const id = 1;
  const information = "";
  const result = { id, information, steps };

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(result);

  fs.writeFile("../tmp/test.xml", xml, function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
};
