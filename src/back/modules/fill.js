var copy = require("./copy.js")
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

        copy(dir, dirToSave, null, function(error) {
            if (!error) {
                ghcli.add(baseUri, "-A", function(error) {
                    if (error) {
                        sockets[data._sid].s.emit(_scbk, error)
                    } else {
                        ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), function(error) {
                            if (error) {
                                sockets[data._sid].s.emit(_scbk, error)
                            } else {
                                ghcli.push(sockets[data._sid].ghtoken, baseUri, data.repo_url, "master", function(push_error) {
                                    sockets[data._sid].s.emit(_scbk, push_error)
                                })
                            }
                        })
                    }
                })
            } else {
                sockets[data._sid].s.emit(_scbk, error)
            }
        })(data)
    }
}
