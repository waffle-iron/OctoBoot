var fs = require("fs"),
ghcli = require("github-cli")

module.exports = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data._sid
        var gitUrl = data.url.replace(/https:\/\/.*github/g, "https://" + sockets[data._sid].ghtoken + "@github")

        try{ fs.mkdirSync(baseUri) } catch (e) {}

        ghcli.clone(baseUri, gitUrl, function(err, stdout, stderr) {
            if (err && stderr.indexOf("already exists") !== -1) {
                // Project already cloned, just refresh it
                ghcli.pull(baseUri + "/" + data.name, function(perr, pstdout, pstderr) {
                    sockets[data._sid].s.emit(data._scbk, perr ? pstderr : null)
                })
            } else {
                sockets[data._sid].s.emit(data._scbk, null)
            }
        })
    }
}
