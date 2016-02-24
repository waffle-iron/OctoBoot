var ghcli = require("github-cli")
var fs = require("fs")
var error = require("./error.js")

module.exports = (dir, sockets) => {
    return (data) => {
        var baseUri = dir + data._sid + "/" + data.name

        data.file = data.file || 'index.html';

        error.init(sockets[data._sid].s, data._scbk)

        var then = () => {
            if (data.url) {
                ghcli.add(baseUri, "-A", error.cbk(() => {
                    ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), error.cbk(() => {
                        ghcli.pull(baseUri, error.cbk(() => {
                            ghcli.push(sockets[data._sid].ghtoken, baseUri, data.url, "master", error.cbk(() => {
                                sockets[data._sid].s.emit(data._scbk)
                            }))
                        }))
                    }))
                })) 
            } else {
                sockets[data._sid].s.emit(data._scbk)
            }
        }

        if (data.content) {
            fs.writeFile(baseUri + "/" + data.file, data.content, (werror) => {
                if (werror) {
                    fs.mkdir(baseUri, error.cbk(() => {
                        fs.writeFile(baseUri + "/" + data.file, data.content, error.cbk(then))
                    }))
                } else {
                    then()
                }
            })
        } else {
            then()
        }
    }
}
