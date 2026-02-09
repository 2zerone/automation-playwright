// Generated Playwright Test: 품질
// Test Case ID: TC100
// Generated at: 2025-09-30T08:39:01.785Z

import { test, expect } from '@playwright/test';

test('품질', async ({ page }) => {
  // Step 1: goto
  await page.goto('https://305tst.console.bf.okestro.cloud/auth/realms/maestro-admin/protocol/openid-connect/auth?approval_prompt=force&client_id=maestro-admin-client&redirect_uri=https%3A%2F%2F305tst.console.bf.okestro.cloud%2Foauth2%2Fcallback&response_type=code&scope=openid+email+profile&state=XAxaj77Gcc23YL5qRfsIiLnKQW-8GGBcLZcoNxmiWlY%3A%2F');
  await page.waitForTimeout(2000);
  console.log('Step 1: 페이지 이동 완료');
  // Wait 1000ms - removed for performance

  // Step 2: click
  await page.getByRole('textbox', { name: '이메일 입력' }).click();
  console.log('Step 2: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 3: fill
  await page.getByRole('textbox', { name: '이메일 입력' }).fill('yh.lee5@okestro.com');
  await page.getByRole('textbox', { name: '이메일 입력' }).blur();
  console.log('Step 3: 입력 완료');
  // Wait 1000ms - removed for performance

  // Step 4: click
  await page.getByText('네임스페이스를 선택해 주세요').click();
  console.log('Step 4: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 5: click
  await page.getByRole('textbox', { name: '* 이름' }).click();
  console.log('Step 5: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 6: fill
  await page.getByRole('textbox', { name: '* 이름' }).fill('quality1234');
  await page.getByRole('textbox', { name: '* 이름' }).blur();
  console.log('Step 6: 입력 완료');
  // Wait 1000ms - removed for performance

  // Step 7: click
  await page.getByRole('button', { name: '중복확인' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 7: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 19: click
  await page.getByRole('button', { name: '생성' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 19: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 20: click
  await page.locator('a').filter({ hasText: 'yh.lee5@okestro.com이영한'  }).click();
  console.log('Step 20: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 21: click
  await page.locator('div').filter({ hasText: /^logout로그아웃$/  }).click();
  console.log('Step 21: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 22: click
  await page.getByRole('button', { name: '확인' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 22: 클릭 완료');
  // Wait 1000ms - removed for performance

});
