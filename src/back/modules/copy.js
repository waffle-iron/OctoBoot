var cp = require("child_process");

exports.init = function(dirP, dirT, sockets) {
    return function(data) {
        var template = data.template.replace(/\[|\]|\s/ig, "\\$&");
        var dest = dirP + data.sid + "/" + data.project + (data.file === "index" ? "/" : "/" + data.file + "/");
        var src = dirT + "/" + template + (data.file === "index" ? "/*" : "");
        cp.exec("cp -rf " + src + " " + dest, function(error, stdout, stderr) {
            sockets[data.sid].s.emit("cp", !error);
            sockets[data.sid].s.emit("save_available");
        });
    }
}
