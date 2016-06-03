define(function(require, exports, module) {
  main.consumes = [
    "Panel", "ui"
  ];
  main.provides = ["panelMininet"];
  return main;

  function main(options, imports, register) {
    var Panel = imports.Panel;

    var staticPrefix = options.staticPrefix;

    var panel = new Panel("mininetView", main.consumes, {
      caption: "Mininet",
      index: 300,
      width: 500,
      minWidth: 500,
      where: "right",
      autohide: true
    });

    /***** Initialization *****/

    /***** Methods *****/

    /***** Lifecycle *****/

    panel.on("draw", function(e) {
      e.html.innerHTML = "<iframe src='" + location.origin + staticPrefix + "/maple/mininet-creator/index.html' style='width:100%;height:100%;border:0px' ></iframe>";
    });

    panel.on("load", function() {
      // Nothing to do
    });

    panel.on("unload", function() {
      // Nothing to do
    });

    /***** Register and define API *****/

    panel.freezePublicAPI({
    });

    register(null, {
      "panelMininet": panel
    });
  }
})
