var cp = require("child_process")

module.exports = function(dirP, dirT, socketEvent, sockets, done) {
    return function(data) {
        var template = data.template.replace(/\[|\]|\s/ig, "\\$&")
        var dest = dirP + data.sid + "/" + data.project + (data.file === "index" ? "/" : "/" + data.file + "/")
        var src = dirT + "/" + template + (data.file === "index" ? "/*" : "")
        cp.exec("cp -rf " + src + " " + dest, function(error, stdout, stderr) {
            if (sockets && socketEvent) {
            	sockets[data.sid].s.emit(socketEvent, !error)
            	sockets[data.sid].s.emit("save_available") // TODO improve this
            } else if (done) {
            	done(error)
            }
        })
    }
}
