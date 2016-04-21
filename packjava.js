define(function(require, exports, module) {
    main.consumes = ["Plugin","c9","commands","Divider","menus","MenuItem","settings","tabManager","ui"];
    main.provides = ["packjava"];
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
        
        
        
        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();
        
        function load() {
            
        }
        
        /***** Methods *****/
        menus.setRootMenu("Maple", 1000, plugin);
        
        var itempackjava = new MenuItem({ 
            caption : "Packjava" 
            /**onclick : "packjava"
            }**/
        });
        
        menus.addItemByPath("Maple/Packjava", itempackjava, 400, plugin);
    
        var packjava = function(){
            
            
        }    
      
        
        
        
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
            "packjava": plugin
        });
    }
});