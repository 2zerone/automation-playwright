import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import test_001 from '../../lib/classes/test_001.js';

const allPlannedTestCases = [
  { name: '페이지 이동', status: 'pending' },
  { name: '아이디를 입력해 주세요 입력', status: 'pending' },
  { name: '비밀번호를 입력해 주세요 입력', status: 'pending' },
  { name: '로그인 버튼 클릭', status: 'pending' },
  { name: 'Okestro OKESTRO unfold_more 버튼 클릭', status: 'pending' },
  { name: '요소 클릭', status: 'pending' },
  { name: '목동(allinone) 버튼 클릭', status: 'pending' },
  { name: '전체 프로젝트 버튼 클릭', status: 'pending' },
  { name: '선택 버튼 클릭', status: 'pending' },
  { name: '요소 클릭 2', status: 'pending' },
  { name: '인스턴스 메뉴 클릭', status: 'pending' },
  { name: 'add 생성 버튼 클릭', status: 'pending' },
  { name: '이름을 입력해 주세요 입력', status: 'pending' },
  { name: '항목 이름 또는 값을 입력해 주세요 입력', status: 'pending' },
  { name: '엔터 키 누르기', status: 'pending' },
  { name: 'folder QA a10de7c81554455cad94c00aee1819a2 체크', status: 'pending' },
  { name: '다음 버튼 클릭', status: 'pending' },
  { name: '항목 이름 또는 값을 입력해 주세요 입력 2', status: 'pending' },
  { name: '엔터 키 누르기 2', status: 'pending' },
  { name: 'ubuntu-24.04-kubespray ACTIVE 체크', status: 'pending' },
  { name: '볼륨을 입력해 주세요 입력', status: 'pending' },
  { name: '요소 클릭 3', status: 'pending' },
  { name: 'keyboard_arrow_right 버튼 클릭', status: 'pending' },
  { name: '4C8M 4 Core 8.0 GiB 0.0 GiB 체크', status: 'pending' },
  { name: '다음 버튼 클릭 2', status: 'pending' },
  { name: '고정 IP 추가 버튼 클릭', status: 'pending' },
  { name: '항목 이름 또는 값을 입력해 주세요 입력 3', status: 'pending' },
  { name: '엔터 키 누르기 3', status: 'pending' },
  { name: 'QA-segment ACTIVE 1 Yes No 체크', status: 'pending' },
  { name: '추가 버튼 클릭', status: 'pending' },
  { name: '다음 버튼 클릭 3', status: 'pending' }
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    test_001: new test_001(page)
  };
}

