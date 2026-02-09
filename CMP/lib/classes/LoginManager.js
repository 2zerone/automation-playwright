// CMP 로그인 관리 클래스
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
   * CMP 로그인 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} 로그인 결과
   */
  async processLogin(config) {
    try {
      console.log('🔐 CMP 로그인 프로세스 시작...');
      
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToLoginPage(), '로그인 페이지 접근', 3);
      await this.executeWithRetry(() => this.fillLoginCredentials(config), '로그인 정보 입력', 3);
      await this.executeWithRetry(() => this.submitLoginAndVerify(), '로그인 실행 및 성공 확인', 3);
      
      console.log('✅ CMP 로그인 프로세스 완료');
      return { success: true, message: 'CMP 로그인 완료' };
      
    } catch (error) {
      console.error('CMP 로그인 실패:', error.message);
      throw error;
    }
  }

  /**
   * 로그인 페이지로 이동
   */
  async navigateToLoginPage() {
    console.log('🌐 CMP 로그인 페이지 접근 중...');
    
    // 세션 및 쿠키 완전 클리어 (이전 로그인 세션 제거)
    await this.page.context().clearCookies();
    console.log('🧹 쿠키 및 세션 클리어 완료');
    
    // HTTPS 인증서 오류 무시 설정
    await this.page.goto('https://305tst.console.bf.okestro.cloud/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 로그인 페이지 접근 스크린샷
    await this.captureScreenshot('CMP 로그인 페이지 접근');
    
    console.log('✅ CMP 로그인 페이지 접근 완료');
  }

  /**
   * 로그인 정보 입력
   * @param {Object} config - 설정 객체
   */
  async fillLoginCredentials(config) {
    console.log('📝 로그인 정보 입력 중...');
    
    // 이메일 입력
    await this.page.getByRole('textbox', { name: '이메일 입력' }).click();
    await this.page.getByRole('textbox', { name: '이메일 입력' }).fill(config.login.userId);
    
    // 비밀번호 입력
    await this.page.getByRole('textbox', { name: '비밀번호 입력' }).click();
    await this.page.getByRole('textbox', { name: '비밀번호 입력' }).fill(config.login.password);
    
    // 로그인 정보 입력 스크린샷
    await this.captureScreenshot('CMP 로그인 정보 입력');
    
    console.log('✅ 로그인 정보 입력 완료');
  }

  /**
   * 로그인 실행 및 성공 확인
   */
  async submitLoginAndVerify() {
    console.log('🚀 로그인 실행 및 성공 확인 중...');
    await this.page.getByRole('button', { name: '로그인' }).click();
    
    // OTP 입력 필드가 나타날 때까지 대기
    try {
      await this.page.waitForSelector('input[type="text"], input[type="number"], input[name*="otp"], input[placeholder*="OTP"]', { 
        timeout: 5000,
        state: 'visible' 
      });
    } catch (error) {
      // OTP 필드가 안 보이면 짧은 대기
      await this.page.waitForTimeout(1000);
    }
    
    console.log('✅ 로그인 버튼 클릭 완료 (OTP 입력 대기 중)');
    
    
    try {
      // 대시보드가 나타날 때까지 대기 (최대 30초)
      await this.page.waitForSelector('text=Service Desk', { 
        timeout: 30000,
        state: 'visible' 
      });
      console.log('✅ OTP 처리 완료! 즉시 재개...\n');
    } catch (error) {
      console.log('⚠️  30초 경과. 다음 단계로 진행...\n');
    }
    
    // 로그인 성공 확인
    console.log('🔍 로그인 성공 확인 중...');
    
    // 대시보드 또는 메인 화면이 표시되는지 확인 (첫 번째 요소만 선택)
    await expect(this.page.getByText('Service Desk')).toBeVisible();
    
    // 로그인 성공 확인 스크린샷 (기존 verifyLoginSuccess의 타이밍)
    await this.captureScreenshot('CMP 로그인 성공');
    
    console.log('✅ 로그인 실행 및 성공 확인 완료');
  }
}

export default LoginManager;
