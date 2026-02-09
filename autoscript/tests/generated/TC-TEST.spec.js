// Generated Playwright Test: 테스트 케이스
// Test Case ID: TC-TEST
// Generated at: 2025-09-16T01:09:43.286Z

import { test, expect } from '@playwright/test';

test('테스트 케이스', async ({ page }) => {
  // Step 1: goto
  console.log('Step 1: goto');
  await page.goto('http://example.com/');
  // Timeout: 1000ms
  await page.waitForTimeout(1000);

  // Step 2: click
  console.log('Step 2: click');
  await page.getByText('This domain is for use in').click();
  // Timeout: 5000ms
  await page.waitForTimeout(5000);

  // Step 3: click
  console.log('Step 3: click');
  await page.getByRole('heading', { name: 'Example Domain' }).click();
  // Timeout: 1000ms
  await page.waitForTimeout(1000);

  // Step 4: click
  console.log('Step 4: click');
  await page.getByText('Example Domain This domain is').click();
  // Timeout: 5000ms
  await page.waitForTimeout(5000);

});
