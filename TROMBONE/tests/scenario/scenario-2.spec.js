import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import TaskCodeManager from '../../lib/classes/TaskCodeManager.js';
import ToolchainManager from '../../lib/classes/ToolchainManager.js';
import RepositoryManager from '../../lib/classes/RepositoryManager.js';
import UserTaskCodeManager from '../../lib/classes/UserTaskCodeManager.js';
import SonarQubeManager from '../../lib/classes/SonarQubeManager.js';
import JUnitManager from '../../lib/classes/JUnitManager.js';
import PipelineManager from '../../lib/classes/PipelineManager.js';
import LoginManager from '../../lib/classes/LoginManager.js';
import TicketCreateManagerEmergency from '../../lib/classes/TicketCreateManager_emergency.js';
import TicketApproachManager from '../../lib/classes/Ticket_Approach.js';
import TicketApproval from '../../lib/classes/TicketApproval.js';
import GitLabManager from '../../lib/classes/GitLabManager.js';
import ApprovalManager from '../../lib/classes/ApprovalManager.js';
import TicketCodeMergeSTGManager from '../../lib/classes/Ticket_CodeMerge_STG.js';
import TicketCodeMergePRDManager from '../../lib/classes/Ticket_CodeMerge_PRD.js';
import TicketManualDeploymentSTGManager from '../../lib/classes/Ticket_ManualDeployment_STG.js';
import TicketManualDeploymentPRDManager from '../../lib/classes/Ticket_ManualDeployment_PRD.js';
import TicketIntegrationTestManager from '../../lib/classes/Ticket_IntegrationTest.js';
import TicketDeploymentInformationManager from '../../lib/classes/Ticket_DeploymentInformation.js';
  import utils from '../../lib/classes/TromboneUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 글로벌 테스트 타임아웃 설정 (1시간)
test.setTimeout(3600000);



// 녹화 설정 확인
console.log('🎬 시나리오 2 테스트 파일 로드됨');
console.log('🎬 PLAYWRIGHT_VIDEO_ENABLED:', process.env.PLAYWRIGHT_VIDEO_ENABLED);



