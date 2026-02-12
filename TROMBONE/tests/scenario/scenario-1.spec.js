import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import test from '../../lib/classes/test.js';

const allPlannedTestCases = [
  { name: 'Navigate to page', status: 'pending' },
  { name: 'Fill username', status: 'pending' },
  { name: 'Fill password', status: 'pending' },
  { name: 'Click login button', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    test: new test(page)
  };
}

test.describe.serial('시나리오 1: test', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 1, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 1, '시나리오 1: test', 'TROMBONE');
  });

  test('Navigate to page', async () => {
    await test.step('Navigate to page', async () => {
      await runTestStep('Navigate to page', async () => {
        console.log('📝 Executing: Navigate to page...');
        await managers.test.navigateToPage(config);
        console.log('✅ Completed: Navigate to page');
      }, page, 1);
    });
  });

  test('Fill username', async () => {
    await test.step('Fill username', async () => {
      await runTestStep('Fill username', async () => {
        console.log('📝 Executing: Fill username...');
        await managers.test.fillUsernameTextbox(config);
        console.log('✅ Completed: Fill username');
      }, page, 1);
    });
  });

  test('Fill password', async () => {
    await test.step('Fill password', async () => {
      await runTestStep('Fill password', async () => {
        console.log('📝 Executing: Fill password...');
        await managers.test.fillPasswordTextbox(config);
        console.log('✅ Completed: Fill password');
      }, page, 1);
    });
  });

  test('Click login button', async () => {
    await test.step('Click login button', async () => {
      await runTestStep('Click login button', async () => {
        console.log('📝 Executing: Click login button...');
        await managers.test.clickLoginButton(config);
        console.log('✅ Completed: Click login button');
      }, page, 1);
    });
  });
});
