// Generated at: 2026-02-03T04:41:53.239Z
// Platform: CONTRABASS
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class AutoRecorded_user_test extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * user test process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processuserTest(config) {
    try {
      console.log('🚀 Starting user test process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), 'Navigate to page', 3);
      await this.executeWithRetry(() => this.clickUsernameButton(config), 'Click username button', 3);
      await this.executeWithRetry(() => this.fillUsername(config), 'Fill username', 3);
      await this.executeWithRetry(() => this.clickPasswordButton(config), 'Click password button', 3);
      await this.executeWithRetry(() => this.fillPassword(config), 'Fill password', 3);
      await this.executeWithRetry(() => this.clickLoginButton(config), 'Click login button', 3);
      await this.executeWithRetry(() => this.navigateToPage2(config), 'Navigate to page', 3);
      
      console.log('✅ user test process completed');
      return { success: true, message: 'user test completed' };
      
    } catch (error) {
      console.error('❌ user test failed:', error.message);
      throw error;
    }
  }

  /**
   * Navigate to page
   */
  async navigateToPage(config) {
    console.log('📝 Executing: Navigate to page...');
    await this.page.goto('https://305tst.console.bf.okestro.cloud/login');
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('navigateToPage');
    console.log('✅ Completed: Navigate to page');
  }

  /**
   * Click username button
   */
  async clickUsernameButton(config) {
    console.log('📝 Executing: Click username button...');
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickUsernameButton');
    console.log('✅ Completed: Click username button');
  }

  /**
   * Fill username
   */
  async fillUsername(config) {
    console.log('📝 Executing: Fill username...');
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).fill('yh.lee5');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillUsername');
    console.log('✅ Completed: Fill username');
  }

  /**
   * Click password button
   */
  async clickPasswordButton(config) {
    console.log('📝 Executing: Click password button...');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickPasswordButton');
    console.log('✅ Completed: Click password button');
  }

  /**
   * Fill password
   */
  async fillPassword(config) {
    console.log('📝 Executing: Fill password...');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill('Okestro2018!');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillPassword');
    console.log('✅ Completed: Fill password');
  }

  /**
   * Click login button
   */
  async clickLoginButton(config) {
    console.log('📝 Executing: Click login button...');
    await this.page.getByRole('button', { name: '로그인' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickLoginButton');
    console.log('✅ Completed: Click login button');
  }

  /**
   * Navigate to page
   */
  async navigateToPage2(config) {
    console.log('📝 Executing: Navigate to page...');
    await this.page.goto('https://305tst.console.bf.okestro.cloud/login');
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('navigateToPage2');
    console.log('✅ Completed: Navigate to page');
  }
}

export default AutoRecorded_user_test;
