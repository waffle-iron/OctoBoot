var cp = require("child_process")

module.exports = function(dirProject, dirPlugin, sockets, done) {
    return function(data) {
        var dest = dirProject + data._sid + "/" + data.project + '/module/' + data.file.split('/').pop();
        var src = dirPlugin + data.file
        cp.exec("cp -rf " + src + " " + dest, function(error, stdout, stderr) {
            if (sockets && data._scbk) {
            	sockets[data._sid].s.emit(data._scbk, !error)
            } else if (done) {
            	done(error)
            }
        })
    }
}
