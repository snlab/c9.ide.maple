define(function(require, exports, module) {
    main.consumes = ["Plugin","c9","commands","Divider","menus","MenuItem","settings","tabManager","ui","proc"];
    main.provides = ["maple"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var commands = imports.commands;
        var tabs = imports.tabManager;
        var ui = imports.ui;
        var menus = imports.menus;
        var c9 = imports.c9;
        var Divider = imports.Divider;
        var MenuItem = imports.MenuItem;
        var settings = imports.settings;
        var proc = imports.proc;
        
        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();
        
        function load() {
        //     commands.addCommand({
        //     name: "alert",
        //     exec: function(){ 
        //         proc.spawn("date", function(err, process) {
        //             if (err) throw err;

        //             process.stdout.on("data", function(chunk) {
        //                 alert(chunk); 
        //             });
        //         });
        //     }
        // }, plugin);
            
        }
        
         /***** Methods *****/
        menus.setRootMenu("Maple", 1000, plugin);
        
        menus.addItemByPath("Maple/New Maple Policy", writemapleapp, 1100, plugin);
        menus.addItemByPath("Maple/Packjava", itempackjava, 1200, plugin);
        
        
        var writemapleapp = new ui.item({
           caption : "Newmapleapp",
           //command :
        });
        
        var itempackjava = new ui.item({
            // onclick : packjava
            caption : "Packjava",
            command : "alert"
        });
        
        
         /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
        });
        plugin.on("unload", function() {
        
        });
        
        /***** Register and define API *****/
        
        plugin.freezePublicAPI({
            
        });
        
        register(null, {
            "maple": plugin
        });
    }
});
