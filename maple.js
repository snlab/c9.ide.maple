define(function(require, exports, module) {
  main.consumes = ["Plugin", "net", "menus", "ui", "commands", "terminal", "Dialog", "c9", "dialog.error", "proc", "util", "fs", "console"];
  main.provides = ["maple"];
  return main;

  function main(options, imports, register) {
    var Plugin = imports.Plugin;
    var net = imports.net;
    var menus = imports.menus;
    var ui = imports.ui;
    var c9 = imports.c9;
    var commands = imports.commands;
    var Dialog = imports.Dialog;
    var showError = imports["dialog.error"].show;
    var proc = imports.proc;
    var util = imports.util;
    var fs = imports.fs;
    var console = imports.console;
    // var ssh2 = require("./lib/ssh2.js");

    var join = require("path").join;
    var basename = require("path").basename;
    var dirname = require("path").dirname;

    var staticPrefix = options.staticPrefix;

    var TEMPLATES = {
      "mapleapp.v1": "Maple App Template 1.0",
      "magellan-dataflow-example": "Magellan Data Flow Analysis Example"
    };

    /***** Initialization *****/

    var plugin = new Plugin("snlab.org", main.consumes);
    var emit = plugin.getEmitter();

    function controller_manager() {
      commands.exec("openpreferences", null, {
        panel: "maple.manager",
        section: "Controller Manager"
      });
    }

    function mininet_manager() {
      commands.exec("openpreferences", null, {
        panel: "maple.manager",
        section: "Topology Manager"
      });
    }

    function createNewTemplate(template) {
      if (!template) return;

      var url = staticPrefix + "/" + join("templates", template + ".tar.gz");
      if (!url.match(/^http/))
        url = location.origin + url;

      function handleError(err) {
        showError("Could not create template.");
        console.error(err);
      }

      var tarPath = "/.tmp" + template + ".tar.gz";
      var tarPathAbsolute = c9.workspaceDir + tarPath;
      var templateDirAbsolute = c9.workspaceDir;

      // Download tar file with template for plugin
      proc.execFile("bash", {
        args: ["-c", [
          "mkdir", "-p", util.escapeShell(dirname(tarPathAbsolute)), ";",
          "curl", "-L", util.escapeShell(url), "-o", util.escapeShell(tarPathAbsolute)].join(" ")
              ]
      }, function(err, stderr, stdout) {
        if (err)
          return handleError(err);

        // Untar tar file
        proc.execFile("bash", {
          args: ["-c", ["tar", "-zxvf", util.escapeShell(tarPathAbsolute), "-C", util.escapeShell(templateDirAbsolute)].join(" ")]
                     }, function(err, stderr, stdout) {
                       if (err)
                         return handleError(err);

                       // Remove .tar.gz
                       fs.unlink(tarPath, function(err) {
                         if (err) throw err;
                       });
                     });
      });
    }

    function addMenuItems() {
      menus.addItemByPath("File/New Maple App", null, 220, plugin);
      Object.keys(TEMPLATES).forEach(function(name) {
        menus.addItemByPath("File/New Maple App/" + TEMPLATES[name], new ui.item({
          onclick: function() {
            createNewTemplate(name);
          }
        }), 230, plugin);
      });
      // menus.setRootMenu("Maple", 1000, plugin);
      menus.addItemByPath("Tools/Test SSH", new ui.item({
        command: "ssh_test_connection"
      }), 300, plugin);
      menus.addItemByPath("Tools/Maple", null, 400, plugin);
      menus.addItemByPath("Tools/Maple/Controller Manager", new ui.item({
        command: "controller_manager"
      }), 420, plugin);
      menus.addItemByPath("Tools/Maple/Mininet Manager", new ui.item({
        command: "mininet_manager"
      }), 430, plugin);
      menus.addItemByPath("Tools/~", new ui.divider(), 900, plugin);
    }

    function addNewCommand() {
      commands.addCommands([
        {
          name: "controller_manager",
          exec: controller_manager
        },
        {
          name: "mininet_manager",
          exec: mininet_manager
        }
      ], plugin);
    }

    function load() {

      // Add Test Item
      addMenuItems();

      // Add Test Command
      addNewCommand();
    }

    /***** Lifecycle *****/
    plugin.on("load", function() {
      load();
    });

    plugin.on("unload", function() {
      // Nothing to do
    });

    /***** Register and define API *****/
    register(null, {
      maple: plugin
    });
  }
});
