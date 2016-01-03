var ghcli = require("github-cli")

module.exports = function(dir, socketEvent, sockets) {
    return function (data) {
        var baseUri = dir + data.sid + "/" + data.name

        ghcli.checkout(baseUri, "gh-pages", function(checkout_err) {
            if (!checkout_err) {
                ghcli.reset(baseUri, "master", function(reset_error) {
                    if (!reset_error) {
                        ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "gh-pages", function(push_error) {
                            if (!push_error) {
                                sockets[data.sid].s.emit(socketEvent, !push_error)
                            }
                        }, true)
                    }
                })
            }
        })
    }
}
