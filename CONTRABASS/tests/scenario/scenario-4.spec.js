import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import AutoRecorded_test_tt from '../../lib/classes/AutoRecorded_test_tt.js';

const allPlannedTestCases = [
  { name: '아이디를 입력해 주세요 입력', status: 'pending' },
  { name: '비밀번호를 입력해 주세요 입력', status: 'pending' },
  { name: '로그인 버튼 클릭', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    autoRecorded_test_tt: new AutoRecorded_test_tt(page)
  };
}

test.describe.serial('시나리오 4: test tt', () => {
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
    await setupScenarioAfterAll(page, browser, 4, '시나리오 4: test tt', 'CONTRABASS');
  });

  test('아이디를 입력해 주세요 입력', async () => {
    await test.step('아이디를 입력해 주세요 입력', async () => {
      await runTestStep('아이디를 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 아이디를 입력해 주세요 입력...');
        await managers.autoRecorded_test_tt.2(config);
        console.log('✅ Completed: 아이디를 입력해 주세요 입력');
      }, page, 4);
    });
  });

  test('비밀번호를 입력해 주세요 입력', async () => {
    await test.step('비밀번호를 입력해 주세요 입력', async () => {
      await runTestStep('비밀번호를 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
        await managers.autoRecorded_test_tt.3(config);
        console.log('✅ Completed: 비밀번호를 입력해 주세요 입력');
      }, page, 4);
    });
  });

  test('로그인 버튼 클릭', async () => {
    await test.step('로그인 버튼 클릭', async () => {
      await runTestStep('로그인 버튼 클릭', async () => {
        console.log('📝 Executing: 로그인 버튼 클릭...');
        await managers.autoRecorded_test_tt.4(config);
        console.log('✅ Completed: 로그인 버튼 클릭');
      }, page, 4);
    });
  });
});
