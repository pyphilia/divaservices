import { DIVA_SERVICES_API_URL, TOOLTIP_BREAK_LINE, Inputs } from "./constants";

export const isParamInput = input => {
  if (input.type) {
    return input.type == Inputs.SELECT.type || input.type == Inputs.NUMBER.type;
  }

  return input[Inputs.SELECT.type] || input[Inputs.NUMBER.type];
};

export const isPort = el => {
  if (el.type) {
    return el.type == Inputs.FILE.type || el.type == Inputs.FOLDER.type;
  }
  return el[Inputs.FILE.type] || el[Inputs.FOLDER.type];
};

export const isPortUserdefined = el => {
  if (el.type) {
    return (
      (el.type == Inputs.FILE.type || el.type == Inputs.FOLDER.type) &&
      el.userdefined
    );
  }
  return (
    (el[Inputs.FILE.type] || el[Inputs.FOLDER.type]) &&
    el[Object.keys(el)[0]].userdefined
  );
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
