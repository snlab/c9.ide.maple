define(function(require, exports, module) {
    main.consumes = [
        "PreferencePanel", "settings", "ui", "util", "Form", "ext", "c9",
        "dialog.alert", "dialog.confirm", "layout", "proc", "menus", "commands",
        "dialog.error", "dialog.info", "tree.favorites", "fs", "tree", "plugin.debug",
        "preferences.experimental", "Plugin", "Dialog", "Form", "Panel", "tabManager", "panels"
    ];
    main.provides = ["panelView"];
    return main;

    function main(options, imports, register) {
        var ui = imports.ui;
        var Panel = imports.Panel;
        var fs = imports.fs;
        var panel = new Panel("networkView", main.consumes, {
            caption: "Network",
            index: 100,
            width: 500,
            minWidth: 500,
            where: "right",
            autohide: true
        });

        // panel.on("load", function() {
        //     panel.show();
        // }, plugin);

        // panel.on("show", function() {
        //     onclick = panel.hide();
        // }, plugin);

        panel.on("draw", function(e) {
            fs.readFile('~/.c9/plugins/maple/index.html', function(err, data) {
                if (err) throw err;
                console.log(data);
                e.html.innerHTML = data;
            });
            // Insert css
            //ui.insertCss(require("text!./panel.css"), options.staticPrefix, panel);
            // Set some custom HTML
        });

        panel.on("load", function() {
            // Any custom load code (most things are cleaned up automatically)
        });
        panel.on("unload", function() {
            // Any custom unload code (most things are cleaned up automatically)
        });

        /***** Register and define API *****/

        panel.freezePublicAPI({

        });

        register(null, {
            "panelView": panel
        });
    }
});
