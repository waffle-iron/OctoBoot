var fs = require("fs"),
pa = require("path")

module.exports = (req, res) => {
    var file = pa.resolve("config/whitelist." + req.params.for + ".json"), j = {}
    if (file) {
        fs.readFile(file, (err, data) => {
            if (!err && data) {
                try { j = JSON.parse(data) } catch (e) {}
                res.sendStatus(j[req.params.from] ? 200 : 401)
            } else {
                res.sendStatus(401)
            }
        })
    } else {
        res.sendStatus(401)
    }

}
