// Generated at: 2026-02-12T04:55:57.749Z
// Platform: CONTRABASS
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
      await this.executeWithRetry(() => this.clickLoginButton(config), '로그인 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickOkestrookestrounfoldmoreButton(config), 'Okestro OKESTRO unfold_more 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickElement(config), '요소 클릭', 3);
      await this.executeWithRetry(() => this.clickFieldButton(config), '목동(allinone) 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickFieldButton2(config), '전체 프로젝트 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickFieldButton3(config), '선택 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickElement2(config), '요소 클릭', 3);
      await this.executeWithRetry(() => this.clickFieldMenuitem(config), '인스턴스 메뉴 클릭', 3);
      await this.executeWithRetry(() => this.clickCreateButton(config), 'add 생성 버튼 클릭', 3);
      await this.executeWithRetry(() => this.fillNameTextbox(config), '이름을 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.fillNameTextbox2(config), '항목 이름 또는 값을 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.pressEnterKey(config), '엔터 키 누르기', 3);
      await this.executeWithRetry(() => this.checkCheckbox(config), 'folder QA a10de7c81554455cad94c00aee1819a2 체크', 3);
      await this.executeWithRetry(() => this.clickFieldButton4(config), '다음 버튼 클릭', 3);
      await this.executeWithRetry(() => this.fillNameTextbox3(config), '항목 이름 또는 값을 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.pressEnterKey2(config), '엔터 키 누르기', 3);
      await this.executeWithRetry(() => this.checkCheckbox2(config), 'ubuntu-24.04-kubespray ACTIVE 체크', 3);
      await this.executeWithRetry(() => this.fillFieldSpinbutton(config), '볼륨을 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.clickElement3(config), '요소 클릭', 3);
      await this.executeWithRetry(() => this.clickKeyboardarrowrightButton(config), 'keyboard_arrow_right 버튼 클릭', 3);
      await this.executeWithRetry(() => this.checkCheckbox3(config), '4C8M 4 Core 8.0 GiB 0.0 GiB 체크', 3);
      await this.executeWithRetry(() => this.clickFieldButton5(config), '다음 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickAddButton(config), '고정 IP 추가 버튼 클릭', 3);
      await this.executeWithRetry(() => this.fillNameTextbox4(config), '항목 이름 또는 값을 입력해 주세요 입력', 3);
      await this.executeWithRetry(() => this.pressEnterKey3(config), '엔터 키 누르기', 3);
      await this.executeWithRetry(() => this.checkCheckbox4(config), 'QA-segment ACTIVE 1 Yes No 체크', 3);
      await this.executeWithRetry(() => this.clickAddButton2(config), '추가 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickFieldButton6(config), '다음 버튼 클릭', 3);
      
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
    const passwordValue = await this.processUniqueValue('password', 'Okestro2018!');
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '비밀번호를 입력해 주세요' }).fill(passwordValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillPasswordTextbox');
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
   * Okestro OKESTRO unfold_more 버튼 클릭
   */
  async clickOkestrookestrounfoldmoreButton(config) {
    console.log('📝 Executing: Okestro OKESTRO unfold_more 버튼 클릭...');
    await this.page.getByRole('button', { name: 'Okestro OKESTRO unfold_more' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickOkestrookestrounfoldmoreButton');
    console.log('✅ Completed: Okestro OKESTRO unfold_more 버튼 클릭');
  }

  /**
   * 요소 클릭
   */
  async clickElement(config) {
    console.log('📝 Executing: 요소 클릭...');
    await this.page.getByText('CONTRABASS', { exact: true }).click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement');
    console.log('✅ Completed: 요소 클릭');
  }

  /**
   * 목동(allinone) 버튼 클릭
   */
  async clickFieldButton(config) {
    console.log('📝 Executing: 목동(allinone) 버튼 클릭...');
    await this.page.getByRole('button', { name: '목동(allinone)' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton');
    console.log('✅ Completed: 목동(allinone) 버튼 클릭');
  }

  /**
   * 전체 프로젝트 버튼 클릭
   */
  async clickFieldButton2(config) {
    console.log('📝 Executing: 전체 프로젝트 버튼 클릭...');
    await this.page.getByRole('button', { name: '전체 프로젝트' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton2');
    console.log('✅ Completed: 전체 프로젝트 버튼 클릭');
  }

  /**
   * 선택 버튼 클릭
   */
  async clickFieldButton3(config) {
    console.log('📝 Executing: 선택 버튼 클릭...');
    await this.page.getByRole('button', { name: '선택' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton3');
    console.log('✅ Completed: 선택 버튼 클릭');
  }

  /**
   * 요소 클릭
   */
  async clickElement2(config) {
    console.log('📝 Executing: 요소 클릭...');
    await this.page.getByText('컴퓨트', { exact: true }).click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement2');
    console.log('✅ Completed: 요소 클릭');
  }

  /**
   * 인스턴스 메뉴 클릭
   */
  async clickFieldMenuitem(config) {
    console.log('📝 Executing: 인스턴스 메뉴 클릭...');
    await this.page.getByRole('menuitem', { name: '인스턴스', exact: true }).locator('span').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickFieldMenuitem');
    console.log('✅ Completed: 인스턴스 메뉴 클릭');
  }

  /**
   * add 생성 버튼 클릭
   */
  async clickCreateButton(config) {
    console.log('📝 Executing: add 생성 버튼 클릭...');
    await this.page.getByRole('button', { name: 'add 생성' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickCreateButton');
    console.log('✅ Completed: add 생성 버튼 클릭');
  }

  /**
   * 이름을 입력해 주세요 입력
   */
  async fillNameTextbox(config) {
    console.log('📝 Executing: 이름을 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const nameValue = await this.processUniqueValue('name', 'instance-test');
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(nameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillNameTextbox');
    console.log('✅ Completed: 이름을 입력해 주세요 입력');
  }

  /**
   * 항목 이름 또는 값을 입력해 주세요 입력
   */
  async fillNameTextbox2(config) {
    console.log('📝 Executing: 항목 이름 또는 값을 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const nameValue = await this.processUniqueValue('name', 'qa');
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).fill(nameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillNameTextbox2');
    console.log('✅ Completed: 항목 이름 또는 값을 입력해 주세요 입력');
  }

  /**
   * 엔터 키 누르기
   */
  async pressEnterKey(config) {
    console.log('📝 Executing: 엔터 키 누르기...');
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).press('Enter');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressEnterKey');
    console.log('✅ Completed: 엔터 키 누르기');
  }

  /**
   * folder QA a10de7c81554455cad94c00aee1819a2 체크
   */
  async checkCheckbox(config) {
    console.log('📝 Executing: folder QA a10de7c81554455cad94c00aee1819a2 체크...');
    await this.page.getByRole('row', { name: 'folder QA a10de7c81554455cad94c00aee1819a2' }).getByLabel('', { exact: true }).check();
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('checkCheckbox');
    console.log('✅ Completed: folder QA a10de7c81554455cad94c00aee1819a2 체크');
  }

  /**
   * 다음 버튼 클릭
   */
  async clickFieldButton4(config) {
    console.log('📝 Executing: 다음 버튼 클릭...');
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton4');
    console.log('✅ Completed: 다음 버튼 클릭');
  }

  /**
   * 항목 이름 또는 값을 입력해 주세요 입력
   */
  async fillNameTextbox3(config) {
    console.log('📝 Executing: 항목 이름 또는 값을 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const nameValue = await this.processUniqueValue('name', 'ubuntu');
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).first().click();
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).first().fill(nameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillNameTextbox3');
    console.log('✅ Completed: 항목 이름 또는 값을 입력해 주세요 입력');
  }

  /**
   * 엔터 키 누르기
   */
  async pressEnterKey2(config) {
    console.log('📝 Executing: 엔터 키 누르기...');
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).first().press('Enter');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressEnterKey2');
    console.log('✅ Completed: 엔터 키 누르기');
  }

  /**
   * ubuntu-24.04-kubespray ACTIVE 체크
   */
  async checkCheckbox2(config) {
    console.log('📝 Executing: ubuntu-24.04-kubespray ACTIVE 체크...');
    await this.page.getByRole('row', { name: 'ubuntu-24.04-kubespray ACTIVE' }).getByLabel('').check();
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('checkCheckbox2');
    console.log('✅ Completed: ubuntu-24.04-kubespray ACTIVE 체크');
  }

  /**
   * 볼륨을 입력해 주세요 입력
   */
  async fillFieldSpinbutton(config) {
    console.log('📝 Executing: 볼륨을 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const fieldValue = await this.processUniqueValue('field', '30');
    await this.page.getByRole('spinbutton', { name: '볼륨을 입력해 주세요' }).click();
    await this.page.getByRole('spinbutton', { name: '볼륨을 입력해 주세요' }).fill(fieldValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillFieldSpinbutton');
    console.log('✅ Completed: 볼륨을 입력해 주세요 입력');
  }

  /**
   * 요소 클릭
   */
  async clickElement3(config) {
    console.log('📝 Executing: 요소 클릭...');
    await this.page.locator('div').filter({ hasText: /^GiB인스턴스와 일괄 삭제$/ }).getByRole('switch').click();
    await this.page.waitForTimeout(500);
    await this.captureScreenshot('clickElement3');
    console.log('✅ Completed: 요소 클릭');
  }

  /**
   * keyboard_arrow_right 버튼 클릭
   */
  async clickKeyboardarrowrightButton(config) {
    console.log('📝 Executing: keyboard_arrow_right 버튼 클릭...');
    await this.page.getByRole('button', { name: 'keyboard_arrow_right' }).nth(1).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickKeyboardarrowrightButton');
    console.log('✅ Completed: keyboard_arrow_right 버튼 클릭');
  }

  /**
   * 4C8M 4 Core 8.0 GiB 0.0 GiB 체크
   */
  async checkCheckbox3(config) {
    console.log('📝 Executing: 4C8M 4 Core 8.0 GiB 0.0 GiB 체크...');
    await this.page.getByRole('row', { name: '4C8M 4 Core 8.0 GiB 0.0 GiB' }).getByLabel('').check();
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('checkCheckbox3');
    console.log('✅ Completed: 4C8M 4 Core 8.0 GiB 0.0 GiB 체크');
  }

  /**
   * 다음 버튼 클릭
   */
  async clickFieldButton5(config) {
    console.log('📝 Executing: 다음 버튼 클릭...');
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton5');
    console.log('✅ Completed: 다음 버튼 클릭');
  }

  /**
   * 고정 IP 추가 버튼 클릭
   */
  async clickAddButton(config) {
    console.log('📝 Executing: 고정 IP 추가 버튼 클릭...');
    await this.page.getByRole('button', { name: '고정 IP 추가' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickAddButton');
    console.log('✅ Completed: 고정 IP 추가 버튼 클릭');
  }

  /**
   * 항목 이름 또는 값을 입력해 주세요 입력
   */
  async fillNameTextbox4(config) {
    console.log('📝 Executing: 항목 이름 또는 값을 입력해 주세요 입력...');
    // Unique 값 처리 (설정되어 있으면 자동으로 카운터 추가)
    const nameValue = await this.processUniqueValue('name', 'qa');
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).fill(nameValue);
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('fillNameTextbox4');
    console.log('✅ Completed: 항목 이름 또는 값을 입력해 주세요 입력');
  }

  /**
   * 엔터 키 누르기
   */
  async pressEnterKey3(config) {
    console.log('📝 Executing: 엔터 키 누르기...');
    await this.page.getByRole('textbox', { name: '항목 이름 또는 값을 입력해 주세요' }).press('Enter');
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('pressEnterKey3');
    console.log('✅ Completed: 엔터 키 누르기');
  }

  /**
   * QA-segment ACTIVE 1 Yes No 체크
   */
  async checkCheckbox4(config) {
    console.log('📝 Executing: QA-segment ACTIVE 1 Yes No 체크...');
    await this.page.getByRole('row', { name: 'QA-segment ACTIVE 1 Yes No' }).getByLabel('').check();
    await this.page.waitForTimeout(300);
    await this.captureScreenshot('checkCheckbox4');
    console.log('✅ Completed: QA-segment ACTIVE 1 Yes No 체크');
  }

  /**
   * 추가 버튼 클릭
   */
  async clickAddButton2(config) {
    console.log('📝 Executing: 추가 버튼 클릭...');
    await this.page.getByRole('button', { name: '추가', exact: true }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickAddButton2');
    console.log('✅ Completed: 추가 버튼 클릭');
  }

  /**
   * 다음 버튼 클릭
   */
  async clickFieldButton6(config) {
    console.log('📝 Executing: 다음 버튼 클릭...');
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickFieldButton6');
    console.log('✅ Completed: 다음 버튼 클릭');
  }
}

export default test_001;
