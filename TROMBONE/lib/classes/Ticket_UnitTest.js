// 티켓 단위테스트 관리 클래스
import BaseManager from './BaseManager.js';

class TicketUnitTestManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 진행 (단위테스트 단계)
  async processTicketUnitTest(config) {
    try {
      console.log('🧪 티켓 단위테스트 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.waitForUnitTestWaiting(), '단위테스트 대기 상태 확인', 3);
      await this.executeWithRetry(() => this.waitForUnitTestInProgress(), '단위테스트 진행 중 상태 확인', 3);
      await this.executeWithRetry(() => this.waitForUnitTestSuccess(), '단위테스트 성공 상태 확인', 3);
      await this.executeWithRetry(() => this.proceedToNextStep(), '다음 단계로 진행', 3);
      
      console.log('✅ 티켓 단위테스트 프로세스 완료');
      return { success: true, message: '단위테스트 완료' };
      
    } catch (error) {
      console.error('단위테스트 실패:', error.message);
      throw error;
    }
  }

  // 단위테스트 대기 상태 확인
  async waitForUnitTestWaiting() {
    console.log('⏳ 단위테스트 대기 상태 확인 중...');
    
    const maxWaitTime = 5 * 60 * 1000; // 5분 (밀리초)
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // '단위테스트대기' 텍스트 확인
        const waitingText = this.utils.page.locator('div').filter({ hasText: /^단위테스트대기$/ }).first();
        const isVisible = await waitingText.isVisible();
        
        if (isVisible) {
          console.log('✅ 단위테스트 대기 상태 확인됨');
          return;
        }
        
        // 1초마다 확인
        await this.utils.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`⚠️ 단위테스트 대기 상태 확인 중 오류: ${error.message}`);
        await this.utils.page.waitForTimeout(1000);
      }
    }
    
    throw new Error('단위테스트 대기 상태를 확인할 수 없음 (5분 타임아웃)');
  }

  // 단위테스트 진행 중 상태 확인
  async waitForUnitTestInProgress() {
    console.log('🔄 단위테스트 진행 중 상태 확인 중...');
    
    const maxWaitTime = 5 * 60 * 1000; // 5분 (밀리초)
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // '단위테스트진행중' 텍스트 확인
        const inProgressText = this.utils.page.locator('div').filter({ hasText: /^단위테스트진행중$/ }).first();
        const isVisible = await inProgressText.isVisible();
        
        if (isVisible) {
          console.log('✅ 단위테스트 진행 중 상태 확인됨');
          return;
        }
        
        // 1초마다 확인
        await this.utils.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`⚠️ 단위테스트 진행 중 상태 확인 중 오류: ${error.message}`);
        await this.utils.page.waitForTimeout(1000);
      }
    }
    
    throw new Error('단위테스트 진행 중 상태를 확인할 수 없음 (5분 타임아웃)');
  }

  // 단위테스트 성공 상태 확인
  async waitForUnitTestSuccess() {
    console.log('✅ 단위테스트 성공 상태 확인 중...');
    
    const maxWaitTime = 5 * 60 * 1000; // 5분 (밀리초)
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // '단위테스트성공' 텍스트 확인
        const successText = this.utils.page.locator('div').filter({ hasText: /^단위테스트성공$/ }).first();
        const isVisible = await successText.isVisible();
        
        if (isVisible) {
          console.log('✅ 단위테스트 성공 상태 확인됨');
          
          // 스크린샷 타이밍: '단위테스트성공' 텍스트를 발견했을 때
          await this.captureScreenshot('단위테스트 단계: 단위테스트 성공', '단위테스트성공');
          return;
        }
        
        // 1초마다 확인
        await this.utils.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`⚠️ 단위테스트 성공 상태 확인 중 오류: ${error.message}`);
        await this.utils.page.waitForTimeout(1000);
      }
    }
    
    throw new Error('단위테스트 성공 상태를 확인할 수 없음 (5분 타임아웃)');
  }

  // 다음 단계로 진행
  async proceedToNextStep() {
    console.log('➡️ 다음 단계로 진행 중...');
    
    // 다음 버튼 클릭
    await this.utils.page.getByRole('button', { name: '다음' }).click();
    console.log('✅ 다음 버튼 클릭 완료');
    
    // 페이지 로딩 대기
    await this.utils.page.waitForTimeout(1000);
    
    // 스크린샷 타이밍: '다음' 버튼 누르고 다음 단계 진입했을 때
    await this.captureScreenshot('단위테스트 단계: 단위테스트 단계 완료 및 다음 단계 진입', '다음단계진입');
  }

  // 개별 실행 메서드들 (세부 단계별 실행을 위해)
  async executeUnitTestWaiting() {
    return await this.executeWithRetry(
      async () => {
        await this.waitForUnitTestWaiting();
        return { success: true, message: '단위테스트 대기 상태 확인 완료' };
      },
      '단위테스트 대기 상태 확인',
      3
    );
  }

  async executeUnitTestInProgress() {
    return await this.executeWithRetry(
      async () => {
        await this.waitForUnitTestInProgress();
        return { success: true, message: '단위테스트 진행 중 상태 확인 완료' };
      },
      '단위테스트 진행 중 상태 확인',
      3
    );
  }

  async executeUnitTestSuccess() {
    return await this.executeWithRetry(
      async () => {
        await this.waitForUnitTestSuccess();
        return { success: true, message: '단위테스트 성공 상태 확인 완료' };
      },
      '단위테스트 성공 상태 확인',
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
}

export default TicketUnitTestManager;