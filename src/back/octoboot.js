var cookieSession = require("cookie-session"),
cookieParser = require("cookie-parser"),
ghapi = require("github-api"),
ghcli = require("github-cli"),
fs = require("fs"),
pa = require("path"),
// Internal module
convert = require("./modules/convert.js"),
clone = require("./modules/clone.js"),
templates = require("./modules/templates.js"),
copy = require("./modules/copy.js"),
save = require("./modules/save.js"),
publish = require("./modules/publish.js"),
// GitHub conf
ghc = require("../../githubconf.json");

// TEMP
ghcli.debug = true;
// ####

var sockets = [];
var projectDir = __dirname + "/../../temp/";
var templateDir = __dirname + "/../../static/templates";

function isLogged(req, res) {
    if (!req.signedCookies.gat) {
        res.status(401).send("not logged in");
    } else {
        sockets[req.params.sid].ghtoken = req.signedCookies.gat;
        res.status(200).send(req.signedCookies.gat);
    }
}

function oauth(req, res, access_token) {
    sockets[req.params.sid].s.emit("connected", req.signedCookies.gat);
    sockets[req.params.sid].ghtoken = access_token;
    res.cookie("gat", access_token, {signed: true}).redirect("/");
}

function r404(req, res, next) {
    var path = req.path.split("/"), sid;

    if (path.length > 2) {
        sid = parseInt(path[2]);
        if (sockets[sid]) {
            sockets[sid].s.emit("404");
        }
    }

    res.status(404).sendFile(pa.resolve(__dirname + "/../../static/404.html"));
}

var octoboot = function(app, socketIo) {
    app.use(cookieParser("octoboot"));
    app.use(cookieSession({ secret: "octoboot"}));
    app.get("/api/isLogged/:sid", isLogged);
    app.get("/api/GitHubApi/:sid", ghapi.oauth(oauth));

    // 404
    app.use(r404);

    ghapi.init(ghc.client_id, ghc.client_secret, ghc.authorization_callback_url);

    socketIo.on("connection", function(socket) {
        var sid = Date.now();
        sockets[sid] = {s: socket};
        socket.emit("sid", sid);

        socket.on("clone", clone.init(projectDir, sockets));
        socket.on("convert", convert.init(projectDir, sockets));
        socket.on("templatesList", templates.init(templateDir, sockets));
        socket.on("cp", copy.init(projectDir, templateDir, sockets));
        socket.on("save", save.init(projectDir, sockets));
        socket.on("publish", publish.init(projectDir, sockets));
    });

    return function(req, res, next) {
        next();
    };
};

exports = module.exports = octoboot;
