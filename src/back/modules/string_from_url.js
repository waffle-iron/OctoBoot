var http = require("http"),
https = require("https");


module.exports = function(req, res) {
	var getter = req.params.url.indexOf('https') === 0 ? https : http

	getter.get(req.params.url, function(getres) {
	    var data = "";

	    getres.on("data", function (chunk) {
	        data += chunk;
	    });

	    getres.on("end", function () {
	        res.send(data)
	    });
	})
}
