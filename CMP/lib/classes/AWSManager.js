// AWSManager - AWS 인스턴스 생성 관리
// Generated at: 2025-11-10T04:39:46.968Z
// Platform: CMP
// Modified: 인스턴스 카운터, 동적 서브넷 선택, 인스턴스 ID 추적 추가

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AWSManager extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
    this.currentInstanceName = null; // 생성된 인스턴스 이름
    this.currentInstanceId = null; // 생성된 인스턴스 ID (i-xxxxxxxxx)
    this.existingInstanceIds = []; // 새로고침 전 인스턴스 ID 목록
  }

  /**
   * AWS 인스턴스 생성 전체 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} 실행 결과
   */
  async processAWSInstanceCreate(config) {
    try {
      console.log('🚀 AWS 인스턴스 생성 프로세스 시작...');
      
      // AWS 서비스 접근
      await this.executeWithRetry(() => this.navigateToAWS(), 'AWS 서비스 접근', 3);
      
      // 인스턴스 페이지 이동
      await this.executeWithRetry(() => this.navigateToInstances(), '인스턴스 페이지 이동', 3);
      
      // 인스턴스 생성 Step 1 (인스턴스명, 이미지, 타입, 스토리지)
      await this.executeWithRetry(() => this.startInstanceCreation_step1(), '기본 정보 입력', 3);
      
      // 인스턴스 생성 Step 2 (VPC, 서브넷, 보안 그룹)
      await this.executeWithRetry(() => this.startInstanceCreation_step2(), '네트워크 입력', 3);
      
      // 인스턴스 생성 Step 3 (키 페어, 최종 생성)
      await this.executeWithRetry(() => this.startInstanceCreation_step3(), '보안 설정 입력', 3);
      
      // 새로 생성된 인스턴스 선택
      await this.executeWithRetry(() => this.selectNewInstance(), '새 인스턴스 선택', 3);
      
      // 인스턴스 RUNNING 상태 확인
      await this.executeWithRetry(() => this.verifyInstanceRunning(), '인스턴스 RUNNING 확인', 3);
      
      console.log('✅ AWS 인스턴스 생성 프로세스 완료');
      console.log(`📋 인스턴스명: ${this.currentInstanceName}`);
      console.log(`🆔 인스턴스 ID: ${this.currentInstanceId}`);
      
      return { 
        success: true, 
        message: 'AWS 인스턴스 생성 완료',
        instanceName: this.currentInstanceName,
        instanceId: this.currentInstanceId
      };
      
    } catch (error) {
      console.error('❌ AWS 인스턴스 생성 실패:', error.message);
      throw error;
    }
  }

  /**
   * 인스턴스 카운터 가져오기 및 증가
   * @returns {number} 현재 카운터 값
   */
  getInstanceCounter() {
    const counterFilePath = path.join(__dirname, '../../config/instance-counter.json');
    
    try {
      if (fs.existsSync(counterFilePath)) {
        const counterData = JSON.parse(fs.readFileSync(counterFilePath, 'utf8'));
        const currentCounter = counterData.counter || 1;
        
        // 카운터 증가 및 저장
        counterData.counter = currentCounter + 1;
        fs.writeFileSync(counterFilePath, JSON.stringify(counterData, null, 2));
        
        return currentCounter;
      } else {
        // 파일이 없으면 초기값으로 생성
        const initialData = { counter: 2 }; // 1을 사용하고 다음을 2로 설정
        fs.writeFileSync(counterFilePath, JSON.stringify(initialData, null, 2));
        return 1;
      }
    } catch (error) {
      console.warn('⚠️ 인스턴스 카운터 파일 처리 중 오류:', error.message);
      // 오류 발생 시 타임스탬프 기반 번호 사용
      return Date.now() % 1000;
    }
  }

  /**
   * 생성된 인스턴스 정보 저장
   * @param {string} instanceName - 인스턴스 이름
   * @param {string} instanceId - 인스턴스 ID
   */
  saveLatestInstanceInfo(instanceName, instanceId) {
    const instanceInfoPath = path.join(__dirname, '../../config/latest-instance.json');
    
    const instanceInfo = {
      instanceName: instanceName,
      instanceId: instanceId,
      createdAt: new Date().toISOString(),
      platform: 'CMP',
      service: 'AWS'
    };
    
    try {
      // 디렉토리가 없으면 생성
      const configDir = path.dirname(instanceInfoPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(instanceInfoPath, JSON.stringify(instanceInfo, null, 2));
      console.log(`💾 인스턴스 정보 저장 완료: ${instanceInfoPath}`);
    } catch (error) {
      console.warn('⚠️ 인스턴스 정보 저장 중 오류:', error.message);
    }
  }

  /**
   * AWS 서비스 접근 (Step 1-7)
   */
  async navigateToAWS() {
    console.log('☁️ AWS 서비스 접근 중...');
    
    // Step 1: 'apps' 버튼 클릭
    await this.page.getByRole('button', { name: 'apps' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 2: 'Amazon Web Service AWS 관리 서비스' 링크 클릭
    await this.page.getByRole('link', { name: 'Amazon Web Service AWS 관리 서비스' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 3: 'AWS-' 텍스트 클릭
    await this.page.getByText('AWS-').click();
    
    // Step 4: '아시아 태평양 (서울)' 텍스트 클릭
    await this.page.getByText('아시아 태평양 (서울)').click();
    
    // Step 5: '선택' 버튼 클릭
    await this.page.getByRole('button', { name: '선택' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 6: 메뉴에서 '컴퓨트' 클릭
    await this.page.getByRole('menu').getByText('컴퓨트').click();
    
    // Step 7: '인스턴스' 링크 클릭
    await this.page.getByRole('link', { name: '인스턴스', exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('AWS 서비스 접근');
    console.log('✅ AWS 서비스 접근 완료');
  }

  /**
   * 인스턴스 페이지 이동 및 기존 인스턴스 ID 수집 (Step 8)
   */
  async navigateToInstances() {
    console.log('📋 인스턴스 페이지 이동 중...');
    
    // 페이지 로딩 대기
    await this.page.waitForTimeout(2000);
    
    // 새로고침 전 기존 인스턴스 ID 목록 수집
    try {
      // 'i-'로 시작하는 텍스트 요소들 찾기
      const existingInstances = await this.page.locator('text=/^i-[a-f0-9]{17}$/').allTextContents();
      this.existingInstanceIds = existingInstances;
      console.log(`📊 기존 인스턴스 ${this.existingInstanceIds.length}개 발견:`, this.existingInstanceIds);
    } catch (error) {
      console.log('⚠️ 기존 인스턴스 목록 수집 실패 (페이지가 비어있을 수 있음)');
      this.existingInstanceIds = [];
    }
    
    await this.captureScreenshot('인스턴스 페이지');
    console.log('✅ 인스턴스 페이지 이동 완료');
  }

  /**
   * 인스턴스 생성 시작 및 인스턴스명 입력 (Step 8-10)
   */
  async startInstanceCreation_step1() {
    console.log('🆕 인스턴스 생성 시작 중...');
    
    // Step 8: '생성' 버튼 클릭
    await this.page.getByRole('button', { name: '생성' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 9: '인스턴스명을 입력해 주세요' 텍스트박스 클릭
    await this.page.getByRole('textbox', { name: '인스턴스명을 입력해 주세요' }).click();
    
    // Step 10: 동적 인스턴스명 생성 및 입력
    const instanceCounter = this.getInstanceCounter();
    this.currentInstanceName = `aws-yh-${instanceCounter}`;
    
    console.log(`🏷️ 생성할 인스턴스명: ${this.currentInstanceName}`);
    
    await this.page.getByRole('textbox', { name: '인스턴스명을 입력해 주세요' }).fill(this.currentInstanceName);
    await this.page.getByRole('textbox', { name: '인스턴스명을 입력해 주세요' }).blur();
    console.log(`✅ 인스턴스명 '${this.currentInstanceName}' 입력 완료`);
    
    // Step 11: '중복확인' 버튼 클릭
    await this.page.getByRole('button', { name: '중복확인' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 12: 'Ubuntu' 텍스트 클릭
    await this.page.getByText('Ubuntu').click();
    
    // Step 13: 이미지 선택 (rc_select_1)
    await this.page.locator('#rc_select_1').click();
    await this.page.waitForTimeout(1000);
    
    // Step 14: 'Deep Learning AMI Neuron (' 텍스트 클릭
    await this.page.getByText('Deep Learning AMI Neuron (').click();
    await this.page.waitForTimeout(1000);
    
    // Step 15: 인스턴스 타입 선택 (rc_select_2)
    await this.page.locator('#rc_select_2').click();
    await this.page.waitForTimeout(1000);
    
    // Step 16: 'nano' 입력 (검색)
    await this.page.locator('#rc_select_2').fill('nano');
    await this.page.waitForTimeout(2000);
    console.log('  ✅ 인스턴스 타입 검색어 입력 완료');
    
    await this.captureScreenshot('기본 설정');
    console.log('✅ 기본 설정 완료');

    // Step 17: 't3a.nano' 선택
    await this.page.locator('span').filter({ hasText: 't3a.nano' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 18: 스토리지 타입 선택 (rc_select_3)
    await this.page.locator('#rc_select_3').click();
    await this.page.waitForTimeout(1000);
    
    // Step 19: '범용 SSD(gp3)' 선택
    await this.page.getByText('범용 SSD(gp3)').click();
    await this.page.waitForTimeout(1000);

    await this.captureScreenshot('step1 설정');
    console.log('✅ step1 설정 완료');

  }

  async startInstanceCreation_step2() {
    // Step 20: '다음' 버튼 클릭 (네트워크 설정으로 이동)
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 21: VPC 선택 (rc_select_4)
    await this.page.locator('#rc_select_4').click();
    await this.page.waitForTimeout(1000);
    // Step 22: 'cmp-vpc' 선택
    await this.page.getByText('cmp-vpc').click();
    await this.page.waitForTimeout(1000);
    // Step 23: 서브넷 선택 드롭다운 클릭 (rc_select_5)
    await this.page.locator('#rc_select_5').click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('네트워크 설정 중');
    console.log('✅ 네트워크 설정 진행 중');
    // Step 24: 동적 서브넷 선택 (cmp-subnet-2a/2b/2c/2d 중 첫 번째 사용 가능한 것)
    try {
      // 모든 서브넷 옵션 찾기
      const subnetOptions = await this.page.locator('text=/^cmp-subnet-2[a-d]$/').all();
      
      if (subnetOptions.length > 0) {
        const selectedSubnet = await subnetOptions[0].textContent();
        console.log(`🔍 사용 가능한 서브넷: ${subnetOptions.length}개`);
        console.log(`✅ 선택된 서브넷: ${selectedSubnet}`);
        await subnetOptions[0].click();
      } else {
        // fallback: 첫 번째 cmp-subnet으로 시작하는 것 선택
        console.log('⚠️ 정확한 패턴 매칭 실패, fallback 사용');
        await this.page.getByText('cmp-subnet-', { exact: false }).first().click();
      }
    } catch (error) {
      console.error('❌ 서브넷 선택 실패:', error.message);
      // 최후의 fallback
      await this.page.getByText('cmp-subnet-2a').click();
    }
    
    // Step 25: 보안 그룹 선택 (rc_select_6)
    await this.page.locator('#rc_select_6').click();
    await this.page.waitForTimeout(1000);

    await this.page.getByText('할당', { exact: true }).nth(1).click();
    await this.page.waitForTimeout(1000);

    await this.captureScreenshot('step2 설정');
    console.log('✅ step2 설정 완료');
  }

  async startInstanceCreation_step3() {
    // Step 26: '다음' 버튼 클릭
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByLabel('', { exact: true }).check();
    await this.page.waitForTimeout(1000);

    // Step 27: 키 페어 선택 (rc_select_7)
    await this.page.locator('#rc_select_7').click();
    console.log('🔍 키 페어 드롭다운 열기 완료');
    
    // 드롭다운 옵션이 로드될 때까지 대기
    await this.page.waitForTimeout(1500);
    
    // 드롭다운에서 'qa-keypair' 옵션 찾기 및 클릭 (여러 방법 시도)
    let keypairSelected = false;
    
    // 방법 1: exact match로 첫 번째 시도
    try {
      const keypairOptions = await this.page.getByText('qa-keypair', { exact: true }).all();
      console.log(`🔍 발견된 'qa-keypair' 옵션 수 (exact): ${keypairOptions.length}`);
      if (keypairOptions.length > 0) {
        await keypairOptions[0].click({ timeout: 3000 });
        keypairSelected = true;
        console.log('✅ qa-keypair 선택 완료 (방법 1: exact match, first)');
      }
    } catch (error) {
      console.log(`⚠️ 방법 1 실패: ${error.message}`);
    }
    
    // 방법 2: 부분 매칭으로 nth(1) 시도
    if (!keypairSelected) {
      try {
        const keypairOptions = await this.page.getByText('qa-keypair').all();
        console.log(`🔍 발견된 'qa-keypair' 옵션 수 (부분 매칭): ${keypairOptions.length}`);
        if (keypairOptions.length > 1) {
          await keypairOptions[1].click({ timeout: 3000 });
          keypairSelected = true;
          console.log('✅ qa-keypair 선택 완료 (방법 2: 부분 매칭, nth(1))');
        } else if (keypairOptions.length === 1) {
          await keypairOptions[0].click({ timeout: 3000 });
          keypairSelected = true;
          console.log('✅ qa-keypair 선택 완료 (방법 2: 부분 매칭, first)');
        }
      } catch (error) {
        console.log(`⚠️ 방법 2 실패: ${error.message}`);
      }
    }
    
    // 방법 3: locator + filter (정규표현식)
    if (!keypairSelected) {
      try {
        await this.page.locator('div').filter({ hasText: /^qa-keypair$/ }).first().click({ timeout: 3000 });
        keypairSelected = true;
        console.log('✅ qa-keypair 선택 완료 (방법 3: locator + filter)');
      } catch (error) {
        console.log(`⚠️ 방법 3 실패: ${error.message}`);
      }
    }
    
    // 방법 4: 드롭다운 내부의 role-based selector
    if (!keypairSelected) {
      try {
        await this.page.getByRole('option', { name: 'qa-keypair' }).click({ timeout: 3000 });
        keypairSelected = true;
        console.log('✅ qa-keypair 선택 완료 (방법 4: role-based)');
      } catch (error) {
        console.log(`⚠️ 방법 4 실패: ${error.message}`);
      }
    }
    
    if (!keypairSelected) {
      console.error('❌ 모든 방법으로 qa-keypair 선택 실패');
      throw new Error('qa-keypair 선택 실패');
    }
    
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('인스턴스 생성 입력 완료');

    console.log('✅ 인스턴스 생성 완료');

    await this.page.waitForTimeout(2000);
    // Step 28: '다음' 버튼 클릭 (최종 검토)
    await this.page.getByRole('button', { name: '다음' }).click();
    await this.page.waitForTimeout(1000);

    await this.page.getByRole('button', { name: '비활성', exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 29: '생성' 버튼 클릭 (인스턴스 생성 실행)
    await this.page.getByRole('button', { name: '생성' }).click();
    await this.page.waitForTimeout(1000);
    
    // Step 30: 닫기 버튼 클릭 ('close' 링크)
    await this.page.locator('a').filter({ hasText: 'close' }).click();
    await this.page.waitForTimeout(1000);
    
  }

  /**
   * 새로 생성된 인스턴스 선택 (Step 31-32)
   */
  async selectNewInstance() {
    console.log('🔍 새로 생성된 인스턴스 선택 중...');
    
    // Step 31: '새로고침' 버튼 클릭
    await this.page.getByRole('button', { name: '새로고침' }).click();
    await this.page.waitForTimeout(3000); // 새로고침 후 로딩 대기
    
    console.log('🔄 페이지 새로고침 완료, 새 인스턴스 검색 중...');
    
    // Step 32: 새로고침 후 새로 나타난 인스턴스 ID 찾기
    try {
      // 현재 페이지의 모든 인스턴스 ID 가져오기
      const currentInstances = await this.page.locator('text=/^i-[a-f0-9]{17}$/').allTextContents();
      console.log(`📊 새로고침 후 인스턴스 ${currentInstances.length}개 발견`);
      
      // 기존 목록에 없는 새로운 인스턴스 ID 찾기
      const newInstanceIds = currentInstances.filter(id => !this.existingInstanceIds.includes(id));
      
      if (newInstanceIds.length > 0) {
        this.currentInstanceId = newInstanceIds[0];
        console.log(`✅ 새로 생성된 인스턴스 ID 발견: ${this.currentInstanceId}`);
        
        // 해당 인스턴스 ID 클릭
        await this.page.getByText(this.currentInstanceId, { exact: true }).click();
        
        // 인스턴스 정보 저장
        this.saveLatestInstanceInfo(this.currentInstanceName, this.currentInstanceId);
      } else {
        console.warn('⚠️ 새로운 인스턴스 ID를 찾을 수 없음, 첫 번째 인스턴스 선택');
        // fallback: 첫 번째 인스턴스 선택
        if (currentInstances.length > 0) {
          this.currentInstanceId = currentInstances[0];
          await this.page.getByText(this.currentInstanceId, { exact: true }).click();
          this.saveLatestInstanceInfo(this.currentInstanceName, this.currentInstanceId);
        }
      }
    } catch (error) {
      console.error('❌ 새 인스턴스 선택 실패:', error.message);
      throw new Error('새로 생성된 인스턴스를 찾을 수 없습니다.');
    }
    
    await this.captureScreenshot('새 인스턴스 선택');
    console.log('✅ 새 인스턴스 선택 완료');
  }

  /**
   * 인스턴스 RUNNING 상태 확인 (Step 33)
   */
  async verifyInstanceRunning() {
    console.log('⏳ 인스턴스 RUNNING 상태 확인 중...');
    
    // Step 33: 'RUNNING' 텍스트 표시 확인
    await expect(this.page.getByText('RUNNING')).toBeVisible({ timeout: 60000 });
    
    await this.captureScreenshot('인스턴스 RUNNING 확인');
    console.log('✅ 인스턴스 RUNNING 상태 확인 완료');
  }

}

export default AWSManager;
