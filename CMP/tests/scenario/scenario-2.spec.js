import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import LoginManager from '../../lib/classes/LoginManager.js';
import aws2Manager from '../../lib/classes/aws2Manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log 오버라이드 - 중복 방지만 처리 (출력은 exec의 child.stdout.on에서 처리)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const loggedMessages = new Set(); // 중복 방지를 위한 Set

console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  // 중복 체크: 같은 메시지가 이미 출력되었으면 스킵
  if (loggedMessages.has(message)) {
    return;
  }
  loggedMessages.add(message);
  
  // 원본 console.log()만 호출 (exec의 child.stdout.on에서 터미널에 출력됨)
  originalConsoleLog.apply(console, args);
};

console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  // 중복 체크
  if (loggedMessages.has(message)) {
    return;
  }
  loggedMessages.add(message);
  
  // 원본 console.error()만 호출 (exec의 child.stderr.on에서 터미널에 출력됨)
  originalConsoleError.apply(console, args);
};

// 글로벌 테스트 타임아웃 설정 (1시간)
test.setTimeout(3600000);

// CMP 시나리오 2: 로그인 및 AWS 대시보드 생성
const allPlannedTestCases = [
  { name: '로그인 페이지 접근', status: 'pending' },
  { name: '로그인 정보 입력', status: 'pending' },
  { name: '로그인 실행 및 성공 확인', status: 'pending' },
  { name: '대시보드 생성', status: 'pending' },
  { name: '위젯 설정', status: 'pending' },
  { name: '메트릭 선택', status: 'pending' },
  { name: '리소스 추가', status: 'pending' },
  { name: '대시보드 확인', status: 'pending' }
];

// 테스트 결과를 저장할 객체
const testResults = {
  status: 'pass',
  error: null,
  testCases: allPlannedTestCases.map(tc => ({ ...tc }))
};

// 테스트 스텝 실행 및 결과 기록 함수
async function runTestStep(stepName, stepFunction, page) {
  let testCase = testResults.testCases.find(tc => tc.name === stepName);
  if (!testCase) {
    testCase = {
      name: stepName,
      status: 'pending',
      startTime: null,
      endTime: null,
      error: null,
      duration: 0,
      logs: [],
      screenshots: []
    };
    testResults.testCases.push(testCase);
  }

  // 테스트 케이스 시작
  testCase.status = 'pending';
  testCase.startTime = new Date().toISOString();
  testCase.error = null;
  testCase.logs = [];
  testCase.screenshots = [];

  const startTime = new Date();

  // 로그 캡처 함수
  const captureLog = (type, message) => {
    const timestamp = new Date().toISOString();
    testCase.logs.push({ timestamp, type, message });
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  captureLog('info', `📝 ${stepName} 시작...`);

  try {
    await stepFunction();
    
    // 브라우저 강제 종료 감지
    if (page.isClosed()) {
      testCase.status = 'fail';
      testCase.error = new Error('브라우저가 강제 종료되었습니다');
      testResults.status = 'fail';
      testResults.error = testCase.error;
      captureLog('error', `❌ ${stepName} 실패: 브라우저 강제 종료`);
      throw testCase.error;
    }
    
    testCase.status = 'pass';
    captureLog('success', `✅ ${stepName} 성공`);
  } catch (error) {
    testCase.status = 'fail';
    testCase.error = error;
    testResults.status = 'fail';
    testResults.error = error;
    captureLog('error', `❌ ${stepName} 실패: ${error.message}`);
    throw error;
  } finally {
    testCase.endTime = new Date().toISOString();
    const endTime = new Date();
    const duration = endTime - startTime;
    testCase.duration = duration;
    captureLog('info', `⏱️ ${stepName} 소요시간: ${duration}ms`);

    // 스크린샷 캡처
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '');
    const screenshotFileName = `screenshot-${stepName}-${testCase.status === 'pass' ? '성공' : '실패'}-${timestamp}.png`;
    const screenshotPath = path.join(__dirname, '../../custom-reports/scenario-2', screenshotFileName);
    
    try {
      // 브라우저가 닫혀있지 않을 때만 스크린샷 시도
      if (!page.isClosed()) {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testCase.screenshots.push({
          path: screenshotFileName,
          description: `${stepName} ${testCase.status === 'pass' ? '성공' : '실패'} 스크린샷`,
          timestamp: new Date().toISOString()
        });
        console.log(`📸 스크린샷 저장: ${screenshotFileName}`);
      } else {
        console.warn(`⚠️ 브라우저가 닫혀있어 스크린샷을 캡처할 수 없습니다: ${stepName}`);
        
        // 브라우저 종료로 인한 실패 케이스 처리
        if (testCase.status === 'pending') {
          testCase.status = 'fail';
          testCase.error = { message: '브라우저가 예기치 않게 종료되었습니다.' };
          testResults.status = 'fail';
          if (!testResults.error) {
          testResults.error = testCase.error;
          }
        }
      }
    } catch (screenshotError) {
      console.error(`❌ 스크린샷 캡처 실패: ${screenshotError.message}`);
      
      // 스크린샷 에러가 브라우저 종료 때문이라면 fail로 변경
      if (testCase.status === 'pass' && (
        screenshotError.message.includes('Target closed') ||
        screenshotError.message.includes('Browser closed') ||
        screenshotError.message.includes('Protocol error')
      )) {
        testCase.status = 'fail';
        testCase.error = new Error('브라우저가 강제 종료되었습니다');
        testResults.status = 'fail';
        testResults.error = testCase.error;
        captureLog('error', `❌ ${stepName} 실패: 브라우저 강제 종료 (스크린샷 에러에서 감지)`);
      }
    }
  }
}

