// Generated at: 2026-02-12T01:52:30.098Z
// Platform: VIOLA
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class viola_test_1 extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * viola test 1 process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processViolaTest1(config) {
    try {
      console.log('🚀 Starting viola test 1 process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), 'Navigate to page', 3);
      await this.executeWithRetry(() => this.fillUsernameTextbox(config), 'Fill username', 3);
      await this.executeWithRetry(() => this.fillPasswordTextbox(config), 'Fill password', 3);
      await this.executeWithRetry(() => this.clickLoginButton(config), 'Click login button', 3);
      await this.executeWithRetry(() => this.clickField(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField2(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField3(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField4(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickCreateButton(config), 'Click create button', 3);
      await this.executeWithRetry(() => this.clickElement(config), 'Click element', 3);
      await this.executeWithRetry(() => this.clickConfirm(config), 'Click confirm', 3);
      await this.executeWithRetry(() => this.fillNameTextbox(config), 'Fill name', 3);
      await this.executeWithRetry(() => this.clickConfirmButton(config), 'Click confirm button', 3);
      await this.executeWithRetry(() => this.clickField5(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickField6(config), 'Click field', 3);
      await this.executeWithRetry(() => this.clickCreateButton2(config), 'Click create button', 3);
      await this.executeWithRetry(() => this.fillNameTextbox2(config), 'Fill name', 3);
      await this.executeWithRetry(() => this.clickElement2(config), 'Click element', 3);
      await this.executeWithRetry(() => this.clickElement3(config), 'Click element', 3);
      await this.executeWithRetry(() => this.clickElement4(config), 'Click element', 3);
      await this.executeWithRetry(() => this.clickField7(config), 'Click field', 3);
      
      console.log('✅ viola test 1 process completed');
      return { success: true, message: 'viola test 1 completed' };
      
    } catch (error) {
      console.error('❌ viola test 1 failed:', error.message);
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
    await this.page.getByText('기본 설정').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click field
   */
  async clickField2(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('클러스터 관리').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField2');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click field
   */
  async clickField3(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('클러스터 설정').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField3');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click field
   */
  async clickField4(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('네임스페이스 관리').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField4');
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
    await this.page.getByTitle('tst-biz').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement');
    console.log('✅ Completed: Click element');
  }

  /**
   * Click confirm
   */
  async clickConfirm(config) {
    console.log('📝 Executing: Click confirm...');
    await this.page.getByText('클러스터tst-biz이름중복확인istio').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickConfirm');
    console.log('✅ Completed: Click confirm');
  }

  /**
   * Fill name
   */
  async fillNameTextbox(config) {
    console.log('📝 Executing: Fill name...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const nameValue = await this.processUniqueValue('name', 'test001-11');
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(nameValue);
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

  /**
   * Click field
   */
  async clickField5(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('백업').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField5');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click field
   */
  async clickField6(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('클러스터 설정').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField6');
    console.log('✅ Completed: Click field');
  }

  /**
   * Click create button
   */
  async clickCreateButton2(config) {
    console.log('📝 Executing: Click create button...');
    await this.page.getByRole('button', { name: 'add 생성' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickCreateButton2');
    console.log('✅ Completed: Click create button');
  }

  /**
   * Fill name
   */
  async fillNameTextbox2(config) {
    console.log('📝 Executing: Fill name...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const nameValue = await this.processUniqueValue('name', 'est');
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(nameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillNameTextbox2');
    console.log('✅ Completed: Fill name');
  }

  /**
   * Click element
   */
  async clickElement2(config) {
    console.log('📝 Executing: Click element...');
    await this.page.locator('#form_item_kubernetesVersion').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement2');
    console.log('✅ Completed: Click element');
  }

  /**
   * Click element
   */
  async clickElement3(config) {
    console.log('📝 Executing: Click element...');
    await this.page.getByTitle('1.31.13').locator('div').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement3');
    console.log('✅ Completed: Click element');
  }

  /**
   * Click element
   */
  async clickElement4(config) {
    console.log('📝 Executing: Click element...');
    await this.page.locator('#form_item_providerId').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement4');
    console.log('✅ Completed: Click element');
  }

  /**
   * Click field
   */
  async clickField7(config) {
    console.log('📝 Executing: Click field...');
    await this.page.getByText('목동(allinone)').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField7');
    console.log('✅ Completed: Click field');
  }
}

export default viola_test_1;
