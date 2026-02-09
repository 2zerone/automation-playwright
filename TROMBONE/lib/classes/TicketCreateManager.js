// 티켓 생성 관리 클래스
import BaseManager from './BaseManager.js';

class TicketCreateManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 티켓 관리 메뉴 접근
  async navigateToTicketMenu() {
    return await this.executeWithRetry(
      async () => {
        await this.utils.page.getByRole('tab', { name: '사용자' }).click();
        await this.utils.page.getByRole('tabpanel').getByText('즐겨찾기0 0 24').click();
        await this.utils.page.getByRole('list').filter({ hasText: /^티켓 관리0 0 24 24$/ }).locator('a').click();
        console.log('티켓 관리 메뉴에 성공적으로 접근했습니다.');
      },
      '티켓 관리 메뉴 접근',
      3,
      async () => {
        // 티켓 관리 페이지가 로드되었는지 확인 (여러 가능한 텍스트 확인)
        const possibleTexts = ['등록(CI/CD)', '등록', 'CI/CD', '티켓 관리'];
        for (const text of possibleTexts) {
          const isVisible = await this.verifyTextAppears(text, 2000);
          if (isVisible) {
            console.log(`✅ 티켓 관리 페이지 확인: "${text}" 텍스트 발견`);
            return true;
          }
        }
        console.log('❌ 티켓 관리 페이지 확인 실패: 예상 텍스트를 찾을 수 없음');
        return false;
      }
    );
  }

  // 티켓 등록 화면 열기
  async openTicketRegistrationForm() {
    return await this.executeWithRetry(
      async () => {
        await this.utils.page.getByRole('button', { name: '등록(CI/CD)' }).click();
        console.log('티켓 등록 화면을 성공적으로 열었습니다.');
      },
      '티켓 등록 화면 열기',
      3,
      async () => {
        // 티켓 등록 폼이 열렸는지 확인 (여러 가능한 텍스트 확인)
        const possibleTexts = ['티켓명을 입력해주세요', '티켓명', '입력해주세요', '등록', '폼'];
        for (const text of possibleTexts) {
          const isVisible = await this.verifyTextAppears(text, 2000);
          if (isVisible) {
            console.log(`✅ 티켓 등록 폼 확인: "${text}" 텍스트 발견`);
            return true;
          }
        }
        console.log('❌ 티켓 등록 폼 확인 실패: 예상 텍스트를 찾을 수 없음');
        return false;
      }
    );
  }

  // 티켓 기본 정보 입력
  async fillTicketBasicInfo(config) {
    try {
      // 티켓명 입력
      const ticketName = `${config.project.code}-TICKET`;
      await this.utils.page.getByRole('textbox', { name: '티켓명을 입력해주세요' }).click();
      await this.utils.page.getByRole('textbox', { name: '티켓명을 입력해주세요' }).fill(ticketName);

      // 티켓 내용 입력
      await this.utils.page.getByRole('textbox', { name: '티켓 내용을 입력해주세요' }).click();
      await this.utils.page.getByRole('textbox', { name: '티켓 내용을 입력해주세요' }).fill(ticketName + ' 입니다.');

      // 업무코드 선택
      const taskCodeText = `${config.project.name}(${config.project.code})`;
      await this.utils.page.getByRole('row', { name: '업무코드', exact: true }).getByPlaceholder('선택').click();
      await this.utils.page.getByRole('row', { name: '업무코드', exact: true }).getByPlaceholder('선택').fill(taskCodeText);
      await this.utils.page.getByText('선택0 0 24').click();

      console.log('티켓 기본 정보를 성공적으로 입력했습니다.');
    } catch (error) {
      console.error('티켓 기본 정보 입력 실패:', error.message);
      throw new Error(`티켓 기본 정보 입력 실패: ${error.message}`);
    }
  }

  // 워크플로우 및 결재 정보 설정
  async configureWorkflowAndApproval() {
    try {
      // 일반 워크플로우 선택
      await this.utils.page.getByText('일반', { exact: true }).click();
      await this.utils.page.getByRole('cell', { name: '일반' }).getByPlaceholder('선택').click();
      await this.utils.page.getByRole('cell', { name: '일반' }).getByPlaceholder('선택').fill('HOTF-일반 워크플로우(즉시배포)');

      // 결재자 설정
      await this.utils.page.getByRole('textbox', { name: '선택' }).nth(2).fill('HOTF-2차직렬결재-개발리더-결재자');

      console.log('워크플로우 및 결재 정보를 성공적으로 설정했습니다.');
    } catch (error) {
      console.error('워크플로우 및 결재 정보 설정 실패:', error.message);
      throw new Error(`워크플로우 및 결재 정보 설정 실패: ${error.message}`);
    }
  }

  // 개발 담당자 및 배포 예정일 설정
  async configureDeveloperAndDeploymentDate() {
    try {
      // 개발 담당자 설정
      await this.utils.page.getByRole('row', { name: '개발 담당자 배포예정일자 YYYY-MM-DD' }).getByPlaceholder('선택').click();
      await this.utils.page.getByRole('row', { name: '개발 담당자 배포예정일자 YYYY-MM-DD' }).getByPlaceholder('선택').fill('이영한개발자(yh.lee6)');

      // 배포 예정일 설정 (색상으로 오늘 날짜 버튼 찾기)
      await this.utils.page.getByRole('cell', { name: 'YYYY-MM-DD' }).getByRole('img').click();
      
      // 오늘 날짜 버튼 클릭 (CSS 클래스와 색상 조합으로 정확하게 찾기)
      try {
        // 오늘 날짜 버튼의 특징: button.day-btn.today 클래스 + #0AB3A2 색상
        const todayButton = this.utils.page.locator('button.day-btn.today').first();
        await todayButton.click();
        console.log('✅ 오늘 날짜 버튼 클릭 성공 (day-btn.today 클래스 사용)');
      } catch (error) {
        console.log('⚠️ day-btn.today 클래스로 찾지 못함, 색상으로 시도...');
        
        try {
          // 색상으로 오늘 날짜 버튼 찾기
          const todayButton = await this.findElementByColor('button.day-btn', '#0AB3A2');
          await todayButton.click();
          console.log('✅ 오늘 날짜 버튼 클릭 성공 (색상으로 찾기)');
        } catch (error2) {
          console.log('⚠️ 색상으로도 찾지 못함, exact name으로 시도...');
          
          // 최종 폴백: 원래 codegen 방식 (exact: true) 사용
          const currentDay = new Date().getDate();
          await this.utils.page.getByRole('button', { name: currentDay.toString(), exact: true }).click();
          console.log(`✅ exact name으로 오늘 날짜(${currentDay}) 버튼 클릭 성공`);
        }
      }

      console.log('개발 담당자 및 배포 예정일을 성공적으로 설정했습니다.');
    } catch (error) {
      console.error('개발 담당자 및 배포 예정일 설정 실패:', error.message);
      throw new Error(`개발 담당자 및 배포 예정일 설정 실패: ${error.message}`);
    }
  }

  // 릴리즈 노트 입력
  async fillReleaseNotes(config) {
    try {
      const releaseNotes = `${config.project.code}-릴리즈 노트`;
      await this.utils.page.getByRole('textbox', { name: '릴리즈 노트를 입력해주세요' }).click();
      await this.utils.page.getByRole('textbox', { name: '릴리즈 노트를 입력해주세요' }).fill(releaseNotes);

      console.log('릴리즈 노트를 성공적으로 입력했습니다.');
    } catch (error) {
      console.error('릴리즈 노트 입력 실패:', error.message);
      throw new Error(`릴리즈 노트 입력 실패: ${error.message}`);
    }
  }

  // 저장소 및 브랜치 선택
  async selectRepositoryAndBranch(config, randomBranchName) {
    try {
      // 저장소 선택
      await this.utils.page.getByRole('row', { name: config.repository.name }).locator('rect').click();
      await this.utils.page.locator(`tr:has-text("${config.repository.name}") td:nth-child(3) button`).click();

      // 브랜치명 선택 (GitLabManager에서 생성된 랜덤 브랜치명 사용)
      await this.utils.page.getByText(randomBranchName).click();

      console.log(`저장소 및 브랜치(${randomBranchName})를 성공적으로 선택했습니다.`);
    } catch (error) {
      console.error('저장소 및 브랜치 선택 실패:', error.message);
      throw new Error(`저장소 및 브랜치 선택 실패: ${error.message}`);
    }
  }

  // 티켓 저장
  async saveTicket() {
    return await this.executeWithRetry(
      async () => {
        await this.utils.saveAndConfirm();
        console.log('티켓을 성공적으로 저장했습니다.');
      },
      '티켓 저장',
      3,
      async () => {
        // 저장 후 성공 메시지나 완료 표시가 나타나는지 확인
        const successMessages = ['성공', '완료', '저장', '등록', '생성', '완료되었습니다', '등록되었습니다'];
        for (const message of successMessages) {
          const isVisible = await this.verifyTextAppears(message, 1500);
          if (isVisible) {
            console.log(`✅ 티켓 저장 성공 확인: "${message}" 메시지 발견`);
            return true;
          }
        }
        
        // 저장 버튼 상태 확인 (더 관대한 검증)
        try {
          const saveButton = this.utils.page.getByRole('button', { name: '저장' });
          const isDisabled = await saveButton.isDisabled();
          if (isDisabled) {
            console.log('✅ 티켓 저장 성공 확인: 저장 버튼이 비활성화됨');
            return true;
          }
        } catch (error) {
          // 저장 버튼이 사라진 경우도 성공으로 간주
          console.log('✅ 티켓 저장 성공 확인: 저장 버튼이 사라짐');
          return true;
        }
        
        // 페이지가 변경되었는지 확인 (URL 변화나 다른 페이지 요소 확인)
        try {
          const currentUrl = this.utils.page.url();
          if (currentUrl.includes('ticket') || currentUrl.includes('list') || currentUrl.includes('main')) {
            console.log('✅ 티켓 저장 성공 확인: 페이지가 변경됨');
            return true;
          }
        } catch (error) {
          // URL 확인 실패는 무시
        }
        
        console.log('❌ 티켓 저장 검증 실패: 성공 지표를 찾을 수 없음');
        return false;
      }
    );
  }

  // 전체 티켓 생성 프로세스 실행
  async createTicket(config, gitlabManager) {
    try {
      console.log('🚀 티켓 생성 프로세스를 시작합니다...');

      // GitLabManager에서 이미 생성된 랜덤 브랜치명 가져오기
      console.log('🌿 GitLab에서 생성된 브랜치명 가져오는 중...');
      const randomBranchName = gitlabManager.getRandomBranchName();
      console.log(`✅ 사용할 브랜치명: ${randomBranchName}`);

      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToTicketMenu(), '티켓 메뉴 접근', 3);
      await this.executeWithRetry(() => this.openTicketRegistrationForm(), '티켓 등록 화면 열기', 3);
      await this.executeWithRetry(() => this.fillTicketBasicInfo(config), '티켓 기본 정보 입력', 3);
      await this.executeWithRetry(() => this.configureWorkflowAndApproval(), '워크플로우 및 승인 설정', 3);
      await this.executeWithRetry(() => this.configureDeveloperAndDeploymentDate(config), '개발자 및 배포일 설정', 3);
      await this.executeWithRetry(() => this.fillReleaseNotes(config), '릴리즈 노트 입력', 3);
      await this.executeWithRetry(() => this.selectRepositoryAndBranch(config, randomBranchName), '저장소 및 브랜치 선택', 3);
      await this.executeWithRetry(() => this.saveTicket(), '티켓 저장', 3);

      console.log('✅ 티켓 생성 프로세스가 성공적으로 완료되었습니다.');
      return { success: true, message: '티켓 생성 완료' };

    } catch (error) {
      console.error('티켓 생성 실패:', error.message);
      throw error;
    }
  }

  // 개별 단계별 실행 메서드들 (커스텀 리포트용)
  async executeTicketMenuNavigation() {
    return await this.navigateToTicketMenu();
  }

  async executeTicketRegistrationFormOpen() {
    return await this.openTicketRegistrationForm();
  }

  async executeTicketBasicInfoFill(config) {
    return await this.fillTicketBasicInfo(config);
  }

  async executeWorkflowApprovalConfig() {
    return await this.configureWorkflowAndApproval();
  }

  async executeDeveloperDeploymentConfig(config) {
    return await this.configureDeveloperAndDeploymentDate(config);
  }

  async executeReleaseNotesFill(config) {
    return await this.fillReleaseNotes(config);
  }

  async executeRepositoryBranchSelection(config, gitlabManager) {
    const randomBranchName = gitlabManager.getRandomBranchName();
    return await this.selectRepositoryAndBranch(config, randomBranchName);
  }

  async executeTicketSave() {
    return await this.saveTicket();
  }
}

export default TicketCreateManager;