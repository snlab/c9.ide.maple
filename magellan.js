define(function(require, exports, module) {
  main.consumes = ["Plugin", "net", "menus", "ui", "commands", "terminal", "Dialog", "c9", "dialog.file", "proc", "util", "fs", "console", "Form", "tabManager"];
  main.provides = ["magellan"];
  return main;

  function main(options, imports, register) {
    var Plugin = imports.Plugin;
    var c9 = imports.c9;
    var menus = imports.menus;
    var ui = imports.ui;
    var commands = imports.commands;
    var fileDialog = imports["dialog.file"];
    var Dialog = imports.Dialog;
    var Form = imports.Form;
    var proc = imports.proc;
    var tabManager = imports.tabManager;

    var join = require("path").join;
    var basename = require("path").basename;
    var dirname = require("path").dirname;
    var relative = require("path").relative;

    var buildform, dataflowform;

    /***** Initialization *****/

    var plugin = new Plugin("snlab.org", main.consumes);
    var emit = plugin.getEmitter();

    var buildSelector = new Dialog("snlab.org", main.consumes, {
      name: "magellan-build-selector",
      allowClose: true,
      modal: true,
      title: "Example Builder"
    });

    var generateDataFlow = new Dialog("snlab.org", main.consumes, {
      name: "magellan-generate-dataflow",
      allowClose: true,
      modal: true,
      title: "Generate Data Flow"
    });

    function addMenuItems() {
      menus.addItemByPath("Tools/Magellan", null, 500, plugin);
      menus.addItemByPath("Tools/Magellan/Build", new ui.item({
        command: "magellan_build_example"
      }), 520, plugin);
      menus.addItemByPath("Tools/Magellan/Generate Data Flow Graph", new ui.item({
        command: "magellan_generate_dataflow"
      }), 530, plugin);
    }

    function addNewCommand() {
      commands.addCommands([
        {
          name: "magellan_build_example",
          group: "Magellan",
          exec: magellanBuild
        },
        {
          name: "magellan_generate_dataflow",
          group: "Magellan",
          exec: magellanGenerate
        }
      ], plugin);
    }

    function load() {

      // Add Test Item
      addMenuItems();

      // Add Test Command
      addNewCommand();
    }

    /***** Methods *****/
    function magellanBuild() {
      buildSelector.show();
    }

    function magellanGenerate() {
      generateDataFlow.show();
    }

    /***** Lifecycle *****/
    buildSelector.on("draw", function(e) {
      buildform = new Form({
        rowHeight: 30,
        colwidth: 100,
        edge: "0 0 0 0",
        form: [
          {
            title: "Source Path",
            name: "sourcepath",
            message: "Input source path for compiling",
            realtime: true,
            type: "textbox"
          },
          {
            type: "button",
            title: "",
            caption: "Select",
            onclick: function() {
              fileDialog.show("Select Jave Source Path", "", function(path, stat, done) {
                done();
                buildform.getElement("sourcepath").childNodes[1].setAttribute("value", path);
              }, {}, {
                chooseCaption: "Select",
                hideFileInput: true
              });
            }
          },
          {
            title: "Source File",
            name: "sourcefile",
            message: "Input source file for compiling",
            realtime: true,
            type: "textbox"
          },
          {
            type: "button",
            title: "",
            caption: "Select",
            onclick: function() {
              fileDialog.show("Select Jave Source File", "", function(path, stat, done) {
                buildform.getElement("sourcefile").childNodes[1].setAttribute("value", path);
                done();
              }, {}, {
                createFolderButton: false,
                showFilesCheckbox: true,
                hideFileInput: false,
                chooseCaption: "Select"
              });
            }
          },
          {
            type: "submit",
            caption: "Build",
            margin: "10 20 5 20",
            width: 140,
            "default": true,
            onclick: function() {
              var args = buildform.toJson();
              proc.execFile("javac", {
                args: ["-sourcepath", join(c9.workspaceDir, args.sourcepath),
                       "-d", join(c9.workspaceDir, args.sourcepath, "../classes"), join(c9.workspaceDir, args.sourcefile)],
                cwd: c9.workspaceDir
              }, function(err, stdout, stderr) {
                if (err) throw err;
              });
              buildSelector.hide();
            }
          }
        ]
      });

      buildform.attachTo(e.html);
    });

    buildSelector.on("show", function() {
      buildform.reset();
    });

    generateDataFlow.on("draw", function(e) {
      dataflowform = new Form({
        rowHeight: 30,
        colwidth: 100,
        edge: "0 0 0 0",
        form: [
          {
            title: "Class Path",
            name: "classpath",
            message: "Class path of input class",
            realtime: true,
            type: "textbox"
          },
          {
            type: "button",
            title: "",
            caption: "Select",
            onclick: function() {
              fileDialog.show("Select Jave Class Path", "", function(path, stat, done) {
                done();
                dataflowform.getElement("classpath").childNodes[1].setAttribute("value", path);
              }, {}, {
                chooseCaption: "Select",
                hideFileInput: true
              });
            }
          },
          {
            title: "Class File",
            name: "classfile",
            message: "Input class file for dataflow generation",
            realtime: true,
            type: "textbox"
          },
          {
            type: "button",
            title: "",
            caption: "Select",
            onclick: function() {
              fileDialog.show("Select Jave Class File", "", function(path, stat, done) {
                dataflowform.getElement("classfile").childNodes[1].setAttribute("value", path);
                done();
              }, {}, {
                createFolderButton: false,
                showFilesCheckbox: true,
                hideFileInput: false,
                chooseCaption: "Select"
              });
            }
          },
          {
            title: "Stage Number",
            name: "stagenum",
            min: "1",
            realtime: true,
            type: "spinner"
          },
          {
            type: "submit",
            caption: "Build",
            margin: "10 20 5 20",
            width: 140,
            "default": true,
            onclick: function() {
              var args = dataflowform.toJson();
              var clazz = relative(args.classpath, args.classfile).replace(/\//g, ".");

              proc.execFile("java", {
                args: [
                  "-jar", join(c9.home, "lib", "magellan-dataflow.jar"),
                  "org.snlab.magellan.dataflow.SimulateStack",
                  join(c9.workspaceDir, args.classfile),
                  join(c9.workspaceDir, args.classfile),
                  args.stagenum
                ]
              }, function(err, stdout, stderr) {
                if (err) throw err;

                proc.execFile("java", {
                  args: [clazz.slice(0, clazz.lastIndexOf('.class'))],
                  cwd: join(c9.workspaceDir, args.classpath)
                }, function(err, stdout, stderr) {
                  if (err) throw err;
                  tabManager.open({
                    path: "DataFlowResult",
                    value: stdout,
                    active: true,
                    document: {
                      meta: {
                        newfile: true
                      }
                    }
                  }, function (err, tab) {
                    if (err) throw err;
                    tab.document.value = stdout;
                  });
                });
              });
              generateDataFlow.hide();
            }
          }
        ]
      });

      dataflowform.attachTo(e.html);
    });

    generateDataFlow.on("show", function() {
      dataflowform.reset();
    });

    plugin.on("load", function() {
      load();
    });

    plugin.on("unload", function() {
      // Nothing to do
    });

    /***** Register and define API *****/
    register(null, {
      magellan: plugin
    });
  }
});
