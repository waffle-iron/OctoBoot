var cookieSession = require('cookie-session'),
cookieParser = require('cookie-parser'),
ghapi = require("github-api"),
ghcli = require("github-cli"),
ghc = require("../../githubconf.json"),
fs = require("fs"),
pa = require("path"),
child_process = require("child_process");

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
    res.cookie("gat", access_token, {signed: true})
        .write("<script>window.close()</script>");
}

function clone(data) {
    var baseUri = projectDir + data.sid;
    var gitUrl = data.url.replace(/https:\/\/.*github/g, "https://" + sockets[data.sid].ghtoken + "@github");

    try{ fs.mkdirSync(baseUri) } catch (e) {};

    ghcli.clone(baseUri, gitUrl, function(err, stdout, stderr) {
        if (err && stderr.indexOf("already exists") !== -1) {
            // Project already cloned, just refresh it
            ghcli.pull(baseUri + "/" + data.name, function(err, stdout, stderr) {
                sockets[data.sid].s.emit("clone", !err);
            });
        } else {
            sockets[data.sid].s.emit("clone", !err);
        }
    });
}

function convert(data) {
    var baseUri = projectDir + data.sid + "/" + data.name;

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
                                sockets[data.sid].s.emit("convert", !push_error2);
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

function templatesList(data) {
    var templates = fs.readdirSync(templateDir);
    sockets[data.sid].s.emit("templatesList", templates);
}

function cp(data) {
    var template = data.template.replace(/\[|\]|\s/ig, '\\$&');
    var dest = projectDir + data.sid + "/" + data.project + (data.file === "index" ? "/" : "/" + data.file + "/");
    var src = templateDir + "/" + template + (data.file === "index" ? "/*" : "");
    child_process.exec("cp -r " + src + " " + dest, function(error, stdout, stderr) {
        sockets[data.sid].s.emit("cp", !error);
        sockets[data.sid].s.emit("save_available");
    });
}

function save(data) {
    var baseUri = projectDir + data.sid + "/" + data.name;

    ghcli.add(baseUri, '-A', function() {
        ghcli.commit(baseUri, "Octoboot - " + new Date().toString(), function() {
            ghcli.push(sockets[data.sid].ghtoken, baseUri, data.url, "master", function(push_error) {
                if (!push_error) {
                    sockets[data.sid].s.emit("save", !push_error);
                }
            });
        })
    })
}

function r404(req, res, next) {
    var path = req.path.split('/'), sid;
    
    if (path.length > 2) {
        sid = parseInt(path[2]);
        if (sockets[sid]) {
            sockets[sid].s.emit("404");
        }
    }

    res.status(404).sendFile(pa.resolve(__dirname + "/../../static/404.html"));
}

var octoboot = function(app, socketIo) {
    app.use(cookieParser('octoboot'));
    app.use(cookieSession({ secret: 'octoboot'}));
    app.get("/api/isLogged/:sid", isLogged);
    app.get("/api/GitHubApi/:sid", ghapi.oauth(oauth));

    // 404
    app.use(r404);

    ghapi.init(ghc.client_id, ghc.client_secret, ghc.authorization_callback_url);

    socketIo.on("connection", function(socket) {
        var sid = Date.now();
        sockets[sid] = {s: socket};
        socket.emit("sid", sid);
        socket.on("clone", clone);
        socket.on("convert", convert);
        socket.on("templatesList", templatesList);
        socket.on("cp", cp);
        socket.on("save", save);
    });

    return function(req, res, next) {
        next();
    };
};

exports = module.exports = octoboot;
