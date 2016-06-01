define(function(require, exports, module) {
    main.consumes = [
        "PreferencePanel", "settings", "ui", "util", "Form", "ext", "c9",
        "dialog.alert", "dialog.confirm", "layout", "proc", "menus", "commands",
        "dialog.error", "dialog.info", "tree.favorites", "fs", "tree", "plugin.debug",
        "preferences.experimental", "Plugin", "Dialog", "Form", "Panel", "tabManager", "panels"
    ];
    main.provides = ["panelTracetree"];
    return main;

    function main(options, imports, register) {
        var ui = imports.ui;
        var Panel = imports.Panel;
        var fs = imports.fs;
        var commands = imports.commands;
        var panel_tracetree = new Panel("tracetree", main.consumes, {
            caption: "TraceTree",
            index: 200,
            width: 500,
            minWidth: 500,
            where: "right",
            autohide: true
        });

        commands.addCommand({
            name: "activateTraceTree",
            exec: function() {
                panel_tracetree.show();
                callTracetreePanel();
            }
        }, commands);

        function activateTraceTree() {
            proc.spawn("bash", {
                args: [
                    "-c", [
                        "node", "server", "3000"
                    ].join(" ")
                ],
                cwd: "/Users/Orangeclouds/Desktop/TraceTree"
            }, function(err, process) {
                if (err) throw err;
                process.stdout.on("data", function(chunk) {
                    console.log(chunk);
                });
            });
        }

        panel_tracetree.on("load", function() {});
        panel_tracetree.on("unload", function() {});
        panel_tracetree.on("draw", function(e) {
            console.log("Hello!");
            e.html.innerHTML = "<iframe src = 'http://" + window.location.hostname + ":3000' style='width:100%;height:100%;border:0px' ></iframe>";
        });


        // panel_tracetree.on("draw", function(e) {
        //     fs.readFile('~/.c9/plugins/maple/index.html', function(err, data) {
        //         if (err) throw err;
        //         console.log(data);
        //         e.html.innerHTML = data;
        //         // Insert css
        //         //ui.insertCss(require("text!./panel.css"), options.staticPrefix, panel);
        //         // Set some custom HTML
        //     });
        // });
        panel_tracetree.on("load", function() {});
        panel_tracetree.on("unload", function() {});

        /***** Register and define API *****/

        panel_tracetree.freezePublicAPI({
        });

        register(null, {
            "panelTracetree": panel_tracetree
        });
    }
});
