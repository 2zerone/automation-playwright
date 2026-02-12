import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import AutoRecorded_cmp_test from '../../lib/classes/AutoRecorded_cmp_test.js';

const allPlannedTestCases = [
  { name: 'Navigate to page', status: 'pending' },
  { name: 'Fill username', status: 'pending' },
  { name: 'Fill password', status: 'pending' },
  { name: 'Click login button', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    autoRecorded_cmp_test: new AutoRecorded_cmp_test(page)
  };
}

test.describe.serial('시나리오 4: cmp test', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 4, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 4, '시나리오 4: cmp test', 'CMP');
  });

  test('Navigate to page', async () => {
    await test.step('Navigate to page', async () => {
      await runTestStep('Navigate to page', async () => {
        console.log('📝 Executing: Navigate to page...');
        await managers.autoRecorded_cmp_test.navigateToPage(config);
        console.log('✅ Completed: Navigate to page');
      }, page, 4);
    });
  });

  test('Fill username', async () => {
    await test.step('Fill username', async () => {
      await runTestStep('Fill username', async () => {
        console.log('📝 Executing: Fill username...');
        await managers.autoRecorded_cmp_test.fillUsernameTextbox(config);
        console.log('✅ Completed: Fill username');
      }, page, 4);
    });
  });

  test('Fill password', async () => {
    await test.step('Fill password', async () => {
      await runTestStep('Fill password', async () => {
        console.log('📝 Executing: Fill password...');
        await managers.autoRecorded_cmp_test.fillPasswordTextbox(config);
        console.log('✅ Completed: Fill password');
      }, page, 4);
    });
  });

  test('Click login button', async () => {
    await test.step('Click login button', async () => {
      await runTestStep('Click login button', async () => {
        console.log('📝 Executing: Click login button...');
        await managers.autoRecorded_cmp_test.clickLoginButton(config);
        console.log('✅ Completed: Click login button');
      }, page, 4);
    });
  });
});
