var login = require('./actions/login.js')
var project = require('./actions/project.js')
var request = require('request')
var logged = false
var project_name

module.exports = {
    before: (client) => {
        project_name = client.globals.project
    },

    after: (client, done) => {
        client
            .getAttribute('iframe:nth-child(2)', 'src', (r) => {
                client.assert.equal(typeof r, 'object', 'iframe src should exist')
                request(r.value, (err, resp, body1) => {
                    client.assert.ifError(err)
                    request(r.value.replace('tata', 'toto'), (err, resp, body2) => {
                        client.assert.ifError(err)
                        client.assert.equal(body1, body2, 'iframe src and template should be equal')
                        done()
                    })
                })
            })
            .end()
    },

    'Check if project to delete': (client) => {
        login(client)
            .waitForElementNotPresent('.menu .repo' + project_name, 1000, false, (r) => {
                if (r.value.length) {
                    // click on "public project" title (and wait for animation)
                    client
                        .click(project.ui.repos_public_title)

                    // delete project and close the client session
                    project
                        .delete(client, project_name)
                        .pause(5000)
                        .end()
                } else {
                    logged = true
                }
            })
    },

    'Create project' : (client) => {
        // log in, and expect to have 0 project on this test account
        if (!logged) {
            login(client)
        }

        // button "new +" should not be visible before click on public project header
        client
            .expect.element(project.ui.repos_public_new)
            .to.not.be.visible

        // click on "public project" title
        client
            .click(project.ui.repos_public_title)
            .pause(500)

        // create project
        project
            .create(client, project_name)
    },

    'Toolsbar should be complete': (client) => {
        ['new', 'save', 'publish', 'edit', 'duplicate', 'background', 'remove', 'upload']
            .forEach((bt) => {
                client
                    .expect.element('.toolbar .item.' + bt)
                    .to.be.present.and.visible
            })
    },

    'Toolsbar - New Page from template should work': (client) => {
        client
            .click('.toolbar .item.new')

        client
            .expect.element(project.ui.modals)
            .to.be.visible
            .before(100)

        // the modal should have "New Page" on .header
        client
            .expect.element(project.ui.modal_title)
            .to.be.visible
            .and
            .text.to.be.equal('New Page')
            .before(1000)

        client
            .expect.element(project.ui.modal_ok)
            .to.be.visible
            .and
            .text.to.be.equal('DUPLICATE')

        client
            .expect.element(project.ui.modal_nok)
            .to.be.visible
            .and
            .text.to.be.equal('TEMPLATE')

        client
            .click(project.ui.modal_nok)

        client
            .expect.element(project.ui.modals)
            .to.be.visible
            .before(1000)

        // the modal should have "Select a template and fill the name for your new page" on .header
        client
            .expect.element(project.ui.modal_title)
            .to.be.visible
            .and
            .text.to.be.equal('Select a template and fill the name for your new page')
            .before(1000)

        // the input search should search correctly
        client
            .setValue(project.ui.modal_input + '.search', 'blog')
            .expect.element(project.ui.modal + ' .dropdown .item.selected')
            .to.have.attribute('data-value')
            .equals('[bootstrap] - blog')

        // on click on ok, the modals should disappear
        client
            .click(project.ui.modal + ' .dropdown .item.selected')
            .click(project.ui.modal_ok)
            .waitForElementNotPresent(project.ui.modal, 100)
            .waitForElementNotVisible(project.ui.modals, 1000)
    },

    'Toolsbar - New Page duplicate should work': (client) => {
        client
            .click('.toolbar .item.new')

        client
            .expect.element(project.ui.modals)
            .to.be.visible
            .before(100)

        client
            .expect.element(project.ui.modal_title)
            .to.be.visible
            .before(1000)

        client
            .click(project.ui.modal_ok)
            .expect.element(project.ui.modal_title)
            .to.be.visible
            .and
            .text.to.be.equal('Fill the name for your new page')
            .before(1000)

        client
            .setValue(project.ui.modal_input, 'toto')
            .click(project.ui.modal_ok)
            .waitForElementNotPresent(project.ui.modal, 100)
            .waitForElementNotVisible(project.ui.modals, 1000)
            .expect.element('iframe:nth-child(2)')
            .to.have.attribute('src')
            .which.contains(project_name + '/toto/index.html')
            .before(100)

        client
            .click('.toolbar .item.new')

        client
            .expect.element(project.ui.modal_title)
            .to.be.visible
            .before(1000)

        client
            .click(project.ui.modal_ok)
            .waitForElementPresent(project.ui.modal_input, 1000)
            .setValue(project.ui.modal_input, 'tata')
            .click(project.ui.modal_ok)
            .waitForElementNotPresent(project.ui.modal, 100)
            .waitForElementNotVisible(project.ui.modals, 1000)
            .expect.element('iframe:nth-child(2)')
            .to.have.attribute('src')
            .which.contains(project_name + '/tata/index.html')
            .before(100)

    }
};
