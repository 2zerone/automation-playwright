// aws2Manager - aws2
// Generated at: 2025-11-11T04:40:02.239Z
// Platform: CMP
// Auto-grouped: 5 groups from 22 steps

import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BaseManager from './BaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class aws2Manager extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
    this.currentInstanceName = null;
    this.currentInstanceId = null;
    this.currentWidgetName = null; // 생성한 위젯 이름 저장
  }

  /**
   * scenario-1에서 생성한 인스턴스 정보 읽기
   * @returns {Object} { instanceName, instanceId }
   */
  getLatestInstanceInfo() {
    const instanceInfoPath = path.join(__dirname, '../../config/latest-instance.json');
    console.log(`📂 인스턴스 정보 파일 경로: ${instanceInfoPath}`);
    
    if (!fs.existsSync(instanceInfoPath)) {
      throw new Error(`인스턴스 정보 파일이 존재하지 않습니다: ${instanceInfoPath}. scenario-1을 먼저 실행해주세요.`);
    }
    
    const instanceInfo = JSON.parse(fs.readFileSync(instanceInfoPath, 'utf8'));
    console.log(`📄 파일 내용: ${JSON.stringify(instanceInfo, null, 2)}`);
    
    if (!instanceInfo.instanceName) {
      throw new Error('인스턴스 이름이 latest-instance.json에 없습니다. scenario-1이 정상적으로 완료되었는지 확인해주세요.');
    }
    
    console.log(`✅ 인스턴스 정보 로드 완료: ${instanceInfo.instanceName} (ID: ${instanceInfo.instanceId})`);
    return instanceInfo;
  }

  /**
   * aws2 전체 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} 실행 결과
   */
  async processaws2(config) {
    try {
      console.log('🚀 aws2 프로세스 시작...');
      
      // 그룹 1: 항목 선택 (Step -)
      await this.executeWithRetry(() => this.dashboardCreate(config), '대시보드 생성', 3);
      
      // 그룹 2: 항목 선택 (Step -) // 1개 AI 변환 포함
      await this.executeWithRetry(() => this.resourceSelect_1(config), '위젯 설정', 3);
      
      // 그룹 3: 항목 선택 (Step -)
      await this.executeWithRetry(() => this.resourceSelect_2(config), '메트릭 선택', 3);
      
      // 그룹 4: 항목 선택 (Step -)
      await this.executeWithRetry(() => this.resourceSelect_3(config), '리소스 추가', 3);
      
      // 그룹 5: 네비게이션 (Step -) // 1개 AI 변환 포함
      await this.executeWithRetry(() => this.confirmDashboard(config), '대시보드 확인', 3);
      
      console.log('✅ aws2 프로세스 완료');
      return { success: true, message: 'aws2 완료' };
      
    } catch (error) {
      console.error('aws2 실패:', error.message);
      throw error;
    }
  }

  /**
   * 항목 선택 (Step -)
   */
  async dashboardCreate(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'apps\' 버튼 클릭
    await this.page.getByRole('button', { name: 'apps' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'Cloud Monitoring 클라우드 모니터링 서비스\' 링크 클릭
    await this.page.getByRole('link', { name: 'Cloud Monitoring 클라우드 모니터링 서비스' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'대시보드\' 링크 클릭
    await this.page.getByRole('link', { name: '대시보드', exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'대시보드 생성\' 버튼 클릭
    await this.page.getByRole('button', { name: '대시보드 생성' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'dashboard_customize 위젯 추가\' 버튼 클릭
    await this.page.getByRole('button', { name: 'dashboard_customize 위젯 추가' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'라인 차트\' 텍스트 클릭
    await this.page.getByText('라인 차트').click();
    
    // Step : \'추가\' 버튼 클릭
    await this.page.getByRole('button', { name: '추가', exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('elect_item');
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 항목 선택 (Step -) (🤖 1개 AI 변환)
   */
  async resourceSelect_1(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : 'edit' 버튼 2번째 클릭
    await this.page.getByRole('button', { name: 'edit' }).nth(1).click();
    
    // Step : \'새 위젯\' 텍스트박스 클릭
    await this.page.getByRole('textbox', { name: '새 위젯' }).click();
    
    // Step : \'새 위젯\' 텍스트박스에 입력
    const dynamic_ = `yh-widget-num_${Date.now()}`;
    this.currentWidgetName = dynamic_; // 위젯 이름 저장 (confirmDashboard에서 사용)
    await this.page.getByRole('textbox', { name: '새 위젯' }).fill(dynamic_);
    await this.page.getByRole('textbox', { name: '새 위젯' }).blur();
    console.log('  ✅ \'새 위젯\' 텍스트박스에 입력:', dynamic_);
    console.log(`  📝 위젯 이름 저장: ${this.currentWidgetName}`);
    
    await this.captureScreenshot('elect_item');
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 항목 선택 (Step -)
   */
  async resourceSelect_2(config) {
    console.log('🖱️ 항목 선택 중...');
    
    // Step : \'대상 메트릭을 선택해 주세요. expand_more\' 버튼 클릭
    await this.page.getByRole('button', { name: '대상 메트릭을 선택해 주세요. expand_more' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'AWS EC2\' 텍스트 클릭
    await this.page.getByText('AWS EC2').click();
    
    // Step : \'CPU 사용률\' 텍스트 클릭
    await this.page.getByText('CPU 사용률').click();
    
    // Step : \'저장\' 버튼 클릭
    await this.page.getByRole('button', { name: '저장' }).nth(1).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('elect_item');
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 항목 선택 (Step -)
   */
  async resourceSelect_3(config) {
    
    // Step : \'선택 add\' 버튼 클릭
    await this.page.getByRole('button', { name: '선택 add' }).click();
    await this.page.waitForTimeout(2000);
    
    // Step : 첫 번째 'All Resources' 버튼 클릭
    await this.page.getByRole('button', { name: 'All Resources' }).click();
    await this.page.waitForTimeout(1000);

    await this.page.getByRole('menuitem', { name: 'All Resources' }).click();
    
      await this.page.waitForTimeout(1000);

    // Step : scenario-1에서 생성한 인스턴스 선택
    if (!this.currentInstanceName) {
      throw new Error('currentInstanceName이 설정되지 않았습니다. scenario-2.spec.js에서 getLatestInstanceInfo()를 호출했는지 확인해주세요.');
    }
    
    console.log(`🔍 인스턴스 선택 중: ${this.currentInstanceName}`);
    
    // 인스턴스 이름으로 검색 (부분 매칭 사용)
    try {
      await this.page.getByText(this.currentInstanceName).click();
      console.log(`✅ 인스턴스 선택 완료: ${this.currentInstanceName}`);
    } catch (error) {
      console.error(`❌ 인스턴스를 찾을 수 없습니다: ${this.currentInstanceName}`);
      throw new Error(`인스턴스를 찾을 수 없습니다: ${this.currentInstanceName}. 리스트에 해당 인스턴스가 있는지 확인해주세요.`);
    }
    
    // Step : \'추가\' 버튼 클릭
    await this.page.getByRole('button', { name: '추가', exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    // Step : \'확인\' 버튼 클릭
    await this.page.getByRole('button', { name: '확인' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('elect_item');
    await this.page.waitForTimeout(1000);
    console.log('✅ 항목 선택 완료');
  }

  /**
   * 네비게이션 (Step -) (🤖 1개 AI 변환)
   */
  async confirmDashboard(config) { 
    // '저장' 버튼 클릭
    await this.page.getByRole('button', { name: '저장', exact: true }).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('button', { name: '확인', exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    // 생성한 위젯 이름이 대시보드에 표시되는지 확인
    if (!this.currentWidgetName) {
      throw new Error('currentWidgetName이 설정되지 않았습니다. resourceSelect_1()에서 위젯 이름이 저장되었는지 확인해주세요.');
    }
    
    console.log(`🔍 위젯 표시 확인 중: ${this.currentWidgetName}`);
    await expect(this.page.getByText(this.currentWidgetName)).toBeVisible();
    console.log(`✅ 위젯 표시 확인 완료: ${this.currentWidgetName}`);
    
    await this.captureScreenshot('avigate');
    console.log('✅ 네비게이션 완료');
  }

}

export default aws2Manager;
