const path = require('path');
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const checkFileExist = require('../utils/existFile');
const userCreds = require('../data/credentials.json');
const Page = require('../pageobjects/page');

describe('OneDrive Automation', () => {
  const { email, password } = userCreds;
  const fileName = faker.datatype.uuid();
  const textForTest = faker.lorem.sentence();
  const filePath = path.join(global.downloadDir, fileName + '.txt');

  describe('Login to the OneDrive web application using valid user credentials', () => {
    it('Open the website and switch to auth window', async () => {
      await Page.open('/');
      await $("[aria-label='Sign in to OneDrive']").click();
      await browser.switchWindow('/about/en-us/signin/');
      await expect(browser).toHaveTitle('Sign in - Microsoft OneDrive');
    });

    it("Switch to iFrame, enter valid email address and click on 'Next'", async () => {
      let frame = await $('.SignIn');
      await browser.switchToFrame(frame);
      const emailInput = await $('input[placeholder="Email, phone, or Skype"]');
      await emailInput.waitForDisplayed();
      await emailInput.clearValue();
      await emailInput.setValue(email);
      const errorAlert = await $('div.allert-error');
      if (await errorAlert.isDisplayed()) {
        await $('input[value="Next"]').click();
      }
      await $('input[value="Next"]').click();
    });

    it("Enter valid password and click on 'Sign in'", async () => {
      const passwordInput = await $('input[placeholder="Password"]');
      await passwordInput.waitForDisplayed();
      await passwordInput.clearValue();
      await passwordInput.setValue(password);
      await $('input[value="Sign in"]').click();
    });

    it("When the 'Stay signed in' modal shows up, click on 'Yes' and switch to the parent frame", async () => {
      const pageProtection = await $('#pageControlHost');
      if (await pageProtection.isDisplayed()) {
        await $('a#iShowSkip').click();
      }
      await $('input[value="Yes"]').waitForDisplayed();
      await $('input[value="Yes"]').click();
      if (await pageProtection.isDisplayed()) {
        await $('a#iCancel').click();
      }
      await expect(browser).toHaveTitle('My files - OneDrive');
      await browser.switchToParentFrame();
    });
  });
  describe('Create new .txt file', () => {
    it("Click on 'New' and create .txt file", async () => {
      await $('[data-automationid="newCommand"]').waitForDisplayed();
      await $('[data-automationid="newCommand"]').click();
      await $('span*=Plain text document').click();
      await $('.od-Dialog-content').waitForDisplayed();
      await expect(
        await $('[data-automationid="actionsSection"]').$('button').isEnabled()
      ).toEqual(false);
      await $('[data-automationid="itemNameEditor-Input"]').setValue(fileName);
      await expect(
        await $('[data-automationid="actionsSection"]').$('button').isEnabled()
      ).toEqual(true);
      await $('button*=Create').click();
      const alert = await $('div[role="alert"]');
      await alert.waitForDisplayed({ timeout: 30000 });
      await expect(await alert.getText()).toContain('Created ' + fileName);
    });

    it('Add some test text to the file, save and close it', async () => {
      await $('textarea.inputarea').waitForDisplayed();
      await $('textarea.inputarea').setValue(textForTest);
      const saveBtn = await $('[data-automationid="save"]');
      await saveBtn.waitForDisplayed();
      await saveBtn.click();
      await expect(await $('div.OperationMonitor').getText()).toContain(
        'Saved ' + fileName
      );
      await $('[data-automationid="close"]').click();
    });
  });

  describe('Download and check the content of the file', () => {
    it('Wait until the file appears on the file list and click on its checkbox', async () => {
      const checkbox = await $(`div[title='${fileName}.txt']`);
      await checkbox.waitForExist();
      await checkbox.click();
    });
    it('Download the file and compare the contents', async () => {
      const downloadBtn = await $(
        '[data-automation-id="visibleContent"] button[name="Download"]'
      );
      await downloadBtn.waitForDisplayed();
      await downloadBtn.click();
      await checkFileExist(filePath);
      fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;
        expect(data).toEqual(textForTest);
      });
    });
  });

  describe('Delete the file', () => {
    it("Click on 'Delete' button and click on a confirmation button", async () => {
      const deleteBtn = await $(
        '[data-automation-id="visibleContent"] button[name="Delete"]'
      );
      await deleteBtn.waitForDisplayed();
      await deleteBtn.click();
      const confirmBtn = await $('[data-automationid="confirmbutton"]');
      await confirmBtn.waitForDisplayed();
      await confirmBtn.click();
    });
    it("Check an confirmation alert and make sure it's deleted from the files list", async () => {
      const deleteAlert = await $('div*=Deleted');
      await deleteAlert.waitForDisplayed({ timeout: 15000 });
      await expect(await deleteAlert.getText()).toContain('Deleted 1 item');
      const checkbox = await $(`div[title='${fileName}.txt']`);
      await checkbox.waitForDisplayed({ reverse: true });
      await expect(await checkbox.isDisplayed()).toBe(false);
    });
  });
});
