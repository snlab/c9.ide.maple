define(function(require, exports, module) {
  main.consumes = ["plugin.test", "maple"];
  main.provides = [];
  return main;

  function main(options, imports, register) {
    var test = imports["plugin.test"];
    var myplugin = imports.maple;

    var describe = test.describe;
    var it = test.it;
    var assert = test.assert;

    describe(myplugin.name, function(){
      // TODO: Test

    });

    register(null, {});

  }

});
