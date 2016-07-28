var fs = require("fs"),
ghcli = require("github-cli"),
copy = require('./copy.js')

module.exports = function(dir, sockets) {
    return function(data) {
        var baseUri = dir + data._sid
        var gitUrl = data.url.replace(/https:\/\/.*github/g, "https://" + sockets[data._sid].ghtoken + "@github")

        var cacheProcess = function() {
            var cache_name = encodeURIComponent(data.url)
            var cache_dir = dir + '.cache'

            // create cache dir if not exist
            try{ fs.mkdirSync(cache_dir) } catch (e) {}

            // clone / clean and reset cachable repo
            ghcli.clone(cache_dir, gitUrl + " " + cache_name, function(err, stdout, stderr) {
                ghcli.clean(cache_dir + "/" + cache_name, function(perr, pstdout, pstderr) {
                    ghcli.reset(baseUri + "/" + cache_name, 'master', function(perr, pstdout, pstderr) {
                        data.src = '.cache/' + cache_name
                        data.dest = data._sid
                        data.file = '/' + data.name

                        // then copy it in user dir
                        copy(dir, sockets)(data)
                    })
                })
            })
        }

        // did user dir exist ?
        fs.access(baseUri, fs.F_OK, (err) => {
          if (err) {
              // if not create it and start cache process
              try{ fs.mkdirSync(baseUri) } catch (e) {}
              cacheProcess()
          } else {
              // did the project exist on user dir ? if not, start cache process
              fs.access(baseUri + '/' + data.name, fs.F_OK, (err) => {
                  if (err) {
                      cacheProcess()
                  } else {
                      // project exist, refresh it
                      ghcli.clean(baseUri + "/" + data.name, function(perr, pstdout, pstderr) {
                          ghcli.reset(baseUri + "/" + data.name, 'master', function(perr, pstdout, pstderr) {
                              sockets[data._sid].s.emit(data._scbk, perr ? pstderr : null)
                          })
                      })
                  }
              })
          }
        })

    }
}
