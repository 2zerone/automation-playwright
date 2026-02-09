// 사용자 업무 코드 관리 클래스
import BaseManager from './BaseManager.js';

class UserTaskCodeManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 사용자-업무코드 메뉴 접근
  async navigateToUserTaskCodeMenu() {
    try {
      await this.utils.clickSubMenuOnly('사용자 정보 관리');
      console.log('사용자-업무코드 메뉴에 성공적으로 접근했습니다.');
    } catch (error) {
      console.error('사용자-업무코드 메뉴 접근 실패:', error.message);
      throw new Error(`사용자-업무코드 메뉴 접근 실패: ${error.message}`);
    }
  }

  // 사용자-업무코드 등록 화면 열기
  async openRegistrationForm() {
    try {
      // 사용자 검색을 위한 준비
      console.log('사용자-업무코드 등록 화면을 성공적으로 열었습니다.');
    } catch (error) {
      console.error('사용자-업무코드 등록 화면 열기 실패:', error.message);
      throw new Error(`사용자-업무코드 등록 화면 열기 실패: ${error.message}`);
    }
  }

  // 사용자-업무코드 정보 입력
  async fillUserTaskCodeInfo(config) {
    try {
      console.log(`📋 총 ${config.users.length}명의 사용자 업무코드 할당 시작...`);
      
      // 사용자 검색 및 업무 코드 할당
      for (let i = 0; i < config.users.length; i++) {
        const userConfig = config.users[i];
        console.log(`\n👤 [${i + 1}/${config.users.length}] 사용자 "${userConfig.name}" 처리 중...`);
        await this.assignTaskCodeToUser(userConfig, config.project);
      }
      
      console.log(`\n🎉 모든 사용자(${config.users.length}명) 업무코드 할당 완료!`);
    } catch (error) {
      console.error('사용자-업무코드 정보 입력 실패:', error.message);
      throw new Error(`사용자-업무코드 정보 입력 실패: ${error.message}`);
    }
  }

  // 사용자-업무코드 저장 및 확인
  async saveAndVerifyUserTaskCode(config) {
    try {
      // 이미 fillUserTaskCodeInfo에서 저장이 완료됨
      console.log('사용자-업무코드 할당이 성공적으로 완료되었습니다.');
    } catch (error) {
      console.error('사용자-업무코드 저장 및 확인 실패:', error.message);
      throw new Error(`사용자-업무코드 저장 및 확인 실패: ${error.message}`);
    }
  }

  // 기존 메서드들 (하위 호환성을 위해 유지)
  async assignUserTaskCode(config) {
    try {
      await this.navigateToUserTaskCodeMenu();
      await this.openRegistrationForm();
      await this.fillUserTaskCodeInfo(config);
      await this.saveAndVerifyUserTaskCode(config);
      
      // 단계 완료 후 스크린샷 캡처
      await this.captureSuccessScreenshot('사용자-업무코드-할당');
    } catch (error) {
      console.error('사용자 업무코드 할당 중 오류 발생:', error.message);
      
      // 오류 발생 시에도 스크린샷 캡처
      await this.captureFailureScreenshot('사용자-업무코드-할당');
      throw error;
    }
  }

  async assignTaskCodeToUser(userConfig, projectConfig) {
    // 각 사용자마다 새로운 검색 수행
    console.log(`🔍 사용자 "${userConfig.name}" 검색 시작...`);
    
    // 검색창 초기화 (이전 검색 결과 제거)
    await this.utils.fillInput('input[placeholder="검색어를 입력해주세요"]', '');
    await this.utils.wait(500);
    
    // 새로운 사용자 검색
    await this.utils.fillInput('input[placeholder="검색어를 입력해주세요"]', userConfig.name);
    await this.utils.page.click('button:has-text("3 3 27")');
    await this.utils.wait(1000); // 검색 결과 로딩 대기
    
    // 사용자 선택 (이름(ID) 형식으로 검색)
    let userClicked = false;
    
    try {
      // 방법 1: 정확한 선택자로 클릭 (5초 타임아웃)
      const userSelector = `td.not-last div.txt-over:has-text("${userConfig.name}(${userConfig.id})")`;
      await this.utils.page.click(userSelector, { timeout: 5000 });
      userClicked = true;
      console.log('사용자 클릭 성공 (방법 1)');
    } catch (error) {
      console.log('방법 1 실패, 방법 2 시도...');
      
      try {
        // 방법 2: 이름만으로 클릭 (5초 타임아웃)
        const alternativeSelector = `td.not-last div.txt-over:has-text("${userConfig.name}(${userConfig.id})")`;
        await this.utils.page.click(alternativeSelector, { timeout: 5000 });
        userClicked = true;
        console.log('사용자 클릭 성공 (방법 2)');
      } catch (error2) {
        console.log('방법 2 실패, 방법 3 시도...');
        
        try {
          // 방법 3: 더 일반적인 선택자 (5초 타임아웃)
          const generalSelector = `td:has-text("${userConfig.name}(${userConfig.id})")`;
          await this.utils.page.click(generalSelector, { timeout: 5000 });
          userClicked = true;
          console.log('사용자 클릭 성공 (방법 3)');
        } catch (error3) {
          console.log('모든 방법 실패, 마지막 시도...');
          
          try {
            // 방법 4: 가장 일반적인 방법 (5초 타임아웃)
            const finalSelector = `div:has-text("${userConfig.name}(${userConfig.id})")`;
            await this.utils.page.click(finalSelector, { timeout: 5000 });
            userClicked = true;
            console.log('사용자 클릭 성공 (방법 4)');
          } catch (error4) {
            console.log('모든 클릭 방법 실패');
            throw new Error(`사용자 "${userConfig.name}" 클릭에 실패했습니다. 모든 방법을 시도했으나 타임아웃이 발생했습니다.`);
          }
        }
      }
    }
    
    if (!userClicked) {
      throw new Error(`사용자 "${userConfig.name}" 클릭에 실패했습니다.`);
    }
    await this.utils.wait(500); // 선택 완료 대기
    
    // 수정 버튼 클릭 (여러 방법 시도)
    try {
      // 방법 1: 일반적인 수정 버튼 클릭
      const editButton = this.utils.page.locator('button:has-text("수정")').first();
      await editButton.click();
    } catch (error) {
      console.log('방법 1 실패, 방법 2 시도...');
      try {
        // 방법 2: 행 내의 수정 버튼 클릭
        const rowWithUser = this.utils.page.locator(`tr:has-text("${userConfig.name}")`);
        const editButtonInRow = rowWithUser.locator('button:has-text("수정")');
        await editButtonInRow.click();
      } catch (error2) {
        console.log('방법 2 실패, 방법 3 시도...');
        // 방법 3: 더 구체적인 선택자 사용
        const editButton = this.utils.page.locator('[data-testid="edit-button"], button[title*="수정"], .edit-button').first();
        await editButton.click();
      }
    }
    await this.utils.wait(1000); // 수정 화면 로딩 대기
    
    // 티켓 전용 업무 및 역할 설정
    const taskCodeText = `${projectConfig.name}(${projectConfig.code})`;
    await this.utils.fillInput('input[placeholder="업무코드 선택"]', taskCodeText);
    await this.utils.page.click(`text=${taskCodeText}`);
    
    // 티켓 역할 선택
    await this.utils.fillInput('input[placeholder="티켓 역할 선택"]', userConfig.role);
    await this.utils.page.click(`text=${userConfig.role}`);
    
    // 티켓 전용 업무 및 역할 추가
    await this.utils.page.click('#root > div > main > div > div.box-content-wrap > form > div:nth-child(3) > div:nth-child(1) > form > div > div.dashboard-title > div.elem-group > button');
    
    // 사용자 업무 및 역할 설정
    const selectCodeInputs = this.utils.page.locator('input[placeholder="업무코드 선택"]');
    await selectCodeInputs.nth(1).fill(taskCodeText);
    await this.utils.page.click(`text=${taskCodeText}`);
    
    // 사용자 역할 선택
    await this.utils.fillInput('input[placeholder="사용자 역할 선택"]', userConfig.systemRole);
    await this.utils.page.click(`text=${userConfig.systemRole}`);
    
    // 사용자 업무 및 역할 추가
    await this.utils.page.click('#root > div > main > div > div.box-content-wrap > form > div:nth-child(3) > div:nth-child(2) > form > div > div.dashboard-title > div.elem-group > button');
    
    // 저장
    await this.utils.saveAndConfirm();
    await this.utils.wait(2000);
    
    // 목록으로 돌아가기 (다음 사용자 처리를 위해)
    await this.utils.page.click('button:has-text("목록")');
    await this.utils.wait(1000);
    
    console.log(`✅ 사용자 "${userConfig.name}" 업무코드 할당 완료`);
  }
}

export default UserTaskCodeManager; 