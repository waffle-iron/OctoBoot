var cp = require("child_process")
var fs = require("fs")

module.exports = function(dirRoot, sockets, done) {
    return function(data) {
        fs.mkdir(dirRoot + data.dest, function(){
            cp.exec("cp -rf " + dirRoot + data.src + " " + dirRoot + data.dest + data.file, function(error, stdout, stderr) {
                if (sockets && data._scbk) {
                    sockets[data._sid].s.emit(data._scbk, error)
                } else if (done) {
                    done(error)
                }
            })
        })
    }
}
