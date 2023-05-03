const path = require('path');
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const checkFileExist = require('../utils/existFile');
const userCreds = require('../data/credentials.json');
const LandingPage = require('../pageobjects/landing.page');
const LoginPage = require('../pageobjects/login.page');
const MyFilesPage = require('../pageobjects/myFiles.page');

describe('OneDrive Automation', () => {
  const { email, password } = userCreds;
  const fileName = faker.datatype.uuid();
  const textForTest = faker.lorem.sentence();
  const filePath = path.join(global.downloadDir, fileName + '.txt');

  describe('Login to the OneDrive web application using valid user credentials', () => {
    it('Open the website and switch to auth window', async () => {
      await LandingPage.open();
      await LandingPage.clickOnLoginAndSwitchWindow();
    });

    it("Switch to iFrame, enter valid email address and click on 'Next'", async () => {
      await LoginPage.switchToiFrame();
      await LoginPage.getEmailInputAndSetValue(email);
      await LoginPage.skipErrorAlertIfExist();
      await LoginPage.nextButton.click();
    });

    it("Enter valid password and click on 'Sign in'", async () => {
      await LoginPage.getPasswordInputAndSetValue(password);
      await LoginPage.signInButton.click();
    });

    it("When the 'Stay signed in' modal shows up, click on 'Yes' and switch to the parent frame", async () => {
      await LoginPage.skipPageProtectionModalIfExist();
      // the 'Stay sign in?' modal shows up always even though you click on the 'Do not show again' checkbox
      await LoginPage.yesButton.waitForDisplayed();
      await LoginPage.yesButton.click();
      await LoginPage.cancelAdditionalModalsIfExist();
      await expect(browser).toHaveTitle('My files - OneDrive');
      // Switch to parent frame from iFrame
      await browser.switchToParentFrame();
    });
  });

  describe('Create new .txt file', () => {
    it("Click on 'New' and create .txt file", async () => {
      await MyFilesPage.newButton.waitForDisplayed();
      await MyFilesPage.newButton.click();
      await MyFilesPage.textDocument.click();
      await MyFilesPage.checkIfCreateButtonIsEnabled(false);
      await MyFilesPage.fileNameInput.setValue(fileName);
      await MyFilesPage.checkIfCreateButtonIsEnabled(true);
      await MyFilesPage.createButton.click();
      await MyFilesPage.checkSuccessAlertWithFileName(fileName);
    });

    it('Add some test text to the file, save and close it', async () => {
      await MyFilesPage.textarea.waitForDisplayed();
      await MyFilesPage.textarea.setValue(textForTest);
      await MyFilesPage.saveButton.waitForDisplayed();
      await MyFilesPage.saveButton.click();
      await MyFilesPage.checkSuccessfullSaveMessage(fileName);
      await MyFilesPage.closeButton.click();
    });
  });

  describe('Download and check the content of the file', () => {
    it('Wait until the file appears on the file list and click on its checkbox', async () => {
      const checkbox = await MyFilesPage.checkboxForCreatedFile(fileName);
      await checkbox.waitForExist();
      await checkbox.click();
    });

    it('Download the file and compare the contents', async () => {
      await MyFilesPage.downloadButton.waitForDisplayed();
      await MyFilesPage.downloadButton.click();
      await checkFileExist(filePath);
      fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;
        expect(data).toEqual(textForTest);
      });
    });
  });

  describe('Delete the file', () => {
    it("Click on 'Delete' button and click on a confirmation button and check successfull delete message", async () => {
      await MyFilesPage.deleteButton.waitForDisplayed();
      await MyFilesPage.deleteButton.click();
      await MyFilesPage.confirmButton.waitForDisplayed();
      await MyFilesPage.confirmButton.click();
      await MyFilesPage.successfullDeleteAlert.waitForDisplayed({
        timeout: 15000,
      });
      await MyFilesPage.checkSuccesfullDeleteMessage();
    });

    it('There is no created file on the file list', async () => {
      const checkbox = await MyFilesPage.checkboxForCreatedFile(fileName);
      await checkbox.waitForDisplayed({ reverse: true });
      await expect(await checkbox.isDisplayed()).toBe(false);
    });
  });
});
