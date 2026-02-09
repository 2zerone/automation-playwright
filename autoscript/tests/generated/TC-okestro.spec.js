// Generated Playwright Test: 목록 진입 테스트
// Test Case ID: TC-okestro
// Generated at: 2025-09-16T01:30:22.618Z

import { test, expect } from '@playwright/test';

test('목록 진입 테스트', async ({ page }) => {
  // Step 1: goto
  await page.goto('http://trombone.qa.okestro.cloud/login');
  await page.waitForLoadState('networkidle');
  console.log('Step 1: 페이지 이동 완료 - http://trombone.qa.okestro.cloud/login');
  await page.waitForTimeout(1000);

  // Step 2: click
  await page.getByRole('textbox', { name: '아이디' }).click();
  await page.waitForLoadState('networkidle');
  console.log('Step 2: 클릭 완료 - textbox '아이디'');
  await page.waitForTimeout(1000);

  // Step 3: fill
  await page.getByRole('textbox', { name: '아이디' }).fill('yh.lee5');
  await page.getByRole('textbox', { name: '아이디' }).blur();
  console.log('Step 3: 입력 완료 - 텍스트박스 '아이디'에 'yh.lee5' 입력');
  await page.waitForTimeout(1000);

  // Step 4: click
  await page.getByRole('textbox', { name: '비밀번호' }).click();
  await page.waitForLoadState('networkidle');
  console.log('Step 4: 클릭 완료 - textbox '비밀번호'');
  await page.waitForTimeout(1000);

  // Step 5: fill
  await page.getByRole('textbox', { name: '비밀번호' }).fill('Okestro2018!');
  await page.getByRole('textbox', { name: '비밀번호' }).blur();
  console.log('Step 5: 입력 완료 - 텍스트박스 '비밀번호'에 'Okestro2018!' 입력');
  await page.waitForTimeout(1000);

  // Step 6: click
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForLoadState('networkidle');
  console.log('Step 6: 클릭 완료 - button '로그인'');
  await page.waitForTimeout(1000);

  // Step 7: click
  await page.getByText('일반0 0 24').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 7: 클릭 완료 - 텍스트 '일반0 0 24'');
  await page.waitForTimeout(1000);

  // Step 8: click
  await page.getByRole('listitem').filter({ hasText: /^사용자 정보 관리0 0 24 24$/  }).locator('a').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 8: 클릭 완료 - page.getByRole('listitem').filter({ hasText: /^사용자 정보 관리0 0 24 24$/  }).locator('a')');
  await page.waitForTimeout(1000);

  // Step 9: click
  await page.getByRole('textbox', { name: '검색어를 입력해주세요' }).click();
  await page.waitForLoadState('networkidle');
  console.log('Step 9: 클릭 완료 - textbox '검색어를 입력해주세요'');
  await page.waitForTimeout(1000);

  // Step 10: fill
  await page.getByRole('textbox', { name: '검색어를 입력해주세요' }).fill('이영한');
  await page.getByRole('textbox', { name: '검색어를 입력해주세요' }).blur();
  console.log('Step 10: 입력 완료 - 텍스트박스 '검색어를 입력해주세요'에 '이영한' 입력');
  await page.waitForTimeout(1000);

  // Step 11: click
  await page.getByRole('button').filter({ hasText: '3 3 27' }).click();
  await page.waitForLoadState('networkidle');
  console.log('Step 11: 클릭 완료 - page.getByRole('button').filter({ hasText: '3 3 27' })');
  await expect(page.getByRole('button').filter({ hasText: '3 3 27' })).toBeVisible();
  await page.waitForTimeout(1000);

  // Step 12: click
  await page.getByText('역할 매핑 관리').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 12: 클릭 완료 - 텍스트 '역할 매핑 관리'');
  await page.waitForTimeout(1000);

  // Step 13: click
  await page.getByText('업무코드별 사용자 관리').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 13: 클릭 완료 - 텍스트 '업무코드별 사용자 관리'');
  await page.waitForTimeout(1000);

  // Step 14: click
  await page.getByText('메뉴 관리').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 14: 클릭 완료 - 텍스트 '메뉴 관리'');
  await page.waitForTimeout(1000);

  // Step 15: click
  await page.getByRole('tabpanel').getByText('통계').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 15: 클릭 완료 - 텍스트 '통계'');
  await page.waitForTimeout(1000);

  // Step 16: click
  await page.getByText('시스템 관리0 0 24').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 16: 클릭 완료 - 텍스트 '시스템 관리0 0 24'');
  await page.waitForTimeout(1000);

  // Step 17: click
  await page.getByText('코드 관리').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 17: 클릭 완료 - 텍스트 '코드 관리'');
  await page.waitForTimeout(1000);

  // Step 18: click
  await page.getByText('일반 코드').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 18: 클릭 완료 - 텍스트 '일반 코드'');
  await page.waitForTimeout(1000);

});
