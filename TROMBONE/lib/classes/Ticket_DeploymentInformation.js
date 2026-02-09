import BaseManager from './BaseManager.js';

class TicketDeploymentInformationManager extends BaseManager {
  constructor(page, config) {
    super(page, config);
  }

  /**
   * 티켓 종료 프로세스 실행
   */
  async processTicketDeploymentInformation() {
    try {
      console.log('🎯 티켓 종료 프로세스 시작');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.clickTicketEndButton(), '티켓 종료 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickConfirmButton(), '확인 버튼 클릭', 3);
      await this.executeWithRetry(() => this.takeTicketEndScreenshot(), '티켓 종료 스크린샷', 3);
      
      console.log('✅ 티켓 종료 프로세스 완료');
      return { success: true, message: '티켓 종료 완료' };
      
    } catch (error) {
      console.error('티켓 종료 실패:', error.message);
      throw error;
    }
  }

  /**
   * 티켓 종료 버튼 클릭
   */
  async clickTicketEndButton() {
    try {
      await this.utils.page.getByRole('button', { name: '티켓 종료' }).click();
      console.log('✅ 티켓 종료 버튼 클릭 완료');
    } catch (error) {
      console.error('❌ 티켓 종료 버튼 클릭 실패:', error);
      throw error;
    }
  }

  /**
   * 확인 버튼 클릭
   */
  async clickConfirmButton() {
    try {
      await this.utils.page.getByRole('button', { name: '확인' }).click();
      console.log('✅ 확인 버튼 클릭 완료');
    } catch (error) {
      console.error('❌ 확인 버튼 클릭 실패:', error);
      throw error;
    }
  }

  /**
   * 티켓 종료 완료 스크린샷
   */
  async takeTicketEndScreenshot() {
    try {
      // 티켓 종료 완료 후 충분한 딜레이
      await this.utils.page.waitForTimeout(3000);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `custom-reports/screenshot-티켓종료완료-${timestamp}.png`;
      await this.utils.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 티켓 종료 완료 스크린샷 저장: ${screenshotPath}`);
    } catch (error) {
      console.error('❌ 티켓 종료 완료 스크린샷 저장 실패:', error);
      // 스크린샷 실패는 전체 프로세스를 중단시키지 않음
    }
  }
}

export default TicketDeploymentInformationManager;
