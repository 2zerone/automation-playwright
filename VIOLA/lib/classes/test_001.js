// Generated at: 2026-02-12T02:05:49.993Z
// Platform: VIOLA
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class test_001 extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * test 001 process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processTest001(config) {
    try {
      console.log('🚀 Starting test 001 process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), '페이지 이동', 3);
      await this.executeWithRetry(() => this.fillUsernameTextbox(config), '아이디를 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.fillPasswordTextbox(config), '비밀번호를 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.pressControlOrMetaaKey(config), 'ControlOrMeta+a 키 누르기', 3);
      await this.executeWithRetry(() => this.fillPasswordTextbox2(config), '비밀번호를 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.clickLoginButton(config), '로그인 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickField(config), '워크플로우 클릭', 3);
      await this.executeWithRetry(() => this.clickField2(config), '워크로드 클릭', 3);
      await this.executeWithRetry(() => this.clickField3(config), '컨테이너 관리 클릭', 3);
      await this.executeWithRetry(() => this.clickFieldMenuitem(config), '작업 관리 메뉴 클릭', 3);
      await this.executeWithRetry(() => this.clickField4(config), '구성 관리 클릭', 3);
      await this.executeWithRetry(() => this.clickField5(config), '오토스케일러 클릭', 3);
      
      console.log('✅ test 001 process completed');
      return { success: true, message: 'test 001 completed' };
      
    } catch (error) {
      console.error('❌ test 001 failed:', error.message);
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
  async fillUsernameTextbox(config) {
    console.log('📝 Executing: 아이디를 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const usernameValue = await this.processUniqueValue('username', 'yh.lee5');
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '아이디를 입력해 주세요' }).fill(usernameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillUsernameTextbox');
    console.log('✅ Completed: 아이디를 입력해 주세요 입력');
  }

  /**
   * 비밀번호를 입력해 주세요 입력
   */
  async fillPasswordTextbox(config) {
    console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const passwordValue = await this.processUniqueValue('password', 'Okestro2018as');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill(passwordValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillPasswordTextbox');
    console.log('✅ Completed: 비밀번호를 입력해 주세요 입력');
  }

  /**
   * ControlOrMeta+a 키 누르기
   */
  async pressControlOrMetaaKey(config) {
    console.log('📝 Executing: ControlOrMeta+a 키 누르기...');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).press('ControlOrMeta+a');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressControlOrMetaaKey');
    console.log('✅ Completed: ControlOrMeta+a 키 누르기');
  }

  /**
   * 비밀번호를 입력해 주세요 입력
   */
  async fillPasswordTextbox2(config) {
    console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const passwordValue = await this.processUniqueValue('password', 'Okestro2018!');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill(passwordValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillPasswordTextbox2');
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
   * 워크플로우 클릭
   */
  async clickField(config) {
    console.log('📝 Executing: 워크플로우 클릭...');
    await this.page.getByText('워크플로우').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField');
    console.log('✅ Completed: 워크플로우 클릭');
  }

  /**
   * 워크로드 클릭
   */
  async clickField2(config) {
    console.log('📝 Executing: 워크로드 클릭...');
    await this.page.getByText('워크로드').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField2');
    console.log('✅ Completed: 워크로드 클릭');
  }

  /**
   * 컨테이너 관리 클릭
   */
  async clickField3(config) {
    console.log('📝 Executing: 컨테이너 관리 클릭...');
    await this.page.getByText('컨테이너 관리').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField3');
    console.log('✅ Completed: 컨테이너 관리 클릭');
  }

  /**
   * 작업 관리 메뉴 클릭
   */
  async clickFieldMenuitem(config) {
    console.log('📝 Executing: 작업 관리 메뉴 클릭...');
    await this.page.getByRole('menuitem', { name: '작업 관리' }).click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickFieldMenuitem');
    console.log('✅ Completed: 작업 관리 메뉴 클릭');
  }

  /**
   * 구성 관리 클릭
   */
  async clickField4(config) {
    console.log('📝 Executing: 구성 관리 클릭...');
    await this.page.getByText('구성 관리').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField4');
    console.log('✅ Completed: 구성 관리 클릭');
  }

  /**
   * 오토스케일러 클릭
   */
  async clickField5(config) {
    console.log('📝 Executing: 오토스케일러 클릭...');
    await this.page.getByText('오토스케일러').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickField5');
    console.log('✅ Completed: 오토스케일러 클릭');
  }
}

export default test_001;
