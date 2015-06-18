var express = require("express"),
io = require("socket.io"),
http = require("http"),
octoboot = require("./src/back/octoboot");

var app = express();
var serverIo = http.createServer(app);
var socketIo = io.listen(serverIo);

app.use(octoboot(app, socketIo));

app.use("/", express.static(__dirname + "/static/"));
app.use("/lib", express.static(__dirname + "/dist/"));
app.use("/lib/handlebars/", express.static(__dirname + "/node_modules/handlebars/dist/"));

// 404 not found
app.use(function(req, res, next) {
    res.setHeader("Content-Type", "text/plain");
    res.status(404).send("Not Found");
});

serverIo.listen(process.env.PORT || 8080);
console.log("now listening on port ", (process.env.PORT || 8080));
