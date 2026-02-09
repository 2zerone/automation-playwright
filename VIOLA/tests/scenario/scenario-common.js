import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// 테스트 결과를 저장할 객체 (각 시나리오에서 초기화)
export let testResults = {
  status: 'pass',
  error: null,
  testCases: []
};

// 테스트 결과 초기화 함수
export function initializeTestResults(allPlannedTestCases) {
  testResults = {
    status: 'pass',
    error: null,
    testCases: allPlannedTestCases.map(tc => ({ ...tc }))
  };
}

// 테스트 스텝 실행 및 결과 기록 함수
export async function runTestStep(stepName, stepFunction, page, scenarioNumber) {
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

  testCase.status = 'pending';
  testCase.startTime = new Date().toISOString();
  testCase.error = null;
  testCase.logs = [];
  testCase.screenshots = [];

  const startTime = new Date();

  const captureLog = (type, message) => {
    const timestamp = new Date().toISOString();
    testCase.logs.push({ timestamp, type, message });
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  captureLog('info', `📝 ${stepName} 시작...`);

  try {
    await stepFunction();
    
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

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '');
    const screenshotFileName = `screenshot-${stepName}-${testCase.status === 'pass' ? '성공' : '실패'}-${timestamp}.png`;
    const screenshotPath = path.join(__dirname, '../../custom-reports', `scenario-${scenarioNumber}`, screenshotFileName);
    
    try {
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
export function loadTestSettings(scenarioNumber) {
  const configPath = path.join(__dirname, `../../config/scenario/test-settings-${scenarioNumber}.json`);
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } else {
    const defaultConfigPath = path.join(__dirname, '../../config/test-settings.json');
    const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    return config;
  }
}

// beforeAll 공통 로직
export async function setupScenarioBeforeAll(browser, scenarioNumber, initializeManagers) {
  const config = loadTestSettings(scenarioNumber);

  const screenshotDir = path.join(__dirname, '../../custom-reports', `scenario-${scenarioNumber}`);
  fs.mkdirSync(screenshotDir, { recursive: true });

  const recordingSettingsPath = path.join(__dirname, '../../config/recording-settings.json');
  let isRecordingEnabled = false;
  
  if (fs.existsSync(recordingSettingsPath)) {
    try {
      const recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
      isRecordingEnabled = recordingSettings[String(scenarioNumber)] || false;
      console.log(`🎬 시나리오 ${scenarioNumber} 녹화 설정: ${isRecordingEnabled ? '활성화' : '비활성화'}`);
    } catch (error) {
      console.log(`⚠️ 녹화 설정 읽기 실패, 기본값 사용: ${error.message}`);
    }
  }
  
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

  const page = await context.newPage();

  if (isRecordingEnabled) {
    console.log('🎯 녹화를 위한 브라우저 포커싱 설정 중...');
    await page.bringToFront();
    await page.waitForTimeout(2000);
    console.log('🎯 브라우저 포커싱 완료');
  }

  const managers = initializeManagers(page);

  return { page, config, managers, browser, isRecordingEnabled };
}

// afterAll 공통 로직
export async function setupScenarioAfterAll(page, browser, scenarioNumber, scenarioName, productName) {
  const recordingSettingsPath = path.join(__dirname, '../../config/recording-settings.json');
  let isRecordingEnabled = false;
  
  if (fs.existsSync(recordingSettingsPath)) {
    try {
      const recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
      isRecordingEnabled = recordingSettings[String(scenarioNumber)] || false;
    } catch (error) {
      console.log(`⚠️ 녹화 설정 읽기 실패: ${error.message}`);
    }
  }
  
  if (page) {
    await page.context().close();
  }
  
  if (isRecordingEnabled) {
    console.log('🎬 녹화가 활성화되어 녹화 파일을 처리합니다.');
    
    try {
      const videoPath = await page.video()?.path();
      
      if (videoPath && fs.existsSync(videoPath)) {
        console.log(`📹 [시나리오 ${scenarioNumber}] Playwright 비디오 경로: ${videoPath}`);
        
        const stats = fs.statSync(videoPath);
        const videoDir = path.dirname(videoPath);
        const oldFileName = path.basename(videoPath);
          
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
          
        const scenarioId = String(scenarioNumber);
        const newFileName = `${productName}-scenario-${scenarioId}-${koreaTime}.webm`;
        const newPath = path.join(videoDir, newFileName);
          
        fs.renameSync(videoPath, newPath);
        console.log(`📹 녹화 파일명 변경: ${oldFileName} → ${newFileName}`);
          
        try {
          const userRecordingSettingsPath = path.join(__dirname, '../../config/user-recording-folders.json');
          if (fs.existsSync(userRecordingSettingsPath)) {
            const userRecordingFolders = JSON.parse(fs.readFileSync(userRecordingSettingsPath, 'utf8'));
            const userFolderPath = userRecordingFolders[String(scenarioNumber)];
            
            if (userFolderPath && fs.existsSync(userFolderPath)) {
              const userRecordingPath = path.join(userFolderPath, newFileName);
              
              fs.copyFileSync(newPath, userRecordingPath);
              console.log(`📹 사용자 지정 경로에 녹화 파일 복사 완료: ${userRecordingPath}`);
              
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
        console.log(`⚠️ [시나리오 ${scenarioNumber}] 녹화 파일 경로를 가져올 수 없습니다.`);
      }
    } catch (error) {
      console.log(`⚠️ 녹화 파일명 변경 중 오류: ${error.message}`);
    }
  } else {
    console.log('🎬 녹화가 비활성화되어 녹화 파일 처리를 건너뜁니다.');
  }

  if (page && !page.isClosed()) {
    await page.close();
  }
  if (browser) {
    await browser.close();
  }

  console.log(`\n--- ${productName} ${scenarioName} 최종 테스트 결과 ---`);
  testResults.testCases.forEach(tc => {
    const statusIcon = tc.status === 'pass' ? '✅' : '❌';
    console.log(`${statusIcon} ${tc.name}: ${tc.status.toUpperCase()} (${tc.duration}ms)`);
    if (tc.error) {
      console.error(`  오류: ${tc.error.message}`);
    }
  });
  console.log('----------------------------------');

  if (testResults.status === 'fail') {
    console.error(`❌ ${productName} ${scenarioName} 테스트 중 실패한 케이스가 있습니다.`);
  }
  console.log(`🏁 ${productName} ${scenarioName} 테스트 완료`);
}
