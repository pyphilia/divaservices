export const equalObjects = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const shortcutToString = shortcut => {
  if (!shortcut) {
    return "";
  }

  const { ctrl, key, shift } = shortcut;
  let string = key;
  if (shift) {
    string = "Shift+" + string;
  }
  if (ctrl) {
    string = "Ctrl+" + string;
  }
  return "(" + string + ")";
};
