import { DIVA_SERVICES_API_URL } from "./constants";

const isNonPortInput = input => {
  return input.number || input.select;
};

export const computeBoxWidth = el => {
  const nameLength = el.general.name.length * 10;
  return 270 + nameLength;
};

export const computeBoxHeight = el => {
  const inputsHeight =
    el.input.filter(input => isNonPortInput(input)).length * 30;
  return 130 + inputsHeight;
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
