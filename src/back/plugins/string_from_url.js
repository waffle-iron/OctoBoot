var request = require("request")
var sumo = require("../services/sumologic.js")
var cache = require("../modules/cache_string.js")

module.exports = function(req, res) {
    cache(req.params.url,
        (done) => {
            var start = Date.now()
            var options = {
              url: req.params.url + (req.params.url.match(/\?/) ? 'ts=' + start : '?ts=' + start),
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36'
              }
            }

            request(options, (err, resp, body) => {
                if (err) {
                    res.status(404).send()
                    sumo.error('plugin-sfu error', req.params.url, err)
                } else {
                    done(body)
                    sumo.info('plugin-sfu', req.params.url, req.get('Referer'), Date.now() - start)
                }
            })
        },
        (data) => {
            res.set('Access-Control-Allow-Origin', '*').send(data)
        }
    )
}
