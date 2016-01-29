var ghcli = require("github-cli")

module.exports = function(dir, sockets) {
    return function (data) {
        var baseUri = dir + data._sid + "/" + data.name

        ghcli.checkout(baseUri, "gh-pages", function(checkout_err) {
            if (!checkout_err) {
                ghcli.reset(baseUri, "master", function(reset_error) {
                    if (!reset_error) {
                        ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "gh-pages", function(push_error) {
                            if (!push_error) {
                                sockets[data._sid].s.emit(data._scbk, !push_error)
                            }
                        }, true)
                    }
                })
            }
        })
    }
}
