var login = require('./actions/login.js')
var project = require('./actions/project.js')
var logged = false
var project_name

module.exports = {
    before: (client) => {
        project_name = client.globals.project
    },

    after: (client) => {
        client.end()
    },

    'Check if project to delete': (client) => {
        login(client)
            .waitForElementNotPresent('.menu .repo' + project_name, 1000, false, (r) => {
                console.log(r.status)
                if (r.status !== 0) {
                    // click on "public project" title (and wait for animation)
                    client
                        .click(project.ui.repos_public_title)

                    // delete project and close the client session
                    project
                        .delete(client, project_name)
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

        client
            .expect.element(project.ui.repos_public_label)
            .text.to.be.equal('0')
            .before(2000)

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

    'Toolsbar - New Page should work': (client) => {
        client
            .click('.toolbar .item.new')

        // then, after click, it should be visible
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
