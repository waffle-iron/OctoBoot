var scraper = require('website-scraper')
var rmdir = require('rimraf')

module.exports = function(dir, sockets) {
    return function(data) {
        var dirToSave = dir + data._sid + '/temp_template'
        rmdir(dirToSave, function() {
        	scraper.scrape({
	            urls: [data.url],
	            directory: dirToSave,
	        }, function (error, result) {
	            sockets[data._sid].s.emit(data._scbk, !error ? 'temp/' + data._sid + '/temp_template' : null)
	        })
        })
    }
}
