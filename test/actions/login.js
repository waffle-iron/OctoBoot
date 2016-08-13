module.exports = function(client) {
    return client
      .url(client.launchUrl)
      .waitForElementVisible('i.github.square.icon', 1000)
      .assert.containsText('.modal .header', 'Log In')
      .assert.containsText('.ok.button', 'Connect me')
      .click('.ok.button')
      .assert.urlContains('github')
      .setValue('input[name=login]', client.globals.github_login)
      .setValue('input[name=password]', client.globals.github_pass)
      .click('input[type=submit]')
      .pause(100)
      .getTitle((t) => {
          // fix an GitHub API Issue, if we connect too many time to fast, we need to re authorize
          if (t.match(/^Authorize/)) {
              client.click('button[type=submit][name=authorize]')
          }
      })
      .waitForElementVisible('.profil', 2000)
      .assert.containsText('.profil .name', client.globals.github_login)
      .pause(1000)
}
