var login = require('./actions/login.js')
var project = require('./actions/project.js')
var request = require('request')
var logged = false
var project_name

module.exports = {
    before: (client) => {
        project_name = client.globals.project
    },

    after: (client) => {
        client.end()
    },

    'Delete project (with falsy value first)': (client) => {
        // log in, and expect to have 1 project on this test account (created on previous test)
        login(client)
            .expect.element(project.ui.repos_public_label)
            .text.to.not.be.equal('0')

        // click on "public project" title (and wait for animation)
        client
            .click(project.ui.repos_public_title)

        // delete project and close the client session
        project
            .delete(client, project_name)
            .pause(5000)
            .end()
    },

    'Delete project check': (client) => {
        // expect modal to be invisible and project repos label to 0
        login(client)
            .click(project.ui.repos_public_title)
            .pause(100)
            .expect.element('.menu .repo' + project_name)
            .to.not.be.present
    }
};
