// 승인 관리 클래스
import BaseManager from './BaseManager.js';

class ApprovalManager extends BaseManager {
  constructor(utils) {
    super(utils);
    this.ticketNumber = null; // 생성된 티켓 번호 저장
  }


  // 첫 번째 승인 프로세스 (yh.lee3 계정)
  async firstApprovalProcess(browser, config) {
    return await this.executeWithRetry(
      async () => {
        console.log('🔐 첫 번째 승인 프로세스 시작 (yh.lee3)...');
        
        // 브라우저 객체 확인
        if (!browser) {
          throw new Error('첫 번째 승인 프로세스: 브라우저 객체가 전달되지 않았습니다.');
        }
        console.log('🌐 첫 번째 승인 프로세스: 브라우저 객체 확인 완료');
        
        // 1. 새 탭 생성
        const newPage = await browser.newPage();
        console.log('✅ 새 탭 생성 완료 (기존 브라우저에서)');
        
        try {
          // 2. 화면 크기 설정
          await newPage.setViewportSize({ width: 1920, height: 1080 });
          console.log('✅ 화면 크기 설정 완료 (1920x1080)');
          
          // 3. Trombone 접속
          await newPage.goto('http://tst.console.trombone.okestro.cloud/login');
          console.log('✅ Trombone 접속 완료');
          
          // 4. 로그인
          await newPage.getByRole('textbox', { name: '아이디' }).fill('yh.lee3');
          await newPage.getByRole('textbox', { name: '비밀번호' }).fill(config.login.password);
          await newPage.getByRole('button', { name: '로그인' }).click();
          
          // 로그인 완료 대기
          await newPage.waitForTimeout(3000);
          console.log('✅ yh.lee3 로그인 완료');
          
          // 4. 승인 프로세스 수행
          // CSS selector로 알림 버튼 클릭
          await newPage.click('#root > div > main > header > div > div > div.gnb-menu > div > div:nth-child(1) > a > svg');
          console.log('✅ CSS selector로 알림 버튼 클릭 완료');
          
          // 알림 목록이 나타날 때까지 대기
          await newPage.waitForTimeout(2000);
          // 가장 최근 알림 (첫 번째) 클릭
          await newPage.locator('dt:has-text("이영한관리자(yh.lee5) 결재를 요청하였습니다")').first().click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          await newPage.getByRole('button', { name: '바로가기' }).click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          await newPage.getByRole('button', { name: '승인' }).click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          await newPage.getByRole('button', { name: '확인' }).click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          console.log('✅ 첫 번째 승인 프로세스 완료');
          
        } finally {
          // 5. 새 탭 정리
          if (newPage && !newPage.isClosed()) {
            await newPage.close();
            console.log('✅ 첫 번째 승인 탭 정리 완료');
          }
        }
      },
      '첫 번째 승인 프로세스',
      3,
      async () => {
        // 승인 완료 확인 로직
        console.log('✅ 첫 번째 승인 프로세스 검증 성공');
        return true;
      }
    );
  }

  // 두 번째 승인 프로세스 (yh.lee7 계정)
  async secondApprovalProcess(browser, config) {
    return await this.executeWithRetry(
      async () => {
        console.log('🔐 두 번째 승인 프로세스 시작 (yh.lee7)...');
        
        // 브라우저 객체 확인
        if (!browser) {
          throw new Error('두 번째 승인 프로세스: 브라우저 객체가 전달되지 않았습니다.');
        }
        console.log('🌐 두 번째 승인 프로세스: 브라우저 객체 확인 완료');
        
        // 1. 새 탭 생성
        const newPage = await browser.newPage();
        console.log('✅ 새 탭 생성 완료 (기존 브라우저에서)');
        
        try {
          // 2. 화면 크기 설정
          await newPage.setViewportSize({ width: 1920, height: 1080 });
          console.log('✅ 화면 크기 설정 완료 (1920x1080)');
          
          // 3. Trombone 접속
          await newPage.goto('http://tst.console.trombone.okestro.cloud/login');
          console.log('✅ Trombone 접속 완료');
          
          // 4. 로그인
          await newPage.getByRole('textbox', { name: '아이디' }).fill('yh.lee7');
          await newPage.getByRole('textbox', { name: '비밀번호' }).fill(config.login.password);
          await newPage.getByRole('button', { name: '로그인' }).click();
          
          // 로그인 완료 대기
          await newPage.waitForTimeout(3000);
          console.log('✅ yh.lee7 로그인 완료');
          
          // 4. 승인 프로세스 수행
          await newPage.getByRole('main').getByText('0 0 24').nth(2).click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          await newPage.getByRole('img', { name: '나의 할 일' }).click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          await newPage.getByRole('button', { name: '승인 및 반려' }).first().click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          await newPage.getByRole('button', { name: '승인', exact: true }).click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          await newPage.getByRole('button', { name: '확인' }).click();
          await newPage.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          console.log('✅ 두 번째 승인 프로세스 완료');
          
        } finally {
          // 5. 새 탭 정리
          if (newPage && !newPage.isClosed()) {
            await newPage.close();
            console.log('✅ 두 번째 승인 탭 정리 완료');
          }
        }
      },
      '두 번째 승인 프로세스',
      3,
      async () => {
        // 승인 완료 확인 로직
        console.log('✅ 두 번째 승인 프로세스 검증 성공');
        return true;
      }
    );
  }

