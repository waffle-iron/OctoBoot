var bodyParser = require('body-parser')
var express = require("express")
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
            data.forEach((comment, i) => {
              if (comment.time === parseInt(req.params.cid)) {
                data[i].like++
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
            data.forEach((comment, i) => {
              if (comment.time === parseInt(req.params.cid)) {
                data.splice(i, 1)
                res.send()
              }
            })
            fs.writeFileSync(dir + req.params.id, JSON.stringify(data))
          }
        })
    })

    return (req, res) => {
        sumo.info('plugin-comments', 'new comments', req.get('Referer'))

        var previous_comments = []
        
        fs.readFile(dir + req.params.id, (err, data) => {
          if (!err && data) {
            previous_comments = JSON.parse(data)
          }
          previous_comments.push({name: req.body.name, message: req.body.message, like: 0, time: Date.now()})
          fs.writeFileSync(dir + req.params.id, JSON.stringify(previous_comments))
          res.redirect(req.get('Referer'))
        })
    }
    
}