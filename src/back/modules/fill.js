var copy = require("./copy.js")
var api = require("../model/serverapi.js")
var ghcli = require("github-cli")

module.exports = function(dir, socketEvent, sockets) {
    return function(data) {
        var dirToSave = dir + data.sid + "/temp_template"
        var baseUri = dir + data.sid + "/" + api.TEMPLATE_REPO_NAME

        data.template = ""
        data.project = api.TEMPLATE_REPO_NAME
        copy(dir, dirToSave, null, null, function(error) {
            if (!error) {
                ghcli.add(baseUri, "-A", function() {
                    ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), function() {
                        ghcli.push(sockets[data.sid].ghtoken, baseUri, data.repo_url, "master", function(push_error) {
                            sockets[data.sid].s.emit(socketEvent, push_error)
                        })
                    })
                })
            } else {
                sockets[data.sid].s.emit(socketEvent, error)
            }
        })(data)
    }
}
