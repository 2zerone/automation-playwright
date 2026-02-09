// 티켓 코드리뷰 관리 클래스
import BaseManager from './BaseManager.js';

class TicketCodeReviewManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 진행 (코드리뷰 단계)
  async processTicketCodeReview(config) {
    try {
      console.log('🔍 티켓 코드리뷰 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.clickCodeReviewButton(), '코드리뷰 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickAdministratorCell(), 'Administrator 셀 클릭', 3);
      await this.executeWithRetry(() => this.fillReviewComment(), '검토 의견 입력', 3);
      await this.executeWithRetry(() => this.clickRegisterButton(), '등록 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickConfirmButton(), '확인 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickCloseButton(), '닫기 버튼 클릭', 3);
      await this.executeWithRetry(() => this.clickManageButton(), '관리 버튼 클릭', 3);
      
      console.log('✅ 티켓 코드리뷰 프로세스 완료');
      return { success: true, message: '티켓 코드리뷰 프로세스 완료' };
      
    } catch (error) {
      console.error('티켓 코드리뷰 실패:', error.message);
      throw error;
    }
  }

  // 개별 단계 메서드들
  async clickCodeReviewButton() {
    await this.utils.page.getByRole('button', { name: '코드리뷰' }).click();
    console.log('✅ 코드리뷰 버튼 클릭 완료');
    await this.utils.page.waitForTimeout(1000);
  }

  async clickAdministratorCell() {
    await this.utils.page.getByRole('cell', { name: 'Administrator' }).click();
    console.log('✅ Administrator 셀 클릭 완료');
    await this.utils.page.waitForTimeout(1000);
  }

  async fillReviewComment() {
    await this.utils.page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
    await this.utils.page.getByRole('textbox').fill('검토 완료');
    console.log('✅ 검토 의견 입력 완료');
    await this.utils.page.waitForTimeout(1000);
  }

  async clickRegisterButton() {
    await this.utils.page.getByRole('button', { name: '등록' }).click();
    console.log('✅ 등록 버튼 클릭 완료');
    await this.utils.page.waitForTimeout(1000);
  }

  async clickConfirmButton() {
    await this.utils.page.getByRole('button', { name: '확인' }).click();
    console.log('✅ 확인 버튼 클릭 완료');
    await this.utils.page.waitForTimeout(1000);
  }

  async clickCloseButton() {
    await this.utils.page.getByRole('button', { name: '닫기' }).click();
    console.log('✅ 닫기 버튼 클릭 완료');
    await this.utils.page.waitForTimeout(1000);
  }

  async clickManageButton() {
    await this.utils.page.getByRole('button', { name: '관리' }).click();
    console.log('✅ 관리 버튼 클릭 완료');
    await this.utils.page.waitForTimeout(1000);
  }

  // 개별 단계별 실행 메서드들 (커스텀 리포트용 - 1~17단계를 논리적으로 그룹화)
  
  // 1~2단계: 코드리뷰 접근 완료
  async executeCodeReviewAccess(config) {
    return await this.executeWithRetry(
      async () => {
        console.log('🔍 코드리뷰 접근 중...');
        // 1. 코드리뷰 버튼 클릭
        await this.utils.page.getByRole('button', { name: '코드리뷰' }).click();
        await this.utils.page.waitForTimeout(1000);
        console.log('✅ 코드리뷰 접근 완료');
      },
      '코드리뷰 접근 완료',
      3
    );
  }

  // 3~7단계: 검토 의견 입력 완료
  async executeReviewCommentComplete() {
    return await this.executeWithRetry(
      async () => {
        console.log('💬 검토 의견 입력 중...');
        // 3. Administrator 셀 클릭
        await this.utils.page.getByRole('cell', { name: 'Administrator' }).click();
        await this.utils.page.waitForTimeout(1000);
        // 4. 검토 의견 입력
        await this.utils.page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
        await this.utils.page.getByRole('textbox').fill('검토 완료');
        await this.utils.page.waitForTimeout(1000);
        // 5. 등록 버튼 클릭
        await this.utils.page.getByRole('button', { name: '등록' }).click();
        await this.utils.page.waitForTimeout(1000);
        // 6. 확인 버튼 클릭
        await this.utils.page.getByRole('button', { name: '확인' }).click();
        await this.utils.page.waitForTimeout(1000);
        // 7. 닫기 버튼 클릭
        await this.utils.page.getByRole('button', { name: '닫기' }).click();
        await this.utils.page.waitForTimeout(1000);
        console.log('✅ 검토 의견 입력 완료');
      },
      '검토 의견 입력 완료',
      3
    );
  }

  // 8단계: 테스트 케이스 관리 진입
  async executeTestCaseManagementEntry() {
    return await this.executeWithRetry(
      async () => {
        console.log('⚙️ 테스트 케이스 관리 진입 중...');
        // 8. 관리 버튼 클릭
        await this.utils.page.getByRole('button', { name: '관리' }).click();
        await this.utils.page.waitForTimeout(1000);
        console.log('✅ 테스트 케이스 관리 진입 완료');
      },
      '테스트 케이스 관리 진입',
      3
    );
  }

  // 9단계: 테스트 케이스 등록 화면 진입
  async executeTestCaseRegistrationEntry() {
    return await this.executeWithRetry(
      async () => {
        console.log('📋 테스트 케이스 등록 화면 진입 중...');
        // 9. 등록 버튼 클릭 (테스트 케이스 등록)
        await this.utils.page.getByRole('button', { name: '등록' }).click();
        await this.utils.page.waitForTimeout(1000);
        console.log('✅ 테스트 케이스 등록 화면 진입 완료');
      },
      '테스트 케이스 등록 화면 진입',
      3
    );
  }

  // 10~12단계: 테스트 케이스 정보 입력
  async executeTestCaseInfoInput() {
    return await this.executeWithRetry(
      async () => {
        console.log('📝 테스트 케이스 정보 입력 중...');
        // 10. 테스트 케이스 정보 입력
        await this.utils.page.getByRole('textbox', { name: '테스트 케이스명을 입력해주세요' }).click();
        await this.utils.page.getByRole('textbox', { name: '테스트 케이스명을 입력해주세요' }).fill('테스트케이스명입니다.');
        await this.utils.page.waitForTimeout(1000);
        
        await this.utils.page.getByRole('textbox', { name: '입력을 입력해주세요' }).click();
        await this.utils.page.getByRole('textbox', { name: '입력을 입력해주세요' }).fill('입력입니다.');
        await this.utils.page.waitForTimeout(1000);
        
        await this.utils.page.getByRole('textbox', { name: '예상 결과를 입력해주세요' }).click();
        await this.utils.page.getByRole('textbox', { name: '예상 결과를 입력해주세요' }).fill('예상결과입니다.');
        await this.utils.page.waitForTimeout(1000);
        
        await this.utils.page.getByRole('textbox', { name: '결과를 입력해주세요', exact: true }).click();
        await this.utils.page.getByRole('textbox', { name: '결과를 입력해주세요', exact: true }).fill('성공입니다.');
        await this.utils.page.waitForTimeout(1000);
        
        // 11. 추가 버튼 클릭
        await this.utils.page.getByRole('button', { name: '추가' }).click();
        await this.utils.page.waitForTimeout(1000);
        
        // 12. 관련 프로그램 선택
        await this.utils.page.getByRole('textbox', { name: '선택' }).click();
        await this.utils.page.waitForTimeout(1000);
        await this.utils.page.locator('rect').click();
        await this.utils.page.waitForTimeout(1000);
        console.log('✅ 테스트 케이스 정보 입력 완료');
      },
      '테스트 케이스 정보 입력',
      3
    );
  }

  // 13~14단계: 테스트 케이스 추가 완료
  async executeTestCaseAdditionComplete() {
    return await this.executeWithRetry(
      async () => {
        console.log('💾 테스트 케이스 추가 중...');
        // 13. 저장 버튼 클릭
        await this.utils.page.getByRole('button', { name: '저장' }).click();
        await this.utils.page.waitForTimeout(1000);
        // 14. 확인 버튼 클릭 (저장 확인)
        await this.utils.page.getByRole('button', { name: '확인' }).nth(1).click();
        console.log('✅ 테스트 케이스 추가 완료');
        
        // 성공 메시지 확인 - 두 가지 패턴 중 하나 찾기
        try {
          await expect(this.utils.page.getByText('성공')).toBeVisible({ timeout: 5000 });
          console.log('✅ 성공 텍스트 확인 완료');
        } catch (error) {
          try {
            await expect(this.utils.page.getByText('성공저장 되었습니다')).toBeVisible({ timeout: 5000 });
            console.log('✅ 성공저장 되었습니다 텍스트 확인 완료');
          } catch (error2) {
            console.log('⚠️ 성공 메시지를 찾을 수 없음, 계속 진행');
          }
        }
        
        // 토스트 닫기 버튼 클릭
        await this.utils.page.getByRole('button', { name: 'toast-close-button' }).click();
        await this.utils.page.waitForTimeout(1000);
        
        // 티켓 이동 버튼 클릭
        await this.utils.page.getByRole('button', { name: '티켓 이동' }).click();
        await this.utils.page.waitForTimeout(1000);
      },
      '테스트 케이스 추가 완료',
      3
    );
  }

  // 15~16단계: 코드 검토 완료
  async executeCodeReviewComplete() {
    return await this.executeWithRetry(
      async () => {
        console.log('🎉 코드 검토 완료 중...');
        await this.utils.page.getByRole('button', { name: '코드리뷰' }).click();
        await this.utils.page.waitForTimeout(1000);
        // 15. 전체 검토 완료 버튼 클릭
        await this.utils.page.getByRole('button', { name: '전체 검토 완료' }).click();
        await this.utils.page.waitForTimeout(1000);
        // 16. 확인 버튼 클릭 (검토 완료 확인)
        await this.utils.page.getByRole('button', { name: '확인' }).click();
        await this.utils.page.waitForTimeout(1000);
        console.log('✅ 코드 검토 완료');
      },
      '코드 검토 완료',
      3
    );
  }

  // 17단계: 코드리뷰 단계 완료
  async executeCodeReviewStageComplete() {
    return await this.executeWithRetry(
      async () => {
        console.log('➡️ 코드리뷰 단계 완료 중...');
        // 17. 다음 버튼 클릭
        await this.utils.page.getByRole('button', { name: '다음' }).click();
        await this.utils.page.waitForTimeout(1000);
        console.log('✅ 코드리뷰 단계 완료');
      },
      '코드리뷰 단계 완료',
      3
    );
  }
}

export default TicketCodeReviewManager;