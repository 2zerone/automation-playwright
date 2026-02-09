// 사용자 관리 클래스
import BaseManager from './BaseManager.js';

class UserManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 사용자 메뉴 접근
  async navigateToUserMenu() {
    try {
      await this.utils.clickSubMenuOnly('사용자 정보 관리');
      console.log('사용자 메뉴에 성공적으로 접근했습니다.');
    } catch (error) {
      console.error('사용자 메뉴 접근 실패:', error.message);
      throw new Error(`사용자 메뉴 접근 실패: ${error.message}`);
    }
  }

  // 사용자 등록 화면 열기
  async openRegistrationForm() {
    try {
      await this.utils.clickRegister();
      console.log('사용자 등록 화면을 성공적으로 열었습니다.');
    } catch (error) {
      console.error('사용자 등록 화면 열기 실패:', error.message);
      throw new Error(`사용자 등록 화면 열기 실패: ${error.message}`);
    }
  }

  // 사용자 정보 입력
  async fillUserInfo(config) {
    try {
      // 기본 정보 입력
      await this.utils.fillInput('input[placeholder="아이디를 입력해주세요"]', config.user.id);
      await this.utils.fillInput('input[placeholder="이름을 입력해주세요"]', config.user.name);
      await this.utils.fillInput('input[placeholder="이메일을 입력해주세요"]', config.user.email);
      
      const selectInputs = this.utils.page.locator('input[placeholder="선택"]');
      await selectInputs.nth(1).fill(config.user.level);

      // 티켓 전용 업무 및 역할
      const taskCodeText = `${config.project.name}(${config.project.code})`;
      await this.utils.fillInput('input[placeholder="업무코드 선택"]', taskCodeText);
      await this.utils.fillInput('input[placeholder="티켓 역할 선택"]', config.user.role);
      await this.utils.page.click('#root > div > main > div > div.box-content-wrap > form > div:nth-child(3) > form > div > div.dashboard-title > div.elem-group > button > span > span');

      // 사용자 업무 및 역할
      const selectCodeInputs = this.utils.page.locator('input[placeholder="업무코드 선택"]');
      await selectCodeInputs.nth(1).fill(taskCodeText);
      await this.utils.fillInput('input[placeholder="사용자 역할 선택"]', config.user.systemRole);
      await this.utils.page.click('#root > div > main > div > div.box-content-wrap > form > div:nth-child(4) > form > div > div.dashboard-title > div.elem-group > button > span > span');

      // 사용자 구분 선택
      const userTypeButton = '#root > div > main > div > div.box-content-wrap > form > div:nth-child(7) > div > div.table-wrap.mgt-base > table > tbody > tr:nth-child(1) > td:nth-child(2) > div > div > div > button';
      await this.utils.page.click(userTypeButton);
      await this.utils.page.click('text=직원');

      console.log('사용자 정보를 성공적으로 입력했습니다.');
    } catch (error) {
      console.error('사용자 정보 입력 실패:', error.message);
      throw new Error(`사용자 정보 입력 실패: ${error.message}`);
    }
  }

  // 사용자 저장 및 확인
  async saveAndVerifyUser(config) {
    try {
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
        await this.utils.wait(5000);
        console.log('사용자가 성공적으로 등록되었습니다.');
      } else {
        await this.utils.cancelAndConfirm();
        console.log('이미 등록된 사용자입니다.');
      }
    } catch (error) {
      console.error('사용자 저장 및 확인 실패:', error.message);
      throw new Error(`사용자 저장 및 확인 실패: ${error.message}`);
    }
  }

  // 기존 메서드 (하위 호환성을 위해 유지)
  async createUser(config) {
    return await this.executeWithRetry(
      async () => {
        await this.navigateToUserMenu();
        await this.openRegistrationForm();
        await this.fillUserInfo(config);
        await this.saveAndVerifyUser(config);
        return { success: true, message: '사용자 등록 완료' };
      },
      '사용자 등록',
      3,
      async (result) => {
        // 사용자 등록이 성공했는지 확인
        if (result && result.success) {
          console.log('✅ 사용자 등록 검증 성공');
          return true;
        } else {
          console.log('❌ 사용자 등록 검증 실패');
          return false;
        }
      }
    );
  }
}

export default UserManager; 