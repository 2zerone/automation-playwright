// Generated Playwright Test: 로그인 성공
// Test Case ID: TC001
// Generated at: 2025-09-16T01:41:30.757Z

import { test, expect } from '@playwright/test';

test('로그인 성공', async ({ page }) => {
  // Step 0: goto
  await page.goto('http://trombone.qa.okestro.cloud/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('Step 0: 페이지 이동 완료');
  await expect(page).toHaveURL(*trombone.qa.okestro.cloud*);
  await page.waitForTimeout(5000);

  // Step 1: fill
  await page.fill('#username', 'testid');
  await page.locator('#username').blur();
  await page.waitForTimeout(1000);
  console.log('Step 1: 입력 완료');
  await expect(page.locator('#username')).toBeVisible();
  await page.waitForTimeout(5000);

  // Step 2: fill
  await page.fill('#password', 'testpw');
  await page.locator('#password').blur();
  await page.waitForTimeout(1000);
  console.log('Step 2: 입력 완료');
  await expect(page.locator('#password')).toBeVisible();
  await page.waitForTimeout(5000);

  // Step 3: click
  await page.click('button[type=submit]');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Step 3: 클릭 완료');
  await page.waitForTimeout(5000);

});
