var scraper = require('website-scraper')

module.exports = function(dir, socketEvent, sockets) {
    return function(data) {
        var dirToSave = dir + data.sid + '/temp_template'

        scraper.scrape({
            urls: [data.url],
            directory: dirToSave,
        }, function (error, result) {
            sockets[data.sid].s.emit(socketEvent, !error ? 'temp/' + data.sid + '/temp_template' : null)
        })
    }
}
