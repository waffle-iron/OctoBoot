var fs = require("fs"),
ghcli = require("github-cli");

module.exports = function(dir, socketEvent, sockets) {
    return function(data) {
        var baseUri = dir + data.sid + "/" + data.name;

        fs.writeFileSync(baseUri + "/.octoboot", JSON.stringify({
            name: data.name,
            type: "project",
            version: "1"
        }));

        ghcli.add(baseUri, baseUri + "/.octoboot", function() {
            ghcli.commit(baseUri, "Octoboot - create ref file", function() {
                ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "master", function(push_error) {
                    if (!push_error) {
                        ghcli.branch(baseUri, "gh-pages", function(branch_error) {
                            if (!branch_error) {
                                ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "gh-pages", function(push_error2) {
                                    sockets[data.sid].s.emit(socketEvent, !push_error2);
                                }, true);
                            } else {
                                //TODO TRIGER ERROR
                            }
                        });
                    } else {
                        //TODO TRIGER ERROR
                    }
                });
            });
        });
    }
}
