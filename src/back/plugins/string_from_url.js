var http = require("http")
var https = require("https")
var url = require("url")
var sumo = require("../services/sumologic.js")
var cache = require("../modules/cache_string.js")


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
    
    cache(req.params.url, 
      (done) => {
        getter.get(options, function(getres) {
            var start = Date.now()
            var data = ""

            getres.on("data", function (chunk) {
                data += chunk
            })

            getres.on("error", function(error) {
                res.status(404).send()
                sumo.error('plugin-sfu', error, purl)
            })

            getres.on("end", function () {
                done(data)
                sumo.info('plugin-sfu', purl, req.get('Referer'), Date.now() - start)
            })
        })
      }, 
      (data) => {
        res.set('Access-Control-Allow-Origin', '*').send(data)
      }
    )
}
