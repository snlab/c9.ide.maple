define(function(require, exports, module) {
    main.consumes = [
        "PreferencePanel", "settings", "ui", "util", "Form", "ext", "c9",
        "dialog.alert", "dialog.confirm", "layout", "proc", "menus", "commands",
        "dialog.error", "dialog.info", "tree.favorites", "fs", "tree", "plugin.debug",
        "preferences.experimental", "Plugin", "Dialog", "Form", "Panel", "tabManager", "panels"
    ];
    main.provides = ["panelTesting"];
    return main;

    function main(options, imports, register) {
        var ui = imports.ui;
        var Panel = imports.Panel;
        var fs = imports.fs;
        var commands = imports.commands;
        var proc = imports.proc;
        var panel_testing = new Panel("testingView", main.consumes, {
            caption: "Testing",
            index: 300,
            width: 500,
            minWidth: 500,
            where: "right",
            autohide: true
        });
        // function start_server(controller) {
        //     proc.spawn("node","server","controller.controllerIPAddress","controllerPort");
        // }
        // panel_testing.on("draw", start_server(controller));

        commands.addCommand({
            name: "activateTesting",
            exec: function() {
                panel_testing.show();
                callTestingPanel();
            }
        }, commands);


        /*****set up server for testing topo*****/
        function callTestingPanel() {
            proc.spawn("bash", {
                args: [
                    "-c", [
                        "python", "-m", "SimpleHTTPServer", "8000"
                    ].join(" ")
                ],
                cwd: "/Users/Orangeclouds/Desktop/GraphTopo"
            }, function(err, process) {
                if (err) throw err;
                process.stdout.on("data", function(chunk) {
                    console.log(chunk);
                });
            });
        }

        panel_testing.on("load", function() {});
        panel_testing.on("unload", function() {});
        panel_testing.on("draw", function(e) {
            console.log("Hello!");
            e.html.innerHTML = "<iframe src = 'http://" + window.location.hostname + ":8000/graphTopo.html' style='width:100%;height:100%;border:0px' ></iframe>";
        });
        /***** Register and define API *****/

        panel_testing.freezePublicAPI({});

        register(null, {
            "panelTesting": panel_testing
        });
    }
});
