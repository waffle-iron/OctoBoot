var https = require('https')
var fs = require('fs')

var sumologic_collector;

fs.readFile(__dirname + '/../../../sumologic.collector.conf', function(error, data) {
    if (error) {
        console.log('service sumologic error - sumologic.collector.conf missing')
    } else {
        sumologic_collector = data.toString()
    }
})

var stringifyData = function(data) {
    var tryToParse = function(o) {
        var s
        try {
            s = JSON.stringify(o)
        } catch (e) {
            if (o.toString) {
                s = o.toString()
            }
        }
        return s
    }

    if (data.length) {
        for (var i in data) {
            if (typeof data[i] === 'function') {
                data[i] = data[i].toString()
            } else if (typeof data[i] === 'object') {
                data[i] = tryToParse(data[i])
            }
        }
    } else {
        data = tryToParse(data)
    }

    return data.toString ? data.toString() : data
}

var sumologic = function(msg) {
    https.get(
        sumologic_collector + msg,
        function (res) {}
    ).on('error', function() {
        console.log('can not reach sumologic')
    })
}

var nconsole = function(id, pre, args) {
    console.log('\n' + pre)
    args.forEach(function(arg) {
        console.log(arg)
    })
}

var log = function(pre, data) {
    var args = Array.prototype.slice.call(data)
    var id = args.shift()
    // log to console
    nconsole(id, pre, args)
    // log to sumo
    if (sumologic_collector) {
        sumologic('[' + id + ']' + pre + encodeURIComponent(stringifyData(args)))
    }
}

exports.info = function(id) {
    if (id !== null) {
       log('[I]', arguments) 
    }
    
    return function(data) {
        log('[I]', data)
    }
}

exports.error = function(id) {
    if (id !== null) {
       log('[E]', arguments) 
    }
    return function(data) {
        log('[E]', data)
    }
}
