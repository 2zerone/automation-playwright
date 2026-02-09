// 티켓 코드 병합 관리 클래스
import BaseManager from './BaseManager.js';

class TicketCodeMergeManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 진행 (코드 병합 단계) - 단계별 재시도 적용
  async processTicketCodeMerge(config) {
    try {
      console.log('🔀 티켓 코드 병합 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.checkAndRefreshMergeAvailability(), '병합 가능 여부 확인 및 새로고침', 3);
      await this.executeWithRetry(() => this.executeFullMerge(), '전체 병합 실행', 3);
      await this.executeWithRetry(() => this.verifyMergeCompletion(), '병합 완료 확인', 3);
      await this.executeWithRetry(() => this.proceedToNextStep(), '다음 단계로 진행', 3);
      
      console.log('✅ 티켓 코드 병합 프로세스 완료');
      return { success: true, message: '코드 병합 완료' };
      
    } catch (error) {
      console.error('티켓 코드 병합 프로세스 실패:', error.message);
      throw error;
    }
  }

  // 병합 가능 여부 확인 및 새로고침
  async checkAndRefreshMergeAvailability() {
    console.log('🔄 병합 가능 여부 확인 중...');
    
    let isMergeAvailable = false;
    let refreshCount = 0;
    const maxRefreshAttempts = 10; // 최대 10번까지 새로고침 시도
    
    while (!isMergeAvailable && refreshCount < maxRefreshAttempts) {
      try {
        // '병합가능여부' 컬럼에서 '가능' 텍스트 확인
        const possibleText = this.utils.page.getByText('가능', { exact: true });
        const isVisible = await possibleText.isVisible();
        
        if (isVisible) {
          console.log('✅ 병합 가능 상태 확인됨');
          isMergeAvailable = true;
          
          // 스크린샷 타이밍: '가능' 텍스트를 발견했을 때
          await this.captureScreenshot('코드병합 단계: 코드병합 가능 확인', '가능상태확인');
        } else {
          console.log(`⚠️ 병합 불가능 상태 - 새로고침 시도 ${refreshCount + 1}/${maxRefreshAttempts}`);
          
          // 새로고침 버튼 클릭
          await this.utils.page.getByRole('button', { name: '새로고침' }).click();
          console.log('🔄 새로고침 버튼 클릭 완료');
          
          // 새로고침 후 잠시 대기
          await this.utils.page.waitForTimeout(2000);
          refreshCount++;
        }
      } catch (error) {
        console.log(`⚠️ 병합 가능 여부 확인 중 오류: ${error.message}`);
        refreshCount++;
        await this.utils.page.waitForTimeout(1000);
      }
    }
    
    if (!isMergeAvailable) {
      throw new Error(`병합 가능 상태가 되지 않음 (${maxRefreshAttempts}번 새로고침 시도 후)`);
    }
  }

  // 전체 병합 실행
  async executeFullMerge() {
    console.log('🔀 전체 병합 실행 중...');
    
    // 전체병합 버튼 클릭
    await this.utils.page.getByRole('button', { name: '전체병합' }).click();
    console.log('✅ 전체병합 버튼 클릭 완료');
    
    // 병합 처리 대기
    await this.utils.page.waitForTimeout(2000);
  }

  // 병합 완료 확인
  async verifyMergeCompletion() {
    console.log('✅ 병합 완료 확인 중...');
    
    // '병합되었습니다' 문구 확인
    const mergeCompleteText = this.utils.page.getByText('병합되었습니다');
    await mergeCompleteText.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ 병합 완료 확인됨: "병합되었습니다" 문구 발견');
    
    // 스크린샷 타이밍: '병합되었습니다.' 문구를 발견했을 때
    await this.captureScreenshot('코드병합 단계: 코드병합 완료', '병합완료확인');
    
    // 안정성 확보를 위한 딜레이
    await this.utils.page.waitForTimeout(3000);
  }

  // 다음 단계로 진행
  async proceedToNextStep() {
    console.log('➡️ 다음 단계로 진행 중...');
    
    // 다음 버튼 클릭
    await this.utils.page.getByRole('button', { name: '다음' }).click();
    console.log('✅ 다음 버튼 클릭 완료');
    
    // 페이지 로딩 대기
    await this.utils.page.waitForTimeout(3000);
    
    // 스크린샷 타이밍: '다음' 버튼 누르고 다음 단계 진입했을 때
    await this.captureScreenshot('코드병합 단계: 코드병합 단계 완료 및 다음 단계 진입', '다음단계진입');
  }

  // 개별 실행 메서드들 (세부 단계별 실행을 위해)
  async executeMergeAvailabilityCheck() {
    return await this.executeWithRetry(
      async () => {
        await this.checkAndRefreshMergeAvailability();
        return { success: true, message: '병합 가능 여부 확인 완료' };
      },
      '병합 가능 여부 확인',
      3
    );
  }

  async executeFullMergeProcess() {
    return await this.executeWithRetry(
      async () => {
        await this.executeFullMerge();
        return { success: true, message: '전체 병합 실행 완료' };
      },
      '전체 병합 실행',
      3
    );
  }

  async executeMergeVerification() {
    return await this.executeWithRetry(
      async () => {
        await this.verifyMergeCompletion();
        return { success: true, message: '병합 완료 확인' };
      },
      '병합 완료 확인',
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

export default TicketCodeMergeManager;