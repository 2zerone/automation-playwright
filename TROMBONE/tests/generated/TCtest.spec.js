// Generated Playwright Test: tc명
// Test Case ID: TCtest
// Generated at: 2025-09-30T04:49:41.616Z

import { test, expect } from '@playwright/test';

test('tc명', async ({ page }) => {
  // Step 1: goto
  await page.goto('https://305tst.console.bf.okestro.cloud/auth/realms/maestro-admin/protocol/openid-connect/auth?approval_prompt=force&client_id=maestro-admin-client&redirect_uri=https%3A%2F%2F305tst.console.bf.okestro.cloud%2Foauth2%2Fcallback&response_type=code&scope=openid+email+profile&state=ghhvgAsJzt0DGyQcGNQfcw5pJZtAz6nWSUAYn58yGhU%3A%2F');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('Step 1: 페이지 이동 완료');
  await page.waitForTimeout(1000);

  // Step 2: click
  await page.getByRole('textbox', { name: '이메일 입력' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 2: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 3: fill
  await page.getByRole('textbox', { name: '이메일 입력' }).fill('yh.lee5@okestro.com');
  await page.getByRole('textbox', { name: '이메일 입력' }).blur();
  await page.waitForTimeout(1000);
  console.log('Step 3: 입력 완료');
  await page.waitForTimeout(1000);

  // Step 4: press
  await page.getByRole('textbox', { name: '이메일 입력' }).press('Tab');
  await page.waitForTimeout(1000);

  // Step 5: click
  await page.getByRole('textbox', { name: '비밀번호 입력' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 5: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 6: fill
  await page.getByRole('textbox', { name: '비밀번호 입력' }).fill('Okestro2018!');
  await page.getByRole('textbox', { name: '비밀번호 입력' }).blur();
  await page.waitForTimeout(1000);
  console.log('Step 6: 입력 완료');
  await page.waitForTimeout(1000);

  // Step 7: click
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 7: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 8: click
  await page.getByRole('button', { name: 'apps' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 8: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 9: click
  await page.getByRole('link', { name: 'Kubernetes Engine 쿠버네티스 관리 서비스' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 9: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 10: click
  await page.getByText('biz-cluster-').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 10: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 11: click
  await page.getByRole('button', { name: '선택' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 11: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 12: click
  await page.getByText('워크플로우').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 12: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 13: click
  await page.getByText('워크로드 arrow_drop_down').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 13: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 14: click
  await page.getByRole('link', { name: '컨테이너 관리' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 14: 클릭 완료');
  await page.waitForTimeout(1000);

});
