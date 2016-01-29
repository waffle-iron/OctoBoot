var ghcli = require("github-cli")
var fs = require("fs")

module.exports = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data._sid + "/" + data.name

        data.file = data.file.match(/index.html$/) ? data.file :
                    data.file.match(/\/$/) ? data.file + 'index.html' : data.file + '/index.html'

        fs.writeFile(baseUri + "/" + data.file, data.content, function() {
            ghcli.add(baseUri, "-A", function() {
                ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), function() {
                    ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "master", function(push_error) {
                        if (!push_error) {
                            sockets[data._sid].s.emit(data._scbk, !push_error)
                        }
                    })
                })
            })
        })
    }
}
