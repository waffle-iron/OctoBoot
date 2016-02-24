var copy = require("./copy.js")

module.exports = function(dirRoot, sockets, done) {
    return function(data) {
        data.src = 'src/front/plugins/' + data.file
        data.dest = 'temp/' + data._sid + '/' + data.project + '/module/'
        data.file = data.file.split('/').pop()
        copy(dirRoot, sockets, done)(data)
    }
}
