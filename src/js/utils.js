import { DIVA_SERVICES_API_URL, TOOLTIP_BREAK_LINE } from "./constants";

const isNonPortInput = input => {
  return input.number || input.select;
};

export const computeBoxWidth = el => {
  console.log("TCL: el", el);

  const InPortinputs = el.input
    .filter(input => isNonPortInput(input))
    .map(input => Object.values(input)[0].name.length);
  const inputDefaultWidth = Math.max(InPortinputs) * 4 || 0;
  const nameLength = el.general.name.length * 11;
  return 270 + nameLength + inputDefaultWidth;
};

export const computeBoxHeight = el => {
  const inputsHeight =
    el.input.filter(input => isNonPortInput(input)).length * 45;
  const ports = [
    ...el.input.filter(input => input.file),
    ...el.output.filter(input => input.file)
  ];
  console.log("TCL: ports", ports);
  // @TODO count input + output port
  return Math.max(40 + inputsHeight, ports.length * 50);
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
