// 저장소 관리 클래스
import BaseManager from './BaseManager.js';

class RepositoryManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 저장소 메뉴 접근
  async navigateToRepositoryMenu() {
    try {
      await this.utils.clickSubMenuOnly('그룹 및 저장소 관리');
      console.log('저장소 메뉴에 성공적으로 접근했습니다.');
    } catch (error) {
      console.error('저장소 메뉴 접근 실패:', error.message);
      throw new Error(`저장소 메뉴 접근 실패: ${error.message}`);
    }
  }

  // 저장소 등록 화면 열기
  async openRegistrationForm() {
    try {
      await this.utils.clickRegister();
      console.log('저장소 등록 화면을 성공적으로 열었습니다.');
    } catch (error) {
      console.error('저장소 등록 화면 열기 실패:', error.message);
      throw new Error(`저장소 등록 화면 열기 실패: ${error.message}`);
    }
  }

  // 저장소 정보 입력
  async fillRepositoryInfo(config) {
    try {
      const exists = await this.utils.elementExists(`text=${config.repository.name}`);
      
      if (!exists) {
        await this.utils.fillInput('input[placeholder="그룹을 선택하세요."]', config.project.code);
        await this.utils.fillInput('#bizNm', config.repository.name);
        console.log('저장소 정보를 성공적으로 입력했습니다.');
      } else {
        console.log(`${config.repository.name} 저장소가 이미 존재합니다.`);
      }
    } catch (error) {
      console.error('저장소 정보 입력 실패:', error.message);
      throw new Error(`저장소 정보 입력 실패: ${error.message}`);
    }
  }

  // 저장소 저장 및 확인
  async saveAndVerifyRepository(config) {
    try {
      const exists = await this.utils.elementExists(`text=${config.repository.name}`);
      
      if (!exists) {
        // 입력 완료 후 저장 버튼이 활성화될 때까지 잠시 대기
        await this.utils.page.waitForTimeout(500);
        
        // 저장 버튼 상태 확인
        const saveButton = this.utils.page.locator('button:has-text("저장")');
        
        // 저장 버튼이 안정화될 때까지 기다림 (최대 3초)
        let isEnabled = false;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          isEnabled = await saveButton.isEnabled();
          await this.utils.page.waitForTimeout(300);
          const newIsEnabled = await saveButton.isEnabled();
          
          // 상태가 안정화되면 (연속 2번 같은 상태) 루프 종료
          if (isEnabled === newIsEnabled) {
            break;
          }
          
          isEnabled = newIsEnabled;
          attempts++;
        }
        
        if (isEnabled) {
          await this.utils.saveAndConfirm();
          console.log(`${config.repository.name} 저장소를 성공적으로 등록했습니다.`);
          await this.utils.wait(5000);
        } else {
          await this.utils.cancelAndConfirm();
          console.log(`${config.repository.name} 저장소 등록을 취소했습니다.`);
        }
      } else {
        await this.utils.cancelAndConfirm();
        console.log(`${config.repository.name} 저장소가 이미 존재합니다.`);
      }
    } catch (error) {
      console.error('저장소 저장 및 확인 실패:', error.message);
      throw new Error(`저장소 저장 및 확인 실패: ${error.message}`);
    }
  }

  // 저장소 등록 (단계별 재시도 적용)
  async createRepository(config) {
    try {
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToRepositoryMenu(), '저장소 메뉴 접근', 3);
      await this.executeWithRetry(() => this.openRegistrationForm(), '저장소 등록 화면 열기', 3);
      await this.executeWithRetry(() => this.fillRepositoryInfo(config), '저장소 정보 입력', 3);
      await this.executeWithRetry(() => this.saveAndVerifyRepository(config), '저장소 저장 및 확인', 3);
      
      await this.captureSuccessScreenshot('저장소-등록');
      return { success: true, message: '저장소 등록 완료' };
      
    } catch (error) {
      console.error('저장소 등록 중 오류 발생:', error.message);
      
      await this.captureFailureScreenshot('저장소-등록');
      throw error;
    }
  }
}

export default RepositoryManager; 