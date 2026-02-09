// Generated at: 2026-02-06T00:41:27.156Z
// Platform: VIOLA
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class AutoRecorded_testd extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * testd process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processTestd(config) {
    try {
      console.log('🚀 Starting testd process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), 'Navigate to page', 3);
      await this.executeWithRetry(() => this.fillUsernameTextbox(config), 'Fill username', 3);
      await this.executeWithRetry(() => this.fillPasswordTextbox(config), 'Fill password', 3);
      await this.executeWithRetry(() => this.clickLoginButton(config), 'Click login button', 3);
      await this.executeWithRetry(() => this.clickField(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField2(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField3(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickCreateButton(config), 'Click create button', 3);
      await this.executeWithRetry(() => this.clickElement(config), 'Click element', 3);
      await this.executeWithRetry(() => this.clickConfirm(config), 'Click confirm', 3);
      await this.executeWithRetry(() => this.clickFieldButton(config), 'Click field button', 3);
      await this.executeWithRetry(() => this.clickFieldButton2(config), 'Click field button', 3);
      await this.executeWithRetry(() => this.pressF12Key(config), 'Press f12 key', 3);
      await this.executeWithRetry(() => this.pressControlOrMetaShiftIKey(config), 'Press controlormeta shift i key', 3);
      await this.executeWithRetry(() => this.pressControlOrMetaShiftIKey2(config), 'Press controlormeta shift i key', 3);
      
      console.log('✅ testd process completed');
      return { success: true, message: 'testd completed' };
      
    } catch (error) {
      console.error('❌ testd failed:', error.message);
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
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).fill('yh.lee5');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillUsernameTextbox');
    console.log('✅ Completed: Fill username');
  }

  /**
   * Fill password
   */
  async fillPasswordTextbox(config) {
    console.log('📝 Executing: Fill password...');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill('Okestro2018!');
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
    await this.page.locator('div').filter({ hasText: /^취소생성$/ }).nth(1).click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement');
    console.log('✅ Completed: Click element');
  }

  /**
   * Click confirm
   */
  async clickConfirm(config) {
    console.log('📝 Executing: Click confirm...');
    await this.page.getByText('클러스터tst-biz네임스페이스네임스페이스를 선택해 주세요.이름중복확인레이블KeyValuecancelcanceldeleteadd필드 추가').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickConfirm');
    console.log('✅ Completed: Click confirm');
  }

  /**
   * Click field button
   */
  async clickFieldButton(config) {
    console.log('📝 Executing: Click field button...');
    await this.page.getByRole('button', { name: '연장' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton');
    console.log('✅ Completed: Click field button');
  }

  /**
   * Click field button
   */
  async clickFieldButton2(config) {
    console.log('📝 Executing: Click field button...');
    await this.page.getByRole('button', { name: '연장' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton2');
    console.log('✅ Completed: Click field button');
  }

  /**
   * Press f12 key
   */
  async pressF12Key(config) {
    console.log('📝 Executing: Press f12 key...');
    await this.page.locator('body').press('F12');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressF12Key');
    console.log('✅ Completed: Press f12 key');
  }

  /**
   * Press controlormeta shift i key
   */
  async pressControlOrMetaShiftIKey(config) {
    console.log('📝 Executing: Press controlormeta shift i key...');
    await this.page.locator('body').press('ControlOrMeta+Shift+I');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressControlOrMetaShiftIKey');
    console.log('✅ Completed: Press controlormeta shift i key');
  }

  /**
   * Press controlormeta shift i key
   */
  async pressControlOrMetaShiftIKey2(config) {
    console.log('📝 Executing: Press controlormeta shift i key...');
    await this.page.locator('body').press('ControlOrMeta+Shift+I');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressControlOrMetaShiftIKey2');
    console.log('✅ Completed: Press controlormeta shift i key');
  }
}

export default AutoRecorded_testd;