// 전체 시나리오의 모든 예정된 테스트 케이스 정의 (시나리오 1에서 코드리뷰/단위테스트/정적분석 제거)
const allPlannedTestCases = [
  // 1. 업무코드 등록
  { name: '업무코드 메뉴 접근', status: 'pending' },
  { name: '업무코드 등록 화면 열기', status: 'pending' },
  { name: '업무코드 정보 입력', status: 'pending' },
  { name: '의도적 실패 테스트', status: 'pending' },
  { name: '업무코드 저장 및 확인', status: 'pending' },
  
  // 2. 툴체인 등록
  { name: '툴체인 메뉴 접근', status: 'pending' },
  { name: '툴체인 등록 화면 열기', status: 'pending' },
  { name: '툴체인 기본 정보 입력', status: 'pending' },
  { name: '툴체인 저장 및 확인', status: 'pending' },
  
  // 3. 저장소 등록
  { name: '저장소 메뉴 접근', status: 'pending' },
  { name: '저장소 등록 화면 열기', status: 'pending' },
  { name: '저장소 정보 입력', status: 'pending' },
  { name: '저장소 저장 및 확인', status: 'pending' },
  { name: '배치 파일 실행', status: 'pending' },
  { name: 'GitLab 파일 수정', status: 'pending' },
  
  // 4. 사용자 등록 (주석 처리된 부분들)
  // { name: '사용자 메뉴 접근', status: 'pending' },
  // { name: '사용자 등록 화면 열기', status: 'pending' },
  // { name: '사용자 기본 정보 입력', status: 'pending' },
  // { name: '티켓 전용 업무 및 역할 설정', status: 'pending' },
  // { name: '사용자 업무 및 역할 설정', status: 'pending' },
  // { name: '사용자 구분 설정', status: 'pending' },
  // { name: '사용자 저장 및 확인', status: 'pending' },
  
  // 5. 사용자 업무코드 등록
  { name: '사용자 업무코드 메뉴 접근', status: 'pending' },
  { name: '사용자 업무코드 등록 화면 열기', status: 'pending' },
  { name: '사용자 업무코드 정보 입력', status: 'pending' },
  { name: '사용자 업무코드 저장 및 확인', status: 'pending' },
  
  // 6. SonarQube 등록
  { name: 'SonarQube 메뉴 접근', status: 'pending' },
  { name: 'SonarQube 등록 화면 열기', status: 'pending' },
  { name: 'SonarQube 정보 입력', status: 'pending' },
  { name: 'SonarQube 저장 및 확인', status: 'pending' },
  
  // 7. JUnit 등록
  { name: 'JUnit 메뉴 접근', status: 'pending' },
  { name: 'JUnit 등록 화면 열기', status: 'pending' },
  { name: 'JUnit 정보 입력', status: 'pending' },
  { name: 'JUnit 저장 및 확인', status: 'pending' },
  
  // 8. 파이프라인 등록
  { name: 'STG 파이프라인 등록', status: 'pending' },
  { name: 'PRD 파이프라인 등록', status: 'pending' },
  
     // 9. 새 탭 로그인 (주석처리)
   // { name: '새 탭에서 로그인', status: 'pending' }
   
  // 11. 티켓 생성 세부 단계
  { name: '티켓 관리 메뉴 접근', status: 'pending' },
  { name: '티켓 등록 화면 열기', status: 'pending' },
  { name: '티켓 기본 정보 입력', status: 'pending' },
  { name: '워크플로우 및 승인 설정', status: 'pending' },
  { name: '개발자 및 배포일 설정', status: 'pending' },
  { name: '릴리즈 노트 작성', status: 'pending' },
  { name: '저장소 및 브랜치 선택', status: 'pending' },
  { name: '티켓 저장', status: 'pending' },
  
  // 12. 승인 프로세스 세부 단계
  { name: '첫 번째 승인 프로세스', status: 'pending' },
  { name: '두 번째 승인 프로세스', status: 'pending' },
  { name: '알림 확인', status: 'pending' },
  
  // 13. 티켓 접근 단계
  { name: '티켓 접근', status: 'pending' },
  
  // 14. 코드병합 단계 세부 단계
  { name: '코드병합(STG) 단계: 코드병합(STG) 가능 확인', status: 'pending' },           // 병합 가능 여부 확인
  { name: '코드병합(STG) 단계: 코드병합(STG) 진행', status: 'pending' },               // 병합 완료 확인
  { name: '코드병합(STG) 단계: 코드병합(STG) 단계 완료 및 다음 단계 진입', status: 'pending' }, // 다음 단계 진행
  
  // 9. 즉시배포 단계
  { name: '검증배포(즉시배포) 단계: 검증배포(즉시배포)', status: 'pending' },
  { name: '검증배포(즉시배포) 단계: 검증배포(즉시배포) 단계 완료 및 다음 단계 진입', status: 'pending' }, // 다음 단계 진행
  
  // 10. 통합테스트 단계
  { name: '통합테스트 단계: 통합테스트 파일 업로드', status: 'pending' },
  { name: '통합테스트 단계: 통합테스트 단계 완료 및 다음 단계 진입', status: 'pending' }, // 다음 단계 진행
  
  // 11. 코드병합(PRD) 단계
  { name: '코드병합(PRD) 단계: 코드병합(PRD) 가능 확인', status: 'pending' },
  { name: '코드병합(PRD) 단계: 코드병합(PRD) 진행', status: 'pending' },
  { name: '코드병합(PRD) 단계: 코드병합(PRD) 단계 완료 및 다음 단계 진입', status: 'pending' }, // 다음 단계 진행
  
  // 12. 운영배포(즉시배포) 단계
  { name: '운영배포(즉시배포) 단계: 운영배포(즉시배포)', status: 'pending' },
  { name: '운영배포(즉시배포) 단계: 운영배포(즉시배포) 단계 완료 및 다음 단계 진입', status: 'pending' }, // 다음 단계 진행
  
  // 13. 티켓 종료 단계
  { name: '티켓 종료 단계: 티켓 종료', status: 'pending' }
];

// 테스트 결과를 저장할 객체 (모든 예정된 테스트 케이스로 초기화)
const testResults = {
  status: 'pass',
  error: null,
  testCases: allPlannedTestCases.map(tc => ({
    name: tc.name,
    status: tc.status,
    startTime: null,
    endTime: null,
    error: null,
    duration: 0,
    logs: []
  })),
  startTime: new Date().toISOString(),
  endTime: null,
  duration: '0분'
};

