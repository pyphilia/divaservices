import { isParamInput, isPort, isPortUserdefined } from "../src/js/utils";
import { Inputs } from "../src/js/constants";

const fileUserdefinedTrue = { type: Inputs.FILE.type, userdefined: true };
const webserviceFileUserdefinedTrue = { file: { userdefined: true } };
const folderUserdefinedTrue = { type: Inputs.FOLDER.type, userdefined: true };
const webserviceFolderUserdefinedTrue = { folder: { userdefined: true } };
const selectUserdefinedTrue = { type: Inputs.SELECT.type, userdefined: true };
const webserviceSelectUserdefinedTrue = { select: { userdefined: true } };
const numberUserdefinedTrue = { type: Inputs.NUMBER.type, userdefined: true };
const webserviceNumberUserdefinedTrue = { number: { userdefined: true } };

const fileUserdefinedFalse = { type: Inputs.FILE.type, userdefined: false };
const webserviceFileUserdefinedFalse = { file: { userdefined: false } };
const folderUserdefinedFalse = { type: Inputs.FOLDER.type, userdefined: false };
const webserviceFolderUserdefinedFalse = { folder: { userdefined: false } };
const selectUserdefinedFalse = { type: Inputs.SELECT.type, userdefined: false };
const webserviceSelectUserdefinedFalse = { select: { userdefined: false } };
const numberUserdefinedFalse = { type: Inputs.NUMBER.type, userdefined: false };
const webserviceNumberUserdefinedFalse = { number: { userdefined: false } };

describe("isParamInput", () => {
  test.each([
    selectUserdefinedFalse,
    webserviceSelectUserdefinedFalse,
    numberUserdefinedFalse,
    webserviceNumberUserdefinedFalse,
    selectUserdefinedTrue,
    webserviceSelectUserdefinedTrue,
    numberUserdefinedTrue,
    webserviceNumberUserdefinedTrue
  ])("returns true for params", e => {
    expect(isParamInput(e)).toBeTruthy();
  });
  test.each([
    fileUserdefinedFalse,
    webserviceFileUserdefinedFalse,
    folderUserdefinedFalse,
    webserviceFolderUserdefinedFalse,
    fileUserdefinedTrue,
    webserviceFileUserdefinedTrue,
    folderUserdefinedTrue,
    webserviceFolderUserdefinedTrue
  ])("returns false for ports", e => {
    expect(isParamInput(e)).toBeFalsy();
  });
});

describe("isPort", () => {
  test.each([
    selectUserdefinedFalse,
    webserviceSelectUserdefinedFalse,
    numberUserdefinedFalse,
    webserviceNumberUserdefinedFalse,
    selectUserdefinedTrue,
    webserviceSelectUserdefinedTrue,
    numberUserdefinedTrue,
    webserviceNumberUserdefinedTrue
  ])("returns false for params", e => {
    expect(isPort(e)).toBeFalsy();
  });

  test.each([
    fileUserdefinedFalse,
    webserviceFileUserdefinedFalse,
    folderUserdefinedFalse,
    webserviceFolderUserdefinedFalse,
    fileUserdefinedTrue,
    webserviceFileUserdefinedTrue,
    folderUserdefinedTrue,
    webserviceFolderUserdefinedTrue
  ])("returns true for ports", e => {
    expect(isPort(e)).toBeTruthy();
  });
});

describe("isPortUserdefined", () => {
  test.each([
    selectUserdefinedFalse,
    webserviceSelectUserdefinedFalse,
    numberUserdefinedFalse,
    webserviceNumberUserdefinedFalse,
    selectUserdefinedTrue,
    webserviceSelectUserdefinedTrue,
    numberUserdefinedTrue,
    webserviceNumberUserdefinedTrue
  ])("returns false for params", e => {
    expect(isPortUserdefined(e)).toBeFalsy();
  });

  test.each([
    fileUserdefinedFalse,
    webserviceFileUserdefinedFalse,
    folderUserdefinedFalse,
    webserviceFolderUserdefinedFalse
  ])("returns false for non userdefined ports", e => {
    expect(isPortUserdefined(e)).toBeFalsy();
  });

  test.each([
    fileUserdefinedTrue,
    webserviceFileUserdefinedTrue,
    folderUserdefinedTrue,
    webserviceFolderUserdefinedTrue
  ])("returns true for userdefined ports", e => {
    expect(isPortUserdefined(e)).toBeTruthy();
  });
});
