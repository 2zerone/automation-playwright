import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import AutoRecorded_zz from '../../lib/classes/AutoRecorded_zz.js';

const allPlannedTestCases = [
  { name: 'Navigate to page', status: 'pending' },
  { name: 'Click username button', status: 'pending' },
  { name: 'Press controlormeta shift i key', status: 'pending' },
  { name: 'Press controlormeta shift i key 2', status: 'pending' },
  { name: 'Press f12 key', status: 'pending' },
  { name: 'Press f12 key 2', status: 'pending' },
  { name: 'Press f12 key 3', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    autoRecorded_zz: new AutoRecorded_zz(page)
  };
}

test.describe.serial('시나리오 11: zz', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 11, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 11, '시나리오 11: zz', 'CONTRABASS');
  });

  test('Navigate to page', async () => {
    await test.step('Navigate to page', async () => {
      await runTestStep('Navigate to page', async () => {
        console.log('📝 Executing: Navigate to page...');
        await managers.autoRecorded_zz.navigateToPage(config);
        console.log('✅ Completed: Navigate to page');
      }, page, 11);
    });
  });

  test('Click username button', async () => {
    await test.step('Click username button', async () => {
      await runTestStep('Click username button', async () => {
        console.log('📝 Executing: Click username button...');
        await managers.autoRecorded_zz.clickUsernameTextbox(config);
        console.log('✅ Completed: Click username button');
      }, page, 11);
    });
  });

  test('Press controlormeta shift i key', async () => {
    await test.step('Press controlormeta shift i key', async () => {
      await runTestStep('Press controlormeta shift i key', async () => {
        console.log('📝 Executing: Press controlormeta shift i key...');
        await managers.autoRecorded_zz.pressControlOrMetaShiftIKey(config);
        console.log('✅ Completed: Press controlormeta shift i key');
      }, page, 11);
    });
  });

  test('Press controlormeta shift i key 2', async () => {
    await test.step('Press controlormeta shift i key 2', async () => {
      await runTestStep('Press controlormeta shift i key 2', async () => {
        console.log('📝 Executing: Press controlormeta shift i key 2...');
        await managers.autoRecorded_zz.pressControlOrMetaShiftIKey2(config);
        console.log('✅ Completed: Press controlormeta shift i key 2');
      }, page, 11);
    });
  });

  test('Press f12 key', async () => {
    await test.step('Press f12 key', async () => {
      await runTestStep('Press f12 key', async () => {
        console.log('📝 Executing: Press f12 key...');
        await managers.autoRecorded_zz.pressF12Key(config);
        console.log('✅ Completed: Press f12 key');
      }, page, 11);
    });
  });

  test('Press f12 key 2', async () => {
    await test.step('Press f12 key 2', async () => {
      await runTestStep('Press f12 key 2', async () => {
        console.log('📝 Executing: Press f12 key 2...');
        await managers.autoRecorded_zz.pressF12Key2(config);
        console.log('✅ Completed: Press f12 key 2');
      }, page, 11);
    });
  });

  test('Press f12 key 3', async () => {
    await test.step('Press f12 key 3', async () => {
      await runTestStep('Press f12 key 3', async () => {
        console.log('📝 Executing: Press f12 key 3...');
        await managers.autoRecorded_zz.pressF12Key3(config);
        console.log('✅ Completed: Press f12 key 3');
      }, page, 11);
    });
  });
});
