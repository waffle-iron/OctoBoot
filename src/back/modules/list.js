var fs = require("fs")

module.exports = function(dir, socketEvent, sockets) {
    return function(data) {
    	var dirToInspect = dir + (data.dir || "")
        sockets[data.sid].s.emit(socketEvent, fs.readdirSync(dirToInspect))
    }
}
