// LoadBalancerCreateManager - LoadBalancerCreate
// Generated at: 2025-11-11T09:27:48.039Z
// Platform: CONTRABASS
// Auto-grouped: 4 groups from 18 steps

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class LoadBalancerCreateManager extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
    this.currentLoadBalancerName = null; // 동적으로 생성된 로드밸런서명 저장
  }

  /**
   * LoadBalancerCreate 전체 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} 실행 결과
   */
  async processLoadBalancerCreate(config) {
    try {
      console.log('🚀 LoadBalancerCreate 프로세스 시작...');

      await this.executeWithRetry(() => this.LoadBalancerAccess(config), '로드밸런서 메뉴 접근', 3);
      
      await this.executeWithRetry(() => this.BasicConfig(config), '기본 정보 입력', 3);
  
      await this.executeWithRetry(() => this.listenerConfig(config), '리스너 입력', 3);

      await this.executeWithRetry(() => this.poolConfig(config), '풀 입력', 3);

      await this.executeWithRetry(() => this.poolMemberConfig(config), '풀멤버 입력', 3);

      await this.executeWithRetry(() => this.healthCheckConfig(config), '헬스체크 입력', 3);

      await this.executeWithRetry(() => this.confirmLoadBalancerCreate(config), '로드밸런서 생성 확인', 3);
      
      console.log('✅ LoadBalancerCreate 프로세스 완료');
      return { success: true, message: 'LoadBalancerCreate 완료' };
      
    } catch (error) {
      console.error('LoadBalancerCreate 실패:', error.message);
      throw error;
    }
  }

  /**
   * 항목 선택 (Step -)
   */
  async LoadBalancerAccess(config) {
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
    
    // Step : \'VPC\' 텍스트 클릭
    await this.page.getByText('VPC').click();
    
    // Step : \'로드밸런서\' 링크 클릭
    await this.page.getByRole('link', { name: '로드밸런서' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('LoadBalancerAccess')
    await this.page.waitForTimeout(1000);
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 항목 선택 (Step -)
   */
  async BasicConfig(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'생성\' 버튼 클릭
    await this.page.getByRole('button', { name: '생성' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'이름을 입력해 주세요\' 텍스트박스 클릭
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    
    // Step : \'이름을 입력해 주세요\' 텍스트박스에 입력
    this.currentLoadBalancerName = `yh-loadbalancer-${Date.now()}`;
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(this.currentLoadBalancerName);
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).blur();
    console.log('  ✅ \'이름을 입력해 주세요\' 텍스트박스에 입력:', this.currentLoadBalancerName);

    await this.page.locator('[id="프로젝트"]').click();
    await this.page.waitForTimeout(1000);

    await this.page.getByText('QA-project', { exact: true }).click();
    await this.page.waitForTimeout(1000);

    // Step : \'hh-seg2 Yes Yes 1 ACTIVE 2025\' 행의 체크박스 선택
    await this.page.getByRole('row', { name: 'hh-seg2 Yes Yes 1 ACTIVE 2025' }).getByLabel('', { exact: true }).check();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('BasicConfig');
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 항목 선택 (Step -)
   */
  async listenerConfig(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'다음\' 버튼 클릭
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    
    // Step: Listener 생성
    console.log('📝 Listener 생성 중...');
    await this.page.getByText('사용', { exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    const listenerName = `yh-listener-${Date.now()}`;
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(listenerName);
    console.log(`  ✅ Listener 이름 입력: ${listenerName}`);
    await this.page.waitForTimeout(1000);

    await this.captureScreenshot('listenerConfig');
    console.log('✅ Listener 생성 완료');
  }

  /**
   * 작업 그룹 - (Step -)
   */
  async poolConfig(config) {
    console.log('🔄 작업 그룹 - 중...');
    
    // Step : \'UP\' 텍스트 표시 확인
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step: Pool 생성
    console.log('📝 Pool 생성 중...');
    await this.page.getByText('사용', { exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    const poolName = `yh-pool-${Date.now()}`;
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(poolName);
    console.log(`  ✅ Pool 이름 입력: ${poolName}`);
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('poolConfig');
    console.log('✅ Pool 생성 완료');
  }


  async poolMemberConfig(config) {
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step: Pool Member 생성
    console.log('📝 Pool Member 생성 중...');
    await this.page.getByText('사용', { exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByRole('row', { name: 'Expand row apartment hh-rep' }).getByLabel('Expand row').click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByRole('button', { name: 'add_circle' }).click();
    await this.page.waitForTimeout(1000);
    
    const pmName = `yh-pm-${Date.now()}`;
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(pmName);
    console.log(`  ✅ Pool Member 이름 입력: ${pmName}`);
    await this.page.waitForTimeout(1000);
    
    await this.page.locator('.ant-input-number').first().click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('spinbutton', { name: '포트을 입력해 주세요' }).fill('80');
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('poolMemberConfig');
    console.log('✅ Pool Member 생성 완료');
  }

  async healthCheckConfig(config) {
    console.log('🔄 Health Check 중...');
    
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step: Health Check 생성
    console.log('📝 Health Check 생성 중...');
    await this.page.getByText('사용', { exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    const hcName = `yh-hc-${Date.now()}`;
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).click();
    await this.page.getByRole('textbox', { name: '이름을 입력해 주세요' }).fill(hcName);
    console.log(`  ✅ Health Check 이름 입력: ${hcName}`);
    await this.page.waitForTimeout(1000);

    await this.captureScreenshot('healthCheckConfig');
    console.log('✅ Health Check 생성 완료');
  }

  async confirmLoadBalancerCreate(config) {
    await this.page.getByRole('button', { name: '제출' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step: 생성된 로드밸런서 클릭
    console.log(`📌 로드밸런서명 클릭: ${this.currentLoadBalancerName}`);
    await this.page.getByText(this.currentLoadBalancerName).click();
    await this.page.waitForTimeout(1000);

    await expect(this.page.getByText('UP')).toBeVisible();
    await this.page.waitForTimeout(1000);

    await this.captureScreenshot('yh-loadbalancer-create-confirm');
    console.log('✅ 항목 선택 완료');
  }
  

}

export default LoadBalancerCreateManager;
