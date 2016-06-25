var copy = require('./copy.js')

module.exports = function(dirRoot, sockets, done) {
    return function(data) {
        var template = data.template.replace(/\[|\]|\s/ig, '\\$&') + '/*'
        data.src = data.personal ? 'temp/' + data._sid + '/OctoBoot-templates/' + template : 'static/templates/' + template
        data.dest = 'temp/' + data._sid + '/' + data.project + '/' + (data.file === 'index' ? '' : data.file)
        data.file = ''
        copy(dirRoot, sockets, done)(data)
    }
}
