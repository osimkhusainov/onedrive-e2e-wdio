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
    return $('button[name="Download"]');
  }

  get deleteButton() {
    return $('button[name="Delete"]');
  }

  get confirmButton() {
    return $('[data-automationid="confirmbutton"]');
  }

  get successfullDeleteAlert() {
    return $('div*=Deleted');
  }

  get iconMore() {
    return $('i[data-icon-name="More"]');
  }

  async checkboxForCreatedFile(fileName) {
    return await $(`div[title='${fileName}.txt']`);
  }

  async checkSuccessfullSaveMessage(fileName) {
    await expect(await this.successfullSaveAlert.getText()).toContain(
      'Saved ' + fileName
    );
  }

  async checkSuccesfullDeleteMessage(count) {
    await this.successfullDeleteAlert.waitForDisplayed({
      timeout: 15000,
    });
    await expect(await this.successfullDeleteAlert.getText()).toContain(
      `Deleted ${count} ${count > 1 ? 'items' : 'item'}`
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

  async clickOnDeleteButton() {
    if (!(await this.deleteButton.isDisplayed())) {
      await this.iconMore.waitForDisplayed();
      await this.iconMore.click();
    }
    await this.deleteButton.waitForDisplayed();
    await this.deleteButton.click();
  }

  async clickOnNewButton() {
    await this.newButton.waitForDisplayed();
    await this.newButton.click();
  }

  async addTextToFile(text) {
    await this.textarea.waitForDisplayed();
    await this.textarea.setValue(text);
  }

  async clickOnSaveButton() {
    await this.saveButton.waitForDisplayed();
    await this.saveButton.click();
  }

  async clickOnDownloadButton() {
    await this.downloadButton.waitForDisplayed();
    await this.downloadButton.click();
  }

  async clickOnConfirmButton() {
    await this.confirmButton.waitForDisplayed();
    await this.confirmButton.click();
  }

  async clickOnCheckboxWithName(name) {
    const checkbox = await this.checkboxForCreatedFile(name);
    await checkbox.waitForExist();
    await checkbox.click();
  }
}

module.exports = new MyFilesPage();
