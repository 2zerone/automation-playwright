// PodRecoveryManager - Pod 삭제 및 복원 시나리오
// Platform: VIOLA
// Description: Pod를 삭제하고 백업으로부터 복원하는 전체 프로세스 관리

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PodRecoveryManager extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
    this.currentPodName = null; // 생성된 Pod 이름을 저장
    this.currentBackupName = null; // 생성된 Backup 이름을 저장
  }

  /**
   * 최근 생성된 Pod 정보 읽기 (scenario-1에서 생성한 Pod)
   */
  getLatestPodInfo() {
    const latestPodFilePath = path.join(__dirname, '../../config/latest-pod.json');
    
    console.log(`📂 Pod 정보 파일 경로: ${latestPodFilePath}`);
    
    try {
      if (fs.existsSync(latestPodFilePath)) {
        const fileContent = fs.readFileSync(latestPodFilePath, 'utf8');
        console.log(`📄 파일 내용: ${fileContent}`);
        
        const podInfo = JSON.parse(fileContent);
        console.log(`✅ Pod 정보 파싱 성공:`);
        console.log(`   - Pod 이름: ${podInfo.podName}`);
        console.log(`   - Backup 이름: ${podInfo.backupName}`);
        console.log(`   - 생성 시간: ${podInfo.createdAt}`);
        console.log(`   - 카운터: ${podInfo.counter}`);
        
        // 백업 이름 검증
        if (!podInfo.backupName || podInfo.backupName === null) {
          console.error('❌ 백업 이름이 설정되지 않았습니다!');
          console.error('📌 scenario-1에서 Backup 생성 확인 단계가 완료되었는지 확인하세요.');
          console.error('📌 BackupManager.verifyBackupCreation()에서 백업 이름을 추출하지 못했을 수 있습니다.');
          throw new Error('백업 이름이 없습니다. scenario-1의 "Backup 생성 확인" 단계를 확인하세요.');
        }
        
        return podInfo;
      } else {
        console.error('❌ latest-pod.json 파일이 존재하지 않습니다!');
        console.log(`📁 config 폴더 확인: ${path.dirname(latestPodFilePath)}`);
        
        // config 폴더의 모든 파일 나열
        const configDir = path.dirname(latestPodFilePath);
        if (fs.existsSync(configDir)) {
          const files = fs.readdirSync(configDir);
          console.log(`📁 config 폴더 내 파일들: ${files.join(', ')}`);
        }
        
        throw new Error('Pod 정보 파일이 없습니다. scenario-1을 먼저 실행하세요.');
      }
    } catch (error) {
      console.error('❌ Pod 정보 읽기 실패:', error.message);
      throw error;
    }
  }

  /**
   * Pod 삭제 및 복원 전체 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} 실행 결과
   */
  async processPodRecovery(config) {
    try {
      console.log('🚀 Pod 삭제 및 복원 프로세스 시작...');
      
      // scenario-1에서 생성한 최근 Pod 정보 읽기
      const podInfo = this.getLatestPodInfo();
      this.currentPodName = podInfo.podName;
      this.currentBackupName = podInfo.backupName;
      
      console.log(`📦 삭제할 Pod 이름: ${this.currentPodName}`);
      console.log(`💾 복원할 Backup 이름: ${this.currentBackupName}`);
      
      
      // Step 2: Kubernetes Engine 접근
      await this.executeWithRetry(() => this.navigateToKubernetes(), 'Kubernetes Engine 접근', 3);
      
      // Step 3: 클러스터 선택
      await this.executeWithRetry(() => this.selectCluster(), '클러스터 선택', 3);
      
      // Step 4: 컨테이너 관리 메뉴로 이동
      await this.executeWithRetry(() => this.navigateToContainerManagement(), '컨테이너 관리 이동', 3);
      
      // Step 5: Pod 선택
      await this.executeWithRetry(() => this.selectPod(), 'Pod 선택', 3);
      
      // Step 6: Pod 삭제
      await this.executeWithRetry(() => this.deletePod(), 'Pod 삭제', 3);
      
      // Step 7: 백업 메뉴로 이동
      await this.executeWithRetry(() => this.navigateToBackup(), '백업 메뉴 이동', 3);
      
      // Step 8: 백업 복원
      await this.executeWithRetry(() => this.restoreBackup(), '백업 복원', 3);
      
      // Step 9: 복원 확인
      await this.executeWithRetry(() => this.verifyRestoration(), '복원 확인', 3);
      
      console.log('✅ Pod 삭제 및 복원 프로세스 완료');
      return { 
        success: true, 
        message: 'Pod 삭제 및 복원 완료',
        podName: this.currentPodName,
        backupName: this.currentBackupName
      };
      
    } catch (error) {
      console.error('❌ Pod 삭제 및 복원 실패:', error.message);
      throw error;
    }
  }


  /**
   * Step 2: Kubernetes Engine 접근
   */
  async navigateToKubernetes() {
    console.log('🎯 Kubernetes Engine 접근 중...');
    
    // Apps 버튼 클릭
    await this.page.getByRole('button', { name: 'apps' }).click();
    await this.page.waitForTimeout(1000);
    
    // Kubernetes Engine 선택
    await this.page.getByRole('link', { name: 'Kubernetes Engine 쿠버네티스 관리 서비스' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('kubernetes_engine');
    console.log('✅ Kubernetes Engine 접근 완료');
  }

  /**
   * Step 3: 클러스터 선택
   */
  async selectCluster() {
    console.log('🎯 클러스터 선택 중...');
    
    // 클러스터 선택
    await this.page.getByText('biz-cluster-').click();
    await this.page.waitForTimeout(500);
    
    // 선택 버튼 클릭
    await this.page.getByRole('button', { name: '선택' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('cluster_selected');
    console.log('✅ 클러스터 선택 완료');
  }

  /**
   * Step 4: 컨테이너 관리 메뉴로 이동
   */
  async navigateToContainerManagement() {
    console.log('📂 컨테이너 관리 메뉴로 이동 중...');
    
    // 워크플로우 클릭
    await this.page.getByText('워크플로우').click();
    await this.page.waitForTimeout(500);
    
    // 워크로드 드롭다운 클릭
    await this.page.getByText('워크로드 arrow_drop_down').click();
    await this.page.waitForTimeout(500);
    
    // 컨테이너 관리 링크 클릭
    await this.page.getByRole('link', { name: '컨테이너 관리' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('container_management');
    console.log('✅ 컨테이너 관리 메뉴 이동 완료');
  }

  /**
   * Step 5: Pod 선택
   */
  async selectPod() {
    console.log(`📦 Pod 선택 중: ${this.currentPodName}`);
    
    try {
      // 방법 1: 특정 Pod의 row를 찾고 그 row 내의 체크박스만 선택 (안전)
      // Row의 실제 name: 'yh-pod-64 check RUNNING biz-...'
      console.log(`🔍 filter 방식으로 Pod row 찾기: ${this.currentPodName}`);
      
      // 주의: first()를 getByLabel 앞에 사용하면 전체 선택 체크박스를 선택할 수 있음!
      // 따라서 row를 먼저 필터링한 후 그 안의 체크박스만 선택
      const podRow = this.page.getByRole('row').filter({ hasText: this.currentPodName });
      
      // row가 존재하는지 확인
      await podRow.waitFor({ state: 'visible', timeout: 5000 });
      
      // 해당 row 내의 체크박스만 선택 (locator로 직접 접근)
      await podRow.locator('input[type="checkbox"]').check();
      await this.page.waitForTimeout(500);
      
      console.log(`✅ Pod 체크박스 선택 완료: ${this.currentPodName}`);
    } catch (error) {
      console.warn(`⚠️ filter 방식 실패, 직접 locator 시도: ${error.message}`);
      
      // 방법 2: CSS 선택자로 특정 Pod가 있는 tr 찾고 그 안의 체크박스 클릭
      try {
        console.log(`🔍 locator 방식으로 Pod row 찾기: ${this.currentPodName}`);
        
        // Pod 이름이 있는 row 찾기 (첫 번째만)
        const podRow = this.page.locator(`tr:has-text("${this.currentPodName}")`).first();
        
        // row가 존재하는지 확인
        await podRow.waitFor({ state: 'visible', timeout: 5000 });
        
        // 해당 row 내의 체크박스 찾기
        await podRow.locator('input[type="checkbox"]').check();
        await this.page.waitForTimeout(500);
        
        console.log(`✅ Pod 체크박스 선택 완료 (locator 방식): ${this.currentPodName}`);
      } catch (locatorError) {
        console.error(`❌ 모든 방법 실패: ${locatorError.message}`);
        
        // 디버깅: 페이지의 모든 row 확인
        const allRows = await this.page.locator('tr').count();
        console.log(`🔍 전체 row 개수: ${allRows}`);
        
        throw new Error(`Pod 선택 실패: ${this.currentPodName}`);
      }
    }
    
    await this.captureScreenshot('pod_selected');
    console.log('✅ Pod 선택 완료');
  }

  /**
   * Step 6: Pod 삭제
   */
  async deletePod() {
    console.log(`🗑️ Pod 삭제 중: ${this.currentPodName}`);
    
    // 삭제 버튼 클릭
    await this.page.getByRole('button', { name: '삭제' }).click();
    await this.page.waitForTimeout(1000);
    
    // 확인 버튼 클릭
    await this.page.getByLabel('알림').getByRole('button', { name: '삭제' }).click();
    await this.page.waitForTimeout(2000);

    await this.page.getByText(`${this.currentPodName}`, { exact: true }).click();

    await this.captureScreenshot('pod_deleted');

    await this.page.getByRole('button', { name: '확인' }).click();
    
    console.log('✅ Pod 삭제 완료');
  }

  /**
   * Step 7: 백업 메뉴로 이동
   */
  async navigateToBackup() {
    console.log('💾 백업 메뉴로 이동 중...');
    
    // 기본 설정 클릭
    await this.page.getByText('기본 설정').click();
    await this.page.waitForTimeout(500);
    
    // 클러스터 관리 드롭다운 클릭
    await this.page.getByText('클러스터 관리 arrow_drop_down').click();
    await this.page.waitForTimeout(500);
    
    // 백업 링크 클릭
    await this.page.getByRole('link', { name: '백업' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('backup_menu');
    console.log('✅ 백업 메뉴 이동 완료');
  }

  /**
   * Step 8: 백업 복원
   * 백업 이름 형식: yh-ns-YYMMDD-임의값 (예: yh-ns-251107-abc123)
   */
  async restoreBackup() {
    console.log(`♻️ 백업 복원 중: ${this.currentBackupName}`);
    
    try {
      // 방법 1: 특정 Backup의 row를 찾고 그 row 내의 체크박스만 선택 (안전)
      // Row의 실제 name: 'yh-ns-251107-abc123 SUCCEEDED ...'
      console.log(`🔍 filter 방식으로 Backup row 찾기: ${this.currentBackupName}`);
      
      // 주의: first()를 getByLabel 앞에 사용하면 전체 선택 체크박스를 선택할 수 있음!
      // 따라서 row를 먼저 필터링한 후 그 안의 체크박스만 선택
      const backupRow = this.page.getByRole('row').filter({ hasText: this.currentBackupName });
      
      // row가 존재하는지 확인
      await backupRow.waitFor({ state: 'visible', timeout: 5000 });
      
      // 해당 row 내의 체크박스만 선택 (locator로 직접 접근)
      await backupRow.locator('input[type="checkbox"]').check();
      await this.page.waitForTimeout(500);
      
      console.log(`✅ 백업 체크박스 선택 완료: ${this.currentBackupName}`);
    } catch (error) {
      console.warn(`⚠️ filter 방식 실패, 직접 locator 시도: ${error.message}`);
      
      // 방법 2: CSS 선택자로 특정 Backup이 있는 tr 찾고 그 안의 체크박스 클릭
      try {
        console.log(`🔍 locator 방식으로 Backup row 찾기: ${this.currentBackupName}`);
        
        // Backup 이름이 있는 row 찾기 (첫 번째만)
        const backupRow = this.page.locator(`tr:has-text("${this.currentBackupName}")`).first();
        
        // row가 존재하는지 확인
        await backupRow.waitFor({ state: 'visible', timeout: 5000 });
        
        // 해당 row 내의 체크박스 찾기
        await backupRow.locator('input[type="checkbox"]').check();
        await this.page.waitForTimeout(500);
        
        console.log(`✅ 백업 체크박스 선택 완료 (locator 방식): ${this.currentBackupName}`);
      } catch (locatorError) {
        console.error(`❌ 모든 방법 실패: ${locatorError.message}`);
        
        // 디버깅: 페이지의 모든 row 확인
        const allRows = await this.page.locator('tr').count();
        console.log(`🔍 전체 row 개수: ${allRows}`);
        
        throw new Error(`백업 선택 실패: ${this.currentBackupName}`);
      }
    }
    
    // 복원 버튼 클릭
    await this.page.getByRole('button', { name: '복원' }).click();
    await this.page.waitForTimeout(2000);

    await this.page.getByLabel('백업 복원').getByRole('button', { name: '복원' }).click();
    await this.page.waitForTimeout(10000);
    
    await this.captureScreenshot('backup_restored');
    console.log('✅ 백업 복원 완료');
  }

  /**
   * Step 9: 복원 확인
   */
  async verifyRestoration() {
    console.log(`✅ 복원 확인 중: ${this.currentPodName}`);
    
    // 컨테이너 관리로 이동
    await this.page.getByRole('link', { name: '컨테이너 관리' }).click();
    await this.page.waitForTimeout(3000); // Pod가 나타날 시간 충분히 대기
    
    try {
      // 방법 1: filter를 사용한 부분 문자열 매칭
      console.log(`🔍 복원된 Pod 확인 중: ${this.currentPodName}`);
      const podElement = this.page.getByRole('row').filter({ hasText: this.currentPodName });
      await expect(podElement).toBeVisible({ timeout: 10000 });
      console.log(`✅ Pod 복원 확인 성공: ${this.currentPodName}`);
    } catch (error) {
      console.warn(`⚠️ filter 방식 실패, 직접 텍스트 확인 시도: ${error.message}`);
      
      // 방법 2: 페이지 전체에서 Pod 이름 찾기
      try {
        const podText = this.page.locator(`text=${this.currentPodName}`).first();
        await expect(podText).toBeVisible({ timeout: 10000 });
        console.log(`✅ Pod 복원 확인 성공 (텍스트 방식): ${this.currentPodName}`);
      } catch (textError) {
        console.error(`❌ Pod 복원 확인 실패: ${textError.message}`);
        
        // 디버깅: 현재 페이지의 모든 텍스트 출력
        const pageContent = await this.page.textContent('body');
        console.log(`📄 현재 페이지 내용 일부: ${pageContent.substring(0, 500)}`);
        
        throw new Error(`Pod 복원 확인 실패: ${this.currentPodName}`);
      }
    }
    
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('restoration_verified');
    console.log('✅ 복원 확인 완료');
  }
}

export default PodRecoveryManager;