// 테스트 단계를 실행하고 결과를 기록하는 함수
async function runTestStep(stepName, action, page) {
  // 기존 테스트 케이스를 찾아서 업데이트
  let testCase = testResults.testCases.find(tc => tc.name === stepName);
  if (!testCase) {
    // 예상하지 못한 테스트 케이스라면 새로 추가
    testCase = {
      name: stepName,
      status: 'pending',
      startTime: null,
      endTime: null,
      error: null,
      duration: 0,
      logs: [],
      screenshots: [] // 스크린샷 배열 추가
    };
    testResults.testCases.push(testCase);
  }
  
  // 테스트 케이스 시작
  testCase.status = 'pending';
  testCase.startTime = new Date().toISOString();
  testCase.error = null;
  testCase.logs = [];  // 로그 초기화
  testCase.screenshots = []; // 스크린샷 초기화

  // 로그 캡처 함수
  const captureLog = (type, message) => {
    const timestamp = new Date().toISOString();
    testCase.logs.push({ timestamp, type, message });
    
    // 로그 메시지 생성
    const logPrefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    const logMessage = `${logPrefix} ${stepName}: ${message}`;
    
    // process.stdout.write만 사용하여 중복 출력 방지
    process.stdout.write(logMessage + '\n');
  };

  // 스크린샷 캡처 함수 - 단계 완료 후 1개만 캡처하고 완료까지 대기
  const captureScreenshot = async (suffix = '') => {
    if (!page) {
      captureLog('warning', '페이지 객체가 없어 스크린샷을 찍을 수 없습니다.');
      return;
    }
    
    try {
      captureLog('info', `📸 ${stepName} 단계 완료 스크린샷 촬영 중...`);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = suffix ? `screenshot-${stepName}-${suffix}-${timestamp}.png` : `screenshot-${stepName}-${timestamp}.png`;
      const screenshotDir = path.join(__dirname, '../../custom-reports/scenario-2');
      const screenshotPath = path.join(screenshotDir, fileName);
      
      // 디렉토리가 없으면 생성
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
        captureLog('info', `📁 스크린샷 디렉토리 생성: ${screenshotDir}`);
      }
      
      // CONTRABASS, CMP, VIOLA와 동일하게: 브라우저가 닫혀있지 않을 때만 스크린샷 시도
      if (!page.isClosed()) {
        // 스크린샷 찍기 (완료까지 대기)
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: true 
        });
        
        // 파일이 실제로 생성되었는지 확인
        if (fs.existsSync(screenshotPath)) {
          const stats = fs.statSync(screenshotPath);
          captureLog('success', `📸 ${stepName} 단계 완료 스크린샷 저장 완료: ${fileName} (크기: ${stats.size} bytes)`);
          
          // 상대 경로로 저장 (리포트에서 참조할 경로)
          const relativePath = `./${fileName}`;
          testCase.screenshots = [relativePath]; // 배열을 새로 할당하여 1개만 유지
        } else {
          captureLog('error', `📸 스크린샷 파일이 생성되지 않았습니다: ${screenshotPath}`);
        }
      } else {
        captureLog('warning', `⚠️ 브라우저가 닫혀있어 스크린샷을 캡처할 수 없습니다: ${stepName}`);
        
        // CONTRABASS, CMP, VIOLA와 동일하게: 브라우저가 닫혔는데 status가 pass라면 fail로 변경
        if (testCase.status === 'pass') {
          testCase.status = 'fail';
          testCase.error = new Error('브라우저가 강제 종료되었습니다');
          testResults.status = 'fail';
          testResults.error = testCase.error;
          captureLog('error', `❌ ${stepName} 실패: 브라우저 강제 종료 (스크린샷 단계에서 감지)`);
        }
      }
    } catch (screenshotError) {
      captureLog('error', `스크린샷 저장 실패: ${screenshotError.message}`);
      
      // CONTRABASS, CMP, VIOLA와 동일하게: 스크린샷 에러가 브라우저 종료 때문이라면 fail로 변경
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
  };

  captureLog('info', `📝 ${stepName} 시작...`);
  const startTime = new Date();
  
  try {
    await action();
    
    // CONTRABASS, CMP, VIOLA와 동일하게: 브라우저 강제 종료 감지 (action 완료 직후)
    if (page.isClosed()) {
      testCase.status = 'fail';
      testCase.error = new Error('브라우저가 강제 종료되었습니다');
      testResults.status = 'fail';
      testResults.error = testCase.error;
      captureLog('error', `❌ ${stepName} 실패: 브라우저 강제 종료`);
      throw testCase.error;
    }
    
    // 스크린샷 캡처 전 1초 대기 (UI 안정화를 위해)
    captureLog('info', `⏳ UI 안정화를 위해 1초 대기 중...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testCase.status = 'pass';
    captureLog('success', `✅ ${stepName} 성공`);
    
    // 테스트 성공 후 단계 완료 스크린샷 (완료까지 대기)
    await captureScreenshot();
    
  } catch (error) {
    // 수동으로 닫힌 테스트인지 확인 (브라우저 강제종료나 중단 버튼)
    const isManuallyClosed = global.manuallyClosedTests && global.manuallyClosedTests.has('scenario-2');
    
    testCase.status = 'fail';
    testCase.error = error;
    testResults.status = 'fail';
    testResults.error = error;
    
    if (isManuallyClosed) {
      captureLog('error', `❌ ${stepName} 수동 중단: ${error.message}`);
    } else {
      captureLog('error', `❌ ${stepName} 실패: ${error.message}`);
    }
    
    // 실패하는 순간 즉시 스크린샷 캡처 (UI 안정화를 위해 0.5초만 대기)
    captureLog('info', `⏳ 실패 상태 캡처를 위해 0.5초 대기 중...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 테스트 실패 순간 스크린샷 (완료까지 대기)
    await captureScreenshot('실패');
    
    // CONTRABASS, CMP, VIOLA와 동일하게: catch 블록에서 나머지 테스트를 not-test로 변경하지 않음
    // 성공한 부분까지는 성공으로 표시되고, 실패나 종료한 단계에서만 실패하고 그 이후만 N/A로 처리됨
    // afterAll에서 pending 상태를 not-test로 변경하는 로직이 처리함
    
    throw error;
  } finally {
    testCase.endTime = new Date().toISOString();
    const endTime = new Date();
    const duration = endTime - startTime;
    testCase.duration = duration;
    captureLog('info', `⏱️ ${stepName} 소요시간: ${duration}ms`);
  }
}

// 매니저 클래스들 import
// import UserManager from '../../lib/classes/UserManager.js';

