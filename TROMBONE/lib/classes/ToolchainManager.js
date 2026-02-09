// 툴체인 관리 클래스
import BaseManager from './BaseManager.js';

class ToolchainManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 툴체인 메뉴 접근
  async navigateToToolchainMenu() {
    try {
      await this.utils.clickSubMenuOnly('툴체인 관리');
      console.log('툴체인 메뉴에 성공적으로 접근했습니다.');
    } catch (error) {
      console.error('툴체인 메뉴 접근 실패:', error.message);
      throw new Error(`툴체인 메뉴 접근 실패: ${error.message}`);
    }
  }

  // 툴체인 등록 화면 열기
  async openRegistrationForm() {
    try {
      const manageButton = '#root > div > main > div > div.box-content-wrap > div:nth-child(2) > div > table > tbody > tr > td.tac.not-last.tac > button';
      await this.utils.page.waitForSelector(manageButton, { state: 'visible' });
      await this.utils.page.click(manageButton);
      console.log('툴체인 등록 화면을 성공적으로 열었습니다.');
    } catch (error) {
      console.error('툴체인 등록 화면 열기 실패:', error.message);
      throw new Error(`툴체인 등록 화면 열기 실패: ${error.message}`);
    }
  }

  // 툴체인 기본 정보 입력
  async fillBasicInfo(config) {
    try {
      // 1. '선택' 텍스트박스 클릭
      await this.utils.page.getByRole('textbox', { name: '선택' }).click();
      
      const taskCodeText = `${config.project.name}(${config.project.code})`;
      const rowName = `${taskCodeText} - -`;
      
      // 2. 업무코드 텍스트 클릭
      await this.utils.page.getByText(taskCodeText).click();
      
      // 3. 행(row)의 rect 요소 클릭
      await this.utils.page.getByRole('row', { name: rowName }).locator('rect').click();
      
      console.log('툴체인 기본 정보를 성공적으로 입력했습니다.');
    } catch (error) {
      console.error('툴체인 기본 정보 입력 실패:', error.message);
      throw new Error(`툴체인 기본 정보 입력 실패: ${error.message}`);
    }
  }

  // 툴체인 저장 및 확인
  async saveAndVerifyToolchain(config) {
    try {
      const taskCodeText = `${config.project.name}(${config.project.code})`;
      const exists = await this.utils.elementExists(`text=${taskCodeText}`);
      
      if (exists) {
        await this.utils.saveAndConfirm();
        console.log(`${taskCodeText}를 툴체인에 성공적으로 추가했습니다.`);
      } else {
        await this.utils.cancelAndConfirm();
        console.log(`${taskCodeText}가 이미 툴체인에 추가되어 있습니다.`);
      }
    } catch (error) {
      console.error('툴체인 저장 및 확인 실패:', error.message);
      throw new Error(`툴체인 저장 및 확인 실패: ${error.message}`);
    }
  }

  // 툴체인에 업무코드 추가 (단계별 재시도 적용)
  async addTaskCodeToToolchain(config) {
    try {
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToToolchainMenu(), '툴체인 메뉴 접근', 3);
      await this.executeWithRetry(() => this.openRegistrationForm(), '툴체인 등록 화면 열기', 3);
      await this.executeWithRetry(() => this.fillBasicInfo(config), '툴체인 기본 정보 입력', 3);
      await this.executeWithRetry(() => this.saveAndVerifyToolchain(config), '툴체인 저장 및 확인', 3);
      
      await this.captureSuccessScreenshot('툴체인-등록');
      return { success: true, message: '툴체인 등록 완료' };
      
    } catch (error) {
      console.error('툴체인에 업무코드 추가 중 오류 발생:', error.message);
      
      // 오류 발생 시에도 스크린샷 캡처
      await this.captureFailureScreenshot('툴체인-등록');
      throw error;
    }
  }

  // createToolchain 함수 추가 (addTaskCodeToToolchain의 별칭)
  async createToolchain(config) {
    return await this.addTaskCodeToToolchain(config);
  }
}

export default ToolchainManager; 