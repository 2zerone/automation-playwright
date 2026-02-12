// Generated at: 2026-02-11T08:29:54.121Z
// Platform: CMP
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class AutoRecorded_cmp_test extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * cmp test process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processCmpTest(config) {
    try {
      console.log('🚀 Starting cmp test process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), 'Navigate to page', 3);
      await this.executeWithRetry(() => this.fillUsernameTextbox(config), 'Fill username', 3);
      await this.executeWithRetry(() => this.fillPasswordTextbox(config), 'Fill password', 3);
      await this.executeWithRetry(() => this.clickLoginButton(config), 'Click login button', 3);
      
      console.log('✅ cmp test process completed');
      return { success: true, message: 'cmp test completed' };
      
    } catch (error) {
      console.error('❌ cmp test failed:', error.message);
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
   * Fill username
   */
  async fillUsernameTextbox(config) {
    console.log('📝 Executing: Fill username...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const usernameValue = await this.processUniqueValue('username', 'yh.lee5');
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).fill(usernameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillUsernameTextbox');
    console.log('✅ Completed: Fill username');
  }

  /**
   * Fill password
   */
  async fillPasswordTextbox(config) {
    console.log('📝 Executing: Fill password...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const passwordValue = await this.processUniqueValue('password', 'Okestro2018!');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill(passwordValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillPasswordTextbox');
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
}

export default AutoRecorded_cmp_test;
