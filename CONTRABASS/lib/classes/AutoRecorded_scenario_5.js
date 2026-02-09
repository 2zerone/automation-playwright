// Generated at: 2026-02-03T05:08:16.976Z
// Platform: CONTRABASS
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class AutoRecorded_scenario_5 extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * scenario 5 process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processlegacyMethod(config) {
    try {
      console.log('🚀 Starting scenario 5 process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), '페이지 이동', 3);
      await this.executeWithRetry(() => this.fill아디InputTextbox(config), '아이디를 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.fillPasswordInputTextbox(config), '비밀번호를 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.pressControlormeta+aKey(config), 'ControlOrMeta+a 키 입력', 3);
      await this.executeWithRetry(() => this.fillPasswordInputTextbox2(config), '비밀번호를 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.clickLoginButton(config), '로그인 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickConfirmButton(config), '확인 버튼 클릭', 3);
      
      console.log('✅ scenario 5 process completed');
      return { success: true, message: 'scenario 5 completed' };
      
    } catch (error) {
      console.error('❌ scenario 5 failed:', error.message);
      throw error;
    }
  }

  /**
   * 페이지 이동
   */
  async navigateToPage(config) {
    console.log('📝 Executing: 페이지 이동...');
    await this.page.goto('https://305tst.console.bf.okestro.cloud/login');
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('navigateToPage');
    console.log('✅ Completed: 페이지 이동');
  }

  /**
   * 아이디를 입력해 주세요 입력
   */
  async fill아디InputTextbox(config) {
    console.log('📝 Executing: 아이디를 입력해 주세요 입력...');
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).fill('yh.lee5');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fill아디InputTextbox');
    console.log('✅ Completed: 아이디를 입력해 주세요 입력');
  }

  /**
   * 비밀번호를 입력해 주세요 입력
   */
  async fillPasswordInputTextbox(config) {
    console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill('Okestro2018');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillPasswordInputTextbox');
    console.log('✅ Completed: 비밀번호를 입력해 주세요 입력');
  }

  /**
   * ControlOrMeta+a 키 입력
   */
  async pressControlormeta+aKey(config) {
    console.log('📝 Executing: ControlOrMeta+a 키 입력...');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).press('ControlOrMeta+a');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressControlormeta+aKey');
    console.log('✅ Completed: ControlOrMeta+a 키 입력');
  }

  /**
   * 비밀번호를 입력해 주세요 입력
   */
  async fillPasswordInputTextbox2(config) {
    console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill('Okestro2018!');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillPasswordInputTextbox2');
    console.log('✅ Completed: 비밀번호를 입력해 주세요 입력');
  }

  /**
   * 로그인 버튼 클릭
   */
  async clickLoginButton(config) {
    console.log('📝 Executing: 로그인 버튼 클릭...');
    await this.page.getByRole('button', { name: '로그인' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickLoginButton');
    console.log('✅ Completed: 로그인 버튼 클릭');
  }

  /**
   * 확인 버튼 클릭
   */
  async clickConfirmButton(config) {
    console.log('📝 Executing: 확인 버튼 클릭...');
    await this.page.getByRole('button', { name: '확인' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickConfirmButton');
    console.log('✅ Completed: 확인 버튼 클릭');
  }
}

export default AutoRecorded_scenario_5;
