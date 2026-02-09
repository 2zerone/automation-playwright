// JUnit 관리 클래스
import BaseManager from './BaseManager.js';

class JUnitManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // JUnit 메뉴 접근
  async navigateToJUnitMenu() {
    try {
      await this.utils.clickSubMenuOnly('JUnit 관리');
      console.log('JUnit 메뉴에 성공적으로 접근했습니다.');
    } catch (error) {
      console.error('JUnit 메뉴 접근 실패:', error.message);
      throw new Error(`JUnit 메뉴 접근 실패: ${error.message}`);
    }
  }

  // JUnit 등록 화면 열기
  async openRegistrationForm() {
    try {
      await this.utils.clickRegister();
      console.log('JUnit 등록 화면을 성공적으로 열었습니다.');
    } catch (error) {
      console.error('JUnit 등록 화면 열기 실패:', error.message);
      throw new Error(`JUnit 등록 화면 열기 실패: ${error.message}`);
    }
  }

  // JUnit 정보 입력
  async fillJUnitInfo(config) {
    try {
      const taskCodeText = `${config.project.name}(${config.project.code})`;
      await this.utils.fillInput('#root > div > main > div > div.box-content-wrap > div:nth-child(1) > div.table-wrap.mgt-base > table > tbody > tr:nth-child(1) > td:nth-child(2) > div > div > div > input', taskCodeText);
      
      // 저장소 이름 입력 전 1초 대기
      await this.utils.wait(1000);
      await this.utils.fillInput('#root > div > main > div > div.box-content-wrap > div:nth-child(1) > div.table-wrap.mgt-base > table > tbody > tr:nth-child(1) > td:nth-child(4) > div > div > div > input', config.repository.name);

      // JUnit 정보 입력
      await this.utils.page.click('#root > div > main > div > div.box-content-wrap > div:nth-child(1) > div.table-wrap.mgt-base > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > div > div > button');
      await this.utils.page.click('text=Maven');
      await this.utils.page.click('#root > div > main > div > div.box-content-wrap > div:nth-child(1) > div.table-wrap.mgt-base > table > tbody > tr:nth-child(2) > td:nth-child(4) > div > div > div > div > div > button');
      await this.utils.page.click('text=LYH_자동화테스트');

      await this.utils.page.click('#root > div > main > div > div.box-content-wrap > div.flex.col > div.flex.col > div > div > section > div > div > div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark > div.lines-content.monaco-editor-background > div.view-lines.monaco-mouse-cursor-text');
      await this.utils.page.keyboard.type(`mvn test
pwd
ls target/surefire-reports`);
      
      console.log('JUnit 정보를 성공적으로 입력했습니다.');
    } catch (error) {
      console.error('JUnit 정보 입력 실패:', error.message);
      throw new Error(`JUnit 정보 입력 실패: ${error.message}`);
    }
  }

  // JUnit 저장 및 확인
  async saveAndVerifyJUnit(config) {
    try {
      // 등록 폼에서 입력한 정보가 실제로 등록이 필요한지 확인
      // 저장 버튼의 활성화 상태를 확인하여 실제 등록이 필요한지 판단
      const saveButton = this.utils.page.locator('button:has-text("저장")');
      const cancelButton = this.utils.page.locator('button:has-text("취소")');
      
      // 버튼들이 로드될 때까지 대기
      await this.utils.page.waitForTimeout(1000);
      
      // 저장 버튼이 활성화되어 있는지 확인
      const isSaveEnabled = await saveButton.isEnabled();
      const isCancelEnabled = await cancelButton.isEnabled();
      
      console.log(`저장 버튼 활성화 상태: ${isSaveEnabled}, 취소 버튼 활성화 상태: ${isCancelEnabled}`);
      
      if (isSaveEnabled) {
        // 저장 버튼이 활성화되어 있다면 실제 등록이 필요한 경우
        await this.utils.saveAndConfirm();
        console.log('JUnit이 성공적으로 등록되었습니다.');
        await this.utils.wait(5000);
      } else {
        // 저장 버튼이 비활성화되어 있다면 이미 등록되었거나 등록이 불가능한 경우
        await this.utils.cancelAndConfirm();
        console.log('JUnit 등록을 취소했습니다. (이미 등록되었거나 등록이 불가능한 상태)');
        await this.utils.wait(1000);
      }
    } catch (error) {
      console.error('JUnit 저장 및 확인 실패:', error.message);
      throw new Error(`JUnit 저장 및 확인 실패: ${error.message}`);
    }
  }

  // 기존 메서드 (하위 호환성을 위해 유지)
  async createJUnit(config) {
    try {
      await this.navigateToJUnitMenu();
      await this.openRegistrationForm();
      await this.fillJUnitInfo(config);
      await this.saveAndVerifyJUnit(config);
      
      // 단계 완료 후 스크린샷 캡처
      await this.captureSuccessScreenshot('JUnit-등록');
    } catch (error) {
      console.error('JUnit 등록 중 오류 발생:', error.message);
      
      // 오류 발생 시에도 스크린샷 캡처
      await this.captureFailureScreenshot('JUnit-등록');
      throw error;
    }
  }
}

export default JUnitManager; 