// 설정 파일에서 데이터를 읽어오는 함수
function loadTestSettings() {
    const defaultConfigPath = path.join(__dirname, '../../config/test-settings.json');
      const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
      return config;
}

// 매니저 클래스들을 초기화하는 함수
function initializeManagers(page) {
      return {
    loginManager: new LoginManager(page),
    aws2Manager: new aws2Manager(page)
  };
}

// CMP 시나리오 2: AWS 대시보드 생성
test.describe.serial('시나리오 2: AWS 대시보드 생성', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    browser = newBrowser;
    config = loadTestSettings();

    // 스크린샷 디렉토리 생성
    const screenshotDir = path.join(__dirname, '../../custom-reports/scenario-2');
    fs.mkdirSync(screenshotDir, { recursive: true });

    // 녹화 설정 확인
    const recordingSettingsPath = path.join(__dirname, '../../config/recording-settings.json');
    let isRecordingEnabled = false;
    
    if (fs.existsSync(recordingSettingsPath)) {
      try {
        const recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
        isRecordingEnabled = recordingSettings['2'] || false;
        console.log(`🎬 시나리오 2 녹화 설정: ${isRecordingEnabled ? '활성화' : '비활성화'}`);
      } catch (error) {
        console.log(`⚠️ 녹화 설정 읽기 실패, 기본값 사용: ${error.message}`);
      }
    }
    
    // 녹화 설정에 따라 브라우저 컨텍스트 생성
    let context;
    if (isRecordingEnabled) {
      context = await browser.newContext({
        recordVideo: {
          dir: 'test-results/videos/',
          size: { width: 1280, height: 720 }
        },
        ignoreHTTPSErrors: true
      });
      console.log('🎬 녹화가 활성화되어 브라우저 컨텍스트를 생성합니다.');
    } else {
      context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
      console.log('🎬 녹화가 비활성화되어 일반 브라우저 컨텍스트를 생성합니다.');
    }

    // 브라우저 페이지 생성
    page = await context.newPage();

    // 포커싱 문제 해결
    if (isRecordingEnabled) {
      console.log('🎯 녹화를 위한 브라우저 포커싱 설정 중...');
      await page.bringToFront();
      await page.waitForTimeout(2000);
      console.log('🎯 브라우저 포커싱 완료');
    }

    // 매니저 클래스들 초기화
    managers = initializeManagers(page);
    
    // scenario-1에서 생성한 인스턴스 정보 로드
    console.log('📂 scenario-1에서 생성한 인스턴스 정보 로드 중...');
    const instanceInfo = managers.aws2Manager.getLatestInstanceInfo();
    managers.aws2Manager.currentInstanceName = instanceInfo.instanceName;
    managers.aws2Manager.currentInstanceId = instanceInfo.instanceId;
    console.log(`✅ 인스턴스 정보 로드 완료: ${instanceInfo.instanceName} (ID: ${instanceInfo.instanceId})`);
  });

  test.afterAll(async () => {
    // 녹화 설정 확인
    const recordingSettingsPath = path.join(__dirname, '../../config/recording-settings.json');
    let isRecordingEnabled = false;
    
    if (fs.existsSync(recordingSettingsPath)) {
      try {
        const recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
        isRecordingEnabled = recordingSettings['2'] || false;
      } catch (error) {
        console.log(`⚠️ 녹화 설정 읽기 실패: ${error.message}`);
      }
    }
    
    // 녹화 컨텍스트 닫기
    if (page) {
      await page.context().close();
    }
    
    // 녹화가 활성화된 경우에만 녹화 파일 처리
    if (isRecordingEnabled) {
      console.log('🎬 녹화가 활성화되어 녹화 파일을 처리합니다.');
      
      // ⚠️ 병렬 실행 대비: Playwright의 page.video().path()로 정확한 비디오 파일 경로 가져오기
      try {
        const videoPath = await page.video()?.path();
        
        if (videoPath && fs.existsSync(videoPath)) {
          console.log(`📹 [시나리오 2] Playwright 비디오 경로: ${videoPath}`);
          
          const stats = fs.statSync(videoPath);
          const videoDir = path.dirname(videoPath);
          const oldFileName = path.basename(videoPath);
            
            // 파일 생성 시간을 대한민국 시간으로 변환
            const koreaTime = new Date(stats.birthtime).toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }).replace(/[\/\s:]/g, '-');
            
          // 제품명 추출
            const productName = path.basename(path.dirname(path.dirname(__dirname))).toUpperCase();
            const scenarioId = '2';
            const newFileName = `${productName}-scenario-${scenarioId}-${koreaTime}.webm`;
          const newPath = path.join(videoDir, newFileName);
            
            // 파일명 변경
          fs.renameSync(videoPath, newPath);
          console.log(`📹 녹화 파일명 변경: ${oldFileName} → ${newFileName}`);
            
            // 사용자 지정 녹화 저장 경로에 복사
            try {
              const userRecordingSettingsPath = path.join(__dirname, '../../config/user-recording-folders.json');
              if (fs.existsSync(userRecordingSettingsPath)) {
                const userRecordingFolders = JSON.parse(fs.readFileSync(userRecordingSettingsPath, 'utf8'));
                const userFolderPath = userRecordingFolders['2'];
                
                if (userFolderPath && fs.existsSync(userFolderPath)) {
                  const userRecordingPath = path.join(userFolderPath, newFileName);
                  fs.copyFileSync(newPath, userRecordingPath);
                  console.log(`📹 사용자 지정 경로에 녹화 파일 복사 완료: ${userRecordingPath}`);
                } else {
                  console.log(`⚠️ 사용자 지정 녹화 폴더가 존재하지 않음: ${userFolderPath}`);
                }
              }
            } catch (copyError) {
              console.log(`⚠️ 사용자 지정 경로 복사 중 오류: ${copyError.message}`);
            }
        } else {
          console.log(`⚠️ [시나리오 2] 녹화 파일 경로를 가져올 수 없습니다.`);
        }
      } catch (error) {
        console.log(`⚠️ 녹화 파일 처리 중 오류: ${error.message}`);
      }
    }

    // 브라우저 닫기
    await browser.close();

    // 최종 테스트 결과 출력
    console.log('\n--- CMP 시나리오 2 최종 테스트 결과 ---');
    testResults.testCases.forEach(tc => {
      const statusIcon = tc.status === 'pass' ? '✅' : '❌';
      console.log(`${statusIcon} ${tc.name}: ${tc.status.toUpperCase()} (${tc.duration}ms)`);
      if (tc.error) {
        console.error(`  오류: ${tc.error.message}`);
      }
    });
    console.log('----------------------------------');

    if (testResults.status === 'fail') {
      console.error('❌ CMP 시나리오 2 테스트 중 실패한 케이스가 있습니다.');
    }
    console.log('🏁 CMP 시나리오 2 테스트 완료');
  });

  // Phase 1: 로그인

  test('로그인 페이지 접근', async () => {
    await test.step('로그인 페이지 접근', async () => {
      await runTestStep('로그인 페이지 접근', async () => {
        console.log('🌐 로그인 페이지 접근 중...');
        await managers.loginManager.navigateToLoginPage();
        console.log('✅ 로그인 페이지 접근 완료');
      }, page);
    });
  });

  test('로그인 정보 입력', async () => {
    await test.step('로그인 정보 입력', async () => {
      await runTestStep('로그인 정보 입력', async () => {
        console.log('📝 로그인 정보 입력 중...');
        await managers.loginManager.fillLoginCredentials(config);
        console.log('✅ 로그인 정보 입력 완료');
      }, page);
    });
  });

  test('로그인 실행 및 성공 확인', async () => {
    await test.step('로그인 실행 및 성공 확인', async () => {
      await runTestStep('로그인 실행 및 성공 확인', async () => {
        console.log('🚀 로그인 실행 및 성공 확인 중...');
        await managers.loginManager.submitLoginAndVerify();
        console.log('✅ 로그인 실행 및 성공 확인 완료');
      }, page);
    });
  });

  // Phase 2: AWS 대시보드 생성

  test('대시보드 생성', async () => {
    await test.step('대시보드 생성', async () => {
      await runTestStep('대시보드 생성', async () => {
        console.log('📊 대시보드 생성 중...');
        await managers.aws2Manager.dashboardCreate(config);
        console.log('✅ 대시보드 생성 완료');
      }, page);
    });
  });

  test('위젯 설정', async () => {
    await test.step('위젯 설정', async () => {
      await runTestStep('위젯 설정', async () => {
        console.log('🎨 위젯 설정 중...');
        await managers.aws2Manager.resourceSelect_1(config);
        console.log('✅ 위젯 설정 완료');
      }, page);
    });
  });

  test('메트릭 선택', async () => {
    await test.step('메트릭 선택', async () => {
      await runTestStep('메트릭 선택', async () => {
        console.log('📈 메트릭 선택 중...');
        await managers.aws2Manager.resourceSelect_2(config);
        console.log('✅ 메트릭 선택 완료');
      }, page);
    });
  });

  test('리소스 추가', async () => {
    await test.step('리소스 추가', async () => {
      await runTestStep('리소스 추가', async () => {
        console.log(`➕ 리소스 추가 중 (인스턴스: ${managers.aws2Manager.currentInstanceName})...`);
        await managers.aws2Manager.resourceSelect_3(config);
        console.log('✅ 리소스 추가 완료');
      }, page);
    });
  });

  test('대시보드 확인', async () => {
    await test.step('대시보드 확인', async () => {
      await runTestStep('대시보드 확인', async () => {
        console.log('✔️ 대시보드 확인 중...');
        await managers.aws2Manager.confirmDashboard(config);
        console.log('✅ 대시보드 확인 완료');
      }, page);
    });
  });
});