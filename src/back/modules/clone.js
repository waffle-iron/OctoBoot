var fs = require("fs"),
ghcli = require("github-cli");

exports.init = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data.sid;
        var gitUrl = data.url.replace(/https:\/\/.*github/g, "https://" + sockets[data.sid].ghtoken + "@github");

        try{ fs.mkdirSync(baseUri) } catch (e) {};

        ghcli.clone(baseUri, gitUrl, function(err, stdout, stderr) {
            if (err && stderr.indexOf("already exists") !== -1) {
                // Project already cloned, just refresh it
                ghcli.pull(baseUri + "/" + data.name, function(err, stdout, stderr) {
                    sockets[data.sid].s.emit("clone", !err);
                });
            } else {
                sockets[data.sid].s.emit("clone", !err);
            }
        });
    }
}