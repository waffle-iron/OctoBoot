var fs = require("fs"),
error = require("./error.js"),
ghcli = require("github-cli")

module.exports = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data._sid + "/" + data.name

        fs.writeFileSync(baseUri + "/.octoboot", JSON.stringify({
            name: data.name,
            type: "project",
            version: "1"
        }))

        error.init(sockets[data._sid].s, data._scbk)

        ghcli.add(baseUri, baseUri + "/.octoboot", error.cbk(function() {
            ghcli.commit(baseUri, "Octoboot - create ref file", error.cbk(function() {
                ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "master", error.cbk(function() {
                    ghcli.branch(baseUri, "gh-pages", error.cbk(function() {
                        ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "gh-pages", error.cbk(function() {
                            sockets[data._sid].s.emit(data._scbk)
                        }), true)
                    }))
                }))
            }))
        }))
    }
}
