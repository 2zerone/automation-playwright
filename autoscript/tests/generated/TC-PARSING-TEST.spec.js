// Generated Playwright Test: 파싱 테스트
// Test Case ID: TC-PARSING-TEST
// Generated at: 2025-09-16T01:30:14.447Z

import { test, expect } from '@playwright/test';

test('파싱 테스트', async ({ page }) => {
  // Step 1: goto
  await page.goto('http://example.com/');
  await page.waitForLoadState('networkidle');
  console.log('Step 1: 페이지 이동 완료 - http://example.com/');
  await page.waitForTimeout(1000);

  // Step 2: click
  await page.getByText('Example Domain This domain is').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 2: 클릭 완료 - 텍스트 'Example Domain This domain is'');
  await page.waitForTimeout(1000);

  // Step 3: click
  await page.getByText('Example Domain This domain is').click();
  await page.waitForLoadState('networkidle');
  console.log('Step 3: 클릭 완료 - 텍스트 'Example Domain This domain is'');
  await page.waitForTimeout(1000);

});
