import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import test_001 from '../../lib/classes/test_001.js';

const allPlannedTestCases = [
  { name: '페이지 이동', status: 'pending' },
  { name: '아이디를 입력해 주세요 입력', status: 'pending' },
  { name: '비밀번호를 입력해 주세요 입력', status: 'pending' },
  { name: 'ControlOrMeta+a 키 누르기', status: 'pending' },
  { name: '비밀번호를 입력해 주세요 입력 2', status: 'pending' },
  { name: '로그인 버튼 클릭', status: 'pending' },
  { name: '워크플로우 클릭', status: 'pending' },
  { name: '워크로드 클릭', status: 'pending' },
  { name: '컨테이너 관리 클릭', status: 'pending' },
  { name: '작업 관리 메뉴 클릭', status: 'pending' },
  { name: '구성 관리 클릭', status: 'pending' },
  { name: '오토스케일러 클릭', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    test_001: new test_001(page)
  };
}

test.describe.serial('시나리오 23: test 001', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 23, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 23, '시나리오 23: test 001', 'VIOLA');
  });

  test('페이지 이동', async () => {
    await test.step('페이지 이동', async () => {
      await runTestStep('페이지 이동', async () => {
        console.log('📝 Executing: 페이지 이동...');
        await managers.test_001.navigateToPage(config);
        console.log('✅ Completed: 페이지 이동');
      }, page, 23);
    });
  });

  test('아이디를 입력해 주세요 입력', async () => {
    await test.step('아이디를 입력해 주세요 입력', async () => {
      await runTestStep('아이디를 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 아이디를 입력해 주세요 입력...');
        await managers.test_001.fillUsernameTextbox(config);
        console.log('✅ Completed: 아이디를 입력해 주세요 입력');
      }, page, 23);
    });
  });

  test('비밀번호를 입력해 주세요 입력', async () => {
    await test.step('비밀번호를 입력해 주세요 입력', async () => {
      await runTestStep('비밀번호를 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
        await managers.test_001.fillPasswordTextbox(config);
        console.log('✅ Completed: 비밀번호를 입력해 주세요 입력');
      }, page, 23);
    });
  });

  test('ControlOrMeta+a 키 누르기', async () => {
    await test.step('ControlOrMeta+a 키 누르기', async () => {
      await runTestStep('ControlOrMeta+a 키 누르기', async () => {
        console.log('📝 Executing: ControlOrMeta+a 키 누르기...');
        await managers.test_001.pressControlOrMetaaKey(config);
        console.log('✅ Completed: ControlOrMeta+a 키 누르기');
      }, page, 23);
    });
  });

  test('비밀번호를 입력해 주세요 입력 2', async () => {
    await test.step('비밀번호를 입력해 주세요 입력 2', async () => {
      await runTestStep('비밀번호를 입력해 주세요 입력 2', async () => {
        console.log('📝 Executing: 비밀번호를 입력해 주세요 입력 2...');
        await managers.test_001.fillPasswordTextbox2(config);
        console.log('✅ Completed: 비밀번호를 입력해 주세요 입력 2');
      }, page, 23);
    });
  });

  test('로그인 버튼 클릭', async () => {
    await test.step('로그인 버튼 클릭', async () => {
      await runTestStep('로그인 버튼 클릭', async () => {
        console.log('📝 Executing: 로그인 버튼 클릭...');
        await managers.test_001.clickLoginButton(config);
        console.log('✅ Completed: 로그인 버튼 클릭');
      }, page, 23);
    });
  });

  test('워크플로우 클릭', async () => {
    await test.step('워크플로우 클릭', async () => {
      await runTestStep('워크플로우 클릭', async () => {
        console.log('📝 Executing: 워크플로우 클릭...');
        await managers.test_001.clickField(config);
        console.log('✅ Completed: 워크플로우 클릭');
      }, page, 23);
    });
  });

  test('워크로드 클릭', async () => {
    await test.step('워크로드 클릭', async () => {
      await runTestStep('워크로드 클릭', async () => {
        console.log('📝 Executing: 워크로드 클릭...');
        await managers.test_001.clickField2(config);
        console.log('✅ Completed: 워크로드 클릭');
      }, page, 23);
    });
  });

  test('컨테이너 관리 클릭', async () => {
    await test.step('컨테이너 관리 클릭', async () => {
      await runTestStep('컨테이너 관리 클릭', async () => {
        console.log('📝 Executing: 컨테이너 관리 클릭...');
        await managers.test_001.clickField3(config);
        console.log('✅ Completed: 컨테이너 관리 클릭');
      }, page, 23);
    });
  });

  test('작업 관리 메뉴 클릭', async () => {
    await test.step('작업 관리 메뉴 클릭', async () => {
      await runTestStep('작업 관리 메뉴 클릭', async () => {
        console.log('📝 Executing: 작업 관리 메뉴 클릭...');
        await managers.test_001.clickFieldMenuitem(config);
        console.log('✅ Completed: 작업 관리 메뉴 클릭');
      }, page, 23);
    });
  });

  test('구성 관리 클릭', async () => {
    await test.step('구성 관리 클릭', async () => {
      await runTestStep('구성 관리 클릭', async () => {
        console.log('📝 Executing: 구성 관리 클릭...');
        await managers.test_001.clickField4(config);
        console.log('✅ Completed: 구성 관리 클릭');
      }, page, 23);
    });
  });

  test('오토스케일러 클릭', async () => {
    await test.step('오토스케일러 클릭', async () => {
      await runTestStep('오토스케일러 클릭', async () => {
        console.log('📝 Executing: 오토스케일러 클릭...');
        await managers.test_001.clickField5(config);
        console.log('✅ Completed: 오토스케일러 클릭');
      }, page, 23);
    });
  });
});
