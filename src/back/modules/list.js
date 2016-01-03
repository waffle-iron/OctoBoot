var fs = require("fs")

module.exports = function(dir, socketEvent, sockets) {
    return function(data) {
    	var dirToInspect = dir + (data.dir || "")
    	var response = null

    	try {response = fs.readdirSync(dirToInspect)} catch(e) {}
    	
        sockets[data.sid].s.emit(socketEvent, response)
    }
}
