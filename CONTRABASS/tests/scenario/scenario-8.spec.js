import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import AutoRecorded_scenario_5 from '../../lib/classes/AutoRecorded_scenario_5.js';

const allPlannedTestCases = [
  { name: '페이지 이동', status: 'pending' },
  { name: '비밀번호를 입력해 주세요 입력', status: 'pending' },
  { name: '비밀번호를 입력해 주세요 입력 2', status: 'pending' },
  { name: '로그인 버튼 클릭', status: 'pending' },
  { name: '확인 버튼 클릭', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    autoRecorded_scenario_5: new AutoRecorded_scenario_5(page)
  };
}

test.describe.serial('시나리오 8: scenario 5', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 8, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 8, '시나리오 8: scenario 5', 'CONTRABASS');
  });

  test('페이지 이동', async () => {
    await test.step('페이지 이동', async () => {
      await runTestStep('페이지 이동', async () => {
        console.log('📝 Executing: 페이지 이동...');
        await managers.autoRecorded_scenario_5.navigateToPage(config);
        console.log('✅ Completed: 페이지 이동');
      }, page, 8);
    });
  });

  test('비밀번호를 입력해 주세요 입력', async () => {
    await test.step('비밀번호를 입력해 주세요 입력', async () => {
      await runTestStep('비밀번호를 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
        await managers.autoRecorded_scenario_5.fillPasswordInputTextbox(config);
        console.log('✅ Completed: 비밀번호를 입력해 주세요 입력');
      }, page, 8);
    });
  });

  test('비밀번호를 입력해 주세요 입력 2', async () => {
    await test.step('비밀번호를 입력해 주세요 입력 2', async () => {
      await runTestStep('비밀번호를 입력해 주세요 입력 2', async () => {
        console.log('📝 Executing: 비밀번호를 입력해 주세요 입력 2...');
        await managers.autoRecorded_scenario_5.fillPasswordInputTextbox2(config);
        console.log('✅ Completed: 비밀번호를 입력해 주세요 입력 2');
      }, page, 8);
    });
  });

  test('로그인 버튼 클릭', async () => {
    await test.step('로그인 버튼 클릭', async () => {
      await runTestStep('로그인 버튼 클릭', async () => {
        console.log('📝 Executing: 로그인 버튼 클릭...');
        await managers.autoRecorded_scenario_5.clickLoginButton(config);
        console.log('✅ Completed: 로그인 버튼 클릭');
      }, page, 8);
    });
  });

  test('확인 버튼 클릭', async () => {
    await test.step('확인 버튼 클릭', async () => {
      await runTestStep('확인 버튼 클릭', async () => {
        console.log('📝 Executing: 확인 버튼 클릭...');
        await managers.autoRecorded_scenario_5.clickConfirmButton(config);
        console.log('✅ Completed: 확인 버튼 클릭');
      }, page, 8);
    });
  });
});
