define(function(require, exports, module) {
    main.consumes = [
        "PreferencePanel", "settings", "ui", "util", "Form", "ext", "c9",
        "dialog.alert", "dialog.confirm", "layout", "proc", "menus", "commands",
        "dialog.error", "dialog.info", "tree.favorites", "fs", "tree", "plugin.debug",
        "preferences.experimental", "Plugin","Dialog","Form"
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
        var tree = imports.tree;
        var proc = imports.proc;
        var util = imports.util;
        var Dialog = imports.Dialog;
        var Form = imports.Form;

        // var qs = require("querystring");
        // var alert = imports["dialog.alert"].show;

        var favs = imports["tree.favorites"];

        var join = require("path").join;
        var basename = require("path").basename;
        var dirname = require("path").dirname;
        var staticPrefix = options.staticPrefix;
        // var architect;

        var CORE = {
            "c9.core":1,"c9.fs":1,"c9.ide.preferences":1,"c9.ide.panels":1,
            "c9.ide.plugins":1,"c9.ide.login":1,"c9.vfs.client":1,
            "c9.ide.console":1,"c9.ide.editors":1,"c9.ide.dialog.common":1,
            "c9.ide.dialog.file":1,"c9.ide.dialog.login":1,"c9.ide.errorhandler":1,
            "c9.ide.help":1,"c9.ide.keys":1,"c9.ide.restore":1,"c9.ide.watcher":1,
            "c9.ide.tree":1, "c9.ide.info":1, "c9.ide.browsersupport":1,
            "c9.ide.layout.classic":1, "c9.ide.terminal":1, "c9.ide.ace":1,
            "c9.ide.clipboard":1, "c9.nodeapi":1
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

            Object.keys(TEMPLATES).forEach(function(name){
                menus.addItemByPath("Maple/New Maple Policy/" + TEMPLATES[name], new ui.item({
                    onclick: function(){
                        alert(c9.workspaceDir);
                        createMapleApp(name);
                    }
                }), 1110, plugin);
            });

            ext.on("register", function(){
                setTimeout(reloadModel);
            });
        }

        function createMapleApp(template){

            // var url = staticPrefix + "/" + join("templates", template);
            // if (!url.match(/^http/))
            //     url = location.origin + url;

            var authform;
            authform = new Form({
                rowheight: 30,
                colwidth: 100,
                edge: "0 0 0 0",
                form: [
                          {
                              title: "Project name",
                              name: "projectname",
                              type: "textbox",
                              message:"Hi! Please give your project a cute name.",
                              realtime: true

                          }
                      ]

            });
            var jsonForm;
            var projectname;
            var dialog = new Dialog("Project Name", main.consumes, {
                name: "dialog",
                allowClose: true,
                modal: true,
                title: "Warm Reminder: Please set up the project name.",
                elements: [
                    {
                        type: "button",
                        id: "cancel",
                        caption: "Cancel",
                        hotkey: "ESC",
                        onclick: function(){ dialog.hide();}
                    },
                    {
                        type: "button",
                        id: "ok",
                        caption: "OK",
                        color: "green",
                        "default": true,
                        onclick: function(){
                            //fs.rename(mapleDirAbsolute, c9.workspaceDir + projectnameinput,function(){});
                            jsonForm = authform.toJson();
                            projectname = jsonForm.projectname;
                            setProjectName(projectname);
                            alert(projectname);
                            dialog.hide();
                            // alert("breakpoint1!!");
                            // tree.refresh();
                            // alert("breakpoint2!!");
                            // tree.expandAndSelect("c9_workspace" + projectname);
                            // alert("breakpoint3!!");
                            // tree.expandAndSelect(mapleDirAbsolute);
                            // alert("breakpoint4!!");
                        }
                    }
                ]
            });
            dialog.on("draw", function(e){
                authform.attachTo(e.html);
            });
            dialog.show();
            tree.expandAndSelect("c9_workspace" + projectname);
            alert("breakpoint!!");

            // diadog.on("show", function(){
            //     alert("breakpoint1!!!");
            //     authform.reset();
            //     alert("breakpoint2!!!");
            // });
            function setProjectName(name){
                var pathAbsolute = "~/"+".c9/plugins/maple/templates/template1.0/";
                alert(pathAbsolute);
                var mapleDir = "/" + name + "/"/**"/maple_example/"**/;
                var mapleDirAbsolute = c9.workspaceDir + mapleDir;
                alert(pathAbsolute);
                alert("ready to mkdir: " + mapleDir);
                fs.mkdir(mapleDir, function (err) {
                    alert("Finished");
                    if (err) throw err;
                        alert("ready to copy, from: " + pathAbsolute + " ; to: " + mapleDirAbsolute);
                    proc.spawn("bash", {
                        args: ["-c", [
                        //"cp", "-r", util.escapeShell(pathAbsolute), util.escapeShell(mapleDirAbsolute)
                            "cp", "-r", util.escapeShell(pathAbsolute), util.escapeShell(mapleDirAbsolute)
                        ].join(" ")
                    ]
                }, function(err, process) {
                    if (err) throw err;

                    process.stdout.on("data", function(chunk) {
                        console.log(chunk);
                    });
                });
            });
          }

//             // fs.exists(path, function (exists) {
//             //     alert (exists);
//             //     if (exists) {
//                     //favs.addFavorite(dirname(mapleDir), "maple_example");
//                     /** show all the files of maple_example in Favorites**/
//                     //favs.addFavorite(mapleDir);
//                     //tree.expand(mapleDir, function() {
//                         //alert("call expand");
//                         //favs.addFavorite(mapleDir);
//                         // tree.select(/**Favorites path**/);
//                         // tree.select(favs.addFavorite(mapleDir)); // path || "/");
//                         // tree.scrollToSelection();
//                         //next();
//                     //}
//                     //);
//                     //tree.focus();
//                     //tree.expandAndSelect(mapleDir,"main.java"/**initial file**/);
//                 //}
//             //});
        }

        plugin.on("load", function(){
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
