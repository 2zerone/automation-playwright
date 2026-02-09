// 티켓 수동 배포 관리 클래스
import BaseManager from './BaseManager.js';

class TicketManualDeploymentManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 진행 (수동 배포 단계) - 단계별 재시도 적용
  async processTicketManualDeployment(config) {
    try {
      console.log('🚀 티켓 수동 배포 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.clickPipelineExecuteButton(), '파이프라인 실행 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickConfirmButton(), '확인 버튼 클릭', 3);
      await this.executeWithRetry(() => this.monitorPipelineStatus(), '파이프라인 상태 모니터링', 3);
      await this.executeWithRetry(() => this.proceedToNextStep(), '다음 단계로 진행', 3);
      
      console.log('✅ 티켓 수동 배포 프로세스 완료');
      return { success: true, message: '수동 배포 완료' };
      
    } catch (error) {
      console.error('티켓 수동 배포 프로세스 실패:', error.message);
      throw error;
    }
  }

  // 파이프라인 실행 버튼 클릭
  async clickPipelineExecuteButton() {
    console.log('▶️ 파이프라인 실행 버튼 클릭 중...');
    
    try {
      // 먼저 파이프라인 실행 버튼이 보이는지 확인
      const button = this.utils.page.getByRole('button', { name: '파이프라인 실행' });
      const isVisible = await button.isVisible();
      
      if (!isVisible) {
        console.log('📜 파이프라인 실행 버튼이 보이지 않음, 스크롤 다운 시도...');
        // 페이지 하단으로 스크롤
        await this.utils.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await this.utils.page.waitForTimeout(1000); // 스크롤 후 잠시 대기
        
        // 다시 확인
        const isVisibleAfterScroll = await button.isVisible();
        if (!isVisibleAfterScroll) {
          console.log('📜 여전히 보이지 않음, 중간 지점으로 스크롤 시도...');
          // 중간 지점으로 스크롤
          await this.utils.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
          });
          await this.utils.page.waitForTimeout(1000);
        }
      }
      
      // 파이프라인 실행 버튼 클릭 (.first() 시도 후 일반 클릭)
      await button.first().click();
      console.log('✅ 파이프라인 실행 버튼 클릭 완료 (first 사용)');
    } catch (error) {
      console.log('⚠️ first() 실패, 일반 클릭 시도...');
      try {
        await this.utils.page.getByRole('button', { name: '파이프라인 실행' }).click();
        console.log('✅ 파이프라인 실행 버튼 클릭 완료 (일반 클릭)');
      } catch (secondError) {
        console.log('⚠️ 일반 클릭도 실패, 스크롤 후 재시도...');
        // 스크롤 후 재시도
        await this.utils.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await this.utils.page.waitForTimeout(2000);
        await this.utils.page.getByRole('button', { name: '파이프라인 실행' }).click();
        console.log('✅ 파이프라인 실행 버튼 클릭 완료 (스크롤 후 재시도)');
      }
    }
    
    await this.utils.page.waitForTimeout(2000); // 안정성 확보를 위한 딜레이
  }

  // 확인 버튼 클릭
  async clickConfirmButton() {
    console.log('✅ 확인 버튼 클릭 중...');
    
    try {
      // 확인 버튼 클릭 (.first() 시도 후 일반 클릭)
      await this.utils.page.getByRole('button', { name: '확인' }).first().click();
      console.log('✅ 확인 버튼 클릭 완료 (first 사용)');
    } catch (error) {
      console.log('⚠️ first() 실패, 일반 클릭 시도...');
      await this.utils.page.getByRole('button', { name: '확인' }).click();
      console.log('✅ 확인 버튼 클릭 완료 (일반 클릭)');
    }
    
    await this.utils.page.waitForTimeout(2000); // 안정성 확보를 위한 딜레이
  }

  // 파이프라인 상태 모니터링
  async monitorPipelineStatus() {
    console.log('👀 파이프라인 상태 모니터링 중...');
    
    const maxWaitTime = 300000; // 5분 최대 대기
    const checkInterval = 5000; // 5초마다 체크
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // 대기 상태 확인
        const waitingElement = await this.utils.page.locator('div').filter({ hasText: /^대기$/ }).first().isVisible().catch(() => false);
        if (waitingElement) {
          console.log('⏳ 파이프라인 대기 중...');
          await this.utils.page.waitForTimeout(checkInterval);
          continue;
        }
        
        // 진행 중 상태 확인
        const runningElement = await this.utils.page.locator('div').filter({ hasText: /^진행중$/ }).first().isVisible().catch(() => false);
        if (runningElement) {
          console.log('🔄 파이프라인 진행 중...');
          await this.utils.page.waitForTimeout(checkInterval);
          continue;
        }
        
        // 성공 상태 확인
        const successElement = await this.utils.page.locator('div').filter({ hasText: /^성공$/ }).first().isVisible().catch(() => false);
        if (successElement) {
          console.log('✅ 파이프라인 성공!');
          // 성공 상태 스크린샷
          await this.utils.page.screenshot({ 
            path: `custom-reports/screenshot-즉시배포성공-${new Date().toISOString().replace(/[:.]/g, '-')}.png` 
          });
          await this.utils.page.waitForTimeout(5000); // 성공 후 잠시 대기
          break;
        }
        
        // 실패 상태 확인
        const failedElement = await this.utils.page.locator('div').filter({ hasText: /^실패$/ }).first().isVisible().catch(() => false);
        if (failedElement) {
          throw new Error('파이프라인 실행 실패');
        }
        
        // 상태를 찾을 수 없는 경우 잠시 대기
        console.log('🔍 파이프라인 상태 확인 중...');
        await this.utils.page.waitForTimeout(checkInterval);
        
      } catch (error) {
        console.log('⚠️ 상태 확인 중 오류:', error.message);
        await this.utils.page.waitForTimeout(checkInterval);
      }
    }
    
    if (Date.now() - startTime >= maxWaitTime) {
      throw new Error('파이프라인 실행 시간 초과 (5분)');
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
      path: `custom-reports/screenshot-즉시배포다음단계진입-${new Date().toISOString().replace(/[:.]/g, '-')}.png` 
    });
  }
}

export default TicketManualDeploymentManager;