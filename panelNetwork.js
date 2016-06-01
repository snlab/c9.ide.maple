define(function(require, exports, module) {
    main.consumes = [
        "PreferencePanel", "settings", "ui", "util", "Form", "ext", "c9",
        "dialog.alert", "dialog.confirm", "layout", "proc", "menus", "commands",
        "dialog.error", "dialog.info", "tree.favorites", "fs", "tree", "plugin.debug",
        "preferences.experimental", "Plugin", "Dialog", "Form", "Panel", "tabManager", "panels"
    ];
    main.provides = ["panelNetwork"];
    return main;

    function main(options, imports, register) {
        var ui = imports.ui;
        var Panel = imports.Panel;
        var fs = imports.fs;
        var panel_network = new Panel("networkView", main.consumes, {
            caption: "Network",
            index: 100,
            width: 500,
            minWidth: 500,
            where: "right",
            autohide: true
        });
        
        panel_network.on("draw", function(e) {
            fs.readFile('~/.c9/plugins/maple/index.html', function(err, data) {
                if (err) throw err;
                console.log(data);
                e.html.innerHTML = data;
            });
        });

        panel_network.on("load", function() {});
        panel_network.on("unload", function() {});
        /***** Register and define API *****/

        panel_network.freezePublicAPI({
        });

        register(null, {
            "panelNetwork": panel_network
        });
    }
});
