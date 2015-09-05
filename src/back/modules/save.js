var ghcli = require("github-cli");
var fs = require("fs");

exports.init = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data.sid + "/" + data.name;

        fs.writeFile(baseUri + "/" + data.file, data.content, function() {
            ghcli.add(baseUri, "-A", function() {
                ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), function() {
                    ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "master", function(push_error) {
                        if (!push_error) {
                            sockets[data.sid].s.emit("save", !push_error);
                        }
                    });
                })
            })
        });
    }
}