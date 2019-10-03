import {
  addAction,
  clearHistory,
  undo,
  history,
  getHistory,
  getFuture,
  redo
} from "../src/js/utils/undo";
import { ACTION_ADD_ELEMENTS } from "../src/js/constants/actions";
jest.mock("../src/js/layout/minimap");
jest.mock("../src/js/layout/toolsbar");

describe("undo-redo (history)", () => {
  beforeEach(() => {
    clearHistory();
  });
  test("addAction add an history element", async () => {
    await addAction(ACTION_ADD_ELEMENTS);
    expect(getHistory().length).toEqual(1);
  });
  test("do and undo result in no history element", async () => {
    await addAction(ACTION_ADD_ELEMENTS);
    undo();
    expect(getHistory().length).toEqual(0);
  });
  test("2 addAction add 2 history elements", async () => {
    await addAction(ACTION_ADD_ELEMENTS);
    await addAction(ACTION_ADD_ELEMENTS);
    expect(getHistory().length).toEqual(2);
  });
  test("2 actions + undo + action removes future", async () => {
    await addAction(ACTION_ADD_ELEMENTS);
    await addAction(ACTION_ADD_ELEMENTS);
    undo();
    await addAction(ACTION_ADD_ELEMENTS);
    expect(getFuture().length).toEqual(0);
    expect(getHistory().length).toEqual(2);
  });
  test("2 actions + undo + redo + action", async () => {
    await addAction(ACTION_ADD_ELEMENTS);
    await addAction(ACTION_ADD_ELEMENTS);
    undo();
    redo();
    expect(getFuture().length).toEqual(0);
    expect(getHistory().length).toEqual(2);
  });
});