// 설정 파일에서 데이터를 읽어오는 함수 (시나리오별)
function loadTestSettings() {
  const scenarioId = 1; // 현재 시나리오 ID
  const configPath = path.join(__dirname, `../../config/scenario/test-settings-${scenarioId}.json`);
  
  // 시나리오별 설정 파일이 존재하는지 확인
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    // 동적으로 생성되는 값들
    config.repository.group = config.project.code;
    return config;
  } else {
    // 시나리오별 설정 파일이 없으면 기본 설정 파일 사용
    const defaultConfigPath = path.join(__dirname, '../../config/test-settings.json');
    const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    // 동적으로 생성되는 값들
    config.repository.group = config.project.code;
    return config;
  }
}

// 파이프라인 템플릿에서 동적으로 내용을 생성하는 함수
async function generatePipelineContent(templatePath, taskCode) {
  try {
    console.log(`🔄 파이프라인 내용 생성: ${templatePath} - 업무코드 ${taskCode}`);
    
    // 템플릿 파일 읽기
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // 플레이스홀더 치환
    let generatedContent = templateContent.replace(/\$\{업무코드\}/g, taskCode);
    generatedContent = generatedContent.replace(/\$\{업무코드\}-REPO/g, `${taskCode}-REPO`);
    
    console.log(`✅ 파이프라인 내용 생성 완료: ${taskCode}/${taskCode}-REPO`);
    return generatedContent;
    
  } catch (error) {
    console.log('❌ 파이프라인 내용 생성 실패:', error.message);
    throw error;
  }
}

