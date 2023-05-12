/**
 * Set the data-md-color-scheme property on the body element to "slate" or "default"
 * depending on the browser's preferred color scheme.
 */

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function (e) {
    var colorScheme = "default";
    if (e.matches) {
      colorScheme = "slate";
    }
    document.body.setAttribute("data-md-color-scheme", colorScheme);
  });
