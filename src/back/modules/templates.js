var fs = require("fs");

exports.init = function(dir, sockets) {
    return function(data) {
        var templates = fs.readdirSync(dir);
        sockets[data.sid].s.emit("templatesList", templates);
    }
}
