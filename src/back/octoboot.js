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
ls = require("./modules/ls.js"),
copy = require("./modules/copy.js"),
copy_template = require("./modules/copy_template.js"),
copy_plugin = require("./modules/copy_plugin.js"),
save = require("./modules/save.js"),
publish = require("./modules/publish.js"),
publish_ftp = require("./modules/publish_ftp.js"),
scrapp = require("./modules/scrapp.js"),
fill = require("./modules/fill.js"),
rm = require("./modules/rm.js"),
rmdir = require("./modules/rmdir.js"),
upload = require("./modules/upload.js"),
whitelist = require("./modules/whitelist.js"),
// Plugins
email = require("./plugins/email.js"),
facebook = require("./plugins/facebook.js"),
sfu = require("./plugins/string_from_url.js"),
comments = require("./plugins/comments.js"),
// Services
sumo = require("./services/sumologic.js"),
// Model API share with front
modelApi = require("./model/serverapi.js"),
// GitHub conf
ghc = require("../../config/githubconf.json")

// TEMP
ghcli.debug = true
// ####

var sockets = []
var rootDir = __dirname + "/../../"
var projectDir = rootDir + "temp/"
var templateDir = rootDir + "static/templates/"


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
    res.cookie("gat", access_token, {signed: true, maxAge: 30 * 24 * 60 * 60 * 1000}).redirect("/")
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

    app.post(modelApi.UPLOAD, upload(projectDir))

    app.get(modelApi.IS_LOGGED, isLogged)
    app.get(modelApi.GITHUB_LOGIN, ghapi.oauth(oauth, 'repo,delete_repo'))

    app.get(modelApi.WHITELIST, whitelist)

    // custom module utilities (instagram / etc..)
    app.get("/stringfromurl/:url", sfu)
    app.get("/facebook/:pageid/feed", facebook.feed)
    app.post("/email/:from/:to/:subject", email.form(app))
    app.post("/comments/:id", comments(app))

    // 404
    app.use(r404)

    for (var domain in ghc) {
        if (ghc.hasOwnProperty(domain)) {
            ghapi.init(domain, ghc[domain].client_id, ghc[domain].client_secret, ghc[domain].authorization_callback_url)
        }
    }

    socketIo.on("connection", function(socket) {
        sumo.info(0, 'socket connection')
        socket.on(modelApi.SOCKET_BIND, function(data) {

            socket.on(modelApi.SOCKET_ID, function(data) {
                var sid = data._sid || Date.now()
                sockets[sid] = sockets[sid] || {}
                sockets[sid].s = socket
                socket.emit(data._scbk, sid)
            })

            socket.on(modelApi.SOCKET_SAVE, save(projectDir, sockets))
            socket.on(modelApi.SOCKET_COPY_TEMPLATE, copy_template(rootDir, sockets))
            socket.on(modelApi.SOCKET_COPY_PLUGIN, copy_plugin(rootDir, sockets))
            socket.on(modelApi.SOCKET_COPY, copy(rootDir, sockets))
            socket.on(modelApi.SOCKET_CLONE, clone(projectDir, sockets))
            socket.on(modelApi.SOCKET_PUBLISH, publish(projectDir, sockets))
            socket.on(modelApi.SOCKET_PUBLISH_FTP, publish_ftp(projectDir, sockets))
            socket.on(modelApi.SOCKET_CONVERT, convert(projectDir, sockets))
            socket.on(modelApi.SOCKET_LIST_DIR, list(projectDir, sockets))
            socket.on(modelApi.SOCKET_LIST_FILES, ls(projectDir, sockets))
            socket.on(modelApi.SOCKET_LIST_TEMPLATE, list(templateDir, sockets))
            socket.on(modelApi.SOCKET_SCRAPP, scrapp(projectDir, sockets))
            socket.on(modelApi.SOCKET_FILL_TEMPLATE, fill(projectDir, sockets))
            socket.on(modelApi.SOCKET_REMOVE_FILE, rm(projectDir, sockets))
            socket.on(modelApi.SOCKET_REMOVE_DIR, rmdir(projectDir, sockets))
            socket.on(modelApi.SOCKET_SUMOLOGIC_INFO, sumo.info(null))
            socket.on(modelApi.SOCKET_SUMOLOGIC_ERROR, sumo.error(null))

            socket.emit(data._scbk)
        })
    })

    return function(req, res, next) {
        next()
    }
}

exports = module.exports = octoboot
