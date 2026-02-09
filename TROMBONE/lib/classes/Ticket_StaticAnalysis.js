// 티켓 정적분석 관리 클래스
import BaseManager from './BaseManager.js';

class TicketStaticAnalysisManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 진행 (정적분석 단계)
  async processTicketStaticAnalysis(config) {
    return await this.executeWithRetry(async () => {
      console.log('🔍 티켓 정적분석 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.waitForStaticAnalysisWaiting(), '정적분석 대기 상태 확인', 3);
      await this.executeWithRetry(() => this.waitForStaticAnalysisInProgress(), '정적분석 진행 중 상태 확인', 3);
      await this.executeWithRetry(() => this.waitForStaticAnalysisSuccess(), '정적분석 성공 상태 확인', 3);
      await this.executeWithRetry(() => this.takeStaticAnalysisSuccessScreenshot(), '정적분석 성공 스크린샷', 3);
      await this.executeWithRetry(() => this.proceedToNextStep(), '다음 단계로 진행', 3);
        
      // 다음 단계 진입 스크린샷
      await this.takeNextStepScreenshot();
        
      console.log('✅ 티켓 정적분석 프로세스 완료');
      return { success: true, message: '정적분석 완료' };
    },
    '정적분석',
    3,
    async (result) => {
      return result && result.success;
    });
  }

  // 정적분석 대기 상태 확인
  async waitForStaticAnalysisWaiting() {
    console.log('⏳ 정적분석 대기 상태 확인 중...');
    
    const maxWaitTime = 5 * 60 * 1000; // 5분 (밀리초)
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // '대기' 셀 확인
        const waitingCell = this.utils.page.getByRole('cell', { name: '대기' }).first();
        const isVisible = await waitingCell.isVisible();
        
        if (isVisible) {
          console.log('✅ 정적분석 대기 상태 확인됨');
          return;
        }
        
        // 1초마다 확인
        await this.utils.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`⚠️ 정적분석 대기 상태 확인 중 오류: ${error.message}`);
        await this.utils.page.waitForTimeout(1000);
      }
    }
    
    throw new Error('정적분석 대기 상태를 확인할 수 없음 (5분 타임아웃)');
  }

  // 정적분석 진행 중 상태 확인
  async waitForStaticAnalysisInProgress() {
    console.log('🔄 정적분석 진행 중 상태 확인 중...');
    
    const maxWaitTime = 5 * 60 * 1000; // 5분 (밀리초)
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // '진행중' 셀 확인
        const inProgressCell = this.utils.page.getByRole('cell', { name: '진행중' });
        const isVisible = await inProgressCell.isVisible();
        
        if (isVisible) {
          console.log('✅ 정적분석 진행 중 상태 확인됨');
          return;
        }
        
        // 1초마다 확인
        await this.utils.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`⚠️ 정적분석 진행 중 상태 확인 중 오류: ${error.message}`);
        await this.utils.page.waitForTimeout(1000);
      }
    }
    
    throw new Error('정적분석 진행 중 상태를 확인할 수 없음 (5분 타임아웃)');
  }

  // 정적분석 성공 상태 확인 (두 개 모두 성공)
  async waitForStaticAnalysisSuccess() {
    console.log('✅ 정적분석 성공 상태 확인 중...');
    
    const maxWaitTime = 5 * 60 * 1000; // 5분 (밀리초)
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // 첫 번째 '성공' 셀 확인
        const firstSuccessCell = this.utils.page.getByRole('cell', { name: '성공' }).first();
        const firstSuccessVisible = await firstSuccessCell.isVisible();
        
        // 두 번째 '성공' 셀 확인
        const secondSuccessCell = this.utils.page.getByRole('cell', { name: '성공' }).nth(1);
        const secondSuccessVisible = await secondSuccessCell.isVisible();
        
        if (firstSuccessVisible && secondSuccessVisible) {
          console.log('✅ 정적분석 성공 상태 확인됨 (두 개 모두 성공)');
          
          // 스크린샷 타이밍: 두 가지가 모두 성공으로 표시될 때
          await this.captureScreenshot('정적분석 단계: 정적분석 완료', '정적분석성공');
          return;
        }
        
        // 1초마다 확인
        await this.utils.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`⚠️ 정적분석 성공 상태 확인 중 오류: ${error.message}`);
        await this.utils.page.waitForTimeout(1000);
      }
    }
    
    throw new Error('정적분석 성공 상태를 확인할 수 없음 (5분 타임아웃)');
  }

  // 다음 단계로 진행
  async proceedToNextStep() {
    console.log('➡️ 다음 단계로 진행 중...');
    
    // 다음 버튼 클릭
    await this.utils.page.getByRole('button', { name: '다음' }).click();
    console.log('✅ 다음 버튼 클릭 완료');
    
    // 페이지 로딩 대기
    await this.utils.page.waitForTimeout(1000);
    
    // 스크린샷 타이밍: 정적분석 단계 완료 후 다음 단계 진입했을 때
    await this.captureScreenshot('정적분석 단계: 정적분석 단계 완료 및 다음 단계 진입', '다음단계진입');
  }

  // 개별 실행 메서드들 (세부 단계별 실행을 위해)
  async executeStaticAnalysisWaiting() {
    return await this.executeWithRetry(
      async () => {
        await this.waitForStaticAnalysisWaiting();
        return { success: true, message: '정적분석 대기 상태 확인 완료' };
      },
      '정적분석 대기 상태 확인',
      3
    );
  }

  async executeStaticAnalysisInProgress() {
    return await this.executeWithRetry(
      async () => {
        await this.waitForStaticAnalysisInProgress();
        return { success: true, message: '정적분석 진행 중 상태 확인 완료' };
      },
      '정적분석 진행 중 상태 확인',
      3
    );
  }

  async executeStaticAnalysisSuccess() {
    return await this.executeWithRetry(
      async () => {
        await this.waitForStaticAnalysisSuccess();
        return { success: true, message: '정적분석 성공 상태 확인 완료' };
      },
      '정적분석 성공 상태 확인',
      3
    );
  }

  async executeNextStepProgression() {
    return await this.executeWithRetry(
      async () => {
        await this.proceedToNextStep();
        return { success: true, message: '다음 단계 진행 완료' };
      },
      '다음 단계 진행',
      3
    );
  }

  // 정적분석 성공 스크린샷
  async takeStaticAnalysisSuccessScreenshot() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `custom-reports/screenshot-정적분석성공-${timestamp}.png`;
      await this.utils.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 정적분석 성공 스크린샷 저장: ${screenshotPath}`);
    } catch (error) {
      console.error('❌ 정적분석 성공 스크린샷 저장 실패:', error);
      // 스크린샷 실패는 전체 프로세스를 중단시키지 않음
    }
  }

  // 다음 단계 진입 스크린샷
  async takeNextStepScreenshot() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `custom-reports/screenshot-정적분석다음단계진입-${timestamp}.png`;
      await this.utils.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 정적분석 다음 단계 진입 스크린샷 저장: ${screenshotPath}`);
    } catch (error) {
      console.error('❌ 정적분석 다음 단계 진입 스크린샷 저장 실패:', error);
      // 스크린샷 실패는 전체 프로세스를 중단시키지 않음
    }
  }
}

export default TicketStaticAnalysisManager;