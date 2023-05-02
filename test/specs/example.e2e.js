const path = require('path');
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const checkFileExist = require('../utils/existFile');

const fileName = faker.datatype.uuid();
const textForTest = 'Konica minolta';

describe('My Login application', () => {
  it('should login with valid credentials', async () => {
    await browser.url('/');
    await $("[aria-label='Sign in to OneDrive']").click();
    await browser.switchWindow('/about/en-us/signin/');
    await expect(browser).toHaveTitle('Sign in - Microsoft OneDrive');
    let frame = await $('.SignIn');
    await browser.switchToFrame(frame);
    const emailInput = await $('input[placeholder="Email, phone, or Skype"]');
    await emailInput.waitForDisplayed();
    await emailInput.clearValue();
    await emailInput.setValue('kmbstesthomework@outlook.com');
    const errorAlert = await $('div.allert-error');
    if (await errorAlert.isDisplayed()) {
      await $('input[value="Next"]').click();
    }
    await $('input[value="Next"]').click();
    const passwordInput = await $('input[placeholder="Password"]');
    await passwordInput.waitForDisplayed();
    await passwordInput.clearValue();
    await passwordInput.setValue('testkmbs05');
    await $('input[value="Sign in"]').click();
    const pageProtection = await $('#pageControlHost');
    if (await pageProtection.isDisplayed()) {
      await $('a#iShowSkip').click();
    }
    await $('input[name="DontShowAgain"]').click();
    await $('input[value="Yes"]').waitForDisplayed();
    await $('input[value="Yes"]').click();
    if (await pageProtection.isDisplayed()) {
      await $('a#iCancel').click();
    }

    console.log(await browser.getTitle());
    await browser.switchToParentFrame();

    await $('[data-automationid="newCommand"]').waitForDisplayed();
    await $('[data-automationid="newCommand"]').click();
    await $('span*=Plain text document').click();
    await $('.od-Dialog-content').waitForDisplayed();
    expect(
      await $('[data-automationid="actionsSection"]').$('button').isEnabled()
    ).toEqual(false);
    await $('[data-automationid="itemNameEditor-Input"]').setValue(fileName);
    expect(
      await $('[data-automationid="actionsSection"]').$('button').isEnabled()
    ).toEqual(true);
    await $('button*=Create').click();
    const alert = await $('div[role="alert"]');
    await alert.waitForDisplayed({ timeout: 30000 });
    console.log(await alert.getText());
    expect(await alert.getText()).toContain('Created ' + fileName);

    await $('textarea.inputarea').waitForDisplayed();
    await $('textarea.inputarea').setValue(textForTest);
    const saveBtn = await $('[data-automationid="save"]');
    await saveBtn.waitForDisplayed();
    await saveBtn.click();
    expect(await $('div.OperationMonitor').getText()).toContain(
      'Saved ' + fileName
    );
    await $('[data-automationid="close"]').click();

    const checkbox = await $(`div[title='${fileName}.txt']`);
    await checkbox.waitForExist();
    await checkbox.click();
    const downloadBtn = await $(
      '[data-automation-id="visibleContent"] button[name="Download"]'
    );
    await downloadBtn.waitForDisplayed();
    await downloadBtn.click();
    const filePath = path.join(global.downloadDir, fileName + '.txt');
    await checkFileExist(filePath);
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) throw err;
      expect(data).toEqual(textForTest);
    });

    await browser.pause(10000);
  });
});
