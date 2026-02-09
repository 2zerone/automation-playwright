// 티켓 접근 관리 클래스
import BaseManager from './BaseManager.js';

class TicketApproachManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 접근 (티켓 클릭 + 버튼 클릭)
  async processTicketApproach(config) {
    try {
      console.log('🎯 티켓 접근 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.clickTicket(config), '티켓 클릭', 3);
      await this.executeWithRetry(() => this.clickButtonBelowTicketInfo(), '티켓정보 아래 버튼 클릭', 3);
      
      console.log('✅ 티켓 접근 프로세스 완료');
      return { success: true, message: '티켓 접근 완료' };
      
    } catch (error) {
      console.error('티켓 접근 실패:', error.message);
      throw error;
    }
  }

  // 티켓 클릭
  async clickTicket(config) {
    await this.utils.page.getByText(config.project.code + '-TICKET').click();
    console.log('✅ 티켓 클릭 완료');
    await this.utils.page.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
  }

  // 티켓정보 텍스트 아래의 버튼 클릭
  async clickButtonBelowTicketInfo() {
    try {
      // 티켓정보 텍스트를 찾기
      const ticketInfoText = this.utils.page.getByText('티켓정보');
      await ticketInfoText.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ 티켓정보 텍스트 발견');

      // 티켓정보 텍스트 아래의 버튼들을 찾기
      // 여러 가능한 버튼 텍스트들을 시도
      const possibleButtonTexts = [
        '코드리뷰', '코드병합', '단위테스트', '정적분석', 
        '즉시배포', '통합테스트', '배포정보', '관리',
        '진행', '시작', '확인', '다음'
      ];

      let buttonClicked = false;
      
      for (const buttonText of possibleButtonTexts) {
        try {
          // 티켓정보 텍스트 다음에 오는 버튼 찾기 (더 안정적인 방법)
          const button = this.utils.page.getByRole('button', { name: buttonText }).first();
          await button.waitFor({ state: 'visible', timeout: 1000 });
          
          console.log(`🔍 버튼 발견: ${buttonText}, 클릭 준비 중...`);
          await this.utils.page.waitForTimeout(1000); // 클릭 전 1초 딜레이
          
          // 버튼이 클릭 가능한 상태인지 확인
          await button.waitFor({ state: 'attached', timeout: 1000 });
          await button.click();
          
          console.log(`✅ 버튼 클릭 완료: ${buttonText}`);
          await this.utils.page.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          buttonClicked = true;
          break;
        } catch (error) {
          // 해당 버튼이 없으면 다음 버튼 시도
          console.log(`⚠️ 버튼 '${buttonText}' 찾기 실패, 다음 시도...`);
          continue;
        }
      }

      if (!buttonClicked) {
        // 특정 텍스트로 찾지 못한 경우, 티켓정보 아래의 모든 버튼 중 첫 번째 클릭
        console.log('⚠️ 특정 버튼을 찾지 못함, 티켓정보 아래의 첫 번째 버튼 시도');
        
        const buttons = this.utils.page.locator('button').filter({ hasText: /./ });
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          await buttons.first().click();
          console.log('✅ 첫 번째 버튼 클릭 완료');
          await this.utils.page.waitForTimeout(1000);
          buttonClicked = true;
        }
      }

      if (!buttonClicked) {
        throw new Error('티켓정보 아래에 클릭 가능한 버튼을 찾을 수 없습니다');
      }

    } catch (error) {
      console.error('❌ 티켓정보 아래 버튼 클릭 실패:', error.message);
      throw error;
    }
  }

  // 티켓 접근 실행 (별칭)
  async executeTicketApproach(config) {
    return await this.processTicketApproach(config);
  }
}

export default TicketApproachManager;
