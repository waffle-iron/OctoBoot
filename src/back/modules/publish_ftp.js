var jsontree = require('jsontree-js')
var client = require('ftp')

module.exports = function(dir, sockets) {
    return function (data) {
        var c = new client()
        var base_uri = dir + data._sid + '/' + data.name
        var current_path = ""
        var local_list, toput, path, name

        data.rpath = data.rpath ? !data.rpath.match(/\/$/) ? data.rpath + '/' : data.rpath : ''

        var pop_list = (err) => {
            if (err) {

                //console.log('PUT error', err)
                sockets[data._sid].s.emit(data._scbk, {error: err})

            } else if (local_list.length) {

                toput = local_list.pop()
                path = toput.split('/')
                name = path.pop()
                path = path.join('/')

                if (current_path === path) {
                    //console.log('PUT', base_uri + '/' + toput, 'TO', name)
                    sockets[data._sid].s.emit(data._scbk, {inc: true})
                    c.put(base_uri + '/' + toput, name, pop_list)
                } else {
                    c.cwd('/' + data.rpath + path, (err) => {
                        if (err) {
                            c.mkdir('/' + data.rpath + path, true, (err) => {
                                if (!err) {
                                    //console.log('MKDIR', '/' + data.rpath + path)
                                    local_list.push(toput)
                                    pop_list()
                                } else {
                                    //console.log('MKDIR error', err)
                                    sockets[data._sid].s.emit(data._scbk, {error: err})
                                }
                            })
                        } else {
                            //console.log('MOVE', '/' + data.rpath + path)
                            current_path = path
                            local_list.push(toput)
                            pop_list()
                        }
                    })
                }


            } else {
                //console.log('ftp done')
                sockets[data._sid].s.emit(data._scbk, {success: true})
            }
        }

        c.on('ready', pop_list)

        c.on('error', (e) => {
            sockets[data._sid].s.emit(data._scbk, {error: e})
        })

        // init -> create a json array from files in project
        // then connect to ftp
        jsontree.list((list) => {
            local_list = list.filter((e) => { return !e.match(/^\.git/) })
            sockets[data._sid].s.emit(data._scbk, {total: local_list.length})
            c.connect(data)
        }, base_uri)
    }
}
