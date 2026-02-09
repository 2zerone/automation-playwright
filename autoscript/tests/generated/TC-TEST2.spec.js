// Generated Playwright Test: 테스트 케이스2
// Test Case ID: TC-TEST2
// Generated at: 2025-09-16T01:16:01.666Z

import { test, expect } from '@playwright/test';

test('테스트 케이스2', async ({ page }) => {
  // Step 1: goto
  console.log('Step 1: goto');
  await page.goto('http://example.com/');
  await page.waitForTimeout(1000);

  // Step 2: click
  console.log('Step 2: click');
  await page.getByText('This domain is for use in').click();
  await page.waitForTimeout(3000);

});