// 배치 파일을 실행하는 함수
async function executeBatchFile(taskCode) {
  try {
    console.log(`🔄 배치 파일 실행: 업무코드 ${taskCode}`);
    
    const { spawn } = await import('child_process');
    const batchFilePath = path.join(__dirname, '../../scripts/push-files-to-repo.bat');
    
    // 배치 파일 존재 확인
    if (!fs.existsSync(batchFilePath)) {
      throw new Error(`배치 파일이 존재하지 않습니다: ${batchFilePath}`);
    }
    
    console.log(`📁 배치 파일 경로: ${batchFilePath}`);
    console.log(`📋 실행 매개변수: ${taskCode}`);
    
    return new Promise((resolve, reject) => {
      // 배치 파일 실행
      const child = spawn('cmd', ['/c', batchFilePath, taskCode], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      // stdout 처리
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(`📤 [BATCH] ${output.trim()}`);
      });
      
      // stderr 처리
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.log(`📤 [BATCH-ERROR] ${output.trim()}`);
      });
      
      // 프로세스 종료 처리
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ 배치 파일 실행 성공 (종료 코드: ${code})`);
          resolve({ success: true, code, stdout, stderr });
        } else {
          console.log(`❌ 배치 파일 실행 실패 (종료 코드: ${code})`);
          reject(new Error(`배치 파일 실행 실패 (종료 코드: ${code})\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`));
        }
      });
      
      // 프로세스 오류 처리
      child.on('error', (error) => {
        console.log(`❌ 배치 파일 실행 오류: ${error.message}`);
        reject(error);
      });
      
      // 타임아웃 설정 (5분)
      setTimeout(() => {
        child.kill();
        reject(new Error('배치 파일 실행 타임아웃 (5분)'));
      }, 5 * 60 * 1000);
    });
    
  } catch (error) {
    console.log('❌ 배치 파일 실행 실패:', error.message);
    throw error;
  }
}

// 매니저 클래스들을 초기화하는 함수
function initializeManagers(page) {
  const tromboneUtils = new utils(page);
  
  return {
    utils: tromboneUtils,
    taskCodeManager: new TaskCodeManager(tromboneUtils),
    toolchainManager: new ToolchainManager(tromboneUtils),
    repositoryManager: new RepositoryManager(tromboneUtils),
    // userManager: new UserManager(tromboneUtils),
    userTaskCodeManager: new UserTaskCodeManager(tromboneUtils),
    sonarQubeManager: new SonarQubeManager(tromboneUtils),
    jUnitManager: new JUnitManager(tromboneUtils),
    pipelineManager: new PipelineManager(tromboneUtils),
    loginManager: new LoginManager(page),
    ticketCreateManager: new TicketCreateManagerEmergency(tromboneUtils),
    ticketApproachManager: new TicketApproachManager(tromboneUtils),
    ticketApproval: new TicketApproval(tromboneUtils),
    gitlabManager: new GitLabManager(page),
    approvalManager: new ApprovalManager(tromboneUtils),
    ticketCodeMergeSTGManager: new TicketCodeMergeSTGManager(tromboneUtils),
    ticketCodeMergePRDManager: new TicketCodeMergePRDManager(tromboneUtils),
    ticketManualDeploymentSTGManager: new TicketManualDeploymentSTGManager(tromboneUtils),
    ticketManualDeploymentPRDManager: new TicketManualDeploymentPRDManager(tromboneUtils),
    ticketIntegrationTestManager: new TicketIntegrationTestManager(tromboneUtils),
    ticketDeploymentInformationManager: new TicketDeploymentInformationManager(tromboneUtils),
  };
}

// 시나리오 2: CI/CD 긴급 티켓을 통한 K8S 배포 시나리오 (예약 배포 / 직렬 결재)
test.describe.serial('시나리오 2: CI/CD 긴급 티켓을 통한 K8S 배포 시나리오', () => {
  let page;
  let browser;
  let config;
  let managers;

  // 테스트 시작 전 한 번만 실행 - 로그인 및 초기 설정
  test.beforeAll(async ({ browser: browserInstance }) => {
    browser = browserInstance;
    // 테스트 시작을 명확하게 표시
    console.log('🚀 시나리오 2 테스트 시작');
    process.stdout.write('🚀 시나리오 2 테스트 시작\n');
    
    console.log('📋 설정 파일 로드 중...');
    process.stdout.write('📋 설정 파일 로드 중...\n');
    
    config = loadTestSettings();
    console.log('✅ 설정 파일 로드 완료');
    
    // 스크린샷 디렉토리 생성 (없으면)
    const screenshotDir = path.join(__dirname, '../../custom-reports/scenario-2');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // 브라우저 인스턴스 저장
    browser = browserInstance;
    
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
        }
      });
      console.log('🎬 녹화가 활성화되어 브라우저 컨텍스트를 생성합니다.');
    } else {
      context = await browser.newContext();
      console.log('🎬 녹화가 비활성화되어 일반 브라우저 컨텍스트를 생성합니다.');
    }
    
    // 브라우저 페이지 생성
    page = await context.newPage();
    
    // 매니저 클래스들 초기화
    console.log('🔧 매니저 클래스 초기화 중...');
    managers = initializeManagers(page);
    console.log('✅ 매니저 클래스 초기화 완료');
     
     // GitLab 매니저는 initializeManagers에서 초기화됨
     console.log('✅ GitLab 매니저 초기화 완료');
  });

  // 테스트 종료 후 정리
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
          
          // 사용자 지정 녹화 저장 경로에 복사 확인
          try {
            const userRecordingSettingsPath = path.join(__dirname, '../../config/user-recording-folders.json');
            if (fs.existsSync(userRecordingSettingsPath)) {
              const userRecordingFolders = JSON.parse(fs.readFileSync(userRecordingSettingsPath, 'utf8'));
              const userFolderPath = userRecordingFolders['2']; // 시나리오 2의 녹화 폴더
              
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
          console.log(`⚠️ [시나리오 2] 녹화 파일 경로를 가져올 수 없습니다.`);
        }
      } catch (error) {
        console.log(`⚠️ 녹화 파일명 변경 중 오류: ${error.message}`);
      }
    } else {
      console.log('🎬 녹화가 비활성화되어 녹화 파일 처리를 건너뜁니다.');
    }
    
    testResults.endTime = new Date().toISOString();
    const duration = new Date(testResults.endTime) - new Date(testResults.startTime);
    testResults.duration = `${Math.round(duration / 1000 / 60)}분`;

    // 수동으로 닫힌 테스트인지 확인 (브라우저 강제종료나 중단 버튼)
    const isManuallyClosed = global.manuallyClosedTests && global.manuallyClosedTests.has('scenario-2');
    
    // CONTRABASS, CMP, VIOLA와 동일하게: 실행되지 않은 테스트(pending)를 not-test로 처리
    // 성공한 부분까지는 성공으로 표시되고, 실패나 종료한 단계에서만 실패하고 그 이후만 N/A로 처리됨
    const hasPendingTests = testResults.testCases.some(tc => tc.status === 'pending');
    if (hasPendingTests) {
      if (isManuallyClosed) {
        console.log('⚠️ 테스트가 수동으로 중단되었습니다 (브라우저 강제종료 또는 중단 버튼).');
        testResults.status = 'fail';
        testResults.error = new Error('테스트가 수동으로 중단되었습니다.');
      } else {
        // 실패한 테스트가 있는 경우에만 fail 상태로 설정
        const hasFailedTests = testResults.testCases.some(tc => tc.status === 'fail');
        if (hasFailedTests) {
          console.log('⚠️ 테스트가 중단되었습니다.');
          testResults.status = 'fail';
          testResults.error = new Error('테스트가 중단되었습니다.');
        }
      }
      
      // 모든 pending 상태의 테스트를 not-test로 표시 (실행되지 않은 테스트)
      testResults.testCases.forEach(tc => {
        if (tc.status === 'pending') {
          tc.status = 'not-test';
          tc.error = isManuallyClosed 
            ? new Error('테스트 수동 중단으로 인해 실행되지 않음')
            : new Error('테스트 중단으로 인해 실행되지 않음');
          tc.endTime = new Date().toISOString();
        }
      });
    }

    // 결과를 파일에 저장
    const resultPath = path.join(__dirname, '../../custom-reports/global-test-results.json');
    try {
      let allResults = {};
      if (fs.existsSync(resultPath)) {
        allResults = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      }
      allResults['scenario-2'] = testResults;
      fs.writeFileSync(resultPath, JSON.stringify(allResults, null, 2));
      
      console.log('📊 테스트 결과 요약:');
      console.log(`- 총 테스트 케이스: ${testResults.testCases.length}`);
      console.log(`- 성공: ${testResults.testCases.filter(tc => tc.status === 'pass').length}`);
      console.log(`- 실패: ${testResults.testCases.filter(tc => tc.status === 'fail').length}`);
      console.log(`- NOT TEST: ${testResults.testCases.filter(tc => tc.status === 'not-test').length}`);
      console.log(`- 전체 상태: ${testResults.status}`);
      if (testResults.error) {
        console.log(`- 오류: ${testResults.error.message}`);
      }

      // 디버그: 모든 테스트 케이스 상태 출력
      console.log('📋 모든 테스트 케이스:');
      testResults.testCases.forEach((tc, index) => {
        console.log(`  ${index + 1}. ${tc.name} - ${tc.status}`);
      });

      // 커스텀 HTML 리포트는 main.js에서 자동으로 생성됩니다.
      console.log('📊 테스트 결과가 main.js로 전달되어 커스텀 리포트가 생성될 예정입니다.');
    } catch (error) {
      console.error('결과 저장 중 오류 발생:', error);
    }

    if (page) {
      try {
        // 메모리 정리 (페이지가 닫혀있지 않은 경우에만)
        if (!page.isClosed()) {
          await page.evaluate(() => {
            if (window.gc) window.gc();
          });
        }
      } catch (error) {
        console.log('메모리 정리 중 오류 (무시됨):', error.message);
      }
      
      try {
        await page.close();
      } catch (error) {
        console.log('페이지 닫기 중 오류 (무시됨):', error.message);
      }
    }
    console.log('🏁 시나리오 2 테스트 완료');
  });

  // === 로그인 ===
  test('로그인 페이지 접근', async () => {
    await runTestStep('로그인 페이지 접근', async () => {
      await managers.loginManager.navigateToLoginPage();
    }, page);
  });

  test('로그인 정보 입력', async () => {
    await runTestStep('로그인 정보 입력', async () => {
      await managers.loginManager.fillLoginCredentials(config);
    }, page);
  });

  test('로그인 실행 및 성공 확인', async () => {
    await runTestStep('로그인 실행 및 성공 확인', async () => {
      await managers.loginManager.submitLoginAndVerify();
    }, page);
  });

  // === 시나리오 테스트 단계 ===
  test('업무코드 메뉴 접근', async () => {
    await runTestStep('업무코드 메뉴 접근', async () => {
      await managers.taskCodeManager.navigateToTaskCodeMenu();
    }, page);
  });

  test('업무코드 등록 화면 열기', async () => {
    await runTestStep('업무코드 등록 화면 열기', async () => {
      await managers.taskCodeManager.openRegistrationForm();
    }, page);
  });

  test('업무코드 정보 입력', async () => {
    await runTestStep('업무코드 정보 입력', async () => {
      await managers.taskCodeManager.fillTaskCodeInfo(config);
    }, page);
  });

  // test('의도적 실패 테스트', async () => { /* 주석 처리됨 */ });

  test('업무코드 저장 및 확인', async () => {
    await runTestStep('업무코드 저장 및 확인', async () => {
      await managers.taskCodeManager.saveAndVerifyTaskCode(config);
    }, page);
  });

  test('툴체인 메뉴 접근', async () => {
    await runTestStep('툴체인 메뉴 접근', async () => {
      await managers.toolchainManager.navigateToToolchainMenu();
    }, page);
  });

  test('툴체인 등록 화면 열기', async () => {
    await runTestStep('툴체인 등록 화면 열기', async () => {
      await managers.toolchainManager.openRegistrationForm();
    }, page);
  });

  test('툴체인 기본 정보 입력', async () => {
    await runTestStep('툴체인 기본 정보 입력', async () => {
      await managers.toolchainManager.fillBasicInfo(config);
    }, page);
  });

  test('툴체인 저장 및 확인', async () => {
    await runTestStep('툴체인 저장 및 확인', async () => {
      await managers.toolchainManager.saveAndVerifyToolchain(config);
    }, page);
  });

  test('저장소 메뉴 접근', async () => {
    await runTestStep('저장소 메뉴 접근', async () => {
      await managers.repositoryManager.navigateToRepositoryMenu();
    }, page);
  });

  test('저장소 등록 화면 열기', async () => {
    await runTestStep('저장소 등록 화면 열기', async () => {
      await managers.repositoryManager.openRegistrationForm();
    }, page);
  });

  test('저장소 정보 입력', async () => {
    await runTestStep('저장소 정보 입력', async () => {
      await managers.repositoryManager.fillRepositoryInfo(config);
    }, page);
  });

  test('저장소 저장 및 확인', async () => {
    await runTestStep('저장소 저장 및 확인', async () => {
      await managers.repositoryManager.saveAndVerifyRepository(config);
    }, page);
  });

  test('배치 파일 실행', async () => {
    await runTestStep('배치 파일 실행', async () => {
      await executeBatchFile(config.project.code);
    }, page);
  });

  test('GitLab 파일 수정', async () => {
    await runTestStep('GitLab 파일 수정', async () => {
      await managers.gitlabManager.modifyFile(config);
    }, page);
  });

  // test('사용자 메뉴 접근', async () => { /* 주석 처리됨 */ });

  // test('사용자 등록 화면 열기', async () => { /* 주석 처리됨 */ });

  // test('사용자 기본 정보 입력', async () => { /* 주석 처리됨 */ });

  // test('티켓 전용 업무 및 역할 설정', async () => { /* 주석 처리됨 */ });

  // test('사용자 업무 및 역할 설정', async () => { /* 주석 처리됨 */ });

  // test('사용자 구분 설정', async () => { /* 주석 처리됨 */ });

  // test('사용자 저장 및 확인', async () => { /* 주석 처리됨 */ });

  test('사용자 업무코드 메뉴 접근', async () => {
    await runTestStep('사용자 업무코드 메뉴 접근', async () => {
      await managers.userTaskCodeManager.navigateToUserTaskCodeMenu();
    }, page);
  });

  test('사용자 업무코드 등록 화면 열기', async () => {
    await runTestStep('사용자 업무코드 등록 화면 열기', async () => {
      await managers.userTaskCodeManager.openRegistrationForm();
    }, page);
  });

  test('사용자 업무코드 정보 입력', async () => {
    await runTestStep('사용자 업무코드 정보 입력', async () => {
      await managers.userTaskCodeManager.fillUserTaskCodeInfo(config);
    }, page);
  });

  test('사용자 업무코드 저장 및 확인', async () => {
    await runTestStep('사용자 업무코드 저장 및 확인', async () => {
      await managers.userTaskCodeManager.saveAndVerifyUserTaskCode(config);
    }, page);
  });

  test('SonarQube 메뉴 접근', async () => {
    await runTestStep('SonarQube 메뉴 접근', async () => {
      await managers.sonarQubeManager.navigateToSonarQubeMenu();
    }, page);
  });

  test('SonarQube 등록 화면 열기', async () => {
    await runTestStep('SonarQube 등록 화면 열기', async () => {
      await managers.sonarQubeManager.openRegistrationForm();
    }, page);
  });

  test('SonarQube 정보 입력', async () => {
    await runTestStep('SonarQube 정보 입력', async () => {
      await managers.sonarQubeManager.fillSonarQubeInfo(config);
    }, page);
  });

  test('SonarQube 저장 및 확인', async () => {
    await runTestStep('SonarQube 저장 및 확인', async () => {
      await managers.sonarQubeManager.saveAndVerifySonarQube(config);
    }, page);
  });

  test('JUnit 메뉴 접근', async () => {
    await runTestStep('JUnit 메뉴 접근', async () => {
      await managers.junitManager.navigateToJUnitMenu();
    }, page);
  });

  test('JUnit 등록 화면 열기', async () => {
    await runTestStep('JUnit 등록 화면 열기', async () => {
      await managers.junitManager.openRegistrationForm();
    }, page);
  });

  test('JUnit 정보 입력', async () => {
    await runTestStep('JUnit 정보 입력', async () => {
      await managers.junitManager.fillJUnitInfo(config);
    }, page);
  });

  test('JUnit 저장 및 확인', async () => {
    await runTestStep('JUnit 저장 및 확인', async () => {
      await managers.junitManager.saveAndVerifyJUnit(config);
    }, page);
  });

  test('STG 파이프라인 등록', async () => {
    await runTestStep('STG 파이프라인 등록', async () => {
      await managers.pipelineManager.createSTGPipeline(config);
    }, page);
  });

  test('PRD 파이프라인 등록', async () => {
    await runTestStep('PRD 파이프라인 등록', async () => {
      await managers.pipelineManager.createPRDPipeline(config);
    }, page);
  });

  test('티켓 관리 메뉴 접근', async () => {
    await runTestStep('티켓 관리 메뉴 접근', async () => {
      await managers.ticketCreateManager.navigateToTicketManagementMenu();
    }, page);
  });

  test('티켓 등록 화면 열기', async () => {
    await runTestStep('티켓 등록 화면 열기', async () => {
      await managers.ticketCreateManager.openTicketRegistrationForm();
    }, page);
  });

  test('티켓 기본 정보 입력', async () => {
    await runTestStep('티켓 기본 정보 입력', async () => {
      await managers.ticketCreateManager.fillBasicInfo(config);
    }, page);
  });

  test('워크플로우 및 승인 설정', async () => {
    await runTestStep('워크플로우 및 승인 설정', async () => {
      await managers.ticketCreateManager.setWorkflowAndApproval(config);
    }, page);
  });

  test('개발자 및 배포일 설정', async () => {
    await runTestStep('개발자 및 배포일 설정', async () => {
      await managers.ticketCreateManager.setDeveloperAndDeploymentDate(config);
    }, page);
  });

  test('릴리즈 노트 작성', async () => {
    await runTestStep('릴리즈 노트 작성', async () => {
      await managers.ticketCreateManager.writeReleaseNote(config);
    }, page);
  });

  test('저장소 및 브랜치 선택', async () => {
    await runTestStep('저장소 및 브랜치 선택', async () => {
      await managers.ticketCreateManager.selectRepositoryAndBranch(config);
    }, page);
  });

  test('티켓 저장', async () => {
    await runTestStep('티켓 저장', async () => {
      await managers.ticketCreateManager.saveTicket();
    }, page);
  });

  test('첫 번째 승인 프로세스', async () => {
    await runTestStep('첫 번째 승인 프로세스', async () => {
      await managers.approvalManager.processFirstApproval(config);
    }, page);
  });

  test('두 번째 승인 프로세스', async () => {
    await runTestStep('두 번째 승인 프로세스', async () => {
      await managers.approvalManager.processSecondApproval(config);
    }, page);
  });

  test('알림 확인', async () => {
    await runTestStep('알림 확인', async () => {
      await managers.ticketApproachManager.confirmNotification();
    }, page);
  });

  test('티켓 접근', async () => {
    await runTestStep('티켓 접근', async () => {
      await managers.ticketApproachManager.accessTicket(config);
    }, page);
  });

  test('코드병합(STG) 단계: 코드병합(STG) 가능 확인', async () => {
    await runTestStep('코드병합(STG) 단계: 코드병합(STG) 가능 확인', async () => {
      await managers.ticketCodeMergeSTGManager.checkMergePossibility();
    }, page);
  });

  test('코드병합(STG) 단계: 코드병합(STG) 진행', async () => {
    await runTestStep('코드병합(STG) 단계: 코드병합(STG) 진행', async () => {
      await managers.ticketCodeMergeSTGManager.proceedMerge();
    }, page);
  });

  test('코드병합(STG) 단계: 코드병합(STG) 단계 완료 및 다음 단계 진입', async () => {
    await runTestStep('코드병합(STG) 단계: 코드병합(STG) 단계 완료 및 다음 단계 진입', async () => {
      await managers.ticketCodeMergeSTGManager.completeAndProceedToNext();
    }, page);
  });

  test('검증배포(즉시배포) 단계: 검증배포(즉시배포)', async () => {
    await runTestStep('검증배포(즉시배포) 단계: 검증배포(즉시배포)', async () => {
      await managers.ticketManualDeploymentSTGManager.proceedManualDeployment();
    }, page);
  });

  test('검증배포(즉시배포) 단계: 검증배포(즉시배포) 단계 완료 및 다음 단계 진입', async () => {
    await runTestStep('검증배포(즉시배포) 단계: 검증배포(즉시배포) 단계 완료 및 다음 단계 진입', async () => {
      await managers.ticketManualDeploymentSTGManager.completeAndProceedToNext();
    }, page);
  });

  test('통합테스트 단계: 통합테스트 파일 업로드', async () => {
    await runTestStep('통합테스트 단계: 통합테스트 파일 업로드', async () => {
      await managers.ticketIntegrationTestManager.uploadIntegrationTestFile();
    }, page);
  });

  test('통합테스트 단계: 통합테스트 단계 완료 및 다음 단계 진입', async () => {
    await runTestStep('통합테스트 단계: 통합테스트 단계 완료 및 다음 단계 진입', async () => {
      await managers.ticketIntegrationTestManager.completeAndProceedToNext();
    }, page);
  });

  test('코드병합(PRD) 단계: 코드병합(PRD) 가능 확인', async () => {
    await runTestStep('코드병합(PRD) 단계: 코드병합(PRD) 가능 확인', async () => {
      await managers.ticketCodeMergePRDManager.checkMergePossibility();
    }, page);
  });

  test('코드병합(PRD) 단계: 코드병합(PRD) 진행', async () => {
    await runTestStep('코드병합(PRD) 단계: 코드병합(PRD) 진행', async () => {
      await managers.ticketCodeMergePRDManager.proceedMerge();
    }, page);
  });

  test('코드병합(PRD) 단계: 코드병합(PRD) 단계 완료 및 다음 단계 진입', async () => {
    await runTestStep('코드병합(PRD) 단계: 코드병합(PRD) 단계 완료 및 다음 단계 진입', async () => {
      await managers.ticketCodeMergePRDManager.completeAndProceedToNext();
    }, page);
  });

  test('운영배포(즉시배포) 단계: 운영배포(즉시배포)', async () => {
    await runTestStep('운영배포(즉시배포) 단계: 운영배포(즉시배포)', async () => {
      await managers.ticketManualDeploymentPRDManager.proceedManualDeployment();
    }, page);
  });

  test('운영배포(즉시배포) 단계: 운영배포(즉시배포) 단계 완료 및 다음 단계 진입', async () => {
    await runTestStep('운영배포(즉시배포) 단계: 운영배포(즉시배포) 단계 완료 및 다음 단계 진입', async () => {
      await managers.ticketManualDeploymentPRDManager.completeAndProceedToNext();
    }, page);
  });

  test('티켓 종료 단계: 티켓 종료', async () => {
    await runTestStep('티켓 종료 단계: 티켓 종료', async () => {
      await managers.ticketDeploymentInformationManager.closeTicket();
    }, page);
  });

});
