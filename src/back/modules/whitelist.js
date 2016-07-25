var fs = require("fs")

module.exports = (req, res) => {
    var file = __dirname + "/../../../config/whitelist." + req.params.for + ".json", j = {}
    fs.readFile(file, (err, data) => {
        if (!err && data) {
            try { j = JSON.parse(data) } catch (e) {}
            res.sendStatus(j[req.params.from] ? 200 : 401)
        } else {
            res.sendStatus(401)
        }
    })
}
