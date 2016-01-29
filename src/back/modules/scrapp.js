var scraper = require('website-scraper')

module.exports = function(dir, sockets) {
    return function(data) {
        var dirToSave = dir + data._sid + '/temp_template'

        scraper.scrape({
            urls: [data.url],
            directory: dirToSave,
        }, function (error, result) {
            sockets[data._sid].s.emit(data._scbk, !error ? 'temp/' + data._sid + '/temp_template' : null)
        })
    }
}
