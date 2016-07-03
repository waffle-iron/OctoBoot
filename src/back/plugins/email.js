var nodemailer = require('nodemailer')
var bodyParser = require('body-parser')
var sumo = require("../services/sumologic.js")
var fs = require('fs')

exports.transporter = {}

fs.readFile(__dirname + '/../../../mailgun.api.login.json', (error, data) => {
    if (error) {
        console.log('plugin mailgun error - mailgun.api.login.json missing')
    } else {
        exports.transporter = nodemailer.createTransport({
             service: 'Mailgun', // no need to set host or port etc.
             auth: JSON.parse(data.toString())
        })
    }
})

exports.form = (app) => {

    app.use(bodyParser.urlencoded({ extended: true }))

    return (req, res) => {
        var mailOptions, body = '';

        if (req.params.from && req.params.to) {

            sumo.info('plugin-email', req.params.from, req.params.to)

            for (var param in req.body) {
                body += param + ': ' + req.body[param] + '\n'
            }

            mailOptions = {
                from: req.params.from,
                to: req.params.to,
                subject: req.params.subject || '',
                text: body
            }

            exports.transporter.sendMail(mailOptions, (error, info) => {
                if(error){
                    sumo.error('plugin-email', req.params.from, req.params.to, error)
                    return res.status(404).send('Error !')
                }
                res.send('Email sended !')
            });

        } else {
            res.status(404).send('Error !')
            sumo.error('plugin-email', req.params.from, req.params.to, error)
        }
    }

}
