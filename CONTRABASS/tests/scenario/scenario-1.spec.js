import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import LoginManager from '../../lib/classes/LoginManager.js';
import InstanceCreateManager from '../../lib/classes/InstanceCreateManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONTRABASS 시나리오 1: 로그인 및 인스턴스 생성
const allPlannedTestCases = [
  { name: '로그인 페이지 접근', status: 'pending' },
  { name: '로그인 정보 입력', status: 'pending' },
  { name: '로그인 실행 및 성공 확인', status: 'pending' },
  { name: '인스턴스 생성 페이지 이동', status: 'pending' },
  { name: '기본 정보 입력', status: 'pending' },
  { name: '인스턴스 사양 입력', status: 'pending' },
  { name: '세그먼트 입력', status: 'pending' },
  { name: '보안 입력', status: 'pending' },
  { name: '항목 선택', status: 'pending' },
  { name: '인스턴스 생성 확인', status: 'pending' }
];

// 테스트 결과 초기화
initializeTestResults(allPlannedTestCases);

// 매니저 클래스들을 초기화하는 함수
function initializeManagers(page) {
  return {
    loginManager: new LoginManager(page),
    instanceCreateManager: new InstanceCreateManager(page)
  };
}

// CONTRABASS 시나리오 1: 로그인 및 인스턴스 생성
test.describe.serial('시나리오 1: 로그인 및 인스턴스 생성', () => {
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
    const productName = path.basename(path.dirname(path.dirname(__dirname))).toUpperCase();
    await setupScenarioAfterAll(page, browser, 1, '시나리오 1: 로그인 및 인스턴스 생성', productName);
  });

  // ===== 로그인 단계 =====
  test('로그인 페이지 접근', async () => {
    await test.step('로그인 페이지 접근', async () => {
      await runTestStep('로그인 페이지 접근', async () => {
        console.log('🌐 로그인 페이지 접근 중...');
        await managers.loginManager.navigateToLoginPage();
        console.log('✅ 로그인 페이지 접근 완료');
      }, page, 1);
    });
  });

  test('로그인 정보 입력', async () => {
    await test.step('로그인 정보 입력', async () => {
      await runTestStep('로그인 정보 입력', async () => {
        console.log('📝 로그인 정보 입력 중...');
        await managers.loginManager.fillLoginCredentials(config);
        console.log('✅ 로그인 정보 입력 완료');
      }, page, 1);
    });
  });

  test('로그인 실행 및 성공 확인', async () => {
    await test.step('로그인 실행 및 성공 확인', async () => {
      await runTestStep('로그인 실행 및 성공 확인', async () => {
        console.log('🚀 로그인 실행 및 성공 확인 중...');
        await managers.loginManager.submitLoginAndVerify();
        console.log('✅ 로그인 실행 및 성공 확인 완료');
      }, page, 1);
    });
  });

  // ===== 인스턴스 생성 단계 =====
  test('인스턴스 생성 페이지 이동', async () => {
    await test.step('인스턴스 생성 페이지 이동', async () => {
      await runTestStep('인스턴스 생성 페이지 이동', async () => {
        console.log('🌐 인스턴스 생성 페이지 이동 중...');
        await managers.instanceCreateManager.navigateToInstanceCreate(config);
        console.log('✅ 인스턴스 생성 페이지 이동 완료');
      }, page, 1);
    });
  });

  test('기본 정보 입력', async () => {
    await test.step('기본 정보 입력', async () => {
      await runTestStep('기본 정보 입력', async () => {
        console.log('✍️ 기본 정보 입력 중...');
        await managers.instanceCreateManager.basicInformation(config);
        console.log('✅ 기본 정보 입력 완료');
      }, page, 1);
    });
  });

  test('인스턴스 사양 입력', async () => {
    await test.step('인스턴스 사양 입력', async () => {
      await runTestStep('인스턴스 사양 입력', async () => {
        console.log('🔧 인스턴스 사양 입력 중...');
        await managers.instanceCreateManager.InstanceType(config);
        console.log('✅ 인스턴스 사양 입력 완료');
      }, page, 1);
    });
  });

  test('세그먼트 입력', async () => {
    await test.step('세그먼트 입력', async () => {
      await runTestStep('세그먼트 입력', async () => {
        console.log('🌐 세그먼트 입력 중...');
        await managers.instanceCreateManager.segmentConfig(config);
        console.log('✅ 세그먼트 입력 완료');
      }, page, 1);
    });
  });

  test('보안 입력', async () => {
    await test.step('보안 입력', async () => {
      await runTestStep('보안 입력', async () => {
        console.log('🔒 보안 입력 중...');
        await managers.instanceCreateManager.securityConfig(config);
        console.log('✅ 보안 입력 완료');
      }, page, 1);
    });
  });

  test('항목 선택', async () => {
    await test.step('항목 선택', async () => {
      await runTestStep('항목 선택', async () => {
        console.log('🖱️ 항목 선택 중...');
        await managers.instanceCreateManager.additionalConfig(config);
        console.log('✅ 항목 선택 완료');
      }, page, 1);
    });
  });

  test('인스턴스 생성 확인', async () => {
    await test.step('인스턴스 생성 확인', async () => {
      await runTestStep('인스턴스 생성 확인', async () => {
        console.log('🔍 인스턴스 생성 확인 중...');
        await managers.instanceCreateManager.instanceCreateConfirm(config);
        console.log('✅ 인스턴스 생성 확인 완료');
      }, page, 1);
    });
  });
});
