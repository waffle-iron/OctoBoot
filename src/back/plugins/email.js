var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var fs = require('fs');

var transporter;

fs.readFile(__dirname + '/../../../mailgun.api.login.json', function(error, data) {
    if (error) {
        console.log('plugin mailgun error - mailgun.api.login.json missing')
    } else {
        console.log(data.toString())
        transporter = nodemailer.createTransport({
             service: 'Mailgun', // no need to set host or port etc.
             auth: JSON.parse(data.toString())
        });
    }
})

module.exports = function(app) {
    
    app.use(bodyParser.urlencoded({ extended: true }))

    return function(req, res) {
        var mailOptions, body = '';
    
        if (req.params.from && req.params.to) {
            for (var param in req.body) {
                body += param + ': ' + req.body[param] + '\n'
            }

            mailOptions = {
                from: req.params.from,
                to: req.params.to,
                subject: req.params.subject || '',
                text: body
            }
                
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return res.status(404).send('Error !')
                }
                res.send('Email sended !')
            });
            
        } else {
            res.status(404).send('Error !')
        }
    }
    
}