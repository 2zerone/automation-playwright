// Generated Playwright Test: 테스트
// Test Case ID: TC500
// Generated at: 2025-10-01T01:36:20.011Z

import { test, expect } from '@playwright/test';

test('테스트', async ({ page }) => {
  // Step 1: goto
  await page.goto('https://305tst.console.bf.okestro.cloud/auth/realms/maestro-admin/protocol/openid-connect/auth?approval_prompt=force&client_id=maestro-admin-client&redirect_uri=https%3A%2F%2F305tst.console.bf.okestro.cloud%2Foauth2%2Fcallback&response_type=code&scope=openid+email+profile&state=gcmabA2ohtlaCWhAw7NzcQlYwrdV8AbMpy6FgSkckWg%3A%2F');
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
  await page.getByRole('textbox', { name: '비밀번호 입력' }).click();
  console.log('Step 4: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 5: fill
  await page.getByRole('textbox', { name: '비밀번호 입력' }).fill('Okestro2018!');
  await page.getByRole('textbox', { name: '비밀번호 입력' }).blur();
  console.log('Step 5: 입력 완료');
  // Wait 1000ms - removed for performance

  // Step 6: click
  await page.getByRole('button', { name: '로그인' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 6: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 7: click
  await page.getByRole('button', { name: 'apps' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 7: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 8: click
  await page.getByRole('link', { name: 'Kubernetes Engine 쿠버네티스 관리 서비스' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 8: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 9: click
  await page.getByText('biz-cluster-').click();
  console.log('Step 9: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 10: click
  await page.getByRole('button', { name: '선택' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 10: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 11: click
  await page.getByText('워크플로우').click();
  console.log('Step 11: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 12: click
  await page.getByText('워크로드 arrow_drop_down').click();
  console.log('Step 12: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 13: click
  await page.getByRole('link', { name: '컨테이너 관리' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 13: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 14: click
  await page.getByRole('button', { name: '생성' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 14: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 15: click
  await page.getByText('네임스페이스를 선택해 주세요').click();
  console.log('Step 15: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 16: click
  await page.getByTitle('pqa-ns').locator('div').click();
  console.log('Step 16: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 17: click
  await page.getByRole('textbox', { name: '* 이름' }).click();
  console.log('Step 17: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 18: fill
  await page.getByRole('textbox', { name: '* 이름' }).fill('testyh');
  await page.getByRole('textbox', { name: '* 이름' }).blur();
  console.log('Step 18: 입력 완료');
  // Wait 1000ms - removed for performance

  // Step 19: click
  await page.getByRole('button', { name: '중복확인' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 19: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 20: click
  await page.getByRole('button', { name: '생성' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 20: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 21: click
  await page.locator('a').filter({ hasText: 'yh.lee5@okestro.com이영한'  }).click();
  console.log('Step 21: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 22: click
  await page.getByText('logout로그아웃').click();
  console.log('Step 22: 클릭 완료');
  // Wait 1000ms - removed for performance

  // Step 23: click
  await page.getByRole('button', { name: '확인' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 23: 클릭 완료');
  // Wait 1000ms - removed for performance

});
