module.exports = {
    ui: {
        repos_public: '.item.ReposPublic',
        repos_public_title: '.item.ReposPublic b',
        repos_public_label: '.item.ReposPublic span.label',
        repos_public_new: '.item.ReposPublic .menu a.item:nth-child(1)',
        modals: 'body > .dimmer.modals.page',
        modal: '.modal.active',
        modal_title: '.modal.active .header',
        modal_input: '.modal.active input',
        modal_ok: '.modal.active .ok.button',
        modal_nok: '.modal.active .deny.button'
    },
    create: (client, name) => {

        // "new +" button should be present and visible
        client
            .expect.element(module.exports.ui.repos_public_new)
            .to.be.visible

        // and contain NEW txt
        client
            .expect.element(module.exports.ui.repos_public_new)
            .text.to.contains('NEW')

        // the "new project" modal should not be visible before click on "new +"
        client
            .expect.element(module.exports.ui.modals)
            .to.not.be.present

        // click on new +
        client
            .click(module.exports.ui.repos_public_new)

        // then, after click, it should be visible
        client
            .expect.element(module.exports.ui.modals)
            .to.be.visible
            .after(100)

        // the modal should have "New Project" on .header
        client
            .expect.element(module.exports.ui.modal_title)
            .text.to.be.equal('New Project')
            .before(1000)

        // fill our name for test project
        client
            .setValue(module.exports.ui.modal_input, name)
            .click(module.exports.ui.modal_ok)

        // expect to be waiting for project creation
        client
            .expect.element(module.exports.ui.modal_ok + ' i.spinner.loading')
            .to.be.present

        // modal has to disappear on success
        client
            .waitForElementNotPresent(module.exports.ui.modal, 20000)
            .waitForElementNotVisible('.sidebar', 1000)

        // toolbar should be visible
        client
            .expect.element('.toolbar')
            .to.be.visible

        // and to the good position (0,0)
        client
            .getLocation('.toolbar', (r) => {
                client.assert.equal(r.value.x, 0)
                client.assert.equal(r.value.y, 0)
            })

        // url value (on dropdown) should be good
        client
            .expect.element('span.text')
            .text.to.be.equal('/' + name + '/index.html')

        // and iframes src too
        client
            .assert.attributeContains('iframe:nth-child(1)', 'src', '/logo.html')
        client
            .assert.attributeContains('iframe:nth-child(2)', 'src', '/' + name + '/index.html')

        return client
    },
    delete: (client, name) => {
        // expect our previously created project to be here and visible
        client
            .waitForElementVisible('.menu .repo' + name, 1000)

        // with trash icon
        client
            .expect.element('.menu .repo' + name + ' i.trash.icon')
            .to.be.present.and.visible

        // click on this trash icon (and wait for animation)
        client
            .click('.menu .repo' + name + ' i.trash.icon')

        // expect Alert modal to be open / visible
        client
            .waitForElementVisible(module.exports.ui.modals, 1000)
            .waitForElementVisible(module.exports.ui.modal, 2000)

        // with the good value / infos
        client
            .expect.element(module.exports.ui.modal_title)
            .text.to.be.equal('Delete website')
        client
            .expect.element(module.exports.ui.modal + ' i.warning.sign')
            .to.be.present.and.visible

        // try to fill input with wrong value, click and wait a little
        client
            .setValue(module.exports.ui.modal_input, 'blabla') // fill wrong value
            .click(module.exports.ui.modal_ok)
            .pause(100)

        // modal should still be present after a click on ok
        client
            .expect.element(module.exports.ui.modal)
            .to.be.present.and.visible

        // fill good value to delete test project
        client
            .clearValue(module.exports.ui.modal_input)
            .setValue(module.exports.ui.modal_input, name)
            .click(module.exports.ui.modal_ok)
            .waitForElementNotVisible(module.exports.ui.modals, 20000)

        client
            .expect.element(module.exports.ui.modal)
            .to.not.be.present

        return client
    }
}
