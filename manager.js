define(function(require, exports, module) {
    main.consumes = [
        "PreferencePanel", "settings", "ui", "util", "Form", "ext", "c9",
        "dialog.alert", "dialog.confirm", "layout", "proc", "menus", "commands",
        "dialog.error", "dialog.info", "tree.favorites", "fs", "tree", "plugin.debug",
        "preferences.experimental"
    ];
    main.provides = ["maple.manager"];
    return main;
   
   function main(options, imports, register) {
        var PreferencePanel = imports.PreferencePanel;
        var settings = imports.settings;
        var layout = imports.layout;
        var ui = imports.ui;
        var c9 = imports.c9;
        var menus = imports.menus;
        var fs = imports.fs;
        var commands = imports.commands;
        var ext = imports.ext;
        var tree = imports.tree;
        var proc = imports.proc;
        var util = imports.util;
        var qs = require("querystring");
        var alert = imports["dialog.alert"].show;
        var confirm = imports["dialog.confirm"].show;
        var showError = imports["dialog.error"].show;
        var showInfo = imports["dialog.info"].show;
        var favs = imports["tree.favorites"];
        var pluginDebug = imports["plugin.debug"];
        var experimental = imports["preferences.experimental"];

        var search = require("../c9.ide.navigate/search");
        var Tree = require("ace_tree/tree");
        var TreeData = require("./managerdp");
        var join = require("path").join;
        var basename = require("path").basename;
        var dirname = require("path").dirname;

        var staticPrefix = options.staticPrefix;
        var architect;

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
        /**var ENABLED = c9.location.indexOf("debug=2") > -1
            || experimental.addExperiment(
                  "plugin-manager",
                  options.devel,
                  "SDK/Plugin Manager"
               );**/

        var plugin = new PreferencePanel("Ajax.org", main.consumes, {
            caption: "Maple Manager",
            className: /**"plugins"**/"maple",
            form: false,
            noscroll: true,
            index: 1100
        });
        
        plugin.on("load", createMapleApp());
        plugin.on("unload", function(e) {
            // Any custom unload code (most things are cleaned up automatically)
        });

        var model, datagrid, filterbox;
        var btnUninstall, btnReport, btnReadme, btnCloud9, btnReload;

        /**var loaded = false;
        function load() {
            if (loaded) return false;
            loaded = true;

            if (!ENABLED) return;**/

        /***** Methods *****/
        function reloadModel() {
            // if (!model) return;

            // var groups = {};
            // var packages = {};
            // var root = [];
            
            Object.keys(TEMPLATES).forEach(function(name){
                menus.addItemByPath("Maple/New Maple Policy/" + TEMPLATES[name], new ui.item({
                    onclick: function(){
                        createMapleApp(name);
                    }
                }), 1110, plugin);
            });
            
            ext.on("register", function(){
                setTimeout(reloadModel);
            });
        };
        
        
        function createMapleApp(template){
            /**if (!template)
                template = "c9.ide.default";**/

            var url = staticPrefix + "/" + join("templates", template/** + ".tar.gz"**/);
            if (!url.match(/^http/))
                url = location.origin + url;

            // function getPath(callback, i){
            //     i = i || 0;
            var path = join("~", ".c9/maple/", template);
            //     fs.exists(path, function(exists){
            //         if (exists) return getPath(callback, i+1);
            //         callback(null, path);
            //     });
            // }

            // function handleError(err){
            //     showError("Could not create maple policy.");
            //     console.error(err);
            // }

            getPath(function(path){
                // if (err)
                //     return handleError(err);
                function getPath(path){
                    var mapleDir = join("~", ".c9/maple/");
                    var mapleDirAbsolute = mapleDir.replace(/^~/, c9.home);
                    // var tarPath = join(mapleDir, template + ".tar.gz");
                    // var tarPathAbsolute = tarPath.replace(/^~/, c9.home);
                
                    favs.addFavorite(dirname(mapleDir), "maple_example");
                    tree.expandAndSelect(path/**initial file**/);

                    // Download tar file with template for plugin
                    proc.execFile("bash", {
                        args: ["-c", [
                            // using mkdirp since "--create-dirs" is broken on windows
                            "mkdir", "-p", util.escapeShell(dirname(mapleDir)), ";",
                            //"curl", "-L", util.escapeShell(url), "-o", util.escapeShell(tarPathAbsolute)].join(" ")
                            "cp", util.escapeShell(url), "-o", util.escapeShell(mapleDirAbsolute)
                            ]
                        ]
                   });/**, function(err, stderr, stdout){**/
                    /**if (err)
                        return handleError(err);**/

                    // Untar tar file
                    // proc.execFile("bash", {
                    //     args: ["-c", ["tar", "-zxvf", util.escapeShell(tarPath), "-C", util.escapeShell(mapleDirAbsolute)].join(" ")]
                    // }, function(/**err,**/ stderr, stdout){
                    //     /**if (err)
                    //         return handleError(err);**/path

                    //     // Move template to the right folder
                    //     var dirPath = join(dirname(tarPath), template);
                    //     fs.rename(dirPath, path, function(err){
                    //         if (err)
                    //             return handleError(err);

                    //         // Remove .tar.gz
                    //         fs.unlink(tarPath, function(){

                    //             // Add plugin to favorites
                    //             favs.addFavorite(dirname(mapleDir), "mapleDir");

                    //             // Select and expand the folder of the plugin
                    //             tree.expandAndSelect(path);
                    //         });
                    //     });
                    // });
                
               };// });
        }；
     
   };
});