define(function(require, exports, module) {
  main.consumes = ["PreferencePanel", "menus", "ui", "commands", "layout", "settings", "Dialog", "Form", "dialog.file", "fs", "vfs", "tabManager", "console"];
  main.provides = ["maple.manager"];
  return main;

  function main(options, imports, register) {
    var PreferencePanel = imports.PreferencePanel;
    var settings = imports.settings;
    var ui = imports.ui;
    var commands = imports.commands;
    var layout = imports.layout;
    var Dialog = imports.Dialog;
    var Form = imports.Form;
    var fileDialog = imports["dialog.file"];
    var fs = imports.fs;
    var vfs = imports.vfs;
    var tabManager = imports.tabManager;
    var console = imports.console;

    var Tree = require("ace_tree/tree");
    var TreeData = require("./mapledp");
    var TreeEditor = require("ace_tree/edit");

    var cdatagrid, tdatagrid, ccontainer, tcontainer, intro;
    var ctrlModel, ctrlform, topoModel;

    /***** Initialization *****/

    var plugin = new PreferencePanel("snlab.org", main.consumes, {
      caption: "Maple Manager",
      index: 400,
      form: true
    });

    var addCtrlDialog = new Dialog("snlab.org", main.consumes, {
      name: "add-ctrl-dialog",
      allowClose: true,
      modal: true,
      title: "Add Controller"
    });

    var loaded = false;
    function load() {
      if (loaded) return false;
      loaded = true;

      // Maple Manager Init
      commands.addCommands([
        {
          name: "ssh_test_connection",
          group: "Maple",
          exec: testSsh
        },
        {
          name: "add_controller",
          group: "Maple",
          exec: addController
        },
        {
          name: "import_controller",
          group: "Maple",
          exec: importController
        },
        {
          name: "import_topology",
          group: "Maple",
          exec: importTopology
        },
        {
          name: "select_maple_app",
          group: "Maple",
          exec: selectMapleApp
        }
      ], plugin);

      return loaded;
    }

    var drawn;
    function draw(e) {
      if (drawn) return;
      drawn = true;

      ctrlModel = new TreeData();
      ctrlModel.emptyMessage = "No controller to display";

      ctrlModel.columns = [{
        caption: "ID",
        value: "id",
        width: "100"
      }, {
        caption: "IP",
        value: "ip",
        width: "100"
      }, {
        caption: "SSH Port",
        value: "ssh_port",
        width: "100"
      }, {
        caption: "REST Port",
        value: "rest_port",
        width: "100"
      }, {
        caption: "Login Name",
        value: "login",
        width: "100"
      }, {
        caption: "Password",
        getText: function(p) {
          return "********";
        },
        width: "100"
      }, {
        caption: "Status",
        value: "status",
        width: "100"
      }];

      topoModel = new TreeData();
      topoModel.emptyMessage = "No test topology store";

      topoModel.columns = [{
        caption: "Topology Name",
        value: "name",
        width: "150"
      }, {
        caption: "Switch Number",
        value: "switch_num",
        width: "150"
      }, {
        caption: "Host Number",
        value: "host_num",
        width: "150"
      }, {
        caption: "Link Number",
        value: "link_num",
        width: "150"
      }];

      layout.on("eachTheme", function(e){
        var height = parseInt(ui.getStyleRule(".bar-preferences .blackdg .tree-row", "height"), 10) || 24;
        ctrlModel.rowHeightInner = height;
        ctrlModel.rowHeight = height;
        topoModel.rowHeightInner = height;
        topoModel.rowHeight = height;

        if (e.changed) {
          cdatagrid.resize(true);
          tdatagrid.resize(true);
        }
      });

      reloadCtrlModel();
      reloadTopoModel();

      plugin.form.add([
        {
          type: "custom",
          title: "Introduction:",
          position: 20,
          node: intro = new ui.bar({
            "class": "intro",
            style: "padding:12px;position:relative;"
          })
        }], plugin);

      plugin.add({
        "Maple": {
          position: 10,
          "Controller Manager": {
            position: 200,
            "Controller Manager": {
              type: "custom",
              title: "Controller Manager",
              position: 30,
              node: ccontainer = new ui.bar({
                style: "padding:10px"
              })
            }
          },
          "Topology Manager": {
            position: 300,
            "Topology Manager": {
              type: "custom",
              title: "Topology Manager",
              position: 30,
              node: tcontainer = new ui.bar({
                style: "padding:10px"
              })
            }
          }
        }
      }, plugin);

      intro.$int.innerHTML =
        '<h1>Maple Manager</h1>'
        + '<p>Change these settings to configure controller management and network management.</p>'
        + '<p class="hint">Hint: Double click on the password cell in the table below to change the password.</p>';

      var cdiv = ccontainer.$ext.appendChild(document.createElement("div"));
      cdiv.style.width = "100%";
      cdiv.style.height = "200px";
      cdiv.style.marginTop = "50px";

      cdatagrid = new Tree(cdiv);
      cdatagrid.setTheme({ cssClass: "blackdg" });
      cdatagrid.setDataProvider(ctrlModel);

      var tdiv = tcontainer.$ext.appendChild(document.createElement("div"));
      tdiv.style.width = "100%";
      tdiv.style.height = "200px";
      tdiv.style.marginTop = "50px";

      tdatagrid = new Tree(tdiv);
      tdatagrid.setTheme({ cssClass: "blackdg" });
      tdatagrid.setDataProvider(topoModel);

      layout.on("resize", function() {
        cdatagrid.resize();
        tdatagrid.resize();
      }, plugin);

      function setTheme(e) {
        // TODO
      }
      layout.on("themeChange", setTheme);
      setTheme({ theme: settings.get("user/general/@skin") });

      ccontainer.on("contextmenu", function() {
        return false;
      });

      tcontainer.on("contextmenu", function() {
        return false;
      });

      cdatagrid.on("mousemove", function() {
        cdatagrid.resize(true);
      });

      tdatagrid.on("mousemove", function() {
        tdatagrid.resize(true);
      });

      cdatagrid.on("delete", function() {
        var nodes = cdatagrid.selection.getSelectedNodes();
        nodes.forEach(function (node) {
          removeController(node.id);
          reloadCtrlModel();
        });
      });

      tdatagrid.on("delete", function() {
        var nodes = tdatagrid.selection.getSelectedNodes();
        nodes.forEach(function (node) {
          removeTopology(node.name);
          reloadCtrlModel();
        });
      });

      new ui.hbox({
        htmlNode: cdiv.parentNode,
        style: "position:absolute;top:10px;",
        padding: 5,
        childNodes: [
          new ui.button({
            caption: "Add",
            skin: "btn-default-css3",
            class: "dark",
            onclick: function() {
              commands.exec("add_controller");
            }
          }),
          new ui.button({
            caption: "Remove",
            skin: "btn-default-css3",
            class: "btn-red",
            onclick: function() {
              cdatagrid.execCommand("delete");
            }
          }),
          new ui.button({
            caption: "Import from File",
            skin: "btn-default-css3",
            class: "btn-green",
            onclick: function() {
              commands.exec("import_controller");
            }
          }),
          new ui.button({
            caption: "Open Karaf",
            skin: "btn-default-css3",
            class: "dark",
            onclick: function() {
              var item = cdatagrid.selection.getCursor();
              commands.exec("ssh_test_connection", item);
            }
          }),
          new ui.button({
            caption: "Deploy Maple App",
            skin: "btn-default-css3",
            class: "dark",
            onclick: function() {
              var item = cdatagrid.selection.getCursor();
              commands.exec("select_maple_app", item);
            }
          })
        ]
      });

      new ui.hbox({
        htmlNode: tdiv.parentNode,
        style: "position:absolute;top:10px;",
        padding: 5,
        childNodes: [
          new ui.button({
            caption: "Remove",
            skin: "btn-default-css3",
            class: "btn-red",
            onclick: function() {
              tdatagrid.execCommand("delete");
            }
          }),
          new ui.button({
            caption: "Import from File",
            skin: "btn-default-css3",
            class: "btn-green",
            onclick: function() {
              commands.exec("import_topology");
            }
          })
        ]
      });
    }

    /***** Methods *****/

    function reloadCtrlModel() {
      if (!ctrlModel) return;

      var ctrl_list = settings.getJson("project/maple/controllers") || {};
      var nodes = Object.keys(ctrl_list).map(function(name) {
        return ctrl_list[name];
      }).sort();

      ctrlModel.setRoot({children : nodes});
    }

    function testSsh(controller) {
      var ctrl_ip = controller['ip'] || '192.168.1.25';
      var ctrl_port = controller['ssh_port'] || 8101;
      var ctrl_login = controller['login'] || 'karaf';
      var ctrl_passwd = controller['password'] || 'karaf';

      tabManager.open({
        editorType: "terminal",
        pane: console.getPanes()[0],
        active: true,
        focus: true,
        document: {
          title: "ODL - " + controller.id,
          tooltip: "OpenDaylight Karaf - " + controller.id
        }
      }, function(err, tab) {
        if (err) throw err;

        var terminal = tab.editor;
        terminal.write("sshpass -p" + ctrl_passwd + " ssh -oHostKeyAlgorithms=+ssh-dss " + ctrl_login + "@" + ctrl_ip + " -p " + ctrl_port + "\n");

        bindController(tab.name, controller.id);
        tab.on("close", function(e) {
          unbindController(controller.id);
        });
      });
    }

    function addController() {
      addCtrlDialog.show();
    }

    function importController() {
      fileDialog.show("Select a JSON File", "", function(path, stat, done) {
        fs.readFile(path, function(err, data) {
          if (err) throw err;

          if (path.split(".").pop() === "json") {
            insertController(JSON.parse(data));
            reloadCtrlModel();
          }
          fileDialog.hide();
        });
      }, {}, {
        createFolderButton: false,
        showFilesCheckbox: true,
        hideFileInput: false,
        chooseCaption: "Import"
      });
    }

    function removeController(id) {
      var ctrl_list = settings.getJson("project/maple/controllers");
      if (!ctrl_list) return;

      delete ctrl_list[id];
      settings.setJson("project/maple/controllers", ctrl_list);

      unbindController(id);
    }

    function insertController(controller) {
      if (controller.id) {
        var ctrl_list = settings.getJson("project/maple/controllers") || {};
        controller.ip = controller.ip || "localhost";
        controller.ssh_port = controller.ssh_port || 8101;
        controller.rest_port = controller.rest_port || 8181;
        controller.login = controller.login || "karaf";
        controller.password = controller.password || "karaf";
        controller.status = controller.status || "Unknown";
        ctrl_list[controller.id] = controller;
        settings.setJson("project/maple/controllers", ctrl_list);
      }
    }

    function bindController(tab_name, ctrl_id) {
      var ctrl_list = settings.getJson("project/maple/controllers") || {};
      ctrl_list[ctrl_id].tab = tab_name;
      ctrl_list[ctrl_id].status = "Connecting";
      settings.setJson("project/maple/controllers", ctrl_list);
      reloadCtrlModel();
    }

    function unbindController(ctrl_id) {
      var ctrl_list = settings.getJson("project/maple/controllers") || {};
      delete ctrl_list[ctrl_id].tab;
      ctrl_list[ctrl_id].status = "Unknown";
      settings.setJson("project/maple/controllers", ctrl_list);
      reloadCtrlModel();
    }

    function reloadTopoModel() {
      if (!topoModel) return;

      var topo_list = settings.getJson("project/maple/topologies") || {};
      var nodes = Object.keys(topo_list).map(function(name) {
        return topo_list[name];
      }).sort();

      topoModel.setRoot({children : nodes});
    }

    function importTopology() {
      fileDialog.show("Select a JSON File", "", function(path, stat, done) {
        fs.readFile(path, function(err, data) {
          if (err) throw err;

          if (path.split(".").pop() === "json") {
            insertTopology(JSON.parse(data));
            reloadTopoModel();
          }
          fileDialog.hide();
        });
      }, {}, {
        createFolderButton: false,
        showFilesCheckbox: true,
        hideFileInput: false,
        chooseCaption: "Import"
      });
    }

    function removeTopology(name) {
      var topo_list = settings.getJson("project/maple/topologies");
      if (!topo_list) return;

      delete topo_list[name];
      settings.setJson("project/maple/topologies", topo_list);
    }

    function insertTopology(topology) {
      if (topology.name) {
        var topo_list = settings.getJson("project/maple/topologies") || {};
        topology.switch_num = topology.nodes.filter(function(node) {
          return node.type === "switch";
        }).length;
        topology.host_num = topology.nodes.filter(function(node) {
          return node.type === "host";
        }).length;
        topology.link_num = topology.links.length;
        topo_list[topology.name] = topology;
        settings.setJson("project/maple/topologies", topo_list);
      }
    }

    function selectMapleApp(controller) {
      fileDialog.show("Select a bundle or kar", "", function(path, stat, done) {
        fs.readFile(path, function(err, data) {
          if (err) throw err;

          var ext = path.split(".").pop();
          if (ext === "jar") {
            deployMapleAppFromBundle(controller, path);
          } else if (path === "kar") {
            deployMapleAppFromKar(controller, path);
          }
          fileDialog.hide();
        });
      }, {}, {
        createFolderButton: false,
        shohwFilesCheckbox: true,
        hideFileInput: false,
        chooseCaption: "Import"
      });
    }

    function deployMapleAppFromBundle(controller, path) {
      // TODO: deploy mapleapp.jar
      alert(vfs.url(path) + "\nid: " + controller.id + "\ntab: " + controller.tab);
    }

    function deployMapleAppFromKar(controller, path) {
      // TODO: deploy mapleapp.kar
      alert(vfs.url(path) + "\nid: " + controller.id + "\ntab: " + controller.tab);
    }

    /***** Lifecycle *****/

    settings.on("read", function() {
      settings.setDefaults("project/maple/controllers", []);
      settings.setDefaults("project/maple/topologies", []);
    });

    addCtrlDialog.on("draw", function(e) {
      ctrlform = new Form({
        rowHeight: 30,
        colwidth: 100,
        edge: "0 0 0 0",
        form: [
          {
            title: "Controller ID",
            name: "id",
            type: "textbox"
          },
          {
            title: "IP Address",
            name: "ip",
            defaultValue: "localhost",
            type: "textbox"
          },
          {
            title: "SSH Port",
            name: "ssh_port",
            defaultValue: 8101,
            type: "textbox"
          },
          {
            title: "REST Port",
            name: "rest_port",
            defaultValue: 8181,
            type: "textbox"
          },
          {
            title: "Login Name",
            name: "login",
            defaultValue: "karaf",
            type: "textbox"
          },
          {
            title: "Password",
            name: "password",
            defaultValue: "karaf",
            type: "password"
          },
          {
            type: "submit",
            caption: "OK",
            margin: "10 20 5 20",
            width: 140,
            "default": true,
            onclick: function() {
              var controller = ctrlform.toJson();
              insertController(controller);
              addCtrlDialog.hide();
              reloadCtrlModel();
            }
          }
        ]
      });

      ctrlform.attachTo(e.html);
    });

    addCtrlDialog.on("show", function() {
      ctrlform.reset();
    });

    plugin.on("load", function() {
      load();
    });

    plugin.on("draw", function(e) {
      draw(e);
    });

    plugin.on("activate", function(e) {
      if (!drawn) return;

      cdatagrid.resize();
      tdatagrid.resize();
    });

    plugin.on("resize", function(e) {
      cdatagrid && cdatagrid.resize();
      tdatagrid && tdatagrid.resize();
    });

    plugin.on("unload", function() {
      loaded = false;
      drawn = false;

      ctrlModel = null;
      topoModel = null;
      cdatagrid = null;
      tdatagrid = null;
      ccontainer = null;
      intro = null;
    });

    /***** Register and define API *****/

    register(null, {
      "maple.manager": plugin
    });
  }
});
