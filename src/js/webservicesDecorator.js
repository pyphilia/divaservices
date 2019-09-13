const getTypeName = type => {
  if (type.File) {
    const {
      MimeTypes: [mimeTypes]
    } = type.File[0];
    return { type: "file", allowed: mimeTypes.Allowed };
  } else if (type.Folder) {
    return { type: "folder" };
  } else if (type.EnumeratedType) {
    const {
      Default: [defaultValue],
      Value
    } = type.EnumeratedType[0];
    return {
      defaultValue,
      values: Value,
      type: "select"
    };
  } else if (type.StepNumberType) {
    const { Default, Min, Max, Step } = type.StepNumberType[0];
    const res = {
      type: "number",
      values: {}
    };
    if (Min) {
      res.values.min = Min[0];
    }
    if (Max) {
      res.values.max = Max[0];
    }
    if (Step) {
      res.values.step = Step[0];
    }
    if (Default) {
      res.defaultValue = Default[0];
    }
    return res;
  }
};

const webservicesDecorator = xml => {
  console.log(xml.Services.Service);

  const json = [];
  // const data = await xml.json();
  for (const algoData of xml.Services.Service) {
    const {
      Id: [id],
      Information: [information],
      API: [api]
    } = algoData;
    const {
      Name: [name],
      Description: [description],
      Type: [type]
    } = information;
    const {
      Inputs: [inputsData],
      Outputs: [outputsData]
    } = api;
    const { Data, Parameter } = inputsData;

    const inputs = [];
    if (Data) {
      for (const paramData of Data) {
        const {
          Description: [description],
          Name: [name],
          Type: [typeData]
        } = paramData;
        const { type, allowed } = getTypeName(typeData);
        const param = {
          description,
          name,
          type,
          mimeTypes: { allowed }
        };
        inputs.push(param);
      }
    }

    // console.log('parametres');
    if (Parameter) {
      for (const parameter of Parameter) {
        const {
          Description: [description],
          Name: [name],
          Type: [typeData]
        } = parameter;
        const { type, defaultValue, values } = getTypeName(typeData);
        const param = {
          description,
          name,
          type,
          values,
          defaultValue
        };
        inputs.push(param);
      }
    }

    const outputs = [];
    if (outputsData) {
      for (const output of outputsData.Output) {
        const {
          Description: [description],
          Name: [name],
          Type: [typeData]
        } = output;
        const { type, allowed } = getTypeName(typeData);
        const out = {
          description,
          name,
          type,
          mimeTypes: { allowed }
        };
        outputs.push(out);
      }
    }

    const algo = {
      id: parseInt(id),
      name,
      type,
      description,
      inputs,
      outputs
    };

    json.push(algo);
  }
  return json;
};

export default webservicesDecorator;
