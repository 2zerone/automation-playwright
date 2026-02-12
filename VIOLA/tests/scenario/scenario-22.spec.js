import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import viola_test_1 from '../../lib/classes/viola_test_1.js';

const allPlannedTestCases = [
  { name: 'Navigate to page', status: 'pending' },
  { name: 'Fill username', status: 'pending' },
  { name: 'Fill password', status: 'pending' },
  { name: 'Click login button', status: 'pending' },
  { name: 'Click field', status: 'pending' },
  { name: 'Click field 2', status: 'pending' },
  { name: 'Click field 3', status: 'pending' },
  { name: 'Click field 4', status: 'pending' },
  { name: 'Click create button', status: 'pending' },
  { name: 'Click element', status: 'pending' },
  { name: 'Click confirm', status: 'pending' },
  { name: 'Fill name', status: 'pending' },
  { name: 'Click confirm button', status: 'pending' },
  { name: 'Click field 5', status: 'pending' },
  { name: 'Click field 6', status: 'pending' },
  { name: 'Click create button 2', status: 'pending' },
  { name: 'Fill name 2', status: 'pending' },
  { name: 'Click element 2', status: 'pending' },
  { name: 'Click element 3', status: 'pending' },
  { name: 'Click element 4', status: 'pending' },
  { name: 'Click field 7', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    viola_test_1: new viola_test_1(page)
  };
}

