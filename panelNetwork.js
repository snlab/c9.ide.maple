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
      e.html.innerHTML = '<iframe src="https://sdnlab.hep.caltech.edu/" style="width:100%;height:100%;border:0px"></iframe><a href="https://sdnlab.hep.caltech.edu/" target="_blank" style="background-color:skyblue;color:blue;margin:0 5px;padding:5px;text-decoration:none;font-size:20px;position:absolute;bottom:0;right:0;">Fullscreen</a>';
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
