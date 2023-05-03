const Page = require('./page');

class LandingPage extends Page {
  get signInButton() {
    return $("[aria-label='Sign in to OneDrive']");
  }
  async open() {
    await super.open('/');
  }

  async clickOnLoginAndSwitchWindow() {
    await this.signInButton.click();
    await browser.switchWindow('/about/en-us/signin/');
    await expect(browser).toHaveTitle('Sign in - Microsoft OneDrive');
  }
}

module.exports = new LandingPage();
