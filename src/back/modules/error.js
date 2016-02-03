var s,c

exports.init = function(socket, scbk) {
	s = socket
	c = scbk
}

exports.cbk = function(done) {
    return function(error, stdo, stde) {
        if (error) {
            s.emit(c, stde || stdo || error)
        } else if (done) {
            done()
        }
    }
}
