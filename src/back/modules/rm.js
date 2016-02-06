var fs = require('fs')

module.exports = function(dir, sockets) {
    return function(data) {
    	var response = null

    	try {response = fs.unlinkSync(dir + data._sid + data.uri)} catch(e) {response = e}

        sockets[data._sid].s.emit(data._scbk, response)
    }
}