import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import LoginManager from '../../lib/classes/LoginManager.js';
import LoadBalancerCreateManager from '../../lib/classes/LoadBalancerCreateManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONTRABASS 시나리오 2: 로그인 및 로드밸런서 생성
const allPlannedTestCases = [
  { name: '로그인 페이지 접근', status: 'pending' },
  { name: '로그인 정보 입력', status: 'pending' },
  { name: '로그인 실행 및 성공 확인', status: 'pending' },
  { name: '로드밸런서 메뉴 접근', status: 'pending' },
  { name: '기본 정보 입력', status: 'pending' },
  { name: '리스너 입력', status: 'pending' },
  { name: '풀 입력', status: 'pending' },
  { name: '풀멤버 입력', status: 'pending' },
  { name: '헬스체크 입력', status: 'pending' },
  { name: '로드밸런서 생성 확인', status: 'pending' }
];

// 테스트 결과 초기화
initializeTestResults(allPlannedTestCases);

// 매니저 클래스들을 초기화하는 함수
function initializeManagers(page) {
      return {
    loginManager: new LoginManager(page),
    loadBalancerCreateManager: new LoadBalancerCreateManager(page)
  };
}

// CONTRABASS 시나리오 2: 로그인 및 로드밸런서 생성
test.describe.serial('시나리오 2: 로그인 및 로드밸런서 생성', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, 2, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    const productName = path.basename(path.dirname(path.dirname(__dirname))).toUpperCase();
    await setupScenarioAfterAll(page, browser, 2, '시나리오 2: 로그인 및 로드밸런서 생성', productName);
  });

  // ===== 로그인 단계 =====
  test('로그인 페이지 접근', async () => {
    await test.step('로그인 페이지 접근', async () => {
      await runTestStep('로그인 페이지 접근', async () => {
        console.log('🌐 로그인 페이지 접근 중...');
        await managers.loginManager.navigateToLoginPage();
        console.log('✅ 로그인 페이지 접근 완료');
      }, page, 2);
    });
  });

  test('로그인 정보 입력', async () => {
    await test.step('로그인 정보 입력', async () => {
      await runTestStep('로그인 정보 입력', async () => {
        console.log('📝 로그인 정보 입력 중...');
        await managers.loginManager.fillLoginCredentials(config);
        console.log('✅ 로그인 정보 입력 완료');
      }, page, 2);
    });
  });

  test('로그인 실행 및 성공 확인', async () => {
    await test.step('로그인 실행 및 성공 확인', async () => {
      await runTestStep('로그인 실행 및 성공 확인', async () => {
        console.log('🚀 로그인 실행 및 성공 확인 중...');
        await managers.loginManager.submitLoginAndVerify();
        console.log('✅ 로그인 실행 및 성공 확인 완료');
      }, page, 2);
    });
  });

  // ===== 로드밸런서 생성 단계 =====
  test('로드밸런서 메뉴 접근', async () => {
    await test.step('로드밸런서 메뉴 접근', async () => {
      await runTestStep('로드밸런서 메뉴 접근', async () => {
        console.log('🌐 로드밸런서 메뉴 접근 중...');
        await managers.loadBalancerCreateManager.LoadBalancerAccess(config);
        console.log('✅ 로드밸런서 메뉴 접근 완료');
      }, page, 2);
    });
  });

  test('기본 정보 입력', async () => {
    await test.step('기본 정보 입력', async () => {
      await runTestStep('기본 정보 입력', async () => {
        console.log('✍️ 기본 정보 입력 중...');
        await managers.loadBalancerCreateManager.BasicConfig(config);
        console.log('✅ 기본 정보 입력 완료');
      }, page, 2);
    });
  });

  test('리스너 입력', async () => {
    await test.step('리스너 입력', async () => {
      await runTestStep('리스너 입력', async () => {
        console.log('📝 리스너 입력 중...');
        await managers.loadBalancerCreateManager.listenerConfig(config);
        console.log('✅ 리스너 입력 완료');
      }, page, 2);
    });
  });

  test('풀 입력', async () => {
    await test.step('풀 입력', async () => {
      await runTestStep('풀 입력', async () => {
        console.log('📝 풀 입력 중...');
        await managers.loadBalancerCreateManager.poolConfig(config);
        console.log('✅ 풀 입력 완료');
      }, page, 2);
    });
  });

  test('풀멤버 입력', async () => {
    await test.step('풀멤버 입력', async () => {
      await runTestStep('풀멤버 입력', async () => {
        console.log('📝 풀멤버 입력 중...');
        await managers.loadBalancerCreateManager.poolMemberConfig(config);
        console.log('✅ 풀멤버 입력 완료');
      }, page, 2);
    });
  });

  test('헬스체크 입력', async () => {
    await test.step('헬스체크 입력', async () => {
      await runTestStep('헬스체크 입력', async () => {
        console.log('📝 헬스체크 입력 중...');
        await managers.loadBalancerCreateManager.healthCheckConfig(config);
        console.log('✅ 헬스체크 입력 완료');
      }, page, 2);
    });
  });

  test('로드밸런서 생성 확인', async () => {
    await test.step('로드밸런서 생성 확인', async () => {
      await runTestStep('로드밸런서 생성 확인', async () => {
        console.log('🔍 로드밸런서 생성 확인 중...');
        await managers.loadBalancerCreateManager.confirmLoadBalancerCreate(config);
        console.log('✅ 로드밸런서 생성 확인 완료');
      }, page, 2);
    });
  });
});
