var fs = require("fs")
var sumo = require("../services/sumologic.js")

var cache = {}
var encoding = 'utf8'
var dir = __dirname + '/../../../.cache_string/'
var refresh = 1000 * 60 * 60 // every hour

fs.mkdir(dir, () => {})

var update_cache = (cache_object, done) => {
    if (cache_object && cache_object.req && cache_object.id) {
        cache_object.req((str) => {
            fs.writeFileSync(dir + cache_object.id, str, encoding)
            if (done) {
                done(str)
            }
        })
    } else {
        sumo.error('cache-string', 'update error - params missing', cache_object)
    } 
}

var inter = setInterval(() => {
    var num = 0
    for (var uid in cache) {
        update_cache(cache[uid])
        num++
    }
    sumo.info('cache-string', 'automatic update cache for', num, 'ressources')
}, refresh)

module.exports = (uid, req, done) => {
    var time = Date.now()
    
    var ndone = (data) => {
        done(data)
        sumo.info('cache-string', 'done in', Date.now() - time)
    }
    
    if (!cache[uid]) {
        cache[uid] = {
            req: req,
            id: encodeURIComponent(uid)
        }
    }

    fs.readFile(dir + cache[uid].id, encoding, (err, data) => {
        if (err) {
            return update_cache(cache[uid], ndone)
        }

        ndone(data)
        update_cache(cache[uid])
    })
}