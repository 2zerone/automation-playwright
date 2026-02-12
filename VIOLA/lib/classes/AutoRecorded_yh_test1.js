// Generated at: 2026-02-09T09:28:59.698Z
// Platform: VIOLA
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class AutoRecorded_yh_test1 extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * yh test1 process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processYhTest1(config) {
    try {
      console.log('🚀 Starting yh test1 process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), 'Navigate to page', 3);
      await this.executeWithRetry(() => this.fillUsernameTextbox(config), 'Fill username', 3);
      await this.executeWithRetry(() => this.fillPasswordTextbox(config), 'Fill password', 3);
      await this.executeWithRetry(() => this.clickLoginButton(config), 'Click login button', 3);
      await this.executeWithRetry(() => this.clickField(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField2(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField3(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickCreateButton(config), 'Click create button', 3);
      await this.executeWithRetry(() => this.clickElement(config), 'Click element', 3);
      await this.executeWithRetry(() => this.clickElement2(config), 'Click element', 3);
      await this.executeWithRetry(() => this.fillNameTextbox(config), 'Fill name', 3);
      await this.executeWithRetry(() => this.clickConfirmButton(config), 'Click confirm button', 3);
      
      console.log('✅ yh test1 process completed');
      return { success: true, message: 'yh test1 completed' };
      
    } catch (error) {
      console.error('❌ yh test1 failed:', error.message);
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

  /**
   * Click field
   */
  async clickField(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('워크플로우').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click field
   */
  async clickField2(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('워크로드').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField2');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click field
   */
  async clickField3(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('컨테이너 관리').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField3');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click create button
   */
  async clickCreateButton(config) {
    console.log('📝 Executing: Click create button...');
    await this.page.getByRole('button', { name: 'add 생성' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickCreateButton');
    console.log('✅ Completed: Click create button');
  }

  /**
   * Click element
   */
  async clickElement(config) {
    console.log('📝 Executing: Click element...');
    await this.page.locator('#rc_select_4').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement');
    console.log('✅ Completed: Click element');
  }

  /**
   * Click element
   */
  async clickElement2(config) {
    console.log('📝 Executing: Click element...');
    await this.page.getByTitle('default').locator('div').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement2');
    console.log('✅ Completed: Click element');
  }

  /**
   * Fill name
   */
  async fillNameTextbox(config) {
    console.log('📝 Executing: Fill name...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const nameValue = await this.processUniqueValue('name', 'yh-namespace');
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요.', exact: true }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요.', exact: true }).fill(nameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillNameTextbox');
    console.log('✅ Completed: Fill name');
  }

  /**
   * Click confirm button
   */
  async clickConfirmButton(config) {
    console.log('📝 Executing: Click confirm button...');
    await this.page.getByRole('button', { name: '중복확인' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickConfirmButton');
    console.log('✅ Completed: Click confirm button');
  }
}

export default AutoRecorded_yh_test1;
