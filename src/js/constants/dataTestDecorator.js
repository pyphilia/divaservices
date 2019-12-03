import { DATATEST_TYPE } from "./constants";
import xml2js from "xml2js";

const createXml2jsPromise = xml => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, async (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const dataTestDecorator = async xmlData => {
  const xml = await createXml2jsPromise(xmlData);

  const dataInputs = [];
  for (const {
    Name: [name],
    Output: [output]
  } of xml.DataTests.Data) {
    const data = { name, outputType: output.Type[0], category: DATATEST_TYPE };
    const mimeType = output.MimeType;
    if (output.MimeType) {
      data.mimeType = mimeType[0];
    }
    dataInputs.push(data);
  }
  return dataInputs;
};
