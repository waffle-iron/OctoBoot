var fs = require("fs")
var buffer = require("buffer")

module.exports = function(projectDir) {
	return function(req, res) {
		var file, dir = projectDir + req.params.sid + "/" + req.params.project + "/uploads/";

	    req.on('data', function(chunk) {
	        file = file ? buffer.Buffer.concat([file, chunk]) : chunk
	    })

	    req.on('end', function() {
	        fs.mkdir(dir , function() {
	            fs.writeFile(dir + req.params.filename, file, function(error) {
	                res.status(error ? 503 : 200).send()
	            })
	        })
	    })
	}
}
