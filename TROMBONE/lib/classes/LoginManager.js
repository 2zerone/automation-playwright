// TROMBONE 로그인 관리 클래스
import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class LoginManager extends BaseManager {
  constructor(page) {
    super(null); // BaseManager는 utils를 받지만, LoginManager는 page를 직접 사용
    this.page = page;
    // utils 객체 생성 (스크린샷 기능을 위해)
    this.utils = { page: this.page };
  }

  /**
   * TROMBONE 로그인 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} 로그인 결과
   */
  async processLogin(config) {
    try {
      console.log('🔐 TROMBONE 로그인 프로세스 시작...');
      
      // 설정 정보 출력
      this.logConfigInfo(config);
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToLoginPage(), '로그인 페이지 접근', 3);
      await this.executeWithRetry(() => this.fillLoginCredentials(config), '로그인 정보 입력', 3);
      await this.executeWithRetry(() => this.submitLoginAndVerify(), '로그인 실행 및 성공 확인', 3);
      
      console.log('✅ TROMBONE 로그인 프로세스 완료');
      return { success: true, message: 'TROMBONE 로그인 완료' };
      
    } catch (error) {
      console.error('TROMBONE 로그인 실패:', error.message);
      throw error;
    }
  }

  /**
   * 설정 정보 출력
   * @param {Object} config - 설정 객체
   */
  logConfigInfo(config) {
    console.log('🔐 Trombone 로그인 정보:');
    console.log(`아이디: ${config.login.userId}`);
    console.log(`비밀번호: ${config.login.password.replace(/./g, '*')}`);
    console.log('');
    
    console.log('📋 프로젝트 정보:');
    console.log(`프로젝트 코드: ${config.project.code}`);
    console.log(`프로젝트명: ${config.project.name}`);
    console.log(`저장소: ${config.repository.name}`);
    console.log('');
    
    console.log('✅ 설정 파일이 로드되었습니다.\n');
  }

  /**
   * 로그인 페이지로 이동
   */
  async navigateToLoginPage() {
    console.log('🌐 TROMBONE 로그인 페이지 접근 중...');
    
    // 페이지 이동
    await this.page.goto('http://tst.console.trombone.okestro.cloud/login');
    await this.page.waitForLoadState('networkidle');
    
    // 창 크기 최대화
    await this.page.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.availWidth, screen.availHeight);
    });
    
    // 로그인 페이지 접근 스크린샷
    await this.captureScreenshot('TROMBONE 로그인 페이지 접근');
    
    console.log('✅ TROMBONE 로그인 페이지 접근 완료');
  }

  /**
   * 로그인 정보 입력
   * @param {Object} config - 설정 객체
   */
  async fillLoginCredentials(config) {
    console.log('📝 로그인 정보 입력 중...');
    
    // 아이디 입력
    await this.page.getByRole('textbox', { name: '아이디' }).fill(config.login.userId);
    
    // 비밀번호 입력
    await this.page.getByRole('textbox', { name: '비밀번호' }).fill(config.login.password);
    
    // 로그인 정보 입력 스크린샷
    await this.captureScreenshot('TROMBONE 로그인 정보 입력');
    
    console.log('✅ 로그인 정보 입력 완료');
  }

  /**
   * 로그인 실행 및 성공 확인
   */
  async submitLoginAndVerify() {
    console.log('🚀 로그인 실행 및 성공 확인 중...');
    
    // 로그인 버튼 클릭
    await this.page.getByRole('button', { name: '로그인' }).click();
    
    // 로그인 성공 확인 (URL 변경 대기)
    await this.page.waitForURL('http://tst.console.trombone.okestro.cloud/');
    
    // 로그인 성공 확인 스크린샷
    await this.captureScreenshot('TROMBONE 로그인 성공');
    
    console.log('✅ 로그인 실행 및 성공 확인 완료');
    console.log('🚀 로그인이 완료되었습니다.\n');
  }

  /**
   * 하위 호환성을 위한 레거시 메서드
   * @deprecated processLogin 사용 권장
   */
  async login(config) {
    console.log('⚠️ login() 메서드는 deprecated되었습니다. processLogin()을 사용하세요.');
    return await this.processLogin(config);
  }
}

export default LoginManager;