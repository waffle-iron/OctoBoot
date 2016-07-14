var bodyParser = require('body-parser')
var express = require("express")
var email = require('./email.js')
var sumo = require("../services/sumologic.js")
var fs = require('fs')

var dir = __dirname + '/../../../.comments/'

fs.mkdir(dir, () => {})

module.exports = (app) => {

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use("/comments", (req, res, next) => {
      res.set('Access-Control-Allow-Origin', '*')
      next()
    })
    app.use("/comments", express.static(dir));
    app.get("/comments/:id/:cid/like", (req, res) => {
      fs.readFile(dir + req.params.id, (err, data) => {
          if (!err && data) {
            data = JSON.parse(data)
            data.comments.forEach((comment, i) => {
              if (comment.time === parseInt(req.params.cid)) {
                data.comments[i].like++
                res.send()
              }
            })
            fs.writeFileSync(dir + req.params.id, JSON.stringify(data))
          }
        })
    })

    app.get("/comments/:id/:cid/delete", (req, res) => {
      fs.readFile(dir + req.params.id, (err, data) => {
          if (!err && data) {
            data = JSON.parse(data)
            data.comments.forEach((comment, i) => {
              if (comment.time === parseInt(req.params.cid)) {
                data.comments.splice(i, 1)
                res.send()
              }
            })
            fs.writeFileSync(dir + req.params.id, JSON.stringify(data))
          }
        })
    })

    app.get("/comments/:id/:email/:name/init", (req, res) => {
      fs.writeFileSync(dir + req.params.id, JSON.stringify({name: req.params.name, email: req.params.email, comments: []}))
      res.send()
    })

    return (req, res) => {
        sumo.info('plugin-comments', 'new comments', req.get('Referer'))

        var store, bodys = '', dests = []

        fs.readFile(dir + req.params.id, (err, data) => {

          if (!err && data) {
            store = JSON.parse(data)

            try {
                for (var param in req.body) {
                    bodys += param + ': ' + req.body[param] + '\n'
                }

                email.transporter.sendMail({
                    from: req.hostname,
                    to: store.email,
                    subject: 'New comment on ' + store.name,
                    text: bodys
                })

                store.comments.forEach((comment) => {
                    if (comment.email && dests.indexOf(comment.email) === -1) {
                        dests.push(comment.email)
                    }
                })

                dests.forEach((dest) => {
                    email.transporter.sendMail({
                        from: req.hostname,
                        to: dest,
                        subject: 'New comment on ' + store.name,
                        text: 'name: ' + req.body.name + '\nmessage: ' + req.body.message
                    })
                })
            } catch (e) { }


            store.comments.push({name: req.body.name, message: req.body.message, email: req.body.email, like: 0, time: Date.now()})
            fs.writeFileSync(dir + req.params.id, JSON.stringify(store))
          }

          res.redirect(req.get('Referer'))
        })
    }

}
