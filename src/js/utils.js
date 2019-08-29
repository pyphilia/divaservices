import { DIVA_SERVICES_API_URL, TOOLTIP_BREAK_LINE } from "./constants";

const isNonPortInput = input => {
  return input.type == "select" || input.type == "number";
};

const isPortInput = input => {
  return input.userdefined && (input.type == "file" || input.type == "folder");
};

const maxWidth = 650;
const titleFontSize = 18;

export const computeTitleLength = el => {
  const value = Math.min(el.label.length * titleFontSize, maxWidth);
  return { value, isCut: el.label.length * titleFontSize > maxWidth };
};

export const computeBoxWidth = el => {
  const paramNameLength = el.params
    .filter(x => isPortInput(x))
    .map(param => (param.name ? param.name.length : 0));

  const inputDefaultWidth = Math.max(...paramNameLength) * 25;

  const nameLength = computeTitleLength(el).value;

  return Math.min(Math.max(nameLength, inputDefaultWidth) + 200, maxWidth); // 200 = button and stuff width
};

const paramHeight = 55;

export const computeBoxHeight = el => {
  const inputsHeight =
    el.params.filter(x => isNonPortInput(x)).length * paramHeight;

  const inPorts = el.ports.items.length
    ? el.ports.items.filter(x => x.group == "in")
    : [];
  const outPorts = el.ports.items.length
    ? el.ports.items.filter(x => x.group == "out")
    : [];

  const maxPortEntry = Math.max(inPorts.length, outPorts.length);
  // @TODO count input + output port
  return Math.max(maxPortEntry * 50, inputsHeight);
};

export const getWebServices = async () => {
  const data = await fetch(DIVA_SERVICES_API_URL);
  const json = await data.json();
  return json;
};

export const getWebServiceFromUrl = async url => {
  const data = await fetch(url);
  const json = await data.json();
  return json;
};

export const objectToString = obj => {
  let str = "";
  for (let p in obj) {
    str += "- " + p + ":" + obj[p] + TOOLTIP_BREAK_LINE;
  }
  return str;
};
