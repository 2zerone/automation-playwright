// Generated Playwright Test: 한글 통합테스트명 테스트
// Test Case ID: TEST-KR-1763014115921
// Generated at: 2025-11-13T06:08:40.692Z

import { test, expect } from '@playwright/test';

test('한글 통합테스트명 테스트', async ({ page }) => {
  // 전역 카운터 (INCREMENT 변수용)
  let globalCounter = 0;
  // Step 1: 페이지로 이동
  await page.goto('http://example.com');
  await page.waitForTimeout(2000);
  console.log('Step 1: 페이지 이동 완료');

  // Step 2: '로그인' 버튼 클릭
  await page.getByRole('button', { name: '로그인' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 2: 클릭 완료');

  // Step 3: '아이디' 텍스트박스에 입력
  await page.getByRole('textbox', { name: '아이디' }).fill('testuser');
  await page.getByRole('textbox', { name: '아이디' }).blur();
  console.log('Step 3: 입력 완료 (고정 값)');

});
