var ghcli = require("github-cli"),
error = require("./error.js")

module.exports = function(dir, sockets) {
    return function (data) {
        var baseUri = dir + data._sid + "/" + data.name

        error.init(sockets[data._sid].s, data._scbk)

        ghcli.checkout(baseUri, "gh-pages", error.cbk(function() {
            ghcli.reset(baseUri, "master", error.cbk(function() {
                ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "gh-pages", error.cbk(function() {
                    sockets[data._sid].s.emit(data._scbk)
                }), true)
            }))
        }))
    }
}
