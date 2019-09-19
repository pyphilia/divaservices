import * as $ from "jquery";

export const fireAlert = (className, text) => {
  const alert = $(`<div/>`, {
    class: `alert alert-${className}`,
    role: "alert",
    text
  });
  $("html").append(alert);
  alert.delay(1500).fadeTo(700, 0, function() {
    $(this).remove();
  });
};
