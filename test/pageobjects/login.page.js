const Page = require('./page');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoginPage extends Page {
  /**
   * define selectors using getter methods
   */
  get iFrame() {
    return $('.SignIn');
  }

  get emailInput() {
    return $('input[placeholder="Email, phone, or Skype"]');
  }

  get passwordInput() {
    return $('input[placeholder="Password"]');
  }

  get signInButton() {
    return $('input[value="Sign in"]');
  }

  get errorAlert() {
    return $('div.allert-error');
  }

  get nextButton() {
    return $('input[value="Next"]');
  }

  get pageProtectionModal() {
    return $('#pageControlHost');
  }

  get skipProtectionButton() {
    return $('a#iShowSkip');
  }

  get yesButton() {
    return $('input[value="Yes"]');
  }

  get cancelLink() {
    return $('a#iCancel');
  }

  /**
   * a method to encapsule automation code to interact with the page
   * e.g. to login using username and password
   */

  async switchToiFrame() {
    let frame = await this.iFrame;
    await browser.switchToFrame(frame);
  }

  async getEmailInputAndSetValue(email) {
    const emailInput = await this.emailInput;
    await emailInput.waitForDisplayed();
    await emailInput.clearValue();
    await emailInput.setValue(email);
  }

  async getPasswordInputAndSetValue(password) {
    const passwordInput = await this.passwordInput;
    await passwordInput.waitForDisplayed();
    await passwordInput.clearValue();
    await passwordInput.setValue(password);
  }

  async skipErrorAlertIfExist() {
    const errorAlert = await this.errorAlert;
    if (await errorAlert.isDisplayed()) {
      await this.nextButton.click();
    }
  }

  async skipPageProtectionModalIfExist() {
    const pageProtection = await this.pageProtectionModal;
    if (await pageProtection.isDisplayed()) {
      await this.skipProtectionButton.click();
    }
  }

  async cancelAdditionalModalsIfExist() {
    const pageProtection = await this.pageProtectionModal;
    if (await pageProtection.isDisplayed()) {
      await this.cancelLink.click();
    }
  }
}

module.exports = new LoginPage();
