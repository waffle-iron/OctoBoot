var cookieSession = require("cookie-session"),
cookieParser = require("cookie-parser"),
ghapi = require("github-api"),
ghcli = require("github-cli"),
fs = require("fs"),
pa = require("path"),
// Internal module
convert = require("./modules/convert.js"),
clone = require("./modules/clone.js"),
list = require("./modules/list.js"),
copy = require("./modules/copy.js"),
save = require("./modules/save.js"),
publish = require("./modules/publish.js"),
scrapp = require("./modules/scrapp.js"),
fill = require("./modules/fill.js"),
// Model API share with front
modelApi = require("./model/serverapi.js"),
// GitHub conf
ghc = require("../../githubconf.json")

// TEMP
ghcli.debug = true
// ####

var sockets = []
var projectDir = __dirname + "/../../temp/"
var templateDir = __dirname + "/../../static/templates"

function isLogged(req, res) {
    if (!req.signedCookies.gat) {
        res.status(401).send("not logged in")
    } else {
        sockets[req.params.sid].ghtoken = req.signedCookies.gat
        res.status(200).send(req.signedCookies.gat)
    }
}

function oauth(req, res, access_token) {
    sockets[req.params.sid].s.emit("connected", req.signedCookies.gat)
    sockets[req.params.sid].ghtoken = access_token
    res.cookie("gat", access_token, {signed: true}).redirect("/")
}

function r404(req, res, next) {
    var path = req.path.split("/"), sid

    if (path.length > 2) {
        sid = parseInt(path[2])
        if (sockets[sid]) {
            sockets[sid].s.emit("404")
        }
    }

    res.status(404).sendFile(pa.resolve(__dirname + "/../../static/404.html"))
}

var octoboot = function(app, socketIo) {
    app.use(cookieParser("octoboot"))
    app.use(cookieSession({ secret: "octoboot"}))
    app.get(modelApi.IS_LOGGED, isLogged)
    app.get(modelApi.GITHUB_LOGIN, ghapi.oauth(oauth))

    // 404
    app.use(r404)

    ghapi.init(ghc.client_id, ghc.client_secret, ghc.authorization_callback_url)

    socketIo.on("connection", function(socket) {
        var sid = Date.now()
        sockets[sid] = {s: socket}
        socket.emit("sid", sid)

        
        socket.on(modelApi.SOCKET_SAVE, save(projectDir, modelApi.SOCKET_SAVE, sockets))
        socket.on(modelApi.SOCKET_COPY, copy(projectDir, templateDir, modelApi.SOCKET_COPY, sockets))
        socket.on(modelApi.SOCKET_CLONE, clone(projectDir, modelApi.SOCKET_CLONE, sockets))
        socket.on(modelApi.SOCKET_PUBLISH, publish(projectDir, modelApi.SOCKET_PUBLISH, sockets))
        socket.on(modelApi.SOCKET_CONVERT, convert(projectDir, modelApi.SOCKET_CONVERT, sockets))
        socket.on(modelApi.SOCKET_LIST_DIR, list(projectDir, modelApi.SOCKET_LIST_DIR, sockets))
        socket.on(modelApi.SOCKET_LIST_TEMPLATE, list(templateDir, modelApi.SOCKET_LIST_TEMPLATE, sockets))
        socket.on(modelApi.SOCKET_SCRAPP, scrapp(projectDir, modelApi.SOCKET_SCRAPP, sockets))
        socket.on(modelApi.SOCKET_FILL_TEMPLATE, fill(projectDir, modelApi.SOCKET_FILL_TEMPLATE, sockets))
        
    })

    return function(req, res, next) {
        next()
    }
}

exports = module.exports = octoboot
