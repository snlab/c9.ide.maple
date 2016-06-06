define(function(require, exports, module) {
  main.consumes = [
    "Panel", "settings", "ui"
  ];
  main.provides = ["panelTracetree"];
  return main;

  function main(options, imports, register) {
    var Panel = imports.Panel;

    var panel = new Panel("snlab.org", main.consumes, {
      caption: "TraceTree",
      index: 100,
      width: 500,
      where: "right",
      autohide: true
    });

    /***** Initialization *****/

    /***** Methods *****/

    /***** Lifecycle *****/

    panel.on("draw", function(e) {
      e.html.innerHTML = '<iframe src="http://' + location.hostname + ':3000/" style="width:100%;height:100%;border:0px"></iframe>';
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
      "panelTracetree": panel
    });
  }
});
