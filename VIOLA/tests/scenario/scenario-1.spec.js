import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import LoginManager from '../../lib/classes/LoginManager.js';
import PodManager from '../../lib/classes/PodManager.js';
import BackupManager from '../../lib/classes/BackupManager.js';
import BaseManager from '../../lib/classes/BaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 중복 로그 방지를 위한 Set
const loggedMessages = new Set();
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// console.log 오버라이드 (중복 제거)
console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  if (loggedMessages.has(message)) {
    return;
  }
  loggedMessages.add(message);
  
  originalConsoleLog.apply(console, args);
};

// console.error 오버라이드 (중복 제거)
console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  if (loggedMessages.has(message)) {
    return;
  }
  loggedMessages.add(message);
  
  originalConsoleError.apply(console, args);
};

// 글로벌 테스트 타임아웃 설정 (1시간)
test.setTimeout(3600000);

// VIOLA 시나리오 1: 로그인 및 Pod 생성 테스트 + Backup 생성 테스트
const allPlannedTestCases = [
  { name: '로그인 페이지 접근', status: 'pending' },
  { name: '로그인 정보 입력', status: 'pending' },
  { name: '로그인 실행 및 성공 확인', status: 'pending' },
  { name: 'Apps 메뉴 접근', status: 'pending' },
  { name: 'Kubernetes Engine 선택', status: 'pending' },
  { name: '클러스터 선택', status: 'pending' },
  { name: '워크로드 메뉴 접근', status: 'pending' },
  { name: '컨테이너 관리 접근', status: 'pending' },
  { name: 'Pod 생성 시작', status: 'pending' },
  { name: '고급 모드 전환', status: 'pending' },
  { name: 'YAML 내용 입력', status: 'pending' },
  { name: 'YAML 유효성 검사', status: 'pending' },
  { name: 'Pod 생성 실행', status: 'pending' },
  { name: 'Pod 생성 확인', status: 'pending' },
  { name: 'Pod 실행 상태 확인', status: 'pending' },
  { name: '백업 메뉴 접근', status: 'pending' },
  { name: '생성 버튼 클릭', status: 'pending' },
  { name: '네임스페이스 백업 선택', status: 'pending' },
  { name: '체크박스 영역으로 스크롤', status: 'pending' },
  { name: '네임스페이스 선택', status: 'pending' },
  { name: '다음 버튼 클릭', status: 'pending' },
  { name: 'Backup 생성 실행', status: 'pending' },
  { name: 'Backup 생성 확인', status: 'pending' }
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
    
    // 브라우저 강제 종료 감지 (stepFunction 완료 직후)
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

    // 스크린샷 캡처 (TROMBONE 스타일 네이밍)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '');
    const screenshotFileName = `screenshot-${stepName}-${testCase.status === 'pass' ? '성공' : '실패'}-${timestamp}.png`;
    const screenshotPath = path.join(__dirname, '../../custom-reports/scenario-1', screenshotFileName);
    
    try {
      // 브라우저가 닫혀있지 않을 때만 스크린샷 시도
      if (!page.isClosed()) {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testCase.screenshots.push({
          path: screenshotFileName, // 상대 경로로 저장
          description: `${stepName} ${testCase.status === 'pass' ? '성공' : '실패'} 스크린샷`,
          timestamp: new Date().toISOString()
        });
        console.log(`📸 스크린샷 저장: ${screenshotFileName}`);
      } else {
        console.warn(`⚠️ 브라우저가 닫혀있어 스크린샷을 캡처할 수 없습니다: ${stepName}`);
        
        // 브라우저가 닫혔는데 status가 pass라면 fail로 변경
        if (testCase.status === 'pass') {
          testCase.status = 'fail';
          testCase.error = new Error('브라우저가 강제 종료되었습니다');
          testResults.status = 'fail';
          testResults.error = testCase.error;
          captureLog('error', `❌ ${stepName} 실패: 브라우저 강제 종료 (스크린샷 단계에서 감지)`);
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
  const scenarioId = 1;
  const configPath = path.join(__dirname, `../../config/scenario/test-settings-${scenarioId}.json`);
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } else {
    const defaultConfigPath = path.join(__dirname, '../../config/test-settings.json');
    const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    return config;
  }
}

// 매니저 클래스들을 초기화하는 함수
function initializeManagers(page) {
  const baseManager = new BaseManager(page);
  return {
    baseManager: baseManager,
    loginManager: new LoginManager(page),
    podManager: new PodManager(page),
    backupManager: new BackupManager(page)
  };
}

// VIOLA 시나리오 1: 로그인 및 Pod 생성 테스트
test.describe.serial('시나리오 1: 로그인 및 파드 생성ㆍ백업', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    browser = newBrowser;
    config = loadTestSettings();

    // 스크린샷 디렉토리 생성
    const screenshotDir = path.join(__dirname, '../../custom-reports/scenario-1');
    fs.mkdirSync(screenshotDir, { recursive: true });

    // 녹화 설정 확인
    const recordingSettingsPath = path.join(__dirname, '../../config/recording-settings.json');
    let isRecordingEnabled = false;
    
    if (fs.existsSync(recordingSettingsPath)) {
      try {
        const recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
        isRecordingEnabled = recordingSettings['1'] || false;
        console.log(`🎬 시나리오 1 녹화 설정: ${isRecordingEnabled ? '활성화' : '비활성화'}`);
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

    // 포커싱 문제 해결: 페이지 로드 후 브라우저 창에 포커스 맞추기
    if (isRecordingEnabled) {
      console.log('🎯 녹화를 위한 브라우저 포커싱 설정 중...');
      await page.bringToFront();
      await page.waitForTimeout(2000); // 포커싱 안정화를 위한 대기
      console.log('🎯 브라우저 포커싱 완료');
    }

    // 매니저 클래스들 초기화
    managers = initializeManagers(page);
  });

  test.afterAll(async () => {
    // 녹화 설정 확인
    const recordingSettingsPath = path.join(__dirname, '../../config/recording-settings.json');
    let isRecordingEnabled = false;
    
    if (fs.existsSync(recordingSettingsPath)) {
      try {
        const recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
        isRecordingEnabled = recordingSettings['1'] || false;
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
          console.log(`📹 [시나리오 1] Playwright 비디오 경로: ${videoPath}`);
          
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
          const scenarioId = '1';
          const newFileName = `${productName}-scenario-${scenarioId}-${koreaTime}.webm`;
          const newPath = path.join(videoDir, newFileName);
          
          // 파일명 변경
          fs.renameSync(videoPath, newPath);
          console.log(`📹 녹화 파일명 변경: ${oldFileName} → ${newFileName}`);
          
          // 사용자 지정 녹화 저장 경로에 복사 확인
          try {
            const userRecordingSettingsPath = path.join(__dirname, '../../config/user-recording-folders.json');
            if (fs.existsSync(userRecordingSettingsPath)) {
              const userRecordingFolders = JSON.parse(fs.readFileSync(userRecordingSettingsPath, 'utf8'));
              const userFolderPath = userRecordingFolders['1']; // 시나리오 1의 녹화 폴더
              
              if (userFolderPath && fs.existsSync(userFolderPath)) {
                const userRecordingPath = path.join(userFolderPath, newFileName);
                
                // 파일 복사
                fs.copyFileSync(newPath, userRecordingPath);
                console.log(`📹 사용자 지정 경로에 녹화 파일 복사 완료: ${userRecordingPath}`);
                
                // 복사된 파일 확인
                if (fs.existsSync(userRecordingPath)) {
                  const userFileStats = fs.statSync(userRecordingPath);
                  console.log(`✅ 사용자 지정 경로 녹화 파일 확인 완료:`);
                  console.log(`   - 경로: ${userRecordingPath}`);
                  console.log(`   - 크기: ${(userFileStats.size / 1024 / 1024).toFixed(2)} MB`);
                  console.log(`   - 수정시간: ${userFileStats.mtime.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
                } else {
                  console.log(`❌ 사용자 지정 경로에 녹화 파일 복사 실패`);
                }
              } else {
                console.log(`⚠️ 사용자 지정 녹화 폴더가 존재하지 않음: ${userFolderPath}`);
              }
            } else {
              console.log(`⚠️ 사용자 녹화 폴더 설정 파일이 존재하지 않음: ${userRecordingSettingsPath}`);
            }
          } catch (copyError) {
            console.log(`⚠️ 사용자 지정 경로 복사 중 오류: ${copyError.message}`);
          }
        } else {
          console.log(`⚠️ [시나리오 1] 녹화 파일 경로를 가져올 수 없습니다.`);
        }
      } catch (error) {
        console.log(`⚠️ 녹화 파일명 변경 중 오류: ${error.message}`);
      }
    } else {
      console.log('🎬 녹화가 비활성화되어 녹화 파일 처리를 건너뜁니다.');
    }

    // 결과를 파일에 저장
    const resultPath = path.join(__dirname, '../../custom-reports/global-test-results.json');
    try {
      let allResults = {};
      if (fs.existsSync(resultPath)) {
        allResults = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      }
      allResults['scenario-1'] = testResults;
      fs.writeFileSync(resultPath, JSON.stringify(allResults, null, 2));
      console.log('📊 테스트 결과 저장 완료: global-test-results.json');
    } catch (error) {
      console.error('결과 저장 중 오류 발생:', error);
    }

    await page.close();
    await browser.close();

    // 최종 테스트 결과 출력
    console.log('\n--- VIOLA 시나리오 1 최종 테스트 결과 ---');
    testResults.testCases.forEach(tc => {
      const statusIcon = tc.status === 'pass' ? '✅' : '❌';
      console.log(`${statusIcon} ${tc.name}: ${tc.status.toUpperCase()} (${tc.duration}ms)`);
      if (tc.error) {
        console.error(`  오류: ${tc.error.message}`);
      }
    });
    console.log('----------------------------------');

    if (testResults.status === 'fail') {
      console.error('❌ VIOLA 시나리오 1 테스트 중 실패한 케이스가 있습니다.');
    }
    console.log('🏁 VIOLA 시나리오 1 테스트 완료');
  });

  // 로그인 페이지 접근 테스트
  test('로그인 페이지 접근', async () => {
    await test.step('로그인 페이지 접근', async () => {
      await runTestStep('로그인 페이지 접근', async () => {
        console.log('🌐 로그인 페이지 접근 중...');
        await managers.loginManager.navigateToLoginPage();
        console.log('✅ 로그인 페이지 접근 완료');
      }, page);
    });
  });

  // 로그인 정보 입력 테스트
  test('로그인 정보 입력', async () => {
    await test.step('로그인 정보 입력', async () => {
      await runTestStep('로그인 정보 입력', async () => {
        console.log('📝 로그인 정보 입력 중...');
        await managers.loginManager.fillLoginCredentials(config);
        console.log('✅ 로그인 정보 입력 완료');
      }, page);
    });
  });

  // 로그인 실행 및 성공 확인 테스트
  test('로그인 실행 및 성공 확인', async () => {
    await test.step('로그인 실행 및 성공 확인', async () => {
      await runTestStep('로그인 실행 및 성공 확인', async () => {
        console.log('🚀 로그인 실행 및 성공 확인 중...');
        await managers.loginManager.submitLoginAndVerify();
        console.log('✅ 로그인 실행 및 성공 확인 완료');
      }, page);
    });
  });

  // Apps 메뉴 접근 테스트
  test('Apps 메뉴 접근', async () => {
    await test.step('Apps 메뉴 접근', async () => {
      await runTestStep('Apps 메뉴 접근', async () => {
        console.log('📱 Apps 메뉴 접근 중...');
        await managers.podManager.navigateToApps();
        console.log('✅ Apps 메뉴 접근 완료');
      }, page);
    });
  });

  // Kubernetes Engine 선택 테스트
  test('Kubernetes Engine 선택', async () => {
    await test.step('Kubernetes Engine 선택', async () => {
      await runTestStep('Kubernetes Engine 선택', async () => {
        console.log('⚙️ Kubernetes Engine 선택 중...');
        await managers.podManager.selectKubernetesEngine();
        console.log('✅ Kubernetes Engine 선택 완료');
      }, page);
    });
  });

  // 클러스터 선택 테스트
  test('클러스터 선택', async () => {
    await test.step('클러스터 선택', async () => {
      await runTestStep('클러스터 선택', async () => {
        console.log('🔧 클러스터 선택 중...');
        await managers.podManager.selectCluster();
        console.log('✅ 클러스터 선택 완료');
      }, page);
    });
  });

  // 워크로드 메뉴 접근 테스트
  test('워크로드 메뉴 접근', async () => {
    await test.step('워크로드 메뉴 접근', async () => {
      await runTestStep('워크로드 메뉴 접근', async () => {
        console.log('📋 워크로드 메뉴 접근 중...');
        await managers.podManager.navigateToWorkloads();
        console.log('✅ 워크로드 메뉴 접근 완료');
      }, page);
    });
  });

  // 컨테이너 관리 접근 테스트
  test('컨테이너 관리 접근', async () => {
    await test.step('컨테이너 관리 접근', async () => {
      await runTestStep('컨테이너 관리 접근', async () => {
        console.log('📦 컨테이너 관리 접근 중...');
        await managers.podManager.navigateToContainerManagement();
        console.log('✅ 컨테이너 관리 접근 완료');
      }, page);
    });
  });

  // Pod 생성 시작 테스트
  test('Pod 생성 시작', async () => {
    await test.step('Pod 생성 시작', async () => {
      await runTestStep('Pod 생성 시작', async () => {
        console.log('🆕 Pod 생성 시작 중...');
        await managers.podManager.startPodCreation();
        console.log('✅ Pod 생성 시작 완료');
      }, page);
    });
  });

  // 고급 모드 전환 테스트
  test('고급 모드 전환', async () => {
    await test.step('고급 모드 전환', async () => {
      await runTestStep('고급 모드 전환', async () => {
        console.log('🔧 고급 모드 전환 중...');
        await managers.podManager.switchToAdvancedMode();
        console.log('✅ 고급 모드 전환 완료');
      }, page);
    });
  });

  // YAML 내용 입력 테스트
  test('YAML 내용 입력', async () => {
    await test.step('YAML 내용 입력', async () => {
      await runTestStep('YAML 내용 입력', async () => {
        console.log('📝 YAML 내용 입력 중...');
        await managers.podManager.fillYamlContent();
        console.log('✅ YAML 내용 입력 완료');
      }, page);
    });
  });

  // YAML 유효성 검사 테스트
  test('YAML 유효성 검사', async () => {
    await test.step('YAML 유효성 검사', async () => {
      await runTestStep('YAML 유효성 검사', async () => {
        console.log('✅ YAML 유효성 검사 중...');
        await managers.podManager.validateYaml();
        console.log('✅ YAML 유효성 검사 완료');
      }, page);
    });
  });

  // Pod 생성 실행 테스트
  test('Pod 생성 실행', async () => {
    await test.step('Pod 생성 실행', async () => {
      await runTestStep('Pod 생성 실행', async () => {
        console.log('🚀 Pod 생성 실행 중...');
        await managers.podManager.createPod();
        console.log('✅ Pod 생성 실행 완료');
      }, page);
    });
  });

  // Pod 생성 확인 테스트
  test('Pod 생성 확인', async () => {
    await test.step('Pod 생성 확인', async () => {
      await runTestStep('Pod 생성 확인', async () => {
        console.log('✔️ Pod 생성 확인 중...');
        await managers.podManager.confirmCreation();
        console.log('✅ Pod 생성 확인 완료');
      }, page);
    });
  });

  // Pod 실행 상태 확인 테스트
  test('Pod 실행 상태 확인', async () => {
    await test.step('Pod 실행 상태 확인', async () => {
      await runTestStep('Pod 실행 상태 확인', async () => {
        console.log('🏃 Pod 실행 상태 확인 중...');
        await managers.podManager.verifyPodRunning();
        console.log('✅ Pod 실행 상태 확인 완료');
      }, page);
    });
  });

  // ==================== Backup 생성 테스트 ====================
  
  // 백업 메뉴 접근 테스트
  test('백업 메뉴 접근', async () => {
    await test.step('백업 메뉴 접근', async () => {
      await runTestStep('백업 메뉴 접근', async () => {
        console.log('📁 백업 메뉴 접근 중...');
        await managers.backupManager.navigateToBackup();
        console.log('✅ 백업 메뉴 접근 완료');
      }, page);
    });
  });

  // 생성 버튼 클릭 테스트
  test('생성 버튼 클릭', async () => {
    await test.step('생성 버튼 클릭', async () => {
      await runTestStep('생성 버튼 클릭', async () => {
        console.log('🆕 생성 버튼 클릭 중...');
        await managers.backupManager.clickCreate();
        console.log('✅ 생성 버튼 클릭 완료');
      }, page);
    });
  });

  // 네임스페이스 백업 선택 테스트
  test('네임스페이스 백업 선택', async () => {
    await test.step('네임스페이스 백업 선택', async () => {
      await runTestStep('네임스페이스 백업 선택', async () => {
        console.log('📦 네임스페이스 백업 선택 중...');
        await managers.backupManager.selectNamespaceBackup();
        console.log('✅ 네임스페이스 백업 선택 완료');
      }, page);
    });
  });

  // 체크박스 영역으로 스크롤 테스트
  test('체크박스 영역으로 스크롤', async () => {
    await test.step('체크박스 영역으로 스크롤', async () => {
      await runTestStep('체크박스 영역으로 스크롤', async () => {
        console.log('📜 체크박스 영역으로 스크롤 중...');
        await managers.backupManager.scrollToCheckbox();
        console.log('✅ 스크롤 완료');
      }, page);
    });
  });

  // 네임스페이스 선택 테스트
  test('네임스페이스 선택', async () => {
    await test.step('네임스페이스 선택', async () => {
      await runTestStep('네임스페이스 선택', async () => {
        console.log('☑️ 네임스페이스 선택 중...');
        await managers.backupManager.selectNamespace();
        console.log('✅ 네임스페이스 선택 완료');
      }, page);
    });
  });

  // 다음 버튼 클릭 테스트
  test('다음 버튼 클릭', async () => {
    await test.step('다음 버튼 클릭', async () => {
      await runTestStep('다음 버튼 클릭', async () => {
        console.log('➡️ 다음 버튼 클릭 중...');
        await managers.backupManager.clickNext();
        console.log('✅ 다음 버튼 클릭 완료');
      }, page);
    });
  });

  // Backup 생성 실행 테스트
  test('Backup 생성 실행', async () => {
    await test.step('Backup 생성 실행', async () => {
      await runTestStep('Backup 생성 실행', async () => {
        console.log('🚀 Backup 생성 실행 중...');
        await managers.backupManager.createBackup();
        console.log('✅ Backup 생성 실행 완료');
      }, page);
    });
  });

  // Backup 생성 확인 테스트
  test('Backup 생성 확인', async () => {
    await test.step('Backup 생성 확인', async () => {
      await runTestStep('Backup 생성 확인', async () => {
        console.log('🔍 Backup 생성 확인 중...');
        await managers.backupManager.verifyBackupCreation();
        console.log('✅ Backup 생성 확인 완료');
      }, page);
    });
  });
});
