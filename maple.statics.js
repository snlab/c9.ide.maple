define(function(require, exports, modules) {
  "use strict";

  main.consumes = ["Plugin", "connect.static"];
  main.provides = ["maple.statics"];
  return main;

  function main(options, imports, register) {
    var Plugin = imports.Plugin;
    var statics = imports["connect.static"];

    /***** Initialization *****/

    var plugin = new Plugin("snlab.org", main.consumes);

    var loaded = false;
    function load() {
      if (loaded) return false;
      loaded = true;

      statics.addStatics([{
          path: __dirname + "/lib",
          mount: "/maple"
      }]);

      return loaded;
    }

    /***** Lifecycle *****/

    plugin.on("load", function(){
      load();
    });
    plugin.on("unload", function(){
      loaded = false;
    });

    /***** Register and define API *****/

    plugin.freezePublicAPI({});

    register(null, {
      "maple.statics": plugin
    });
  }
});
