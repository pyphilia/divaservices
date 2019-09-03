import xml2js from "xml2js";

export const saveWorkflow = jsonGraph => {
  const allPorts = {};

  const steps = { step: [] };
  // NODE
  jsonGraph.cells
    .filter(cell => cell.type != "standard.Link")
    .forEach((box, i) => {
      const id = box.id;
      const no = i;
      const name = box.type;
      const service = "";
      const params = { parameter: [], data: [] };
      for (const param in box.params) {
        const p = {
          name: param,
          value: box.params[param]
        };
        params.parameter.push(p);
      }

      box.ports.items.forEach(port => {
        allPorts[port.id] = {
          boxId: box.id,
          boxNo: i,
          name: port.name
        };
      });

      const step = { id, no, name, service, inputs: params };
      steps.step.push(step);
    });

  // LINK
  jsonGraph.cells
    .filter(cell => cell.type == "standard.Link")
    .forEach(link => {
      const targetPort = link.target.port;
      const targetBox = allPorts[targetPort];
      const targetWebservice = steps.step.filter(
        step => step.id == targetBox.boxId
      )[0];

      const sourcePort = link.source.port;
      const sourceBox = allPorts[sourcePort];
      const p = {
        name: sourceBox.name,
        value: {
          workflowStep: {
            ref: sourceBox.boxNo,
            ServiceOutputName: sourceBox.name
          }
        }
      };
      targetWebservice.inputs.data.push(p);
    });

  const id = 1;
  const information = "";
  const result = { id, information, steps };

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(result);

  //@TODO add xml headers

  console.log(xml);
};
