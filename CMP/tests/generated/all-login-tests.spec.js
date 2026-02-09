// Generated Merged Playwright Tests
// Test Cases: TC001, TC002, TC999
// Generated at: 2025-09-15T00:26:51.187Z
// Output File: all-login-tests.spec.js

import { test, expect } from '@playwright/test';

test('로그인 성공', async ({ page }) => {
  // Step 0: goto
  await page.goto('http://trombone.qa.okestro.cloud/');
  await expect(page).toHaveURL(*trombone.qa.okestro.cloud*);
  // Timeout: 5000ms

  // Step 1: fill
  await page.fill('#username', 'testid');
  await expect(page.locator('#username')).toBeVisible();
  // Timeout: 5000ms

  // Step 2: fill
  await page.fill('#password', 'testpw');
  await expect(page.locator('#password')).toBeVisible();
  // Timeout: 5000ms

  // Step 3: click
  await page.click('button[type=submit]');
  // Timeout: 5000ms

});

test('로그인 실패', async ({ page }) => {
  // Step 0: goto
  await page.goto('http://trombone.qa.okestro.cloud/');
  await expect(page).toHaveURL(*trombone.qa.okestro.cloud*);
  // Timeout: 5000ms

  // Step 1: fill
  await page.fill('#username', 'wrongid');
  await expect(page.locator('#username')).toBeVisible();
  // Timeout: 5000ms

  // Step 2: fill
  await page.fill('#password', 'wrongpw');
  await expect(page.locator('#password')).toBeVisible();
  // Timeout: 5000ms

  // Step 3: click
  await page.click('button[type=submit]');
  // Timeout: 5000ms

});

test('Codegen 테스트', async ({ page }) => {
  // Step 1: goto
  await page.goto('http://trombone.qa.okestro.cloud/');
  // Timeout: 5000ms

  // Step 2: click
  await page.click('#username');
  await expect(page.locator('#username')).toBeVisible();
  // Timeout: 5000ms

  // Step 3: fill
  await page.fill('#username', 'admin');
  await expect(page.locator('#username')).toBeVisible();
  // Timeout: 5000ms

  // Step 4: click
  await page.click('#password');
  await expect(page.locator('#password')).toBeVisible();
  // Timeout: 5000ms

  // Step 5: fill
  await page.fill('#password', 'password123');
  await expect(page.locator('#password')).toBeVisible();
  // Timeout: 5000ms

  // Step 6: waitFor
  await page.waitForSelector('.dashboard');
  // Timeout: 5000ms

});

