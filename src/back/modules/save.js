var ghcli = require("github-cli")
var fs = require("fs")

module.exports = function(dir, socketEvent, sockets) {
    return function(data) {
        var baseUri = dir + data.sid + "/" + data.name
        
        data.file = data.file.match(/index.html$/) ? data.file : 
                    data.file.match(/\/$/) ? data.file + 'index.html' : data.file + '/index.html'
        
        fs.writeFile(baseUri + "/" + data.file, data.content, function() {
            ghcli.add(baseUri, "-A", function() {
                ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), function() {
                    ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "master", function(push_error) {
                        if (!push_error) {
                            sockets[data.sid].s.emit(socketEvent, !push_error)
                        }
                    })
                })
            })
        })
    }
}
