define(function(require, exports, module) {
    main.consumes = [
        "PreferencePanel", "settings", "ui", "util", "Form", "ext", "c9", "dialog.file",
        "dialog.alert", "dialog.confirm", "layout", "proc", "menus", "commands",
        "dialog.error", "dialog.info", "tree.favorites", "fs", "tree", "plugin.debug",
        "preferences.experimental", "Plugin", "Dialog", "Form", "Panel", "tabManager", "panels", "net", "vfs"
    ];
    main.provides = ["maple.manager"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var PreferencePanel = imports.PreferencePanel;
        var settings = imports.settings;
        var layout = imports.layout;
        var ui = imports.ui;
        var c9 = imports.c9;
        var menus = imports.menus;
        var fs = imports.fs;
        // var commands = imports.commands;
        var ext = imports.ext;
        var filetree = imports.tree;
        var proc = imports.proc;
        var util = imports.util;
        var Dialog = imports.Dialog;
        var Form = imports.Form;
        var Panel = imports.Panel;
        var tabManager = imports.tabManager;
        var panels = imports.panels;
        var dialogFile = imports["dialog.file"].tree;
        var dialog_file = imports["dialog.file"].show;
        // var qs = require("querystring");
        // var alert = imports["dialog.alert"].show;
        var favs = imports["tree.favorites"];
        var join = require("path").join;
        var basename = require("path").basename;
        var dirname = require("path").dirname;
        var staticPrefix = options.staticPrefix;
        var net = imports.net;
        var vfs = imports.vfs;
        // var architect;

        var CORE = {
            "c9.core": 1,
            "c9.fs": 1,
            "c9.ide.preferences": 1,
            "c9.ide.panels": 1,
            "c9.ide.plugins": 1,
            "c9.ide.login": 1,
            "c9.vfs.client": 1,
            "c9.ide.console": 1,
            "c9.ide.editors": 1,
            "c9.ide.dialog.common": 1,
            "c9.ide.dialog.file": 1,
            "c9.ide.dialog.login": 1,
            "c9.ide.errorhandler": 1,
            "c9.ide.help": 1,
            "c9.ide.keys": 1,
            "c9.ide.restore": 1,
            "c9.ide.watcher": 1,
            "c9.ide.tree": 1,
            "c9.ide.info": 1,
            "c9.ide.browsersupport": 1,
            "c9.ide.layout.classic": 1,
            "c9.ide.terminal": 1,
            "c9.ide.ace": 1,
            "c9.ide.clipboard": 1,
            "c9.nodeapi": 1
        };
        var GROUPS = {
            "custom": "Installed Plugins",
            "pre": "Pre-installed plugins",
            "core": "Core Plugins",
            "runtime": "Plugins created runtime"
        };
        var TEMPLATES = {
            "template1.0": "Maple Example",
            // "plugin.default": "Full Plugin",
            // "plugin.installer": "Installer Plugin",
            // "plugin.bundle": "Cloud9 Bundle"
        };

        var plugin = new Plugin("Ajax.org", main.consumes);


        /***** Methods *****/
        reloadModel();

        function reloadModel() {
            /***********new a maple menuitem to create maple app**************/
            Object.keys(TEMPLATES).forEach(function(name) {
                menus.addItemByPath("Maple/New Maple Policy/" + TEMPLATES[name], new ui.item({
                    onclick: function() {
                        alert(c9.workspaceDir);
                        createMapleApp(name);
                    }
                }), 1110, plugin);
            });

            ext.on("register", function() {
                setTimeout(reloadModel);
            });
        }

        /***********using dialog to create an maple app and set the project name**************/
        function createMapleApp(template) {
            var authform;
            authform = new Form({
                rowheight: 30,
                colwidth: 100,
                edge: "0 0 0 0",
                form: [{
                    title: "Project name",
                    name: "projectname",
                    type: "textbox",
                    message: "Hi! Please give your project a cute name.",
                    realtime: true

                }]

            });
            var jsonForm;
            var projectname;
            var dialog = new Dialog("Project Name", main.consumes, {
                name: "dialog",
                allowClose: true,
                modal: true,
                title: "Warm Reminder: Please set up the project name.",
                elements: [{
                    type: "button",
                    id: "cancel",
                    caption: "Cancel",
                    hotkey: "ESC",
                    onclick: function() {
                        dialog.hide();
                    }
                }, {
                    type: "button",
                    id: "ok",
                    caption: "OK",
                    color: "green",
                    "default": true,
                    onclick: function() {
                        //fs.rename(mapleDirAbsolute, c9.workspaceDir + projectnameinput,function(){});
                        jsonForm = authform.toJson();
                        projectname = jsonForm.projectname;
                        setProjectName(projectname);
                        alert(projectname);
                        dialog.hide();
                    }
                }]
            });
            dialog.on("draw", function(e) {
                authform.attachTo(e.html);
            });
            dialog.show();

            function setProjectName(name) {
                var pathAbsolute = "~/" + ".c9/plugins/maple/templates/template1.0/";
                alert(pathAbsolute);
                var mapleDir = "/" + name + "/";
                var mapleDirAbsolute = c9.workspaceDir + mapleDir;
                alert(pathAbsolute);
                alert("ready to mkdir: " + mapleDir);
                fs.mkdir(mapleDir, function(err) {
                    alert("Finished");
                    if (err) throw err;
                    alert("ready to copy, from: " + pathAbsolute + " ; to: " + mapleDirAbsolute);
                    proc.spawn("bash", {
                        args: ["-c", [
                            "cp", "-r", util.escapeShell(pathAbsolute), util.escapeShell(mapleDirAbsolute)
                        ].join(" ")]
                    }, function(err, process) {
                        if (err) throw err;
                        process.stdout.on("data", function(chunk) {
                            console.log(chunk);
                        });
                    });
                });
            }
        }
        // var readConfig;
        var jsonFile;
        var controllerIPAddress;
        var controllerPort;

        menus.addItemByPath("Maple/Maple Manager", new ui.item({
            caption: "dialog of files",
            onclick: function() {
                dialog_file("Select the controller(s) to connect", c9.workspaceDir, function(path, state, callback) {
                    alert(path);

                    fs.exists(join(path, "config.json"), function(exists, stat) {
                        if (exists) {
                            path = join(path, "config.json");
                        }
                        if (basename(path) == "config.json") {
                            fs.readFile(path, function(err, data) {
                                if (err) {
                                    throw err;
                                }
                                jsonFile = JSON.parse(data);
                                controllerIPAddress = jsonFile.controllerIPAddress;
                                alert(controllerIPAddress);
                                controllerPort = jsonFile.controllerPort;
                            });
                        }
                    });
                }, function() {}, {
                    "chooseCaption": "Choose",
                    "hideFileInput": true
                });
            }
        }), 1200, plugin);
        menus.addItemByPath("Maple/Build Maple App", new ui.item({
            caption: "build the maple app",
            onclick: function() {
                alert("build the Maple App");
            }
        }), 1300, plugin);
        menus.addItemByPath("Maple/Test Maple App", new ui.item({
            caption: "test the maple app",
            onclick: function() {
                alert("test the Maple App");
            }
        }), 1400, plugin);
        menus.addItemByPath("Maple/Test Maple App/New Mininet", new ui.item({
            caption: "Graphically Topo Test",
            command: "activateTesting"
        }), 1400, plugin);
        menus.addItemByPath("Maple/Test Maple App/Test in Mininet", new ui.item({
            caption: "Remote Termianl Mininet",
            onclick: function() {
                alert("test in mininet");
            }
        }), 1400, plugin);

        /***********set up several panels**************/
        // var panel_testing = new Panel("testingView", main.consumes, {
        //     caption: "Testing",
        //     index: 300,
        //     width: 500,
        //     minWidth: 500,
        //     where: "right",
        //     autohide: true
        // });
        //
        // panel_testing.on("draw", function(){
        //
        // });
        // panel_testing.on("load", function() {});
        // panel_testing.on("unload", function() {});
        //

        // function start_server(data) {
        //     panel_testing.on("draw", start_server(controllerIPAddress, controllerPort));
        //     commands.addCommand({
        //         name: "activateTesting",
        //         exec: function() {
        //             panel_testing.show();
        //         }
        //     }, commands);
        //
        //     panel_testing.on("load", function() {});
        //     panel_testing.on("unload", function() {});
        //     panel_testing.freezePublicAPI({});
        // }

        // proc.execFile("bash", {
        //     args: [
        //         "-c", [
        //             "cd", c9.workspaceDir + "/vxe-ui", ";",
        //             "node", "server.js", ";"
        //         ].join(" ")
        //     ]
        // }, function(err, process) {
        //     if (err) throw err;
        //     process.stdout.on("data", function(chunk) {
        //         console.log(chunk);
        //     });
        // });

        plugin.on("load", function() {
            // Any custom load code (most things are cleaned up automatically)
        });
        plugin.on("unload", function() {
            // Any custom unload code (most things are cleaned up automatically)
        });

        /***** Register and define API *****/

        plugin.freezePublicAPI({

        });

        register(null, {
            "maple.manager": plugin
        });
    }
});
