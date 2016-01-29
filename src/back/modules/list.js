var fs = require("fs")

module.exports = function(dir, sockets) {
    return function(data) {
    	var dirToInspect = dir + (data.dir || "")
    	var response = null

    	try {response = fs.readdirSync(dirToInspect)} catch(e) {}

        sockets[data._sid].s.emit(data._scbk, response)
    }
}
