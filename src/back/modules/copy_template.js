var cp = require("child_process")

module.exports = function(dirP, dirT, sockets, done) {
    return function(data) {
        var template = data.template.replace(/\[|\]|\s/ig, "\\$&")
        var dest = dirP + data._sid + "/" + data.project + (data.file === "index" ? "/" : "/" + data.file + "/")
        var src = dirT + template + (data.file === "index" ? "/*" : "")
        cp.exec("cp -rf " + src + " " + dest, function(error, stdout, stderr) {
            if (sockets && data._scbk) {
            	sockets[data._sid].s.emit(data._scbk, !error)
            } else if (done) {
            	done(error)
            }
        })
    }
}
