var ghcli = require("github-cli")
var fs = require("fs")
var error = require("./error.js")

module.exports = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data._sid + "/" + data.name

        data.file = data.file || 'index.html';

        error.init(sockets[data._sid].s, data._scbk)

        var then = function() {
           ghcli.add(baseUri, "-A", error.cbk(function() {
                ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), error.cbk(function() {
                    ghcli.pull(baseUri, error.cbk(function() {
                        ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "master", error.cbk(function() {
                            sockets[data._sid].s.emit(data._scbk)
                        }))
                    }))
                }))
            })) 
        }

        if (data.content) {
            fs.writeFile(baseUri + "/" + data.file, data.content, error.cbk(then))
        } else {
            then()
        }
    }
}
