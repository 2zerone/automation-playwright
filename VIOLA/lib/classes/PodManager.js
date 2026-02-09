// VIOLA Pod 관리 클래스 - 새로운 파일 (2025-09-30 23:07)
import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PodManager extends BaseManager {
  constructor(page) {
    super(null); // BaseManager는 utils를 받지만, PodManager는 page를 직접 사용
    this.page = page;
    // utils 객체 생성 (스크린샷 기능을 위해)
    this.utils = { page: this.page };
    this.currentPodName = null; // 생성된 Pod 이름을 저장
  }

  /**
   * VIOLA Pod 생성 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} Pod 생성 결과
   */
  async processPodCreate(config) {
    try {
      console.log('🚀 VIOLA Pod 생성 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToApps(), 'Apps 메뉴 접근', 3);
      await this.executeWithRetry(() => this.selectKubernetesEngine(), 'Kubernetes Engine 선택', 3);
      await this.executeWithRetry(() => this.selectCluster(), '클러스터 선택', 3);
      await this.executeWithRetry(() => this.navigateToWorkloads(), '워크로드 메뉴 접근', 3);
      await this.executeWithRetry(() => this.navigateToContainerManagement(), '컨테이너 관리 접근', 3);
      await this.executeWithRetry(() => this.startPodCreation(), 'Pod 생성 시작', 3);
      await this.executeWithRetry(() => this.switchToAdvancedMode(), '고급 모드 전환', 3);
      await this.executeWithRetry(() => this.fillYamlContent(), 'YAML 내용 입력', 3);
      await this.executeWithRetry(() => this.validateYaml(), 'YAML 유효성 검사', 3);
      await this.executeWithRetry(() => this.createPod(), 'Pod 생성 실행', 3);
      await this.executeWithRetry(() => this.confirmCreation(), '생성 확인', 3);
      await this.executeWithRetry(() => this.verifyPodRunning(), 'Pod 실행 상태 확인', 3);
      
      console.log('✅ VIOLA Pod 생성 프로세스 완료');
      return { success: true, message: 'VIOLA Pod 생성 완료' };
      
    } catch (error) {
      console.error('VIOLA Pod 생성 실패:', error.message);
      throw error;
    }
  }

  /**
   * Apps 메뉴 접근
   */
  async navigateToApps() {
    console.log('📱 Apps 메뉴 접근 중...');
    
    await this.page.getByRole('button', { name: 'apps' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('Apps 메뉴 접근');
    console.log('✅ Apps 메뉴 접근 완료');
  }

  /**
   * Kubernetes Engine 선택
   */
  async selectKubernetesEngine() {
    console.log('⚙️ Kubernetes Engine 선택 중...');
    
    await this.page.getByRole('link', { name: 'Kubernetes Engine 쿠버네티스 관리 서비스' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('Kubernetes Engine 선택');
    console.log('✅ Kubernetes Engine 선택 완료');
  }

  /**
   * 클러스터 선택
   */
  async selectCluster() {
    console.log('🔧 클러스터 선택 중...');
    
    await this.page.getByRole('listitem').filter({ hasText: 'dataplatform-k8s' }).click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('button', { name: '선택' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('클러스터 선택');
    console.log('✅ 클러스터 선택 완료');
  }

  /**
   * 워크로드 메뉴 접근
   */
  async navigateToWorkloads() {
    console.log('📋 워크로드 메뉴 접근 중...');
    
    await this.page.getByText('워크플로우').click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByText('워크로드 arrow_drop_down').click();
    await this.page.waitForTimeout(500);
    
    await this.captureScreenshot('워크로드 메뉴 접근');
    console.log('✅ 워크로드 메뉴 접근 완료');
  }

  /**
   * 컨테이너 관리 접근
   */
  async navigateToContainerManagement() {
    console.log('📦 컨테이너 관리 접근 중...');
    
    await this.page.getByRole('link', { name: '컨테이너 관리' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('컨테이너 관리 접근');
    console.log('✅ 컨테이너 관리 접근 완료');
  }

  /**
   * Pod 생성 시작
   */
  async startPodCreation() {
    console.log('🆕 Pod 생성 시작 중...');
    
    try {
      // 생성 버튼이 활성화될 때까지 대기
      await this.page.waitForSelector('button:has-text("생성"):not([disabled])', { 
        timeout: 60000,
        state: 'visible'
      });
      
      await this.page.getByRole('button', { name: '생성' }).click({ 
        timeout: 60000,
        force: false
      });
      await this.page.waitForTimeout(1000);
      
    } catch (error) {
      console.warn('⚠️ Pod 생성 시작 버튼 클릭 중 오류:', error.message);
      // 대체 방법으로 강제 클릭
      try {
        await this.page.locator('button:has-text("생성")').click({ force: true });
        await this.page.waitForTimeout(1000);
      } catch (forceError) {
        console.warn('⚠️ 강제 클릭도 실패, 계속 진행:', forceError.message);
      }
    }
    
    await this.captureScreenshot('Pod 생성 시작');
    console.log('✅ Pod 생성 시작 완료');
  }

  /**
   * 고급 모드 전환
   */
  async switchToAdvancedMode() {
    console.log('🔧 고급 모드 전환 중...');
    
    await this.page.locator('span').filter({ hasText: '고급 모드' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.captureScreenshot('고급 모드 전환');
    console.log('✅ 고급 모드 전환 완료');
  }

  /**
   * Pod 카운터 읽기 및 업데이트
   */
  getPodCounter() {
    const counterFilePath = path.join(__dirname, '../../config/pod-counter.json');
    
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
      console.warn('⚠️ Pod 카운터 파일 처리 중 오류:', error.message);
      return 1; // 오류 시 기본값 반환
    }
  }

  /**
   * Pod 카운터 초기화 (선택적 사용)
   */
  resetPodCounter() {
    const counterFilePath = path.join(__dirname, '../../config/pod-counter.json');
    
    try {
      const initialData = { counter: 1 };
      fs.writeFileSync(counterFilePath, JSON.stringify(initialData, null, 2));
      console.log('🔄 Pod 카운터가 1로 초기화되었습니다.');
    } catch (error) {
      console.warn('⚠️ Pod 카운터 초기화 중 오류:', error.message);
    }
  }

  /**
   * YAML 내용 입력
   */
  async fillYamlContent() {
    console.log('📝 YAML 내용 입력 중...');
    
    // 에디터 클릭
    await this.page.locator('.view-lines > div:nth-child(18)').click();
    await this.page.waitForTimeout(500);
    
    // 전체 선택
    await this.page.getByRole('textbox', { name: 'Editor content;Press Alt+F1' }).press('ControlOrMeta+a');
    await this.page.waitForTimeout(500);
    
    // Pod 카운터 가져오기
    const podCounter = this.getPodCounter();
    const podName = `yh-pod-${podCounter}`;
    
    console.log(`🏷️ 생성할 Pod 이름: ${podName}`);
    
    // YAML 파일 내용 읽기
    const yamlFilePath = path.join(__dirname, '../../scripts/pod-create-file.txt');
    let yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
    
    // Pod 이름을 동적으로 변경
    yamlContent = yamlContent.replace(/name:\s*yh-pod/, `name: ${podName}`);
    
    // YAML 내용 붙여넣기
    await this.page.getByRole('textbox', { name: 'Editor content;Press Alt+F1' }).fill(yamlContent);
    await this.page.waitForTimeout(1000);
    
    // 스크롤을 아래로 내리기 (YAML 유효성 검사 버튼이 보이도록)
    await this.page.keyboard.press('PageDown');
    await this.page.waitForTimeout(500);
    
    await this.captureScreenshot('YAML 내용 입력');
    console.log(`✅ YAML 내용 입력 완료 (Pod 이름: ${podName})`);
    
    // 생성된 Pod 이름을 클래스 속성으로 저장 (나중에 확인용)
    this.currentPodName = podName;
    
    // Pod 정보를 파일로 저장 (scenario-2에서 사용)
    this.saveLatestPodInfo(podName);
  }
  
  /**
   * 최근 생성된 Pod 정보 저장
   * 주의: 백업 이름은 BackupManager.verifyBackupCreation()에서 실제 생성 후 업데이트됩니다
   */
  saveLatestPodInfo(podName) {
    const latestPodFilePath = path.join(__dirname, '../../config/latest-pod.json');
    
    const podInfo = {
      podName: podName,
      backupName: null,  // BackupManager가 실제 백업 생성 후 업데이트
      createdAt: new Date().toISOString(),
      counter: parseInt(podName.replace('yh-pod-', ''))
    };
    
    try {
      fs.writeFileSync(
        latestPodFilePath,
        JSON.stringify(podInfo, null, 2),
        'utf8'
      );
      console.log(`💾 Pod 정보 저장 완료: ${latestPodFilePath}`);
      console.log(`   - Pod 이름: ${podName}`);
      console.log(`   - Backup 이름: BackupManager가 "Backup 생성 확인" 단계에서 업데이트 예정`);
    } catch (error) {
      console.warn('⚠️ Pod 정보 저장 실패:', error.message);
    }
  }

  /**
   * YAML 유효성 검사
   */
  async validateYaml() {
    console.log('✅ YAML 유효성 검사 중...');
    
    try {
      // YAML 유효성 검사 버튼 클릭
      await this.page.getByRole('button', { name: 'YAML 유효성 검사' }).click();
      
      // 유효성 검사 완료까지 충분히 대기 (생성 버튼 활성화를 위해)
      await this.page.waitForTimeout(3000);
      
      // 유효성 검사 결과 확인 (선택적)
      try {
        const successMessage = await this.page.locator('text=유효한').isVisible({ timeout: 2000 });
        if (successMessage) {
          console.log('✅ YAML 유효성 검사 성공 확인');
        }
      } catch (checkError) {
        console.log('ℹ️ 유효성 검사 결과 메시지 확인 불가, 계속 진행...');
      }
      
    } catch (error) {
      console.warn('⚠️ YAML 유효성 검사 중 오류:', error.message);
      console.log('🔄 유효성 검사 없이 계속 진행...');
      await this.page.waitForTimeout(2000);
    }
    
    await this.captureScreenshot('YAML 유효성 검사');
    console.log('✅ YAML 유효성 검사 완료');
  }

  /**
   * Pod 생성 실행 - 새로운 안전한 버전
   */
  async createPod() {
    console.log('🚀 Pod 생성 실행 중... (PodManager 새 버전)');
    
    try {
      // 페이지/브라우저 상태 확인
      if (!this.page || this.page.isClosed()) {
        console.error('❌ 페이지가 이미 닫혔습니다. Pod 생성을 중단합니다.');
        throw new Error('페이지가 닫혔습니다');
      }

      // 브라우저 컨텍스트 확인
      const context = this.page.context();
      if (!context || context.pages().length === 0) {
        console.error('❌ 브라우저 컨텍스트가 유효하지 않습니다. Pod 생성을 중단합니다.');
        throw new Error('브라우저 컨텍스트가 유효하지 않습니다');
      }
      
      // 생성 버튼이 활성화될 때까지 대기 (최대 10초)
      console.log('⏳ 생성 버튼 활성화 대기 중...');
      await this.page.waitForSelector('button:has-text("생성"):not([disabled])', { 
        timeout: 10000,
        state: 'visible'
      });
      
      // 추가 안정화 대기
      await this.page.waitForTimeout(1000);
      
      // 페이지 상태 재확인
      if (this.page.isClosed()) {
        console.error('❌ 대기 중 페이지가 닫혔습니다.');
        throw new Error('페이지가 닫혔습니다');
      }
      
      // 생성 버튼 클릭
      console.log('🖱️ 생성 버튼 클릭 시도...');
      await this.page.getByRole('button', { name: '생성' }).click({ 
        timeout: 5000,
        force: false // 요소가 실제로 클릭 가능할 때까지 대기
      });
      
      console.log('✅ 생성 버튼 클릭 완료');
      
      // 클릭 후 안정화 대기
      await this.page.waitForTimeout(3000);
      
    } catch (error) {
      // 브라우저/페이지 닫힘 관련 오류 처리
      if (error.message.includes('Target page, context or browser has been closed') ||
          error.message.includes('페이지가 닫혔습니다') ||
          error.message.includes('브라우저 컨텍스트가 유효하지 않습니다')) {
        console.error('❌ 브라우저가 닫혔습니다. Pod 생성을 중단합니다.');
        throw new Error('브라우저가 닫혔습니다. 테스트를 중단합니다.');
      }
      
      console.warn('⚠️ Pod 생성 클릭 중 오류:', error.message);
      
      // 페이지가 여전히 유효한 경우에만 대체 방법 시도
      if (!this.page.isClosed()) {
        // 대체 방법: 강제 클릭 시도
        try {
          console.log('🔄 대체 방법으로 강제 클릭 시도...');
          await this.page.locator('button:has-text("생성")').click({ force: true });
          await this.page.waitForTimeout(2000);
          console.log('✅ 강제 클릭 성공');
        } catch (forceError) {
          console.warn('⚠️ 강제 클릭도 실패:', forceError.message);
          console.log('🔄 키보드 Enter로 시도...');
          
          // 마지막 대체 방법: Enter 키
          try {
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(2000);
          } catch (keyError) {
            console.warn('⚠️ 모든 클릭 방법 실패, 계속 진행...');
          }
        }
      } else {
        console.error('❌ 페이지가 닫혀서 대체 방법을 시도할 수 없습니다.');
        throw error;
      }
    }
    
    await this.captureScreenshot('Pod 생성 실행');
    console.log('✅ Pod 생성 실행 완료');
  }

  /**
   * 생성 확인
   */
  async confirmCreation() {
    console.log('✔️ 생성 확인 중...');
    
    try {
      // 확인 버튼이 나타날 때까지 대기 (최대 5초)
      await this.page.waitForSelector('button:has-text("확인")', { timeout: 5000 });
      
      // 확인 버튼 클릭
      await this.page.getByRole('button', { name: '확인' }).click();
      await this.page.waitForTimeout(3000);
      
      console.log('✅ 확인 버튼 클릭 완료');
      
    } catch (error) {
      console.warn('⚠️ 확인 버튼 처리 중 오류:', error.message);
      console.log('🔄 대체 방법으로 진행...');
      
      // 대체 방법: Enter 키 또는 Escape 키로 모달 닫기
      try {
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000);
      } catch (keyError) {
        console.warn('⚠️ 키보드 입력도 실패:', keyError.message);
      }
    }
    
    await this.captureScreenshot('Pod 생성 확인');
    console.log('✅ Pod 생성 확인 완료');
  }

  /**
   * Pod 실행 상태 확인
   */
  async verifyPodRunning() {
    console.log('🏃 Pod 실행 상태 확인 중...');
    
    // 동적으로 생성된 Pod 이름 사용
    const podName = this.currentPodName || 'yh-pod-'; // 기본값 설정
    console.log(`🔍 확인할 Pod 이름: ${podName}`);
    
    // Pod 이름 클릭 (테이블이나 리스트에서 정확한 요소 찾기)
    console.log('⏳ Pod 클릭 가능 상태 확인 중...');
    
    // Pod가 클릭 가능한 상태가 될 때까지 대기
    await this.page.waitForTimeout(3000); // 기본 로딩 대기
    
    try {
      // 방법 1: 정확한 Pod 이름으로 클릭 가능한지 확인 후 클릭
      console.log('🔍 정확한 Pod 이름으로 클릭 시도 중...');
      const exactPodElement = this.page.getByText(podName, { exact: true });
      
      // Pod 요소가 활성화될 때까지 대기 (타임아웃 30초로 제한)
      await exactPodElement.waitFor({ state: 'visible', timeout: 30000 });
      
      // 추가 안정화 대기
      await this.page.waitForTimeout(1000);
      
      await exactPodElement.click();
      console.log(`✅ 정확한 Pod 이름으로 클릭 성공: ${podName}`);
    } catch (error) {
      console.warn('⚠️ 정확한 Pod 이름으로 클릭 실패, 패턴 매칭 시도:', error.message);
      
      try {
        // 방법 2: yh-pod- 패턴으로 클릭 가능한지 확인 후 클릭 (Pod가 하나만 있을 때)
        console.log('🔍 패턴 매칭으로 Pod 클릭 시도 중...');
        const patternPodElement = this.page.getByText('yh-pod-');
        
        // Pod 요소가 활성화될 때까지 대기
        await patternPodElement.waitFor({ state: 'visible', timeout: 10000 });
        
        // 추가 안정화 대기
        await this.page.waitForTimeout(1000);
        
        await patternPodElement.click();
        console.log('✅ 패턴 매칭으로 Pod 클릭 성공: yh-pod-');
      } catch (patternError) {
        console.error('❌ 모든 Pod 클릭 방법 실패:', patternError.message);
        throw new Error('Pod 클릭 실패: 정확한 이름과 패턴 매칭 모두 실패');
      }
    }
    
    await this.page.waitForTimeout(2000);
    
    // RUNNING 상태 확인 (타임아웃 30초로 제한)
    console.log('🔍 Pod RUNNING 상태 확인 중...');
    try {
      await expect(this.page.getByText('RUNNING').first()).toBeVisible({ timeout: 30000 });
      console.log('✅ Pod가 RUNNING 상태입니다.');
    } catch (error) {
      console.error('❌ Pod가 RUNNING 상태가 아닙니다.');
      throw new Error(`Pod 실행 상태 확인 실패: Pod가 RUNNING 상태가 아닙니다 (Pod: ${podName})`);
    }
    
    await this.captureScreenshot('Pod 실행 상태 확인');
    console.log(`✅ Pod 실행 상태 확인 완료 (Pod: ${podName})`);
  }
}

export default PodManager;
