import xml2js from "xml2js";
import path from "path";
import { HOST } from "./constants";
import webservicesDecorator from "./webservicesDecorator";

export let webservices;

// init webservices from xml file
export const initWebservices = async () => {
  const filepath = path.join(HOST, "api/services.xml");

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

// array of selected elements
export let selectedElements = [];

// array of copied elements
export let copiedElements = [];

export const clearSelection = () => {
  selectedElements = [];
};

export const addToSelection = el => {
  if (selectedElements.indexOf(el) == -1) {
    selectedElements.push(el);
  }
};

export const setCopiedElements = () => {
  copiedElements = selectedElements;
};

// layout options
const DEFAULT_OPTIONS = {
  showParameters: true,
  showPortDetails: true,
  showPorts: true,
  showTooltips: true
};

export const getLayoutOptions = () => {
  return DEFAULT_OPTIONS;
};

export const changeShowPorts = value => {
  DEFAULT_OPTIONS.showPorts = value;
};

export const changeShowTooltips = value => {
  DEFAULT_OPTIONS.showTooltips = value;
};

export const changeShowPortDetails = value => {
  DEFAULT_OPTIONS.showPortDetails = value;
};

export const changeShowParameters = value => {
  DEFAULT_OPTIONS.showParameters = value;
};
