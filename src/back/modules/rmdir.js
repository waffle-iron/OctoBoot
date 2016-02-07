var rm = require('rimraf')

module.exports = function(dir, sockets) {
	return function(data) {
        var dirToRemove = dir + data._sid + '/' + data.name
        rm(dirToRemove, function() {
        	sockets[data._sid].s.emit(data._scbk, null)
        })
    }
}