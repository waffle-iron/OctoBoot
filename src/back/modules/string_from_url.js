var http = require("http"),
https = require("https"),
url = require("url");


module.exports = function(req, res) {
    var getter = req.params.url.indexOf('https') === 0 ? https : http
    var purl = url.parse(req.params.url)
    var options = {
      hostname: purl.hostname,
      path: purl.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36'
      }
    }

    getter.get(options, function(getres) {
        var data = "";

        getres.on("data", function (chunk) {
            data += chunk;
        });

        getres.on("error", function() {
            res.status(404).send();
        })

        getres.on("end", function () {
            res.set('Access-Control-Allow-Origin', '*').send(data)
        });
    })
}
