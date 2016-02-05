var jsontree = require('jsontree-js')

module.exports = function(dir, sockets) {
    return function(data) {
    	var dirToInspect = dir + (data.dir || "")
    	var response = null

    	jsontree.list(function(dirs) {
    		sockets[data._sid].s.emit(data._scbk, dirs.filter(function(v) {return !v.match(/^(\/)*\./)}))
    	}, dirToInspect)
    }
}
