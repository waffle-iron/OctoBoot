var FB = require("fb")
var fs = require("fs")
var sumo = require("../services/sumologic.js")

var appId, appSecret, token
var appLogin = (done, error) => {
    if (appId && appSecret) {
        done(appId, appSecret)
        return
    }

    fs.readFile(__dirname + '/../../../facebook.app.login.json', (err, data) => {
      if (err) {
        console.log('facebook plugin error, facebook.app.login.json missing')
        error()
      } else {
        data = JSON.parse(data)
        appId = data.appId
        appSecret = data.appSecret
        done(appId, appSecret)
      } 
    })
}
var appToken = (done, error) => {
    if (token) {
        done(token.access_token)
    } else {
        appLogin((id, secret) => {
            FB.api('oauth/access_token', {
                client_id: id,
                client_secret: secret,
                grant_type: 'client_credentials'
            }, (res) => {
                if(!res || res.error) {
                    sumo.error('plugin-facebook', !res ? 'error occurred' : res.error, req.get('Referer'));
                    error()
                    return;
                }
                token = res
                done(token.access_token)
            })
        }, error)
    }
}

exports.feed = (req, res) => {
    var error = (err) => {res.status(410).send()}
    var start = Date.now()
    
    if (req.params.pageid) {
        appToken((token) => {
            FB.api(req.params.pageid + '/feed', {access_token: token}, (fb_res) => {
                if(!fb_res || fb_res.error) {
                    console.log(!fb_res ? 'error occurred' : fb_res.error);
                    sumo.error('plugin-facebook', !res ? 'error occurred' : res.error, req.get('Referer'));
                    error()
                    return;
                }
                var ids = fb_res.data.map((post) => { return post.id })
                res.set('Access-Control-Allow-Origin', '*').send(ids)
                sumo.info('plugin-facebook', req.params.pageid, req.get('Referer'), Date.now() - start);
            })
        }, error)
    } else {
        error()
        sumo.error('plugin-facebook', 'no page id', req.get('Referer'));
    }
}