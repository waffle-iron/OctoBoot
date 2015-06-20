var cookieSession = require('cookie-session'),
cookieParser = require('cookie-parser'),
ghapi = require("github-api"),
ghcli = require("github-cli"),
ghc = require("../../githubconf.json"),
fs = require("fs");

// TEMP
ghcli.debug = true;
// ####

var sockets = [];

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
    res.cookie("gat", access_token, {signed: true})
        .write("<script>window.close()</script>");
}

function clone(data) {
    var baseUri = __dirname + "/../../temp/" + data.sid;
    var gitUrl = data.url.replace(/https:\/\/.*github/g, "https://" + sockets[data.sid].ghtoken + "@github");

    try{ fs.mkdirSync(baseUri) } catch (e) {};
    
    ghcli.clone(baseUri, gitUrl, function(err, stdout, stderr) {
        sockets[data.sid].s.emit("cloned", !err);
    });
}

function convert(data) {
    var baseUri = __dirname + "/../../temp/" + data.sid + "/" + data.name;
    
    fs.writeFileSync(baseUri + "/.octoboot", JSON.stringify({
        name: data.name,
        type: 'project',
        version: '1'
    }));
    
    ghcli.add(baseUri, baseUri + "/.octoboot", function() {
        ghcli.commit(baseUri, "Octoboot - create ref file", function() {
            ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "master", function(push_error) {
                if (!push_error) {
                    ghcli.branch(baseUri, "gh-pages", function(branch_error) {
                        if (!branch_error) {
                            ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "gh-pages", function(push_error2) {
                                sockets[data.sid].s.emit("converted", !push_error2);
                            }, true);
                        } else {
                            //TODO TRIGER ERROR
                        }
                    });
                } else {
                    //TODO TRIGER ERROR
                }
            });
        });
    });
}

var octoboot = function(app, socketIo) {
    app.use(cookieParser('octoboot'));
    app.use(cookieSession({ secret: 'octoboot'}));
    app.get("/api/isLogged/:sid", isLogged);
    app.get("/api/GitHubApi/:sid", ghapi.oauth(oauth));

    ghapi.init(ghc.client_id, ghc.client_secret, ghc.authorization_callback_url);

    socketIo.on("connection", function(socket) {
        var sid = Date.now();
        sockets[sid] = {s: socket};
        socket.emit("sid", sid);
        socket.on("clone", clone);
        socket.on("convert", convert);
    });

    return function(req, res, next) {
        next();
    };
};

exports = module.exports = octoboot;
