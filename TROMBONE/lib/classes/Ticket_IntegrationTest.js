// 티켓 통합테스트 관리 클래스
import BaseManager from './BaseManager.js';

class TicketIntegrationTestManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 진행 (통합테스트 단계)
  async processTicketIntegrationTest(config) {
    try {
      console.log('🧪 티켓 통합테스트 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.uploadTestCaseFile(), '테스트 케이스 파일 업로드', 3);
      await this.executeWithRetry(() => this.uploadEvidenceFile(), '증적 파일 업로드', 3);
      await this.executeWithRetry(() => this.proceedToNextStep(), '다음 단계로 진행', 3);
      
      console.log('✅ 티켓 통합테스트 프로세스 완료');
      return { success: true, message: '통합테스트 파일 업로드 완료' };
      
    } catch (error) {
      console.error('통합테스트 실패:', error.message);
      throw error;
    }
  }

  // 테스트 케이스 파일 업로드
  async uploadTestCaseFile() {
    console.log('📄 테스트 케이스 파일 업로드 중...');
    
    try {
      // 파일 업로드 input 요소를 찾아서 파일 설정
      const fileInput = this.utils.page.locator('input[type="file"]').first();
      const fullPath = 'C:\\Users\\okestro\\Desktop\\오케스트로\\2파트\\TROMBONE\\테스트 케이스.xlsx';
      
      await fileInput.setInputFiles(fullPath);
      console.log('✅ 테스트 케이스 파일 업로드 완료');
      
      await this.utils.page.waitForTimeout(2000);
      
      // 테스트 케이스 파일 확정 버튼 클릭
      await this.utils.page.locator('div').filter({ hasText: /^테스트 케이스파일 확정$/ }).getByRole('button').click();
      console.log('✅ 테스트 케이스 파일 확정 버튼 클릭 완료');
      await this.utils.page.waitForTimeout(1000);
      
      // 확인 버튼 클릭
      await this.utils.page.getByRole('button', { name: '확인' }).click();
      console.log('✅ 테스트 케이스 파일 확인 버튼 클릭 완료');
      await this.utils.page.waitForTimeout(1000);
    } catch (error) {
      console.error('❌ 테스트 케이스 파일 업로드 실패:', error);
      throw error;
    }
  }

  // 증적 파일 업로드
  async uploadEvidenceFile() {
    console.log('📋 증적 파일 업로드 중...');
    
    try {
      // 파일 업로드 input 요소를 찾아서 파일 설정
      const fileInput = this.utils.page.locator('input[type="file"]').first();
      const fullPath = 'C:\\Users\\okestro\\Desktop\\오케스트로\\2파트\\TROMBONE\\증적.xlsx';
      
      await fileInput.setInputFiles(fullPath);
      console.log('✅ 증적 파일 업로드 완료');
      
      await this.utils.page.waitForTimeout(2000);
      
      // 증적 파일 확정 버튼 클릭
      await this.utils.page.locator('div').filter({ hasText: /^증적파일 확정$/ }).getByRole('button').click();
      console.log('✅ 증적 파일 확정 버튼 클릭 완료');
      await this.utils.page.waitForTimeout(1000);
      
      // 확인 버튼 클릭
      await this.utils.page.getByRole('button', { name: '확인' }).click();
      console.log('✅ 증적 파일 확인 버튼 클릭 완료');
      await this.utils.page.waitForTimeout(1000);
      
      // 증적파일 확정 후 스크린샷
      await this.utils.page.screenshot({ 
        path: `custom-reports/screenshot-통합테스트증적파일확정-${new Date().toISOString().replace(/[:.]/g, '-')}.png` 
      });
      console.log('📸 증적파일 확정 스크린샷 저장 완료');
    } catch (error) {
      console.error('❌ 증적 파일 업로드 실패:', error);
      throw error;
    }
  }

  // 다음 단계로 진행
  async proceedToNextStep() {
    console.log('➡️ 다음 단계로 진행 중...');
    
    try {
      // 다음 버튼 클릭 (.first() 시도 후 일반 클릭)
      await this.utils.page.getByRole('button', { name: '다음' }).first().click();
      console.log('✅ 다음 버튼 클릭 완료 (first 사용)');
    } catch (error) {
      console.log('⚠️ first() 실패, 일반 클릭 시도...');
      await this.utils.page.getByRole('button', { name: '다음' }).click();
      console.log('✅ 다음 버튼 클릭 완료 (일반 클릭)');
    }
    
    await this.utils.page.waitForTimeout(2000); // 안정성 확보를 위한 딜레이
    
    // 다음 단계 진입 스크린샷
    await this.utils.page.screenshot({ 
      path: `custom-reports/screenshot-통합테스트다음단계진입-${new Date().toISOString().replace(/[:.]/g, '-')}.png` 
    });
    console.log('📸 다음 단계 진입 스크린샷 저장 완료');
  }

}

export default TicketIntegrationTestManager;