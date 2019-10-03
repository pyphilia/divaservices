import xml2js from "xml2js";
import path from "path";
import { HOST, WEBSERVICES_XML } from "../../config";
import webservicesDecorator from "./webservicesDecorator";

export let webservices;

// init webservices from xml file
export const initWebservices = async () => {
  const filepath = path.join(HOST, WEBSERVICES_XML);

  const response = await fetch(filepath);
  const xml = await response.text();
  const xml2jsPromise = new Promise((resolve, reject) => {
    xml2js.parseString(xml, async (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  const data = await xml2jsPromise;

  console.log("---- webservices initialized");

  webservices = webservicesDecorator(data);
};
