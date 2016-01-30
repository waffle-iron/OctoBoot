var fs = require("fs"),
ghcli = require("github-cli")

module.exports = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data._sid + "/" + data.name

        fs.writeFileSync(baseUri + "/.octoboot", JSON.stringify({
            name: data.name,
            type: "project",
            version: "1"
        }))

        ghcli.add(baseUri, baseUri + "/.octoboot", function() {
            ghcli.commit(baseUri, "Octoboot - create ref file", function() {
                ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "master", function(pe, pstdout, pstderr) {
                    if (!pe) {
                        ghcli.branch(baseUri, "gh-pages", function(be, bstdout, bstderr) {
                            if (!be) {
                                ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "gh-pages", function(pe2, pstdout2, pstderr2) {
                                    sockets[data._sid].s.emit(data._scbk, pe2 ? pstderr2 : null)
                                }, true)
                            } else {
                                sockets[data._sid].s.emit(data._scbk, be ? bstderr : null)
                            }
                        })
                    } else {
                        sockets[data._sid].s.emit(data._scbk, pe ? pstderr : null)
                    }
                })
            })
        })
    }
}