test.describe.serial('시나리오 22: viola test 1', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 22, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 22, '시나리오 22: viola test 1', 'VIOLA');
  });

  test('Navigate to page', async () => {
    await test.step('Navigate to page', async () => {
      await runTestStep('Navigate to page', async () => {
        console.log('📝 Executing: Navigate to page...');
        await managers.viola_test_1.navigateToPage(config);
        console.log('✅ Completed: Navigate to page');
      }, page, 22);
    });
  });

  test('Fill username', async () => {
    await test.step('Fill username', async () => {
      await runTestStep('Fill username', async () => {
        console.log('📝 Executing: Fill username...');
        await managers.viola_test_1.fillUsernameTextbox(config);
        console.log('✅ Completed: Fill username');
      }, page, 22);
    });
  });

  test('Fill password', async () => {
    await test.step('Fill password', async () => {
      await runTestStep('Fill password', async () => {
        console.log('📝 Executing: Fill password...');
        await managers.viola_test_1.fillPasswordTextbox(config);
        console.log('✅ Completed: Fill password');
      }, page, 22);
    });
  });

  test('Click login button', async () => {
    await test.step('Click login button', async () => {
      await runTestStep('Click login button', async () => {
        console.log('📝 Executing: Click login button...');
        await managers.viola_test_1.clickLoginButton(config);
        console.log('✅ Completed: Click login button');
      }, page, 22);
    });
  });

  test('Click field', async () => {
    await test.step('Click field', async () => {
      await runTestStep('Click field', async () => {
        console.log('📝 Executing: Click field...');
        await managers.viola_test_1.clickField(config);
        console.log('✅ Completed: Click field');
      }, page, 22);
    });
  });

  test('Click field 2', async () => {
    await test.step('Click field 2', async () => {
      await runTestStep('Click field 2', async () => {
        console.log('📝 Executing: Click field 2...');
        await managers.viola_test_1.clickField2(config);
        console.log('✅ Completed: Click field 2');
      }, page, 22);
    });
  });

  test('Click field 3', async () => {
    await test.step('Click field 3', async () => {
      await runTestStep('Click field 3', async () => {
        console.log('📝 Executing: Click field 3...');
        await managers.viola_test_1.clickField3(config);
        console.log('✅ Completed: Click field 3');
      }, page, 22);
    });
  });

  test('Click field 4', async () => {
    await test.step('Click field 4', async () => {
      await runTestStep('Click field 4', async () => {
        console.log('📝 Executing: Click field 4...');
        await managers.viola_test_1.clickField4(config);
        console.log('✅ Completed: Click field 4');
      }, page, 22);
    });
  });

  test('Click create button', async () => {
    await test.step('Click create button', async () => {
      await runTestStep('Click create button', async () => {
        console.log('📝 Executing: Click create button...');
        await managers.viola_test_1.clickCreateButton(config);
        console.log('✅ Completed: Click create button');
      }, page, 22);
    });
  });

  test('Click element', async () => {
    await test.step('Click element', async () => {
      await runTestStep('Click element', async () => {
        console.log('📝 Executing: Click element...');
        await managers.viola_test_1.clickElement(config);
        console.log('✅ Completed: Click element');
      }, page, 22);
    });
  });

  test('Click confirm', async () => {
    await test.step('Click confirm', async () => {
      await runTestStep('Click confirm', async () => {
        console.log('📝 Executing: Click confirm...');
        await managers.viola_test_1.clickConfirm(config);
        console.log('✅ Completed: Click confirm');
      }, page, 22);
    });
  });

  test('Fill name', async () => {
    await test.step('Fill name', async () => {
      await runTestStep('Fill name', async () => {
        console.log('📝 Executing: Fill name...');
        await managers.viola_test_1.fillNameTextbox(config);
        console.log('✅ Completed: Fill name');
      }, page, 22);
    });
  });

  test('Click confirm button', async () => {
    await test.step('Click confirm button', async () => {
      await runTestStep('Click confirm button', async () => {
        console.log('📝 Executing: Click confirm button...');
        await managers.viola_test_1.clickConfirmButton(config);
        console.log('✅ Completed: Click confirm button');
      }, page, 22);
    });
  });

  test('Click field 5', async () => {
    await test.step('Click field 5', async () => {
      await runTestStep('Click field 5', async () => {
        console.log('📝 Executing: Click field 5...');
        await managers.viola_test_1.clickField5(config);
        console.log('✅ Completed: Click field 5');
      }, page, 22);
    });
  });

  test('Click field 6', async () => {
    await test.step('Click field 6', async () => {
      await runTestStep('Click field 6', async () => {
        console.log('📝 Executing: Click field 6...');
        await managers.viola_test_1.clickField6(config);
        console.log('✅ Completed: Click field 6');
      }, page, 22);
    });
  });

  test('Click create button 2', async () => {
    await test.step('Click create button 2', async () => {
      await runTestStep('Click create button 2', async () => {
        console.log('📝 Executing: Click create button 2...');
        await managers.viola_test_1.clickCreateButton2(config);
        console.log('✅ Completed: Click create button 2');
      }, page, 22);
    });
  });

  test('Fill name 2', async () => {
    await test.step('Fill name 2', async () => {
      await runTestStep('Fill name 2', async () => {
        console.log('📝 Executing: Fill name 2...');
        await managers.viola_test_1.fillNameTextbox2(config);
        console.log('✅ Completed: Fill name 2');
      }, page, 22);
    });
  });

  test('Click element 2', async () => {
    await test.step('Click element 2', async () => {
      await runTestStep('Click element 2', async () => {
        console.log('📝 Executing: Click element 2...');
        await managers.viola_test_1.clickElement2(config);
        console.log('✅ Completed: Click element 2');
      }, page, 22);
    });
  });

  test('Click element 3', async () => {
    await test.step('Click element 3', async () => {
      await runTestStep('Click element 3', async () => {
        console.log('📝 Executing: Click element 3...');
        await managers.viola_test_1.clickElement3(config);
        console.log('✅ Completed: Click element 3');
      }, page, 22);
    });
  });

  test('Click element 4', async () => {
    await test.step('Click element 4', async () => {
      await runTestStep('Click element 4', async () => {
        console.log('📝 Executing: Click element 4...');
        await managers.viola_test_1.clickElement4(config);
        console.log('✅ Completed: Click element 4');
      }, page, 22);
    });
  });

  test('Click field 7', async () => {
    await test.step('Click field 7', async () => {
      await runTestStep('Click field 7', async () => {
        console.log('📝 Executing: Click field 7...');
        await managers.viola_test_1.clickField7(config);
        console.log('✅ Completed: Click field 7');
      }, page, 22);
    });
  });
});
