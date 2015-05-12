var cookieSession = require('cookie-session'),
cookieParser = require('cookie-parser'),
ghapi = require("github-api"),
ghc = require("../../githubconf.json");

var sockets = [];

function updateUI(sid, access_token) {
    var ctrl = function(event) {
        return function(error, data) {
            if (!error && data) {
                sockets[sid].s.emit(event, data);
            } else {
                console.error(error);
            }
        }
    };

    ghapi.getUser(access_token, ctrl("user"));
    ghapi.getRepos(access_token, "public", ctrl("repos_public"));
    ghapi.getRepos(access_token, "private", ctrl("repos_private"));
}

function isLogged(req, res) {
    if (!req.signedCookies.gat) {
        res.status(401).send("not logged in");
    } else {
        res.status(200).send("logged");
        sockets[req.params.sid].ghtoken = req.signedCookies.gat;
        updateUI(req.params.sid, req.signedCookies.gat);
    }
}

function oauth(req, res, access_token) {
    sockets[req.params.sid].s.emit("connected");
    sockets[req.params.sid].ghtoken = access_token;
    res.cookie("gat", access_token, {signed: true})
        .write("<script>window.close()</script>");
}

var ghboot = function(app, socketIo) {
    app.use(cookieParser('ghboot'));
    app.use(cookieSession({ secret: 'ghboot'}));
    app.get("/api/isLogged/:sid", isLogged);
    app.get("/api/GitHubApi/:sid", ghapi.oauth(oauth));

    ghapi.init(ghc.app_id, ghc.app_secret, ghc.app_redirect);

    socketIo.on("connection", function(socket) {
        sockets.push({s: socket});
        socket.emit("sid", sockets.length - 1);
    });

    return function(req, res, next) {
        next();
    };
};

exports = module.exports = ghboot;
