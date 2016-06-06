define(function(require, exports, module) {
  main.consumes = [
    "Panel", "settings", "ui"
  ];
  main.provides = ["panelNetwork"];
  return main;

  function main(options, imports, register) {
    var Panel = imports.Panel;

    var panelNetwork = new Panel("snlab.org", main.consumes, {
      caption: "Network",
      index: 100,
      width: 500,
      where: "right",
      autohide: true
    });

    /***** Initialization *****/

    /***** Methods *****/

    /***** Lifecycle *****/

    panelNetwork.on("draw", function(e) {
      e.html.innerHTML = '<iframe src="https://sdnlab.hep.caltech.edu/" style="width:100%;height:100%;border:0px"></iframe>';
    });

    panelNetwork.on("load", function() {
      // Nothing to do
    });

    panelNetwork.on("unload", function() {
      // Nothing to do
    });

    /***** Register and define API *****/

    panelNetwork.freezePublicAPI({
    });

    register(null, {
      "panelNetwork": panelNetwork
    });
  }
});
