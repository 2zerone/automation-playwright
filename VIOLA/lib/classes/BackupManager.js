// 백업 기능 클래스
import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackupManager extends BaseManager {
  constructor(page) {
    super(null); // BaseManager는 utils를 받지만, BackupManager는 page를 직접 사용
    this.page = page;
    // utils 객체 생성 (스크린샷 기능을 위해)
    this.utils = { page: this.page };
    this.currentBackupName = null; // 생성된 Backup 이름을 저장
  }

  /**
   * VIOLA Backup 생성 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} Backup 생성 결과
   */
  async processBackupCreate(config) {
    try {
      console.log('💾 VIOLA Backup 생성 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToBackup(), '백업 메뉴 접근', 3);
      await this.executeWithRetry(() => this.clickCreate(), '생성 버튼 클릭', 3);
      await this.executeWithRetry(() => this.selectNamespaceBackup(), '네임스페이스 백업 선택', 3);
      await this.executeWithRetry(() => this.scrollToCheckbox(), '체크박스 영역으로 스크롤', 3);
      await this.executeWithRetry(() => this.selectNamespace(), '네임스페이스 선택', 3);
      await this.executeWithRetry(() => this.clickNext(), '다음 버튼 클릭', 3);
      await this.executeWithRetry(() => this.createBackup(), 'Backup 생성 및 확인', 3);
      await this.executeWithRetry(() => this.verifyBackupCreation(), 'Backup 생성 확인', 3);
      
      console.log('✅ VIOLA Backup 생성 프로세스 완료');
      return { success: true, message: 'VIOLA Backup 생성 완료' };
      
    } catch (error) {
      console.error('VIOLA Backup 생성 실패:', error.message);
      throw error;
    }
  }

  /**
   * 백업 메뉴 접근
   */
  async navigateToBackup() {
    console.log('📁 백업 메뉴 접근 중...');
    
    await this.page.getByText('기본 설정').click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByText('클러스터 관리 arrow_drop_down').click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('link', { name: '백업' }).click();
    console.log('✅ 백업 링크 클릭 완료, 페이지 로드 대기 중...');
    
    // 페이지 전환 완료 대기 - 백업 페이지의 고유 요소가 나타날 때까지 대기
    try {
      // 백업 페이지의 '생성' 버튼이 나타날 때까지 대기
      await this.page.getByRole('button', { name: '생성' }).waitFor({ 
        state: 'visible', 
        timeout: 30000 
      });
      console.log('✅ 백업 페이지 로드 완료 확인');
    } catch (error) {
      console.warn('⚠️ 백업 페이지 로드 확인 실패, 계속 진행:', error.message);
    }
    
    // 추가 안정화 대기 (이전 페이지 DOM 정리 시간)
    await this.page.waitForTimeout(2000);
    
    await this.captureScreenshot('백업 메뉴 접근');
    console.log('✅ 백업 메뉴 접근 완료');
  }

  /**
   * 생성 버튼 클릭
   */
  async clickCreate() {
    console.log('🆕 생성 버튼 클릭 중...');
    
    // 생성 버튼이 표시되고 클릭 가능할 때까지 명시적으로 대기
    const createButton = this.page.getByRole('button', { name: '생성' });
    await createButton.waitFor({ state: 'visible', timeout: 100000 });
    console.log('✅ 생성 버튼 감지됨, 클릭 대기 중...');
    
    // 버튼이 완전히 렌더링되고 안정화될 때까지 추가 대기
    await this.page.waitForTimeout(500);
    
    await createButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('생성 버튼 클릭');
    console.log('✅ 생성 버튼 클릭 완료');
  }

  /**
   * 네임스페이스 백업 선택
   */
  async selectNamespaceBackup() {
    console.log('📦 네임스페이스 백업 선택 중...');
    
    await this.page.getByText('네임스페이스 백업').click();
    
    // 렌더링 안정화 대기
    await this.page.waitForTimeout(500);
    
    
    await this.captureScreenshot('네임스페이스 백업 선택');
    console.log('✅ 네임스페이스 백업 선택 완료');
  }

  /**
   * 체크박스 영역으로 스크롤
   */
  async scrollToCheckbox() {
    console.log('📜 체크박스 영역으로 스크롤 중...');
    
    try {
      // 방법 1: 페이지 다운 키 사용
      await this.page.keyboard.press('PageDown');
      await this.page.waitForTimeout(500);
      
      // 방법 2: 추가 스크롤이 필요하면 한 번 더
      const checkboxVisible = await this.page.getByRole('checkbox', { name: 'yh-ns' }).isVisible({ timeout: 2000 }).catch(() => false);
      if (!checkboxVisible) {
        console.log('🔄 추가 스크롤 시도...');
        await this.page.keyboard.press('PageDown');
        await this.page.waitForTimeout(500);
      }
      
      // 방법 3: 직접 스크롤 (필요시)
      await this.page.evaluate(() => {
        const scrollContainer = document.querySelector('.MuiDialog-container') || document.body;
        scrollContainer.scrollBy(0, 300);
      });
      await this.page.waitForTimeout(500);
      
    } catch (error) {
      console.warn('⚠️ 스크롤 중 오류:', error.message);
      console.log('🔄 계속 진행...');
    }
    
    await this.captureScreenshot('체크박스 영역으로 스크롤');
    console.log('✅ 스크롤 완료');
  }

  /**
   * 네임스페이스 선택
   */
  async selectNamespace() {
    console.log('☑️ 네임스페이스 선택 중...');
    
    // yh-ns 체크박스가 표시되고 클릭 가능할 때까지 명시적으로 대기
    const checkbox = this.page.getByRole('checkbox', { name: 'yh-ns' });
    await checkbox.waitFor({ state: 'visible', timeout: 100000 });
    console.log('✅ yh-ns 체크박스 감지됨, 체크 대기 중...');
    
    // 체크박스가 완전히 렌더링되고 안정화될 때까지 추가 대기
    await this.page.waitForTimeout(500);
    
    // yh-ns 체크박스 체크
    await checkbox.check();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('네임스페이스 선택');
    console.log('✅ 네임스페이스 선택 완료');
  }

  /**
   * 다음 버튼 클릭
   */
  async clickNext() {
    console.log('➡️ 다음 버튼 클릭 중...');
    
    // 다음 버튼이 표시되고 클릭 가능할 때까지 명시적으로 대기
    const nextButton = this.page.getByRole('button', { name: '다음' });
    await nextButton.waitFor({ state: 'visible', timeout: 100000 });
    console.log('✅ 다음 버튼 감지됨, 클릭 대기 중...');
    
    // 버튼이 완전히 렌더링되고 안정화될 때까지 추가 대기
    await this.page.waitForTimeout(500);
    
    await nextButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('다음 버튼 클릭');
    console.log('✅ 다음 버튼 클릭 완료');
  }

  /**
   * Backup 생성 실행 (생성 확인 포함)
   */
  async createBackup() {
    console.log('🚀 Backup 생성 실행 중...');
    
    try {
      // 생성 버튼이 활성화될 때까지 대기
      await this.page.waitForSelector('button:has-text("생성"):not([disabled])', { 
        timeout: 5000,
        state: 'visible'
      });
      
      await this.page.getByRole('button', { name: '생성' }).click({ 
        timeout: 5000,
        force: false
      });
      
      console.log('✅ 생성 버튼 클릭 완료');
      
      // 클릭 후 안정화 대기
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      console.warn('⚠️ Backup 생성 클릭 중 오류:', error.message);
      
      // 대체 방법: 강제 클릭 시도
      try {
        console.log('🔄 대체 방법으로 강제 클릭 시도...');
        await this.page.locator('button:has-text("생성")').click({ force: true });
        await this.page.waitForTimeout(2000);
        console.log('✅ 강제 클릭 성공');
      } catch (forceError) {
        console.warn('⚠️ 강제 클릭도 실패:', forceError.message);
      }
    }
    
    // 생성 확인
    console.log('✔️ 생성 확인 중...');
    
    try {
      // 확인 버튼이 나타날 때까지 대기
      await this.page.waitForSelector('button:has-text("확인")', { timeout: 5000 });
      
      // 확인 버튼 클릭
      await this.page.getByRole('button', { name: '확인' }).click();
      await this.page.waitForTimeout(2000);
      
      console.log('✅ 확인 버튼 클릭 완료');
      
    } catch (error) {
      console.warn('⚠️ 확인 버튼 처리 중 오류:', error.message);
      console.log('🔄 대체 방법으로 진행...');
      
      // 대체 방법: Enter 키로 모달 닫기
      try {
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000);
      } catch (keyError) {
        console.warn('⚠️ 키보드 입력도 실패:', keyError.message);
      }
    }
    
    await this.captureScreenshot('Backup 생성 실행');
    console.log('✅ Backup 생성 및 확인 완료');
  }

  /**
   * Backup 생성 확인 및 실제 백업 이름 추출 & 저장
   * 백업 이름 형식: yh-ns-YYMMDD-임의값 (예: yh-ns-251107-abc123)
   */
  async verifyBackupCreation() {
    console.log('🔍 Backup 생성 확인 중...');
    
    try {
      // 백업 생성 후 UI 업데이트 대기
      console.log('⏳ 백업 생성 완료 대기 중...');
      await this.page.waitForTimeout(3000);
      
      // 백업 테이블에서 yh-ns-로 시작하는 모든 row 찾기
      console.log('🔍 생성된 백업 찾는 중 (yh-ns-YYMMDD-xxxxx 형식)...');
      const backupRows = this.page.getByRole('row').filter({ hasText: 'yh-ns-' });
      
      // 백업 row가 나타날 때까지 대기
      await backupRows.first().waitFor({ state: 'visible', timeout: 10000 });
      
      // 첫 번째 백업 row의 전체 텍스트 가져오기
      const backupRowText = await backupRows.first().textContent();
      console.log(`📄 백업 row 전체 텍스트: ${backupRowText}`);
      
      // 백업 이름 추출 (yh-ns-YYMMDD-xxxxx 형식)
      // 정규식: yh-ns- + 6자리 숫자(날짜) + - + 임의의 영숫자
      const backupNameMatch = backupRowText.match(/yh-ns-\d{6}-[a-z0-9]+/i);
      
      if (backupNameMatch) {
        this.currentBackupName = backupNameMatch[0];
        console.log(`✅ 백업 이름 추출 성공: ${this.currentBackupName}`);
        
        // latest-pod.json 업데이트 (백업 이름 추가)
        this.updateLatestPodInfoWithBackupName(this.currentBackupName);
        
      } else {
        console.warn('⚠️ 정규식 매칭 실패, 대체 방법 시도...');
        
        // 대체 방법: 첫 번째 셀의 텍스트 직접 가져오기
        try {
          const firstCell = backupRows.first().locator('td').first();
          const backupName = await firstCell.textContent();
          this.currentBackupName = backupName.trim();
          console.log(`✅ 백업 이름 추출 성공 (대체 방법): ${this.currentBackupName}`);
          
          this.updateLatestPodInfoWithBackupName(this.currentBackupName);
          
        } catch (altError) {
          console.error('❌ 모든 백업 이름 추출 방법 실패:', altError.message);
          console.error('⚠️ 백업은 생성되었으나 이름 추출에 실패했습니다.');
        }
      }
      
    } catch (error) {
      console.error('❌ Backup 생성 확인 중 오류:', error.message);
      console.log('⚠️ 백업 이름을 추출할 수 없어 scenario-2 실행이 불가능합니다.');
      throw error;
    }
    
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('Backup 생성 확인');
    console.log('✅ Backup 생성 확인 완료');
  }
  
  /**
   * latest-pod.json에 실제 백업 이름 업데이트
   */
  updateLatestPodInfoWithBackupName(backupName) {
    const latestPodFilePath = path.join(__dirname, '../../config/latest-pod.json');
    
    try {
      if (fs.existsSync(latestPodFilePath)) {
        const podInfo = JSON.parse(fs.readFileSync(latestPodFilePath, 'utf8'));
        
        // 백업 이름 업데이트
        podInfo.backupName = backupName;
        podInfo.backupCreatedAt = new Date().toISOString();
        
        fs.writeFileSync(
          latestPodFilePath,
          JSON.stringify(podInfo, null, 2),
          'utf8'
        );
        
        console.log(`💾 latest-pod.json 업데이트 완료:`);
        console.log(`   - Pod 이름: ${podInfo.podName}`);
        console.log(`   - Backup 이름: ${podInfo.backupName}`);
        
      } else {
        console.warn('⚠️ latest-pod.json 파일이 존재하지 않습니다.');
        console.warn('📌 PodManager가 먼저 실행되어 Pod 정보를 저장해야 합니다.');
      }
    } catch (error) {
      console.error('❌ latest-pod.json 업데이트 실패:', error.message);
    }
  }
}

export default BackupManager;

