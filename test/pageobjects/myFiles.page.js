const Page = require('./page');

class MyFilesPage extends Page {
  get newButton() {
    return $('[data-automationid="newCommand"]');
  }

  get textDocument() {
    return $('span*=Plain text document');
  }

  get dialogContent() {
    return $('.od-Dialog-content');
  }

  get createButton() {
    return $('button*=Create');
  }

  get fileNameInput() {
    return $('[data-automationid="itemNameEditor-Input"]');
  }

  get alertModal() {
    return $('div[role="alert"]');
  }

  get textarea() {
    return $('textarea.inputarea');
  }

  get saveButton() {
    return $('[data-automationid="save"]');
  }

  get successfullSaveAlert() {
    return $('div.OperationMonitor');
  }

  get closeButton() {
    return $('[data-automationid="close"]');
  }

  get downloadButton() {
    return $('[data-automation-id="visibleContent"] button[name="Download"]');
  }

  get deleteButton() {
    return $('[data-automation-id="visibleContent"] button[name="Delete"]');
  }

  get confirmButton() {
    return $('[data-automationid="confirmbutton"]');
  }

  get successfullDeleteAlert() {
    return $('div*=Deleted');
  }

  async checkboxForCreatedFile(fileName) {
    return await $(`div[title='${fileName}.txt']`);
  }

  async checkSuccessfullSaveMessage(fileName) {
    await expect(await this.successfullSaveAlert.getText()).toContain(
      'Saved ' + fileName
    );
  }

  async checkSuccesfullDeleteMessage() {
    await expect(await this.successfullDeleteAlert.getText()).toContain(
      'Deleted 1 item'
    );
  }

  async clickOnCreateTextDocument() {
    const newBtn = await this.newButton;
    await newBtn.waitForDisplayed();
    await newBtn.click();
    await this.dialogContent.waitForDisplayed();
  }

  async checkIfCreateButtonIsEnabled(boolean) {
    await expect(await this.createButton.isEnabled()).toEqual(boolean);
  }

  async checkSuccessAlertWithFileName(fileName) {
    const alert = await this.alertModal;
    await alert.waitForDisplayed({ timeout: 30000 });
    await expect(await alert.getText()).toContain('Created ' + fileName);
  }

  async clickOnLoginAndSwitchWindow() {
    await this.signInButton.click();
    await browser.switchWindow('/about/en-us/signin/');
    await expect(browser).toHaveTitle('Sign in - Microsoft OneDrive');
  }
}

module.exports = new MyFilesPage();