test.describe.serial('시나리오 12: test 001', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 12, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, 12, '시나리오 12: test 001', 'CONTRABASS');
  });

  test('페이지 이동', async () => {
    await test.step('페이지 이동', async () => {
      await runTestStep('페이지 이동', async () => {
        console.log('📝 Executing: 페이지 이동...');
        await managers.test_001.navigateToPage(config);
        console.log('✅ Completed: 페이지 이동');
      }, page, 12);
    });
  });

  test('아이디를 입력해 주세요 입력', async () => {
    await test.step('아이디를 입력해 주세요 입력', async () => {
      await runTestStep('아이디를 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 아이디를 입력해 주세요 입력...');
        await managers.test_001.fillUsernameTextbox(config);
        console.log('✅ Completed: 아이디를 입력해 주세요 입력');
      }, page, 12);
    });
  });

  test('비밀번호를 입력해 주세요 입력', async () => {
    await test.step('비밀번호를 입력해 주세요 입력', async () => {
      await runTestStep('비밀번호를 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 비밀번호를 입력해 주세요 입력...');
        await managers.test_001.fillPasswordTextbox(config);
        console.log('✅ Completed: 비밀번호를 입력해 주세요 입력');
      }, page, 12);
    });
  });

  test('로그인 버튼 클릭', async () => {
    await test.step('로그인 버튼 클릭', async () => {
      await runTestStep('로그인 버튼 클릭', async () => {
        console.log('📝 Executing: 로그인 버튼 클릭...');
        await managers.test_001.clickLoginButton(config);
        console.log('✅ Completed: 로그인 버튼 클릭');
      }, page, 12);
    });
  });

  test('Okestro OKESTRO unfold_more 버튼 클릭', async () => {
    await test.step('Okestro OKESTRO unfold_more 버튼 클릭', async () => {
      await runTestStep('Okestro OKESTRO unfold_more 버튼 클릭', async () => {
        console.log('📝 Executing: Okestro OKESTRO unfold_more 버튼 클릭...');
        await managers.test_001.clickOkestrookestrounfoldmoreButton(config);
        console.log('✅ Completed: Okestro OKESTRO unfold_more 버튼 클릭');
      }, page, 12);
    });
  });

  test('요소 클릭', async () => {
    await test.step('요소 클릭', async () => {
      await runTestStep('요소 클릭', async () => {
        console.log('📝 Executing: 요소 클릭...');
        await managers.test_001.clickElement(config);
        console.log('✅ Completed: 요소 클릭');
      }, page, 12);
    });
  });

  test('목동(allinone) 버튼 클릭', async () => {
    await test.step('목동(allinone) 버튼 클릭', async () => {
      await runTestStep('목동(allinone) 버튼 클릭', async () => {
        console.log('📝 Executing: 목동(allinone) 버튼 클릭...');
        await managers.test_001.clickFieldButton(config);
        console.log('✅ Completed: 목동(allinone) 버튼 클릭');
      }, page, 12);
    });
  });

  test('전체 프로젝트 버튼 클릭', async () => {
    await test.step('전체 프로젝트 버튼 클릭', async () => {
      await runTestStep('전체 프로젝트 버튼 클릭', async () => {
        console.log('📝 Executing: 전체 프로젝트 버튼 클릭...');
        await managers.test_001.clickFieldButton2(config);
        console.log('✅ Completed: 전체 프로젝트 버튼 클릭');
      }, page, 12);
    });
  });

  test('선택 버튼 클릭', async () => {
    await test.step('선택 버튼 클릭', async () => {
      await runTestStep('선택 버튼 클릭', async () => {
        console.log('📝 Executing: 선택 버튼 클릭...');
        await managers.test_001.clickFieldButton3(config);
        console.log('✅ Completed: 선택 버튼 클릭');
      }, page, 12);
    });
  });

  test('요소 클릭 2', async () => {
    await test.step('요소 클릭 2', async () => {
      await runTestStep('요소 클릭 2', async () => {
        console.log('📝 Executing: 요소 클릭 2...');
        await managers.test_001.clickElement2(config);
        console.log('✅ Completed: 요소 클릭 2');
      }, page, 12);
    });
  });

  test('인스턴스 메뉴 클릭', async () => {
    await test.step('인스턴스 메뉴 클릭', async () => {
      await runTestStep('인스턴스 메뉴 클릭', async () => {
        console.log('📝 Executing: 인스턴스 메뉴 클릭...');
        await managers.test_001.clickFieldMenuitem(config);
        console.log('✅ Completed: 인스턴스 메뉴 클릭');
      }, page, 12);
    });
  });

  test('add 생성 버튼 클릭', async () => {
    await test.step('add 생성 버튼 클릭', async () => {
      await runTestStep('add 생성 버튼 클릭', async () => {
        console.log('📝 Executing: add 생성 버튼 클릭...');
        await managers.test_001.clickCreateButton(config);
        console.log('✅ Completed: add 생성 버튼 클릭');
      }, page, 12);
    });
  });

  test('이름을 입력해 주세요 입력', async () => {
    await test.step('이름을 입력해 주세요 입력', async () => {
      await runTestStep('이름을 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 이름을 입력해 주세요 입력...');
        await managers.test_001.fillNameTextbox(config);
        console.log('✅ Completed: 이름을 입력해 주세요 입력');
      }, page, 12);
    });
  });

  test('항목 이름 또는 값을 입력해 주세요 입력', async () => {
    await test.step('항목 이름 또는 값을 입력해 주세요 입력', async () => {
      await runTestStep('항목 이름 또는 값을 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 항목 이름 또는 값을 입력해 주세요 입력...');
        await managers.test_001.fillNameTextbox2(config);
        console.log('✅ Completed: 항목 이름 또는 값을 입력해 주세요 입력');
      }, page, 12);
    });
  });

  test('엔터 키 누르기', async () => {
    await test.step('엔터 키 누르기', async () => {
      await runTestStep('엔터 키 누르기', async () => {
        console.log('📝 Executing: 엔터 키 누르기...');
        await managers.test_001.pressEnterKey(config);
        console.log('✅ Completed: 엔터 키 누르기');
      }, page, 12);
    });
  });

  test('folder QA a10de7c81554455cad94c00aee1819a2 체크', async () => {
    await test.step('folder QA a10de7c81554455cad94c00aee1819a2 체크', async () => {
      await runTestStep('folder QA a10de7c81554455cad94c00aee1819a2 체크', async () => {
        console.log('📝 Executing: folder QA a10de7c81554455cad94c00aee1819a2 체크...');
        await managers.test_001.checkCheckbox(config);
        console.log('✅ Completed: folder QA a10de7c81554455cad94c00aee1819a2 체크');
      }, page, 12);
    });
  });

  test('다음 버튼 클릭', async () => {
    await test.step('다음 버튼 클릭', async () => {
      await runTestStep('다음 버튼 클릭', async () => {
        console.log('📝 Executing: 다음 버튼 클릭...');
        await managers.test_001.clickFieldButton4(config);
        console.log('✅ Completed: 다음 버튼 클릭');
      }, page, 12);
    });
  });

  test('항목 이름 또는 값을 입력해 주세요 입력 2', async () => {
    await test.step('항목 이름 또는 값을 입력해 주세요 입력 2', async () => {
      await runTestStep('항목 이름 또는 값을 입력해 주세요 입력 2', async () => {
        console.log('📝 Executing: 항목 이름 또는 값을 입력해 주세요 입력 2...');
        await managers.test_001.fillNameTextbox3(config);
        console.log('✅ Completed: 항목 이름 또는 값을 입력해 주세요 입력 2');
      }, page, 12);
    });
  });

  test('엔터 키 누르기 2', async () => {
    await test.step('엔터 키 누르기 2', async () => {
      await runTestStep('엔터 키 누르기 2', async () => {
        console.log('📝 Executing: 엔터 키 누르기 2...');
        await managers.test_001.pressEnterKey2(config);
        console.log('✅ Completed: 엔터 키 누르기 2');
      }, page, 12);
    });
  });

  test('ubuntu-24.04-kubespray ACTIVE 체크', async () => {
    await test.step('ubuntu-24.04-kubespray ACTIVE 체크', async () => {
      await runTestStep('ubuntu-24.04-kubespray ACTIVE 체크', async () => {
        console.log('📝 Executing: ubuntu-24.04-kubespray ACTIVE 체크...');
        await managers.test_001.checkCheckbox2(config);
        console.log('✅ Completed: ubuntu-24.04-kubespray ACTIVE 체크');
      }, page, 12);
    });
  });

  test('볼륨을 입력해 주세요 입력', async () => {
    await test.step('볼륨을 입력해 주세요 입력', async () => {
      await runTestStep('볼륨을 입력해 주세요 입력', async () => {
        console.log('📝 Executing: 볼륨을 입력해 주세요 입력...');
        await managers.test_001.fillFieldSpinbutton(config);
        console.log('✅ Completed: 볼륨을 입력해 주세요 입력');
      }, page, 12);
    });
  });

  test('요소 클릭 3', async () => {
    await test.step('요소 클릭 3', async () => {
      await runTestStep('요소 클릭 3', async () => {
        console.log('📝 Executing: 요소 클릭 3...');
        await managers.test_001.clickElement3(config);
        console.log('✅ Completed: 요소 클릭 3');
      }, page, 12);
    });
  });

  test('keyboard_arrow_right 버튼 클릭', async () => {
    await test.step('keyboard_arrow_right 버튼 클릭', async () => {
      await runTestStep('keyboard_arrow_right 버튼 클릭', async () => {
        console.log('📝 Executing: keyboard_arrow_right 버튼 클릭...');
        await managers.test_001.clickKeyboardarrowrightButton(config);
        console.log('✅ Completed: keyboard_arrow_right 버튼 클릭');
      }, page, 12);
    });
  });

  test('4C8M 4 Core 8.0 GiB 0.0 GiB 체크', async () => {
    await test.step('4C8M 4 Core 8.0 GiB 0.0 GiB 체크', async () => {
      await runTestStep('4C8M 4 Core 8.0 GiB 0.0 GiB 체크', async () => {
        console.log('📝 Executing: 4C8M 4 Core 8.0 GiB 0.0 GiB 체크...');
        await managers.test_001.checkCheckbox3(config);
        console.log('✅ Completed: 4C8M 4 Core 8.0 GiB 0.0 GiB 체크');
      }, page, 12);
    });
  });

  test('다음 버튼 클릭 2', async () => {
    await test.step('다음 버튼 클릭 2', async () => {
      await runTestStep('다음 버튼 클릭 2', async () => {
        console.log('📝 Executing: 다음 버튼 클릭 2...');
        await managers.test_001.clickFieldButton5(config);
        console.log('✅ Completed: 다음 버튼 클릭 2');
      }, page, 12);
    });
  });

  test('고정 IP 추가 버튼 클릭', async () => {
    await test.step('고정 IP 추가 버튼 클릭', async () => {
      await runTestStep('고정 IP 추가 버튼 클릭', async () => {
        console.log('📝 Executing: 고정 IP 추가 버튼 클릭...');
        await managers.test_001.clickAddButton(config);
        console.log('✅ Completed: 고정 IP 추가 버튼 클릭');
      }, page, 12);
    });
  });

  test('항목 이름 또는 값을 입력해 주세요 입력 3', async () => {
    await test.step('항목 이름 또는 값을 입력해 주세요 입력 3', async () => {
      await runTestStep('항목 이름 또는 값을 입력해 주세요 입력 3', async () => {
        console.log('📝 Executing: 항목 이름 또는 값을 입력해 주세요 입력 3...');
        await managers.test_001.fillNameTextbox4(config);
        console.log('✅ Completed: 항목 이름 또는 값을 입력해 주세요 입력 3');
      }, page, 12);
    });
  });

  test('엔터 키 누르기 3', async () => {
    await test.step('엔터 키 누르기 3', async () => {
      await runTestStep('엔터 키 누르기 3', async () => {
        console.log('📝 Executing: 엔터 키 누르기 3...');
        await managers.test_001.pressEnterKey3(config);
        console.log('✅ Completed: 엔터 키 누르기 3');
      }, page, 12);
    });
  });

  test('QA-segment ACTIVE 1 Yes No 체크', async () => {
    await test.step('QA-segment ACTIVE 1 Yes No 체크', async () => {
      await runTestStep('QA-segment ACTIVE 1 Yes No 체크', async () => {
        console.log('📝 Executing: QA-segment ACTIVE 1 Yes No 체크...');
        await managers.test_001.checkCheckbox4(config);
        console.log('✅ Completed: QA-segment ACTIVE 1 Yes No 체크');
      }, page, 12);
    });
  });

  test('추가 버튼 클릭', async () => {
    await test.step('추가 버튼 클릭', async () => {
      await runTestStep('추가 버튼 클릭', async () => {
        console.log('📝 Executing: 추가 버튼 클릭...');
        await managers.test_001.clickAddButton2(config);
        console.log('✅ Completed: 추가 버튼 클릭');
      }, page, 12);
    });
  });

  test('다음 버튼 클릭 3', async () => {
    await test.step('다음 버튼 클릭 3', async () => {
      await runTestStep('다음 버튼 클릭 3', async () => {
        console.log('📝 Executing: 다음 버튼 클릭 3...');
        await managers.test_001.clickFieldButton6(config);
        console.log('✅ Completed: 다음 버튼 클릭 3');
      }, page, 12);
    });
  });
});