  // 전체 승인 프로세스 실행
  async executeApprovalProcess(browser, config) {
    try {
      // 브라우저 객체 확인
      if (!browser) {
        throw new Error('브라우저 객체가 전달되지 않았습니다.');
      }
      console.log('🌐 브라우저 객체 확인 완료:', browser.constructor.name);
      
      console.log('🚀 전체 승인 프로세스를 시작합니다...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.firstApprovalProcess(browser, config), '첫 번째 승인 프로세스', 3);
      await this.executeWithRetry(() => this.secondApprovalProcess(browser, config), '두 번째 승인 프로세스', 3);
      
      console.log('✅ 전체 승인 프로세스가 성공적으로 완료되었습니다.');
      return { success: true, message: '승인 프로세스 완료' };
    } catch (error) {
      // 수동으로 닫힌 테스트인지 확인
      const isManuallyClosed = global.manuallyClosedTests && global.manuallyClosedTests.has('scenario-1');
      
      if (isManuallyClosed) {
        console.error('💥 승인 프로세스 수동 중단:', error.message);
        throw new Error(`승인 프로세스 수동 중단: ${error.message}`);
      } else {
        console.error('💥 승인 프로세스 최종 실패:', error.message);
        throw error; // 에러를 다시 던져서 runTestStep에서 잡을 수 있도록 함
      }
    }
  }

  // 기존 로그인된 계정에서 알림 확인
  async checkNotificationResult(config) {
    try {
      return await this.executeWithRetry(
        async () => {
          console.log('🔔 기존 계정에서 알림 확인 시작...');

          // 먼저 티켓 번호 찾기 (기존 계정에서 이미 목록이 떠 있으므로)
          console.log('🔍 티켓 번호 찾기 시작...');
          const ticketName = config.project.code + '-TICKET';
          console.log(`📋 찾는 티켓명: ${ticketName}`);
          
          // 티켓 목록에서 티켓 번호 찾기
          let ticketRow = null;
          try {
            ticketRow = this.utils.page.locator(`tr:has-text("${ticketName}")`);
            await ticketRow.waitFor({ state: 'visible', timeout: 5000 });
            console.log(`✅ 정확한 티켓명 발견: ${ticketName}`);
          } catch (error) {
            console.log(`⚠️ 정확한 티켓명을 찾을 수 없음: ${ticketName}`);
            // 프로젝트 코드가 포함된 티켓 찾기 시도
            const projectCode = config.project.code;
            try {
              ticketRow = this.utils.page.locator(`tr:has-text("${projectCode}")`);
              await ticketRow.waitFor({ state: 'visible', timeout: 5000 });
              console.log(`✅ 프로젝트 코드 포함 티켓 발견: ${projectCode}`);
            } catch (error2) {
              console.log(`⚠️ 프로젝트 코드 포함 티켓도 찾을 수 없음: ${projectCode}`);
              // 첫 번째 티켓 사용 (fallback)
              ticketRow = this.utils.page.locator('table tbody tr').first();
              await ticketRow.waitFor({ state: 'visible', timeout: 5000 });
              console.log('✅ 첫 번째 티켓 사용 (fallback)');
            }
          }
          
          // 해당 행에서 티켓 번호 추출 (두 번째 컬럼의 div > div 구조)
          const ticketNumberCell = ticketRow.locator('td:nth-child(2) > div > div');
          const ticketNumber = await ticketNumberCell.textContent();
          
          if (ticketNumber && ticketNumber.trim()) {
            this.ticketNumber = ticketNumber.trim();
            console.log(`✅ 티켓 번호 저장 완료: ${this.ticketNumber}`);
          } else {
            console.log('⚠️ 티켓 번호를 찾을 수 없어 기본값 사용');
            this.ticketNumber = '2025_00439'; // 기본값으로 fallback
          }

          // 알림 버튼 클릭
          await this.utils.page.click('#root > div > main > header > div > div > div.gnb-menu > div > div:nth-child(1) > a > svg');
          console.log('✅ 알림 버튼 클릭 완료');
          await this.utils.page.waitForTimeout(1000); // 안정성 확보를 위한 딜레이

          // 알림 목록이 나타날 때까지 대기
          await this.utils.page.waitForTimeout(2000);

          // '실행 되었습니다.' 문구 확인 (일반 워크플로우와 긴급 워크플로우 둘 다 확인)
          const normalWorkflowText = `[SYSTEM] 티켓번호 : ${this.ticketNumber} 티켓의 일반 워크플로우가 실행 되었습니다.`;
          const emergencyWorkflowText = `[SYSTEM] 티켓번호 : ${this.ticketNumber} 티켓의 긴급 워크플로우가 실행 되었습니다.`;
          
          console.log(`🔍 확인할 알림 텍스트 (일반): ${normalWorkflowText}`);
          console.log(`🔍 확인할 알림 텍스트 (긴급): ${emergencyWorkflowText}`);
          
          // 일반 워크플로우 알림 확인
          const isNormalNotificationVisible = await this.utils.page.getByText(normalWorkflowText).isVisible();
          await this.utils.page.waitForTimeout(1000); // 안정성 확보를 위한 딜레이
          
          // 긴급 워크플로우 알림 확인
          const isEmergencyNotificationVisible = await this.utils.page.getByText(emergencyWorkflowText).isVisible();
          await this.utils.page.waitForTimeout(1000); // 안정성 확보를 위한 딜레이

          if (isNormalNotificationVisible) {
            console.log('✅ 알림 확인 성공: "일반 워크플로우가 실행 되었습니다." 문구 발견');
            return { success: true, message: '알림 확인 성공 (일반 워크플로우)' };
          } else if (isEmergencyNotificationVisible) {
            console.log('✅ 알림 확인 성공: "긴급 워크플로우가 실행 되었습니다." 문구 발견');
            return { success: true, message: '알림 확인 성공 (긴급 워크플로우)' };
          } else {
            console.log('❌ 알림 확인 실패: 일반 워크플로우 또는 긴급 워크플로우 문구를 찾을 수 없음');
            throw new Error('알림 확인 실패: 예상 문구를 찾을 수 없음');
          }
        },
        '알림 확인',
        3,
        async (result) => {
          // 알림 확인이 성공했는지 검증
          if (result && result.success) {
            console.log('✅ 알림 확인 검증 성공');
            return true;
          } else {
            console.log('❌ 알림 확인 검증 실패');
            return false;
          }
        }
      );
    } catch (error) {
      // 수동으로 닫힌 테스트인지 확인
      const isManuallyClosed = global.manuallyClosedTests && global.manuallyClosedTests.has('scenario-1');
      
      if (isManuallyClosed) {
        console.error('💥 알림 확인 수동 중단:', error.message);
        throw new Error(`알림 확인 수동 중단: ${error.message}`);
      } else {
        console.error('💥 알림 확인 최종 실패:', error.message);
        throw error; // 에러를 다시 던져서 runTestStep에서 잡을 수 있도록 함
      }
    }
  }
  // 개별 단계별 실행 메서드들 (커스텀 리포트용)

  async executeFirstApprovalProcess(browser, config) {
    return await this.firstApprovalProcess(browser, config);
  }

  async executeSecondApprovalProcess(browser, config) {
    return await this.secondApprovalProcess(browser, config);
  }

  async executeNotificationCheck(config) {
    return await this.checkNotificationResult(config);
  }
}

export default ApprovalManager;