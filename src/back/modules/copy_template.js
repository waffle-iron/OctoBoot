var copy = require("./copy.js")

module.exports = function(dirRoot, sockets, done) {
    return function(data) {
        var template = data.template.replace(/\[|\]|\s/ig, "\\$&") + "/*"
        data.src = 'static/templates/' + template
        data.dest = 'temp/' + data._sid + '/' + data.project + "/" + (data.file === "index" ? "" : data.file)
        data.file = ''
        console.log(data.project, data.file,data.dest,  template)
        copy(dirRoot, sockets, done)(data)
    }
}
