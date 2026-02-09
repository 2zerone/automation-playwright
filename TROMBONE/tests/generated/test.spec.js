// Generated Playwright Test: test
// Test Case ID: test
// Generated at: 2025-09-16T01:41:56.557Z

import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Step 1: goto
  await page.goto('http://tst.console.trombone.okestro.cloud/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('Step 1: 페이지 이동 완료');
  await page.waitForTimeout(1000);

  // Step 2: click
  await page.getByRole('textbox', { name: '아이디' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 2: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 3: fill
  await page.getByRole('textbox', { name: '아이디' }).fill('yh.lee5');
  await page.getByRole('textbox', { name: '아이디' }).blur();
  await page.waitForTimeout(1000);
  console.log('Step 3: 입력 완료');
  await page.waitForTimeout(1000);

  // Step 4: click
  await page.getByRole('textbox', { name: '비밀번호' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 4: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 5: fill
  await page.getByRole('textbox', { name: '비밀번호' }).fill('Okestro2018!');
  await page.getByRole('textbox', { name: '비밀번호' }).blur();
  await page.waitForTimeout(1000);
  console.log('Step 5: 입력 완료');
  await page.waitForTimeout(1000);

  // Step 6: click
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 6: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 7: click
  await page.getByRole('tab', { name: '사용자' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 7: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 8: click
  await page.getByRole('tabpanel').getByText('빌드배포0 0 24').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 8: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 9: click
  await page.getByRole('listitem').filter({ hasText: /^티켓 관리0 0 24 24$/  }).locator('a').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 9: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 10: click
  await page.getByRole('textbox', { name: '검색어를 입력해주세요' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 10: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 11: fill
  await page.getByRole('textbox', { name: '검색어를 입력해주세요' }).fill('LYH7641');
  await page.getByRole('textbox', { name: '검색어를 입력해주세요' }).blur();
  await page.waitForTimeout(1000);
  console.log('Step 11: 입력 완료');
  await page.waitForTimeout(1000);

  // Step 12: click
  await page.getByRole('button').filter({ hasText: '3 3 27' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 12: 클릭 완료');
  await expect(page.getByRole('button').filter({ hasText: '3 3 27' })).toBeVisible();
  await page.waitForTimeout(1000);

  // Step 13: expect
  await expect(page.getByText('LYH7641-TICKET')).toBeVisible();
  await page.waitForTimeout(1000);

  // Step 14: click
  await page.getByText('LYH7641-TICKET').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 14: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 15: click
  await page.locator('header').getByText('0 0 24').nth(2).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 15: 클릭 완료');
  await page.waitForTimeout(1000);

  // Step 16: click
  await page.locator('div').filter({ hasText: /^로그아웃$/  }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 16: 클릭 완료');
  await page.waitForTimeout(1000);

});
