/**
 * Set the data-md-color-scheme property on the body element to "slate" or "default"
 * depending on the browser's preferred color scheme.
 */

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function (e) {
    var colorScheme = "default";
    var colorPrimary = "teal";
    var colorAccent = "indigo";
    if (e.matches) {
      colorScheme = "slate";
      colorPrimary = "blue";
      colorAccent = "indigo";
    }
    document.body.setAttribute("data-md-color-switching", "")
    document.body.setAttribute("data-md-color-scheme", colorScheme);
    document.body.setAttribute("data-md-color-primary", colorPrimary);
    document.body.setAttribute("data-md-color-accent", colorAccent);
    document.getElementById("__palette_1").nextElementSibling.hidden = false;
    document.getElementById("__palette_2").nextElementSibling.hidden = true;
    document.body.removeAttribute("data-md-color-switching")
  });

window
.matchMedia("(prefers-color-scheme: light)")
.addEventListener("change", function (e) {
  var colorScheme = "slate";
  var colorPrimary = "blue";
  var colorAccent = "indigo";
  if (e.matches) {
    colorScheme = "default";
    colorPrimary = "teal";
    colorAccent = "indigo";
  }
  document.body.setAttribute("data-md-color-switching", "")
  document.body.setAttribute("data-md-color-scheme", colorScheme);
  document.body.setAttribute("data-md-color-primary", colorPrimary);
  document.body.setAttribute("data-md-color-accent", colorAccent);
  document.getElementById("__palette_2").nextElementSibling.hidden = false;
  document.getElementById("__palette_1").nextElementSibling.hidden = true;
  document.body.removeAttribute("data-md-color-switching", "")
});