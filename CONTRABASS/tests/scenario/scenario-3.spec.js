import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import AutoRecorded_user_test from '../../lib/classes/AutoRecorded_user_test.js';

const allPlannedTestCases = [
  { name: 'Navigate to page', status: 'pending' },
  { name: 'Click username button', status: 'pending' },
  { name: 'Fill username', status: 'pending' },
  { name: 'Click password button', status: 'pending' },
  { name: 'Fill password', status: 'pending' },
  { name: 'Click login button', status: 'pending' },
  { name: 'Navigate to page 2', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    autoRecorded_user_test: new AutoRecorded_user_test(page)
  };
}

test.describe.serial('시나리오 3: user test', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 3, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 3, '시나리오 3: user test', 'CONTRABASS');
  });

  test('Navigate to page', async () => {
    await test.step('Navigate to page', async () => {
      await runTestStep('Navigate to page', async () => {
        console.log('📝 Executing: Navigate to page...');
        await managers.autoRecorded_user_test.navigateToPage(config);
        console.log('✅ Completed: Navigate to page');
      }, page, 3);
    });
  });

  test('Click username button', async () => {
    await test.step('Click username button', async () => {
      await runTestStep('Click username button', async () => {
        console.log('📝 Executing: Click username button...');
        await managers.autoRecorded_user_test.clickUsernameButton(config);
        console.log('✅ Completed: Click username button');
      }, page, 3);
    });
  });

  test('Fill username', async () => {
    await test.step('Fill username', async () => {
      await runTestStep('Fill username', async () => {
        console.log('📝 Executing: Fill username...');
        await managers.autoRecorded_user_test.fillUsername(config);
        console.log('✅ Completed: Fill username');
      }, page, 3);
    });
  });

  test('Click password button', async () => {
    await test.step('Click password button', async () => {
      await runTestStep('Click password button', async () => {
        console.log('📝 Executing: Click password button...');
        await managers.autoRecorded_user_test.clickPasswordButton(config);
        console.log('✅ Completed: Click password button');
      }, page, 3);
    });
  });

  test('Fill password', async () => {
    await test.step('Fill password', async () => {
      await runTestStep('Fill password', async () => {
        console.log('📝 Executing: Fill password...');
        await managers.autoRecorded_user_test.fillPassword(config);
        console.log('✅ Completed: Fill password');
      }, page, 3);
    });
  });

  test('Click login button', async () => {
    await test.step('Click login button', async () => {
      await runTestStep('Click login button', async () => {
        console.log('📝 Executing: Click login button...');
        await managers.autoRecorded_user_test.clickLoginButton(config);
        console.log('✅ Completed: Click login button');
      }, page, 3);
    });
  });

  test('Navigate to page 2', async () => {
    await test.step('Navigate to page 2', async () => {
      await runTestStep('Navigate to page 2', async () => {
        console.log('📝 Executing: Navigate to page 2...');
        await managers.autoRecorded_user_test.navigateToPage2(config);
        console.log('✅ Completed: Navigate to page 2');
      }, page, 3);
    });
  });
});
