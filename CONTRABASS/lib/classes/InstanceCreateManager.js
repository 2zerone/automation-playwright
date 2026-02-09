// Generated at: 2025-11-11T06:34:44.956Z
// Platform: CONTRABASS
// Auto-grouped: 8 groups from 28 steps

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class InstanceCreateManager extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
    this.currentInstanceName = null; // 동적으로 생성된 인스턴스명 저장
  }

  /**
   * @param {Object} config - 설정 객체
   * @returns {Object} 실행 결과
   */
  async processInstanceCreate(config) {
    try {
      console.log('🚀 contra 프로세스 시작...');
      
      // 그룹 1: 항목 선택 (Step -)
      await this.executeWithRetry(() => this.navigateToInstanceCreate(config), '인스턴스 생성 페이지 이동', 3);
      
      // 그룹 2: 정보 입력 (Step -)
      await this.executeWithRetry(() => this.basicInformation(config), '기본 정보 입력', 3);
      
      // 그룹 4: 항목 선택 (Step -)
      await this.executeWithRetry(() => this.InstanceType(config), '인스턴스 사양 입력', 3);
      
      // 그룹 5: 네비게이션 (Step -)
      await this.executeWithRetry(() => this.segmentConfig(config), '세그먼트 입력', 3);
      
      // 그룹 6: 항목 선택 (Step -)
      await this.executeWithRetry(() => this.securityConfig(config), '보안 입력', 3);
      
      // 그룹 7: 항목 선택 (Step -)
      await this.executeWithRetry(() => this.additionalConfig(config), '항목 선택', 3);
      
      // 그룹 8: 작업 그룹 - (Step -) // 1개 AI 변환 포함
      await this.executeWithRetry(() => this.instanceCreateConfirm(config), '인스턴스 생성 확인', 3);
      
      console.log('✅ InstanceCreate 프로세스 완료');
      return { success: true, message: 'InstanceCreate 완료' };
      
    } catch (error) {
      console.error('InstanceCreate 실패:', error.message);
      throw error;
    }
  }

  /**
   * 항목 선택 (Step -)
   */
  async navigateToInstanceCreate(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'apps\' 버튼 클릭
    await this.page.getByRole('button', { name: 'apps' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'Openstack Engine IaaS\' 링크 클릭
    await this.page.getByRole('link', { name: 'Openstack Engine IaaS' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'GPU-Con\' 텍스트 클릭
    await this.page.getByText('GPU-Con').click();
    
    // Step : \'전체 프로젝트\' 텍스트 클릭
    await this.page.getByText('전체 프로젝트').click();
    
    // Step : \'선택\' 버튼 클릭
    await this.page.getByRole('button', { name: '선택' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByText('컴퓨트', { exact: true }).click();
    
    // Step : \'인스턴스\' 링크 클릭
    await this.page.getByRole('link', { name: '인스턴스', exact: true }).click();
    await this.page.waitForTimeout(2000);
    
    await this.captureScreenshot('elect_item');
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 정보 입력 (Step -)
   */
  async basicInformation(config) {
    
    // Step : \'생성\' 버튼 클릭
    await this.page.getByRole('button', { name: '생성' }).click();
    await this.page.waitForTimeout(1000);

    console.log('✍️ 정보 입력 중...');
    
    // Step : \'이름을 입력해 주세요\' 텍스트박스 클릭
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    
    // Step : \'이름을 입력해 주세요\' 텍스트박스에 입력
    this.currentInstanceName = `yh-instance-num_${Date.now()}`;
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(this.currentInstanceName);
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).blur();
    console.log('  ✅ \'이름을 입력해 주세요\' 텍스트박스에 입력:', this.currentInstanceName);

    // Step : \'folder QA-project\' 행의 체크박스 선택
    await this.page.getByRole('row', { name: 'folder QA-project' }).getByLabel('', { exact: true }).check();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('basicInformation');
    console.log('✅ 정보 입력 완료');
  }
  /**
   * 항목 선택 (Step -)
   */
  async InstanceType(config) {
    console.log('🖱️ 항목 선택 중...');
    // Step : \'다음\' 버튼 클릭
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    

    await this.page.getByText('3', { exact: true }).first().click();
    await this.page.waitForTimeout(1000);

    // Step : \'hh-ubuntu ACTIVE QA-project\' 행의 체크박스 선택
    await this.page.getByRole('row', { name: 'ubuntu-24.04-js ACTIVE QA-' }).getByLabel('', { exact: true }).check();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByRole('spinbutton', { name: '볼륨을 입력해 주세요' }).dblclick();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('spinbutton', { name: '볼륨을 입력해 주세요' }).fill('5');
    await this.page.getByRole('spinbutton', { name: '볼륨을 입력해 주세요' }).blur();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByRole('checkbox', { name: '인스턴스와 일괄 삭제' }).check();
    await this.page.waitForTimeout(1000);
    
    // Step : \'cm-24 2 Core 4.0 GB 0.0 GB\' 행의 체크박스 선택
    await this.page.getByRole('row', { name: 'cm-24 2 Core 4.0 GB 0.0 GB' }).getByLabel('', { exact: true }).check();
    await this.page.waitForTimeout(1000);
    
    // Step: '__DEFAULT__' 텍스트가 자동으로 나타날 때까지 대기 (최대 60초)
    console.log('⏳ __DEFAULT__ 표시 대기 중...');
    await expect(this.page.getByText('__DEFAULT__')).toBeVisible({ timeout: 300000 });
    console.log('✅ __DEFAULT__ 표시 확인');
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('InstanceType');
    console.log('✅ 항목 선택 완료');
  }


  /**
   * 항목 선택 (Step -)
   */
  async segmentConfig(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'__DEFAULT__\' 텍스트 표시 확인
    
    // Step : \'다음\' 버튼 클릭
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'고정 IP 추가 add\' 버튼 클릭
    await this.page.getByRole('button', { name: '고정 IP 추가 add' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByLabel('세그먼트 설정').getByText('3', { exact: true }).click();
    await this.page.waitForTimeout(1000);

    await this.page.getByRole('row', { name: 'js-int ACTIVE 1 No No - 2025-' }).getByLabel('').check();
    await this.page.waitForTimeout(1000);
    // Step : \'추가\' 버튼 클릭
    await this.page.getByRole('button', { name: '추가', exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('segmentConfig');
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 항목 선택 (Step -)
   */
  async securityConfig(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'hh-seg2 ACTIVE 1 Yes Yes 설명\' 행의 체크박스 선택
    
    // Step : \'다음\' 버튼 클릭
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('securityConfig');
    console.log('✅ 항목 선택 완료');
  }

  async additionalConfig(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'다음\' 버튼 클릭
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);

    await this.captureScreenshot('additionalConfig');
    
    // Step : \'생성\' 버튼 클릭
    await this.page.getByRole('button', { name: '생성' }).click();
    await this.page.waitForTimeout(1000);
    
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 작업 그룹 - (Step -) (🤖 1개 AI 변환)
   */
  async instanceCreateConfirm(config) {
    console.log('🔄 인스턴스 생성 확인 중...');
    
    // Step: 생성된 인스턴스 클릭하여 상세 페이지 접속
    console.log(`📌 인스턴스명 클릭: ${this.currentInstanceName}`);
    await this.page.getByText(this.currentInstanceName).click();
    await this.page.waitForTimeout(2000);
    
    // Step: RUNNING 상태가 될 때까지 10초마다 새로고침
    console.log('⏳ RUNNING 상태 대기 중 (10초마다 새로고침)...');
    const maxAttempts = 60; // 최대 10분 대기 (60회 * 10초)
    const refreshInterval = 10000; // 10초 간격
    let attempts = 0;
    let isRunning = false;

    while (attempts < maxAttempts && !isRunning) {
      attempts++;
      console.log(`  🔄 확인 시도 ${attempts}/${maxAttempts}...`);
      
      // RUNNING 텍스트 확인
      const runningElement = this.page.getByText('RUNNING');
      const isVisible = await runningElement.isVisible().catch(() => false);
      
      if (isVisible) {
        isRunning = true;
        console.log('  ✅ RUNNING 상태 확인됨!');
        break;
      }
      
      // 브라우저 페이지 새로고침 (domcontentloaded로 빠르게 로드)
      console.log('  🔄 페이지 새로고침 중...');
      const refreshStartTime = Date.now();
      await this.page.reload({ waitUntil: 'domcontentloaded' }); // networkidle 대신 domcontentloaded 사용
      const refreshDuration = Date.now() - refreshStartTime;
      console.log(`  ✅ 페이지 새로고침 완료 (${refreshDuration}ms 소요)`);
      
      // 새로고침 후 즉시 상태 확인 (새로고침 직후 상태가 변경되었을 수 있음)
      const runningElementAfterRefresh = this.page.getByText('RUNNING');
      const isVisibleAfterRefresh = await runningElementAfterRefresh.isVisible().catch(() => false);
      
      if (isVisibleAfterRefresh) {
        isRunning = true;
        console.log('  ✅ 새로고침 직후 RUNNING 상태 확인됨!');
        break;
      }
      
      // 일정한 간격 유지: 새로고침 시간을 제외한 나머지 시간만 대기
      const remainingWaitTime = Math.max(0, refreshInterval - refreshDuration);
      if (remainingWaitTime > 0) {
        console.log(`  ⏳ ${remainingWaitTime}ms 대기 중...`);
        await this.page.waitForTimeout(remainingWaitTime);
      } else {
        console.log('  ⚠️ 새로고침 시간이 너무 길어 대기 시간 없음');
      }
    }

    if (!isRunning) {
      throw new Error(`⚠️ 인스턴스가 ${maxAttempts * 10}초 내에 RUNNING 상태가 되지 않았습니다.`);
    }

    // 최종 확인
    await expect(this.page.getByText('RUNNING', { exact: true })).toBeVisible();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('instanceCreateConfirm');
    console.log('✅ 인스턴스 생성 확인 완료');
  }
}

export default InstanceCreateManager;
