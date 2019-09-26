import {
  addAction,
  clearHistory,
  undo,
  history,
  getHistory,
  getFuture,
  redo
} from "../src/js/utils/undo";
import { ACTION_PASTE } from "../src/js/constants/actions";
jest.mock("../src/js/layout/minimap");

describe("undo-redo (history)", () => {
  beforeEach(() => {
    clearHistory();
  });
  test("addAction add an history element", async () => {
    await addAction(ACTION_PASTE);
    expect(getHistory().length).toEqual(1);
  });
  test("do and undo result in no history element", async () => {
    await addAction(ACTION_PASTE);
    undo();
    expect(getHistory().length).toEqual(0);
  });
  test("2 addAction add 2 history elements", async () => {
    await addAction(ACTION_PASTE);
    await addAction(ACTION_PASTE);
    expect(getHistory().length).toEqual(2);
  });
  test("2 actions + undo + action removes future", async () => {
    await addAction(ACTION_PASTE);
    await addAction(ACTION_PASTE);
    undo();
    await addAction(ACTION_PASTE);
    expect(getFuture().length).toEqual(0);
    expect(getHistory().length).toEqual(2);
  });
  test("2 actions + undo + redo + action", async () => {
    await addAction(ACTION_PASTE);
    await addAction(ACTION_PASTE);
    undo();
    redo();
    expect(getFuture().length).toEqual(0);
    expect(getHistory().length).toEqual(2);
  });
});