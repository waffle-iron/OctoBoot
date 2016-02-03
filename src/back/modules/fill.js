var copy = require("./copy.js")
var error = require("./error.js")
var api = require("../model/serverapi.js")
var ghcli = require("github-cli")

module.exports = function(dir, sockets) {
    return function(data) {
        var dirToSave = dir + data._sid + "/temp_template"
        var baseUri = dir + data._sid + "/" + api.TEMPLATE_REPO_NAME
        var _scbk = data._scbk

        data.template = ""
        data.project = api.TEMPLATE_REPO_NAME
        data._scbk = ""

        error.init(sockets[data._sid].s, _scbk)

        copy(dir, dirToSave, null, error.cbk(function() {
            ghcli.add(baseUri, "-A", error.cbk(function() {
                ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), error.cbk(function() {
                    ghcli.pull(baseUri, error.cbk(function() {
                        ghcli.push(sockets[data._sid].ghtoken, baseUri, data.repo_url, "master", error.cbk(function() {
                            sockets[data._sid].s.emit(_scbk)
                        }))
                    }))
                }))
            }))
        }))(data)
    }
}
