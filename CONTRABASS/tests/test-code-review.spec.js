// Ticket_CodeReview.js의 executeTestCaseAdditionComplete 메서드 테스트
import { test, expect } from '@playwright/test';
import { TromboneUtils } from '../lib/classes/index.js';
import TicketCodeReviewManager from '../lib/classes/Ticket_CodeReview.js';

test('Ticket_CodeReview - executeTestCaseAdditionComplete 테스트', async ({ page }) => {
  console.log('🧪 Ticket_CodeReview 테스트 시작');
  
  // TromboneUtils 초기화
  const tromboneUtils = new TromboneUtils(page);
  
  // TicketCodeReviewManager 초기화
  const ticketCodeReviewManager = new TicketCodeReviewManager(tromboneUtils);
  
  // 로그인 먼저 수행
  console.log('🔐 로그인 수행 중...');
  await page.goto('http://trombone.qa.okestro.cloud/login');
  await page.getByRole('textbox', { name: '아이디' }).fill('yh.lee5');
  await page.getByRole('textbox', { name: '비밀번호' }).fill('Okestro2018!');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForTimeout(2000);
  
  console.log('✅ 로그인 완료');
  
  // 테스트 케이스 추가 완료 메서드 실행
  console.log('💾 executeTestCaseAdditionComplete 메서드 실행 중...');
  
  try {
    const result = await ticketCodeReviewManager.executeTestCaseAdditionComplete();
    console.log('✅ 메서드 실행 결과:', result);
  } catch (error) {
    console.error('❌ 메서드 실행 실패:', error.message);
    // 실패 시 스크린샷 촬영
    await page.screenshot({ path: 'test-results/code-review-test-failed.png' });
    throw error;
  }
  
  console.log('🎉 테스트 완료');
});
