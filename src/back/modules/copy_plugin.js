var cp = require("child_process")
var fs = require("fs")

module.exports = function(dirProject, dirPlugin, sockets, done) {
    return function(data) {
        var dest = dirProject + data._sid + "/" + data.project + '/module/';
        var src = dirPlugin + data.file
        fs.mkdir(dest, function(){
            dest += data.file.split('/').pop();
            cp.exec("cp -rf " + src + " " + dest, function(error, stdout, stderr) {
                if (sockets && data._scbk) {
                    sockets[data._sid].s.emit(data._scbk, error)
                } else if (done) {
                    done(error)
                }
            })
        })
    }
}
