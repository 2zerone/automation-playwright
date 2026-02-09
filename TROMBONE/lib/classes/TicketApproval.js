// 티켓 승인 관리 클래스
class TicketApproval {
  constructor(tromboneUtils) {
    this.utils = tromboneUtils;
    this.page = tromboneUtils.page;
  }

  /**
   * 새로운 탭에서 Trombone에 로그인
   * @param {Object} config - 로그인 설정 정보
   * @param {Object} browser - 브라우저 객체 (새 페이지 생성을 위해 필요)
   * @returns {Object} 새로운 페이지 객체
   */
  async loginInNewTab(config, browser) {
    console.log('🆕 새 탭 생성 중...');
    
    // 브라우저에서 직접 새 페이지 생성
    console.log('🔧 새 탭 생성: browser.newPage() 사용');
    const newPage = await browser.newPage();
    
    // 현재 열려있는 페이지 수 확인
    const context = this.page.context();
    const pagesBefore = context.pages();
    console.log(`📊 새 탭 생성 전 페이지 수: ${pagesBefore.length}`);
    
    const pagesAfter = context.pages();
    console.log(`📊 새 탭 생성 후 페이지 수: ${pagesAfter.length}`);
    console.log(`✅ 새 탭 생성 완료! 새 페이지 URL: ${newPage.url()}`);
    
    // 새 탭을 활성화하여 사용자가 볼 수 있도록 함
    await newPage.bringToFront();
    console.log('👀 새 탭을 활성화했습니다!');
    console.log('🔍 브라우저 상단 탭 바에서 새 탭을 확인하세요!');
    console.log('📊 현재 페이지 수:', context.pages().length);
    console.log('⏰ 5초 동안 대기합니다...');
    
    // 충분한 시간 대기 (5초로 단축)
    await newPage.waitForTimeout(5000);
    
    console.log('🔐 새 탭에서 Trombone 로그인 정보:');
    console.log(`아이디: ${config.login.userId}`);
    console.log(`비밀번호: ${config.login.password.replace(/./g, '*')}`);
    console.log('');
    
    console.log('📋 프로젝트 정보:');
    console.log(`프로젝트 코드: ${config.project.code}`);
    console.log(`프로젝트명: ${config.project.name}`);
    console.log(`저장소: ${config.repository.name}`);
    console.log('');

    try {
      console.log('🌐 새 탭에서 Trombone 로그인 페이지로 이동 중...');
      
      // 새 탭에서 Trombone 로그인 페이지로 이동
      await newPage.goto('http://tst.console.trombone.okestro.cloud/login');
      await newPage.waitForLoadState('networkidle');
      console.log('✅ 로그인 페이지 로딩 완료');
      
      // 창 크기 설정
      await newPage.evaluate(() => {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
      });
      console.log('📏 새 탭 창 크기 설정 완료');
      
      // 한글 입력기 설정 확인
      console.log('🔤 한글 입력기 설정 확인 중...');
      try {
        await newPage.evaluate(() => {
          // IME 상태 확인
          if (navigator.language.includes('ko')) {
            console.log('✅ 한국어 언어 설정 감지됨');
          }
        });
      } catch (error) {
        console.log('⚠️ 한글 입력기 확인 실패:', error.message);
      }

      console.log('⌨️ 로그인 정보 입력 중...');
      // 로그인 정보 입력
      await newPage.fill('input[name="userId"]', config.login.userId);
      await newPage.fill('input[name="password"]', config.login.password);
      console.log('✅ 로그인 정보 입력 완료');
      
      console.log('🖱️ 로그인 버튼 클릭 중...');
      // 로그인 버튼 클릭
      await newPage.click('button:has-text("로그인")');

      console.log('⏳ 로그인 처리 중... 메인 페이지로 리디렉션 대기');
      // 로그인 성공 확인 (메인 페이지로 리디렉션 대기)
      await newPage.waitForURL('http://tst.console.trombone.okestro.cloud/');
      
      // 새 탭을 다시 활성화하여 결과 확인
      await newPage.bringToFront();
      await newPage.waitForTimeout(2000);
      
      console.log('🚀 새 탭에서 로그인이 완료되었습니다!\n');
      console.log(`📍 새 탭 현재 URL: ${newPage.url()}`);
      console.log(`📄 새 탭 페이지 제목: ${await newPage.title()}`);
      console.log('');
      
      return newPage;
      
    } catch (error) {
      console.error('❌ 새 탭에서 로그인 실패:', error.message);
      
      // 실패 시 새 탭 닫기
      await newPage.close();
      throw error;
    }
  }

  /**
   * 두 탭 간 전환하여 작업 수행
   * @param {Object} originalPage - 원본 페이지
   * @param {Object} newPage - 새로운 페이지  
   */
  async switchBetweenTabs(originalPage, newPage) {
    console.log('🔄 탭 간 전환 테스트 시작...');
    
    // 원본 탭으로 전환
    await originalPage.bringToFront();
    console.log('📑 원본 탭으로 전환됨');
    
    // 원본 탭에서 간단한 작업 (예: 페이지 제목 확인)
    const originalTitle = await originalPage.title();
    console.log(`📋 원본 탭 제목: ${originalTitle}`);
    
    // 잠시 대기
    await originalPage.waitForTimeout(1000);
    
    // 새 탭으로 전환
    await newPage.bringToFront();
    console.log('📑 새 탭으로 전환됨');
    
    // 새 탭에서 간단한 작업 (예: 페이지 제목 확인)
    const newTitle = await newPage.title();
    console.log(`📋 새 탭 제목: ${newTitle}`);
    
    console.log('✅ 탭 간 전환 테스트 완료');
  }

  /**
   * 새 탭 닫기
   * @param {Object} newPage - 닫을 페이지 객체
   */
  async closeNewTab(newPage) {
    if (newPage && !newPage.isClosed()) {
      await newPage.close(); // 페이지(탭)만 닫기
      console.log('🗑️ 새 탭이 닫혔습니다.');
    }
  }
}

export default TicketApproval; 