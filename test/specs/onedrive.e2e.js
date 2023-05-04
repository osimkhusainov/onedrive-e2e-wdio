const path = require('path');
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const report = require('@wdio/allure-reporter');
const checkFileExist = require('../utils/existFile');
const userCreds = require('../data/credentials.json');
const LandingPage = require('../pageobjects/landing.page');
const LoginPage = require('../pageobjects/login.page');
const MyFilesPage = require('../pageobjects/myFiles.page');

describe('OneDrive e2e testing', () => {
  const { email, password } = userCreds;
  const fileName = faker.datatype.uuid();
  const textForTest = faker.lorem.sentence();
  const filePath = path.join(global.downloadDir, fileName + '.txt');

  it('TC-1: Open the website and switch to auth window', async () => {
    await LandingPage.open();
    await LandingPage.clickOnLoginAndSwitchWindow();
    await expect(browser).toHaveTitle('Sign in - Microsoft OneDrive');
  });

  it("TC-2: Switch to iFrame, enter valid email address and click on 'Next'", async () => {
    await LoginPage.switchToiFrame();
    await LoginPage.getEmailInputAndSetValue(email);
    await LoginPage.skipErrorAlertIfExist();
    await LoginPage.nextButton.click();
  });

  it("TC-3: Enter valid password and click on 'Sign in'", async () => {
    await LoginPage.getPasswordInputAndSetValue(password);
    await LoginPage.signInButton.click();
  });

  it("TC-4: When the 'Stay signed in' modal shows up, click on 'Yes' and switch to the parent frame", async () => {
    await LoginPage.skipPageProtectionModalIfExist();
    // the 'Stay sign in?' modal shows up always even though you click on the 'Do not show again' checkbox
    await LoginPage.clickOnYesButton();
    await LoginPage.cancelAdditionalModalsIfExist();
    await expect(browser).toHaveTitle('My files - OneDrive');
    // Switch to parent frame from iFrame
    await browser.switchToParentFrame();
  });

  it("TC-5: Click on 'New' and create .txt file", async () => {
    await MyFilesPage.clickOnNewButton();
    await MyFilesPage.textDocument.click();
    await MyFilesPage.checkIfCreateButtonIsEnabled(false);
    await MyFilesPage.fileNameInput.setValue(fileName);
    await MyFilesPage.checkIfCreateButtonIsEnabled(true);
    await MyFilesPage.createButton.click();
    report.addStep('Created a file with the name: ' + fileName + '.txt');
    await MyFilesPage.checkSuccessAlertWithFileName(fileName);
  });

  it('TC-6: Add some test text to the file, save and close it', async () => {
    await MyFilesPage.addTextToFile(textForTest);
    await MyFilesPage.clickOnSaveButton();
    await MyFilesPage.checkSuccessfullSaveMessage(fileName);
    await MyFilesPage.closeButton.click();
    await MyFilesPage.newButton.waitForDisplayed();
  });

  it('TC-7: Download the file and compare the contents', async () => {
    // Will download the file, open it and check its text and the text of the 'textForTest' variable.
    // After tests the 'download' folder will be deleted
    await MyFilesPage.clickOnCheckboxWithName(fileName);
    await MyFilesPage.clickOnDownloadButton();
    await checkFileExist(filePath);
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) throw err;
      expect(data).toEqual(textForTest);
    });
  });

  it("TC-8: Click on 'Delete' button and click on a confirmation button and check successfull delete message", async () => {
    await MyFilesPage.clickOnDeleteButton();
    await MyFilesPage.clickOnConfirmButton();
    // Pass to the script below how many files we are deleting
    await MyFilesPage.checkSuccesfullDeleteMessage(1);
  });

  it('TC-9: File should not exist anymore', async () => {
    const checkbox = await MyFilesPage.checkboxForCreatedFile(fileName);
    await checkbox.waitForDisplayed({ reverse: true });
    await expect(await checkbox.isDisplayed()).toBe(false);
  });
});
