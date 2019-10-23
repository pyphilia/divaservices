import { DATATEST_TYPE } from "./constants";

export const dataTestDecorator = xml => {
  const dataInputs = [];
  for (const {
    Name: [name],
    Output: [output]
  } of xml.DataTests.Data) {
    const data = { name, outputType: output.Type[0], type: DATATEST_TYPE };
    const mimeType = output.MimeType;
    if (output.MimeType) {
      data.mimeType = mimeType[0];
    }
    dataInputs.push(data);
  }
  return dataInputs;
};
