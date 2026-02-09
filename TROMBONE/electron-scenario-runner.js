#!/usr/bin/env node

import { execFileSync, spawn, execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎺 TROMBONE Electron 시나리오 실행기\n');

// TROMBONE 시나리오 구조 레포트 출력 함수
function printViolaReport(scenarioId) {
    console.log(`\n📊 TROMBONE 시나리오 ${scenarioId} 구조 레포트`);
    console.log('=' .repeat(60));
    
    // TROMBONE 시나리오 목록
    const tromboneScenarios = [
        'CI/CD 일반 티켓을 통한 K8S 배포 시나리오 (예약 배포 / 직렬 결재)',
        'CI/CD 긴급 티켓을 통한 K8S 배포 시나리오 (수동 배포 / 병렬 결재)',
        'CI/CD 원복 티켓을 통한 K8S 배포 시나리오',
        'CI/CD 티켓 반려 시나리오 (그룹 결재)',
        '파이프라인 템플릿 기반 스크립트 점검 및 실행 검증',
        'Argo CD를 통한 Kubernetes 매니페스트 배포 시나리오',
        'Argo CD 연동 파이프라인 실패 시 롤백 처리 검증 시나리오',
        '워크플로우 수정 후 기존 티켓과 새로운 티켓의 워크플로우 확인 시나리오',
        'Git 병합 충돌 해결 후 티켓 진행 시나리오',
        '단위테스트 및 정적 분석 실패 시 스킵 후 티켓 진행 시나리오',
        '파이프라인 실행 실패 후 스크립트 수정 시 정상 배포 시나리오',
        '통합테스트 실패 티켓의 조치 및 재의뢰 처리 시나리오',
        '동시 실행 제한에 따른 파이프라인 순차 실행 시나리오',
        'PMS 기반 프로젝트 관리 및 모니터링 시나리오',
        'PMS 일반 티켓을 통한 K8S 배포 시나리오 (예약 배포 / 직렬 결재)',
        'PMS 긴급 티켓을 통한 K8S 배포 시나리오 (수동 배포 / 병렬 결재)',
        'PMS 원복 티켓을 통한 K8S 배포 시나리오',
        'PMS 티켓 반려 시나리오 (그룹 결재)',
        '인수테스트 실패 티켓의 조치 불필요 처리 후 진행 시나리오',
        '단위테스트 및 정적 분석 실패 시 스킵 후 티켓 진행 시나리오',
        'LDAP 연동을 통한 사용자 등록 및 역할에 따른 포털 제어 확인 시나리오'
    ];
    
    console.log('\n📋 TROMBONE 시나리오 목록');
    console.log('-'.repeat(40));
    tromboneScenarios.forEach((scenario, index) => {
        console.log(`${index + 1}. ${scenario}`);
    });
    
    console.log('\n📋 테스트 파일 사용: scenario-' + scenarioId + '.spec.js');
}

// 메인 실행 함수
async function runScenario(scenarioId) {
    const startTime = new Date();
    
    // 전역 변수 초기화 (이전 실행 영향 제거)
    global.tromboneTestOutput = null;
    global.tromboneExecutionError = null;
    if (!global.testResults) {
        global.testResults = new Map();
    }
    console.log(`🔄 TROMBONE 시나리오 ${scenarioId} 전역 변수 초기화 완료`);
    const startTimestamp = startTime.getTime();
    
    // 공통 함수: global-test-results.json 저장
    function saveGlobalTestResults(scenarioId, testResultsData, logMessage) {
        console.log(`\n🔍 [DEBUG] saveGlobalTestResults 호출됨!`);
        console.log(`🔍 [DEBUG] scenarioId: ${scenarioId}, 타입: ${typeof scenarioId}`);
        console.log(`🔍 [DEBUG] testResultsData.testCases.length: ${testResultsData.testCases?.length}`);
        
        const globalTestResultsPath = path.join(__dirname, 'custom-reports', 'global-test-results.json');
        let globalTestResultsData = {};
        
        // 기존 파일이 있으면 읽어오기
        if (fs.existsSync(globalTestResultsPath)) {
            try {
                const rawData = JSON.parse(fs.readFileSync(globalTestResultsPath, 'utf8'));
                console.log(`🔍 [DEBUG] 기존 파일 로드 완료`);
                console.log(`🔍 [DEBUG] 기존 키 개수: ${Object.keys(rawData).length}`);
                
                // 유효한 키만 필터링 (손상된 키 자동 제거)
                let validKeyCount = 0;
                let invalidKeyCount = 0;
                Object.keys(rawData).forEach(key => {
                    // 유효한 키 패턴: 'trombone-scenario-N', 'scenario-N', 'N' (N은 숫자)
                    const validKeyPattern = /^(trombone-scenario-\d+|scenario-\d+|\d+)$/;
                    if (validKeyPattern.test(key)) {
                        globalTestResultsData[key] = rawData[key];
                        validKeyCount++;
                    } else {
                        console.warn(`🔍 [DEBUG] 손상된 키 제거: ${key.substring(0, 50)}...`);
                        invalidKeyCount++;
                    }
                });
                
                console.log(`🔍 [DEBUG] 유효한 키: ${validKeyCount}개, 제거된 키: ${invalidKeyCount}개`);
            } catch (error) {
                console.log(`⚠️ 기존 global-test-results.json 파싱 실패, 새로 생성: ${error.message}`);
                globalTestResultsData = {};
            }
        }
        
        // 호환성을 위해 두 개의 키로 모두 저장 (보수적 접근)
        // 1. TROMBONE 전용 키 (main.js에서 사용)
        const key1 = `trombone-scenario-${scenarioId}`;
        const key2 = `scenario-${scenarioId}`;
        
        console.log(`🔍 [DEBUG] 저장할 키1: ${key1}`);
        console.log(`🔍 [DEBUG] 저장할 키2: ${key2}`);
        
        globalTestResultsData[key1] = testResultsData;
        globalTestResultsData[key2] = testResultsData;
        
        console.log(`🔍 [DEBUG] 저장 후 키 개수: ${Object.keys(globalTestResultsData).length}`);
        
        fs.writeFileSync(globalTestResultsPath, JSON.stringify(globalTestResultsData, null, 2), 'utf8');
        console.log(`💾 ${logMessage}: ${globalTestResultsPath}`);
        console.log(`💾 저장 키: ${key1}, ${key2}\n`);
    }
    
    try {
        console.log(`🚀 TROMBONE 시나리오 ${scenarioId} 실행을 시작합니다...\n`);
        console.log(`⏰ 시작 시간: ${startTime.toLocaleString('ko-KR')}`);
        
        // TROMBONE 녹화 설정 확인
        let recordingEnabled = false;
        let recordingPath = null;
        
        try {
            // 1. 녹화 활성화 설정 확인
            const recordingSettingsPath = path.join(__dirname, 'config', 'recording-settings.json');
            if (fs.existsSync(recordingSettingsPath)) {
                const recordingData = fs.readFileSync(recordingSettingsPath, 'utf8');
                const recordingSettings = JSON.parse(recordingData);
                recordingEnabled = recordingSettings[scenarioId] || false;
                console.log(`📹 TROMBONE 시나리오 ${scenarioId} 녹화 설정: ${recordingEnabled ? '활성화' : '비활성화'}`);
            }
            
            // 2. 녹화 저장 경로 확인 (녹화가 활성화된 경우에만)
                if (recordingEnabled) {
                const userRecordingFoldersPath = path.join(__dirname, 'config', 'user-recording-folders.json');
                if (fs.existsSync(userRecordingFoldersPath)) {
                    const folderData = fs.readFileSync(userRecordingFoldersPath, 'utf8');
                    const userRecordingFolders = JSON.parse(folderData);
                    recordingPath = userRecordingFolders[scenarioId];
                    if (recordingPath) {
                    console.log(`📹 녹화 저장 경로: ${recordingPath}`);
                    } else {
                        console.log(`⚠️ 녹화가 활성화되었지만 저장 경로가 설정되지 않음`);
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️ 녹화 설정 확인 실패: ${error.message}`);
        }
        
        // TROMBONE 시나리오 구조 레포트 출력
        printViolaReport(scenarioId);
        
        console.log('\n🔄 Playwright 테스트 실행 중...');
        console.log('=' .repeat(60));
        
        // TROMBONE 폴더 내의 시나리오 파일 경로
        const testFile = path.join(__dirname, 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
        const configFile = path.join(__dirname, 'playwright.config.js');
        
        console.log(`📂 실행할 테스트 파일: ${testFile}`);
        
        // 파일 존재 확인
        if (!fs.existsSync(testFile)) {
            throw new Error(`테스트 파일이 존재하지 않습니다: ${testFile}`);
        }
        
        if (!fs.existsSync(configFile)) {
            throw new Error(`설정 파일이 존재하지 않습니다: ${configFile}`);
        }
        
        console.log('🔍 Playwright 테스트 직접 실행');
        console.log('--- PLAYWRIGHT DEBUG ---');
        console.log(`CWD: ${__dirname}`);
        console.log(`testFile (raw): ${testFile}`);
        
        // POSIX 경로로 변환
        const testFilePosix = testFile.replace(/\\/g, '/');
        const configPosix = configFile.replace(/\\/g, '/');
        
        console.log(`testFile (posix): ${testFilePosix}`);
        console.log(`config (posix): ${configPosix}`);
        
        // 시나리오 디렉토리 확인
        const scenarioDir = path.join(__dirname, 'tests', 'scenario');
        console.log(`scenarioDir: ${scenarioDir}`);
        
        if (fs.existsSync(scenarioDir)) {
            const files = fs.readdirSync(scenarioDir);
            console.log('scenarioDir file list:');
            files.forEach(file => {
                console.log(` - ${file}`);
            });
        }
        
        console.log(`exists(testFile): ${fs.existsSync(testFile)}`);
        console.log(`exists(config): ${fs.existsSync(configFile)}`);
        console.log('--- /PLAYWRIGHT DEBUG ---');
        
        // Playwright 실행 전에 이전 test-results.json 백업 (캐시 방지하되 실패 시 복구 가능)
        const oldTestResultsPath = path.join(__dirname, 'playwright-report', 'test-results.json');
        const backupTestResultsPath = path.join(__dirname, 'playwright-report', 'test-results.backup.json');
        if (fs.existsSync(oldTestResultsPath)) {
            console.log(`📦 이전 test-results.json 백업: ${oldTestResultsPath}`);
            try {
                // 백업 생성
                fs.copyFileSync(oldTestResultsPath, backupTestResultsPath);
                // 원본 삭제
                fs.unlinkSync(oldTestResultsPath);
                console.log('✅ 이전 결과 파일 백업 및 삭제 완료');
            } catch (deleteError) {
                console.warn(`⚠️ 이전 결과 파일 처리 실패: ${deleteError.message}`);
            }
        }
        
        // PLAN-A: exec로 실행 (POSIX 경로, 실시간 로그 지원)
        console.log('\n🚀 PLAN-A: exec로 실행 (POSIX 경로)');
        console.log(`📂 실행 명령: npx playwright test "${testFilePosix}" --project=chromium`);
        
        let result;
        let playwrightOutput = '';
        let playwrightError = '';
        let testExitCode = 0;
        
        try {
            const command = `npx playwright test "${testFilePosix}" --project=chromium --headed --reporter=list`;
            console.log(`📂 실행 명령: ${command}`);
            
            // 환경 변수 설정 및 디버깅
            const envVars = {
                    ...process.env,
                    DEBUG: '',
                    PWDEBUG: '0',
                    PLAYWRIGHT_DEBUG: '0',
                    PLAYWRIGHT_HEADLESS: 'false',
                    PLAYWRIGHT_VIDEO_ENABLED: recordingEnabled ? 'true' : 'false',
                    NODE_ENV: 'test'
            };
            
            console.log(`📹 환경 변수 PLAYWRIGHT_VIDEO_ENABLED: ${envVars.PLAYWRIGHT_VIDEO_ENABLED}`);
            console.log(`📹 녹화 활성화 상태: ${recordingEnabled}`);
            
            // exec로 변경하여 실시간 로그 지원
            await new Promise((resolve, reject) => {
                const child = exec(command, {
                    cwd: __dirname,
                    env: envVars,
                    maxBuffer: 10 * 1024 * 1024
                }, (error, stdout, stderr) => {
                    playwrightOutput = stdout || '';
                    playwrightError = stderr || '';
                    
                    if (error) {
                        testExitCode = error.code || 1;
                        console.log(`⚠️ Playwright 종료 코드: ${testExitCode} (테스트 실패 가능)`);
                    }
                    
                    resolve();
                });
                
                // 실시간 로그 출력
                child.stdout.on('data', (data) => {
                    const dataStr = data.toString();
                    process.stdout.write(dataStr);
                    playwrightOutput += dataStr;
                });
                
                child.stderr.on('data', (data) => {
                    const dataStr = data.toString();
                    process.stderr.write(dataStr);
                    playwrightError += dataStr;
                });
            });
            
            result = Buffer.from(playwrightOutput);
            
            // 실행 결과를 콘솔에 출력
            console.log(playwrightOutput);
            
            // 성공 케이스에서도 터미널 출력 저장 (터미널 파싱용)
            global.tromboneTestOutput = playwrightOutput;
            
            console.log('✅ PLAN-A 성공: Playwright 테스트 실행 완료');
            
        } catch (planAError) {
            console.log(`⚠️ 테스트 실행 실패: ${planAError.message}`);
            // result 변수를 빈 문자열로 초기화하고 error 정보 저장
            result = Buffer.from('');
            // 오류 정보를 전역 변수로 저장 (나중에 output 파싱에서 사용)
            global.tromboneExecutionError = planAError;
            // 오류를 던지지 않고 계속 진행
            console.log(`❌ TROMBONE 시나리오 ${scenarioId} 실행 중 오류 발생`);
        }
        
        // TROMBONE 동적 테스트 결과 파싱 (성공/실패 모든 경우에 적용)
        console.log(`📊 TROMBONE 동적 테스트 결과 파싱 시작`);
        
        // 1. Playwright test-results.json 파일에서 실제 결과 파싱
        const testResultsPath = path.join(__dirname, 'playwright-report', 'test-results.json');
        let testResults = [];
        let overallStatus = 'fail';
        let totalDuration = 0;
        
        // 브라우저 강제 종료 감지: global.tromboneExecutionError가 있으면 test-results.json을 신뢰하지 않음
        const isBrowserForceClosedFromError = !!global.tromboneExecutionError;
        if (isBrowserForceClosedFromError) {
            console.log(`⚠️ TROMBONE 브라우저 강제 종료 감지 (tromboneExecutionError 존재), test-results.json 무시`);
        }
        
        if (fs.existsSync(testResultsPath) && !isBrowserForceClosedFromError) {
            console.log(`📊 TROMBONE Playwright 결과 파일 발견: ${testResultsPath}`);
            const testResultsData = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
            
            // 시나리오 파일 패턴 매칭 (실제 파일 경로에 맞게 수정)
            const patterns = [
                `scenario/scenario-${scenarioId}.spec.js`,  // 실제 경로
                `tests/scenario/scenario-${scenarioId}.spec.js`,
                `scenario-${scenarioId}.spec.js`
            ];
            
            let scenarioSuite = null;
            console.log(`📊 TROMBONE 시나리오 ${scenarioId} 파일 패턴 검색 중...`);
            for (const pattern of patterns) {
                scenarioSuite = testResultsData.suites?.find(suite => 
                    suite.file && (suite.file === pattern || suite.file.includes(pattern))
                );
                if (scenarioSuite) {
                    console.log(`✅ TROMBONE 시나리오 발견 (패턴: ${pattern}, 실제 파일: ${scenarioSuite.file})`);
                    break;
                } else {
                    console.log(`❌ TROMBONE 패턴 매칭 실패: ${pattern}`);
                }
            }
            
            // 디버깅: 사용 가능한 모든 suite 파일 출력
            if (!scenarioSuite && testResultsData.suites) {
                console.log(`📊 TROMBONE 사용 가능한 suite 파일들:`);
                testResultsData.suites.forEach((suite, index) => {
                    console.log(`  ${index}: ${suite.file || 'undefined'}`);
                });
            }
            
            if (scenarioSuite) {
                console.log(`📊 TROMBONE 시나리오 ${scenarioId} 테스트 결과 발견`);
                
                // 모든 테스트 스펙을 재귀적으로 찾기
                const findAllSpecs = (suite) => {
                    let specs = [];
                    if (suite.specs) {
                        specs = specs.concat(suite.specs);
                    }
                    if (suite.suites) {
                        suite.suites.forEach(subSuite => {
                            specs = specs.concat(findAllSpecs(subSuite));
                        });
                    }
                    return specs;
                };
                
                const allSpecs = findAllSpecs(scenarioSuite);
                console.log(`📊 TROMBONE 발견된 테스트 스펙: ${allSpecs.length}개`);
                
                // 전체 테스트 목록과 results 유무 파악
                const allTests = [];
                allSpecs.forEach(spec => {
                    console.log(`🔍 [DEBUG] spec.title: "${spec.title}", tests 개수: ${spec.tests ? spec.tests.length : 0}`);
                    
                    if (spec.tests && spec.tests.length > 0) {
                        spec.tests.forEach(test => {
                            // Playwright에서 spec.title이 실제 test() 블록의 이름입니다
                            // test.title은 때로는 undefined이거나 다른 값일 수 있으므로 spec.title을 우선 사용
                            const testName = spec.title;
                            
                            console.log(`🔍 [DEBUG] spec.title: "${spec.title}", test.title: "${test.title}", 최종 testName: "${testName}"`);
                            
                            // describe 블록 이름 필터링 (시나리오 전체 이름 제외)
                            if (testName.includes('TROMBONE Scenario') || 
                                testName.includes('시나리오 1:') || 
                                testName.includes('시나리오 2:') ||
                                testName.includes('Pod 삭제 및 백업 복원')) {
                                console.log(`🔍 [DEBUG] describe 블록 제외: ${testName}`);
                                return; // 이 테스트 건너뛰기
                            }
                            
                            // ": 티켓 진행(...)" 형식의 테스트 이름 필터링
                            if (testName.includes(': 티켓 진행') || 
                                testName.startsWith(': 티켓 진행') ||
                                testName.match(/^:\s*티켓 진행/) ||
                                testName.includes('대메뉴: 티켓 진행') ||
                                testName.includes('중메뉴: 티켓 진행')) {
                                console.log(`🔍 [DEBUG] 불필요한 테스트 이름 필터링: ${testName}`);
                                return; // 이 테스트 건너뛰기
                            }
                            
                            allTests.push({
                                name: testName,
                                hasResults: test.results && test.results.length > 0,
                                test: test,
                                result: test.results && test.results.length > 0 ? test.results[0] : null
                            });
                        });
                    }
                });
                
                console.log(`📊 TROMBONE 전체 테스트: ${allTests.length}개, results 있음: ${allTests.filter(t => t.hasResults).length}개`);
                
                // 전체 시나리오 시작 시간 계산
                let scenarioStartTime = null;
                
                // 첫 번째 테스트의 startTime이 있으면 사용
                const firstTestWithResults = allTests.find(t => t.hasResults);
                if (firstTestWithResults && firstTestWithResults.result.startTime) {
                    scenarioStartTime = new Date(firstTestWithResults.result.startTime);
                    console.log(`📊 TROMBONE 시나리오 시작 시간 (첫 번째 테스트): ${scenarioStartTime.toISOString()}`);
                } else {
                    // startTime이 없으면 현재 시간에서 전체 duration을 빼서 추정
                    const totalTestDuration = allTests
                        .filter(t => t.hasResults)
                        .reduce((sum, t) => sum + (t.result.duration || 0), 0);
                    scenarioStartTime = new Date(Date.now() - totalTestDuration);
                    console.log(`📊 TROMBONE 시나리오 시작 시간 (추정): ${scenarioStartTime.toISOString()}, 전체 duration: ${totalTestDuration}ms`);
                }
                
                // 누적 duration 변수
                let accumulatedDuration = 0;
                
                // results가 있는 테스트 파싱
                allTests.forEach(testInfo => {
                    if (testInfo.hasResults) {
                        const result = testInfo.result;
                                
                                // 실제 결과 상태에 따라 상태 설정
                                let status = 'fail';
                                if (result.status === 'passed') {
                                    status = 'pass';
                                } else if (result.status === 'failed' || result.status === 'timedOut') {
                                    status = 'fail';
                                } else if (result.status === 'skipped') {
                                    status = 'not-test';
                                }
                                
                                // 오류 메시지 추출
                                let errorMessage = null;
                                if (result.errors && result.errors.length > 0) {
                                    errorMessage = result.errors[0].message;
                                } else if (result.error) {
                                    errorMessage = result.error.message;
                                }
                                
                                // startTime과 endTime 계산
                                let calculatedStartTime, calculatedEndTime;
                                
                                if (result.startTime) {
                                    // result에 startTime이 있으면 사용
                                    calculatedStartTime = new Date(result.startTime).toISOString();
                                    if (result.endTime) {
                                        calculatedEndTime = new Date(result.endTime).toISOString();
                                    } else {
                                        calculatedEndTime = new Date(new Date(result.startTime).getTime() + (result.duration || 0)).toISOString();
                                    }
                                } else {
                                    // result에 startTime이 없으면 시나리오 시작 시간 + 누적 duration 사용
                                    calculatedStartTime = new Date(scenarioStartTime.getTime() + accumulatedDuration).toISOString();
                                    calculatedEndTime = new Date(scenarioStartTime.getTime() + accumulatedDuration + (result.duration || 0)).toISOString();
                                }
                                
                                // 디버깅: duration 값 확인
                                console.log(`📊 [${testInfo.name}] Playwright result.duration: ${result.duration}ms`);
                                
                                testResults.push({
                            name: testInfo.name,
                                    status: status,
                                    duration: result.duration || 0,
                                    error: errorMessage,
                            hasResults: true,
                                    startTime: calculatedStartTime,
                                    endTime: calculatedEndTime
                                });
                                
                                // 누적 duration 업데이트
                                accumulatedDuration += result.duration || 0;
                                totalDuration += result.duration || 0;
                    } else {
                        // results가 없는 테스트 - 나중에 처리 (브라우저 강제 종료로 실행되지 않은 경우)
                        // 누적 duration 기준으로 시간 설정
                        const notExecutedStartTime = new Date(scenarioStartTime.getTime() + accumulatedDuration).toISOString();
                        const notExecutedEndTime = notExecutedStartTime; // duration이 0이므로 시작과 종료가 같음
                        
                        testResults.push({
                            name: testInfo.name,
                            status: 'not-test',
                            duration: 0,
                            error: '실행되지 않음',
                            hasResults: false,
                            startTime: notExecutedStartTime,
                            endTime: notExecutedEndTime
                        });
                        
                        // duration이 0이므로 accumulatedDuration 업데이트 없음
                    }
                });
                
                // 전체 상태 계산
                if (testResults.length === 0) {
                    overallStatus = 'fail';
                } else if (testResults.some(step => step.status === 'fail')) {
                    overallStatus = 'fail';
                } else if (testResults.every(step => step.status === 'pass')) {
                    overallStatus = 'pass';
                } else {
                    overallStatus = 'fail';
                }
                
                // 브라우저 강제 종료 처리 (모든 테스트가 pass가 아닐 때만)
                if (testResults.length > 0 && overallStatus !== 'pass') {
                    console.log(`📊 TROMBONE 브라우저 강제 종료 지점 탐색 시작 (총 ${testResults.length}개 테스트)`);
                    console.log(`📊 TROMBONE testResults 상세:`, testResults.map((t, i) => `[${i}] ${t.name}: ${t.status} (hasResults: ${t.hasResults})`).join(', '));
                    
                    // results가 없는 테스트가 있는지 확인
                    const hasTestsWithoutResults = testResults.some(t => !t.hasResults);
                    console.log(`📊 TROMBONE hasTestsWithoutResults: ${hasTestsWithoutResults}`);
                    
                    if (hasTestsWithoutResults) {
                        console.log(`⚠️ TROMBONE results가 없는 테스트 발견 - 브라우저 강제 종료 지점 탐지`);
                        overallStatus = 'fail';  // 브라우저 강제 종료로 fail 처리
                        console.log(`📊 TROMBONE overallStatus를 fail로 변경`);
                        
                        // 브라우저 강제 종료 지점 찾기:
                        // 1. 먼저 hasResults가 있는 테스트 중에서 실제로 fail 상태이거나 브라우저 종료 에러가 있는 테스트를 찾음
                        let failIndex = -1;
                        for (let i = 0; i < testResults.length; i++) {
                            const testCase = testResults[i];
                            // hasResults가 있는 테스트만 확인
                            if (testCase.hasResults) {
                                const hasBrowserClosedError = testCase.error && (
                                    testCase.error.includes('browser has been closed') ||
                                    testCase.error.includes('Target closed') ||
                                    testCase.error.includes('Target page') ||
                                    testCase.error.includes('Protocol error') ||
                                    testCase.error.includes('Session closed')
                                );
                                
                                if (testCase.status === 'fail' || hasBrowserClosedError) {
                                    failIndex = i;
                                    console.log(`⚠️ TROMBONE 브라우저 강제 종료 지점 감지 (실제 fail/error): ${testCase.name} (인덱스: ${i})`);
                                    break;
                                }
                            }
                        }
                        
                        // 2. 실제 fail이 없으면 마지막 results 있는 테스트가 브라우저 강제 종료 지점
                        //    (브라우저가 강제 종료되면 해당 테스트는 results는 있지만 불완전한 상태)
                        if (failIndex === -1) {
                            let lastResultsIndex = -1;
                            for (let i = testResults.length - 1; i >= 0; i--) {
                                if (testResults[i].hasResults) {
                                    lastResultsIndex = i;
                                    break;
                                }
                            }
                            
                            if (lastResultsIndex >= 0) {
                                // hasTestsWithoutResults가 true라는 건 브라우저가 강제 종료되었다는 의미
                                // 따라서 마지막 results 있는 테스트가 강제 종료 지점
                                failIndex = lastResultsIndex;
                                console.log(`⚠️ TROMBONE 브라우저 강제 종료 지점 (추정): ${testResults[failIndex].name} (인덱스: ${failIndex}, 마지막 results 있는 테스트)`);
                            } else if (testResults.length > 0) {
                                // results가 없는 테스트만 있는 경우, 첫 번째 테스트를 fail로
                                failIndex = 0;
                                console.log(`⚠️ TROMBONE 브라우저 강제 종료 지점 (추정): ${testResults[failIndex].name} (인덱스: ${failIndex}, 첫 번째 테스트)`);
                            }
                        }
                        
                        if (failIndex >= 0) {
                            // 이미 fail이 아닌 경우에만 상태 변경
                            if (testResults[failIndex].status !== 'fail') {
                                testResults[failIndex].status = 'fail';
                                testResults[failIndex].error = testResults[failIndex].error || '브라우저 강제 종료로 인한 테스트 중단';
                                testResults[failIndex].duration = testResults[failIndex].duration || 0;
                                testResults[failIndex].screenshots = testResults[failIndex].screenshots || [];
                                console.log(`✅ ${testResults[failIndex].name}을(를) fail로 변경 완료`);
                            } else {
                                console.log(`✅ ${testResults[failIndex].name}은(는) 이미 fail 상태`);
                            }
                            
                            // fail point 이후의 테스트들을 not-test로 변경
                            for (let i = failIndex + 1; i < testResults.length; i++) {
                                if (testResults[i].status !== 'not-test') {
                                    testResults[i].status = 'not-test';
                                    testResults[i].error = '이전 단계 실패로 인해 실행되지 않음';
                                    console.log(`✅ ${testResults[i].name}을(를) not-test로 변경`);
                                }
                            }
                        }
                        
                        console.log(`📊 TROMBONE 브라우저 강제 종료 처리 완료: ${testResults.filter(t => t.status === 'pass').length}개 성공, ${testResults.filter(t => t.status === 'fail').length}개 실패, ${testResults.filter(t => t.status === 'not-test').length}개 미수행`);
                    } else if (global.tromboneExecutionError) {
                        // results가 모두 있지만 execSync 오류가 발생한 경우
                        console.log(`📊 TROMBONE execSync 오류 감지 - error 메시지나 fail 상태로 찾기`);
                    overallStatus = 'fail';
                    
                        // error 메시지나 fail 상태로 찾기
                        let failPointFound = false;
                        for (let i = 0; i < testResults.length; i++) {
                            const testCase = testResults[i];
                            
                            if (!failPointFound) {
                                const hasBrowserClosedError = testCase.error && (
                                    testCase.error.includes('browser has been closed') ||
                                    testCase.error.includes('Target closed') ||
                                    testCase.error.includes('Target page') ||
                                    testCase.error.includes('Protocol error')
                                );
                                
                                if (testCase.status === 'fail' || hasBrowserClosedError) {
                                    console.log(`⚠️ TROMBONE 브라우저 강제 종료 지점 감지: ${testCase.name}`);
                                    failPointFound = true;
                                    // 이미 fail 상태
                                }
                            } else {
                                // fail point 이후는 not-test로
                                testResults[i].status = 'not-test';
                                testResults[i].error = '이전 단계 실패로 인해 실행되지 않음';
                            }
                        }
                    }
                }
                
                console.log(`📊 TROMBONE 파싱 결과: ${testResults.length}개 테스트, 상태: ${overallStatus}, totalDuration: ${totalDuration}ms`);
                
                // 성공 케이스에서도 동적 데이터를 global-test-results.json에 저장
                if (testResults.length > 0) {
                    // totalDuration을 "X분 Y초" 형식으로 변환
                    const totalSeconds = Math.round(totalDuration / 1000);
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    const formattedDuration = `${minutes}분 ${seconds}초`;
                    console.log(`📊 TROMBONE duration 계산: ${totalDuration}ms → ${formattedDuration}`);
                    console.log(`📊 TROMBONE testResults 상세 duration: ${testResults.map(t => `${t.name}=${t.duration}ms`).join(', ')}`);
                    
                    const testResultsData = {
                        status: overallStatus,
                        duration: formattedDuration,
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        timestamp: new Date().toLocaleString('ko-KR'),
                        testCases: testResults
                    };
                    
                    if (!global.testResults) {
                        global.testResults = new Map();
                    }
                    global.testResults.set(`trombone-scenario-${scenarioId}`, testResultsData);
                    console.log(`📊 TROMBONE 성공 케이스 동적 파싱 결과 저장 완료: ${testResults.length}개 테스트 케이스`);
                    
                    // 공통 함수로 저장
                    saveGlobalTestResults(scenarioId, testResultsData, 'TROMBONE 성공 케이스 동적 결과 저장 완료');
                }
            } else {
                console.log(`⚠️ TROMBONE 시나리오 ${scenarioId} 테스트 결과를 찾을 수 없음`);
            }
        } else {
            console.log(`⚠️ TROMBONE test-results.json 파일이 존재하지 않음: ${testResultsPath}`);
            
            // 백업 파일 확인
            const backupPath = path.join(__dirname, 'playwright-report', 'test-results.backup.json');
            if (fs.existsSync(backupPath)) {
                console.log(`📦 TROMBONE 백업 파일 발견, 백업 파일로 파싱 시도: ${backupPath}`);
                try {
                    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                    
                    // 백업 파일에서 시나리오 찾기
                    const patterns = [
                        `scenario/scenario-${scenarioId}.spec.js`,
                        `tests/scenario/scenario-${scenarioId}.spec.js`,
                        `scenario-${scenarioId}.spec.js`
                    ];
                    
                    let scenarioSuite = null;
                    for (const pattern of patterns) {
                        scenarioSuite = backupData.suites?.find(suite => 
                            suite.file && (suite.file === pattern || suite.file.includes(pattern))
                        );
                        if (scenarioSuite) break;
                    }
                    
                    if (scenarioSuite) {
                        console.log(`✅ TROMBONE 백업 파일에서 시나리오 발견`);
                        
                        // allTests 추출 (이전과 동일한 로직)
                        const findAllSpecs = (suite) => {
                            let specs = [];
                            if (suite.specs) specs = specs.concat(suite.specs);
                            if (suite.suites) {
                                suite.suites.forEach(subSuite => {
                                    specs = specs.concat(findAllSpecs(subSuite));
                                });
                            }
                            return specs;
                        };
                        
                        const allSpecs = findAllSpecs(scenarioSuite);
                        const allTests = [];
                        allSpecs.forEach(spec => {
                            if (spec.tests && spec.tests.length > 0) {
                                spec.tests.forEach(test => {
                                    const testName = test.title || spec.title;
                                    
                                    // describe 블록 이름 필터링
                                    if (testName.includes('TROMBONE Scenario') || 
                                        testName.includes('시나리오 1:') || 
                                        testName.includes('시나리오 2:') ||
                                        testName.includes('Pod 삭제 및 백업 복원')) {
                                        return; // 건너뛰기
                                    }
                                    
                                    allTests.push({
                                        name: testName,
                                        hasResults: false,  // 백업이므로 results 없음으로 처리
                                        test: test,
                                        result: null
                                    });
                                });
                            }
                        });
                        
                        console.log(`📊 TROMBONE 백업에서 ${allTests.length}개 테스트 발견, 모두 실패로 간주`);
                        
                        // 모든 테스트를 not-test로 초기화
                        allTests.forEach(testInfo => {
                            testResults.push({
                                name: testInfo.name,
                                status: 'not-test',
                                duration: 0,
                                error: '실행되지 않음',
                                hasResults: false,
                                startTime: new Date().toISOString(),
                                endTime: new Date().toISOString()
                            });
                        });
                        
                        // 첫 번째 테스트를 fail로 설정 (실패 지점을 알 수 없으므로)
                        if (testResults.length > 0) {
                            testResults[0].status = 'fail';
                            testResults[0].error = 'Playwright 실행 실패 - 정확한 실패 지점을 알 수 없음';
                            console.log(`⚠️ TROMBONE 첫 번째 테스트를 fail로 설정: ${testResults[0].name}`);
                        }
                        
                        overallStatus = 'fail';
                        
                        // 실제 실행 시간 계산 (startTime - endTime)
                        const endTime = new Date();
                        const actualDurationMs = endTime.getTime() - startTimestamp;
                        const actualSeconds = Math.round(actualDurationMs / 1000);
                        const minutes = Math.floor(actualSeconds / 60);
                        const seconds = actualSeconds % 60;
                        const formattedDuration = `${minutes}분 ${seconds}초`;
                        console.log(`📊 TROMBONE 백업 파일 기반 duration 계산: ${actualDurationMs}ms → ${formattedDuration}`);
                        
                        // 결과 저장
                        const testResultsData = {
                            status: overallStatus,
                            duration: formattedDuration,
                            startTime: startTime.toISOString(),
                            endTime: endTime.toISOString(),
                            timestamp: new Date().toLocaleString('ko-KR'),
                            testCases: testResults
                        };
                        
                        if (!global.testResults) {
                            global.testResults = new Map();
                        }
                        global.testResults.set(`trombone-scenario-${scenarioId}`, testResultsData);
                        saveGlobalTestResults(scenarioId, testResultsData, 'TROMBONE 백업 파일 기반 실패 결과 저장 완료');
                    }
                } catch (backupError) {
                    console.error(`❌ TROMBONE 백업 파일 파싱 실패: ${backupError.message}`);
                }
            } else {
                console.log(`⚠️ TROMBONE 백업 파일도 없음, 실패 정보만 저장`);
            }
        }
        
        // 3. 터미널 출력에서 실제 테스트 결과 파싱 (test-results.json이 없거나 성공 케이스)
        console.log(`📊 TROMBONE 터미널 출력에서 테스트 결과 파싱 시도`);
        
        // 성공/실패 모든 경우에서 터미널 출력 추출
        let terminalOutput = '';
        
        // 1. 성공 케이스: global.tromboneTestOutput 확인
        if (global.tromboneTestOutput) {
            terminalOutput += global.tromboneTestOutput;
            console.log(`📊 TROMBONE 성공 케이스 터미널 출력 발견: ${terminalOutput.length}자`);
        }
        
        // 2. 실패 케이스: global.tromboneExecutionError 확인
        if (global.tromboneExecutionError) {
                const error = global.tromboneExecutionError;
                if (error.stdout) {
                    terminalOutput += error.stdout.toString();
                }
                if (error.stderr) {
                    terminalOutput += error.stderr.toString();
                }
                if (error.message) {
                    terminalOutput += error.message;
                }
            }
            
            if (terminalOutput) {
                console.log(`📊 TROMBONE 터미널 출력 길이: ${terminalOutput.length}자`);
                
                // 테스트 단계별 결과 패턴 파싱 (시나리오 파일에서 동적 추출)
                let testPatterns = [];
                
                // 시나리오 파일에서 allPlannedTestCases 추출
                const extractTestCasesFromSpecFile = (scenarioId) => {
                    try {
                        const specFilePath = path.join(__dirname, 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
                        console.log(`📂 TROMBONE 시나리오 ${scenarioId} spec 파일 경로: ${specFilePath}`);
                        
                        if (!fs.existsSync(specFilePath)) {
                            console.log(`⚠️ TROMBONE 시나리오 ${scenarioId} spec 파일이 존재하지 않음`);
                            return [];
                        }
                        
                        const specContent = fs.readFileSync(specFilePath, 'utf8');
                        const match = specContent.match(/const allPlannedTestCases = \[([\s\S]*?)\];/);
                        
                        if (!match) {
                            console.log(`⚠️ TROMBONE 시나리오 ${scenarioId} spec 파일에서 allPlannedTestCases를 찾을 수 없음`);
                            return [];
                        }
                        
                        const testCases = [];
                        const nameMatches = match[1].matchAll(/\{\s*name:\s*['"]([^'"]+)['"]/g);
                        for (const nameMatch of nameMatches) {
                            testCases.push(nameMatch[1]);
                        }
                        
                        console.log(`✅ TROMBONE 시나리오 ${scenarioId} spec 파일에서 ${testCases.length}개 테스트 케이스 추출`);
                        return testCases;
                    } catch (error) {
                        console.log(`❌ TROMBONE 시나리오 ${scenarioId} spec 파일 파싱 실패: ${error.message}`);
                        return [];
                    }
                };
                
                // spec 파일에서 테스트 케이스 추출
                const testCaseNames = extractTestCasesFromSpecFile(scenarioId);
                
                if (testCaseNames.length > 0) {
                    // 동적으로 패턴 생성 (특수문자 이스케이프 처리)
                    testPatterns = testCaseNames.map(name => ({
                        name: name,
                        pattern: new RegExp(`✅ ${name.replace(/[()]/g, '\\$&')}.*?PASS`, 'i')
                    }));
                    console.log(`📊 TROMBONE 시나리오 ${scenarioId} 동적 테스트 패턴: ${testPatterns.length}개`);
                } else {
                    // fallback: 기본 패턴
                    console.log(`⚠️ TROMBONE 시나리오 ${scenarioId} spec 파일에서 추출 실패, 기본 패턴 사용`);
                    testPatterns = [
                        { name: '로그인 페이지 접근', pattern: /✅ 로그인 페이지 접근.*?PASS/i },
                        { name: '로그인 정보 입력', pattern: /✅ 로그인 정보 입력.*?PASS/i },
                        { name: '로그인 실행', pattern: /✅ 로그인 실행.*?PASS/i },
                        { name: '로그인 성공 확인', pattern: /✅ 로그인 성공 확인.*?PASS/i }
                    ];
                }
                
                console.log(`📊 TROMBONE 시나리오 ${scenarioId} 최종 테스트 패턴 수: ${testPatterns.length}개`);
                
                // 실패 감지 (브라우저 강제 종료 또는 일반 실패)
                const browserClosed = terminalOutput.includes('Target page, context or browser has been closed');
                const hasExecutionError = global.tromboneExecutionError !== null && global.tromboneExecutionError !== undefined;
                let failurePoint = -1;
                
                if (browserClosed || hasExecutionError) {
                if (browserClosed) {
                    console.log(`❌ TROMBONE 터미널에서 브라우저 강제 종료 감지`);
                    } else {
                        console.log(`❌ TROMBONE 터미널에서 execSync 오류 감지 - 실패 지점 찾기`);
                    }
                    
                    // 1. "브라우저가 닫혀있어 스크린샷을 캡처할 수 없습니다" 메시지에서 실패 지점 찾기
                    let failureFromScreenshotError = -1;
                    const screenshotErrorMatch = terminalOutput.match(/⚠️ 브라우저가 닫혀있어 스크린샷을 캡처할 수 없습니다:\s*([^\n]+)/);
                    if (screenshotErrorMatch) {
                        const failedStepName = screenshotErrorMatch[1].trim();
                        console.log(`🔍 TROMBONE 스크린샷 에러에서 실패 단계 발견: "${failedStepName}"`);
                        
                        // testPatterns에서 해당 이름 찾기
                        for (let i = 0; i < testPatterns.length; i++) {
                            if (testPatterns[i].name === failedStepName) {
                                failureFromScreenshotError = i;
                                console.log(`✅ TROMBONE 스크린샷 에러 단계 매칭: ${testPatterns[i].name} (인덱스 ${i})`);
                                break;
                            }
                        }
                    }
                    
                    // 2. 비정상적으로 짧은 duration(< 200ms)을 가진 마지막 PASS 단계 찾기
                    let lastPassIndexWithShortDuration = -1;
                    for (let i = testPatterns.length - 1; i >= 0; i--) {
                        if (testPatterns[i].pattern.test(terminalOutput)) {
                            // 소요시간 추출
                            const durationMatch = terminalOutput.match(new RegExp(`✅ ${testPatterns[i].name.replace(/[()]/g, '\\$&')}.*?PASS \\((\\d+(?:\\.\\d+)?)(?:ms|s)\\)`, 'i'));
                            if (durationMatch) {
                                const timeValue = parseFloat(durationMatch[1]);
                                const duration = durationMatch[0].includes('s)') && !durationMatch[0].includes('ms') ? timeValue * 1000 : timeValue;
                                
                                // 비정상적으로 짧은 duration (< 200ms) 발견
                                if (duration < 200) {
                                    lastPassIndexWithShortDuration = i;
                                    console.log(`⚠️ TROMBONE 비정상적으로 짧은 duration 발견: ${testPatterns[i].name} (${duration}ms)`);
                                    break;
                                }
                            }
                        }
                    }
                    
                    // 3. 우선순위: 스크린샷 에러 > 짧은 duration > PASS 없는 첫 단계
                    if (failureFromScreenshotError >= 0) {
                        failurePoint = failureFromScreenshotError;
                        console.log(`❌ TROMBONE 스크린샷 에러 단계를 실패로 간주: ${testPatterns[failurePoint].name} (인덱스 ${failurePoint})`);
                    } else if (lastPassIndexWithShortDuration >= 0) {
                        failurePoint = lastPassIndexWithShortDuration;
                        console.log(`❌ TROMBONE 비정상적으로 짧은 duration 단계를 실패로 간주: ${testPatterns[failurePoint].name} (인덱스 ${failurePoint})`);
                    } else {
                        // PASS 없는 첫 단계를 실패로 간주
                        for (let i = 0; i < testPatterns.length; i++) {
                            if (!testPatterns[i].pattern.test(terminalOutput)) {
                                failurePoint = i;
                                console.log(`❌ TROMBONE PASS 없는 첫 단계를 실패로 간주: ${testPatterns[i].name} (인덱스 ${i})`);
                                break;
                            }
                        }
                    }
                }
                
                // 시작 시간 기준 설정 (테스트 시작 시간 또는 현재 시간에서 totalDuration을 빼서 추정)
                let baseStartTime = startTime || new Date(Date.now() - totalDuration);
                let accumulatedDuration = 0;
                
                // 테스트 결과 생성
                testPatterns.forEach((test, index) => {
                    let status = 'not-test';
                    let duration = 0;
                    let error = null;
                    
                    // 1. failurePoint 단계인지 먼저 확인 (PASS가 있어도 fail로 처리)
                    if ((browserClosed || hasExecutionError) && index === failurePoint) {
                        status = 'fail';
                        
                        // 소요시간 추출 (터미널에서, 여러 패턴 시도)
                        let durationExtracted = false;
                        
                        // 패턴 1: "✅ 단계명 PASS (N.NNs)" 또는 "✅ 단계명 PASS (NNNms)"
                        const durationMatch1 = terminalOutput.match(new RegExp(`✅ ${test.name.replace(/[()]/g, '\\$&')}.*?PASS \\((\\d+(?:\\.\\d+)?)(?:ms|s)\\)`, 'i'));
                        if (durationMatch1) {
                            const timeValue = parseFloat(durationMatch1[1]);
                            duration = durationMatch1[0].includes('s)') && !durationMatch1[0].includes('ms') ? timeValue * 1000 : timeValue;
                            durationExtracted = true;
                            console.log(`⏱️ TROMBONE failurePoint duration 추출 (패턴1): ${test.name} = ${duration}ms`);
                        }
                        
                        // 패턴 2: "단계명 (N.NNs)" 형식 (PASS 없이)
                        if (!durationExtracted) {
                            const durationMatch2 = terminalOutput.match(new RegExp(`${test.name.replace(/[()]/g, '\\$&')}[^\\n]*?\\((\\d+(?:\\.\\d+)?)(?:ms|s)\\)`, 'i'));
                            if (durationMatch2) {
                                const timeValue = parseFloat(durationMatch2[1]);
                                duration = durationMatch2[0].includes('s)') && !durationMatch2[0].includes('ms') ? timeValue * 1000 : timeValue;
                                durationExtracted = true;
                                console.log(`⏱️ TROMBONE failurePoint duration 추출 (패턴2): ${test.name} = ${duration}ms`);
                            }
                        }
                        
                        // 패턴 3: "N.NN초" 형식
                        if (!durationExtracted) {
                            const durationMatch3 = terminalOutput.match(new RegExp(`${test.name.replace(/[()]/g, '\\$&')}[^\\n]*?(\\d+\\.\\d+)초`, 'i'));
                            if (durationMatch3) {
                                duration = parseFloat(durationMatch3[1]) * 1000;
                                durationExtracted = true;
                                console.log(`⏱️ TROMBONE failurePoint duration 추출 (패턴3): ${test.name} = ${duration}ms`);
                            }
                        }
                        
                        if (!durationExtracted) {
                            duration = 100; // 비정상 종료 시 기본값
                            console.log(`⚠️ TROMBONE failurePoint duration 추출 실패, 기본값 사용: ${test.name} = ${duration}ms`);
                        }
                        
                        // 에러 메시지를 더 구체적으로 설정
                        let errorMessage = '알 수 없는 오류';
                        
                        if (browserClosed) {
                            errorMessage = '브라우저 강제 종료';
                        } else if (hasExecutionError && global.tromboneExecutionError) {
                            // global.tromboneExecutionError에서 핵심 에러 메시지 추출
                            const err = global.tromboneExecutionError;
                            
                            // 1. Playwright 에러 메시지 파싱
                            if (err.message) {
                                // "expect(locator).toBeVisible() failed" 같은 핵심 메시지만 추출
                                const playwrightError = err.message.match(/expect\([^)]+\)\.[^(]+\([^)]*\)\s+(\w+)/);
                                if (playwrightError) {
                                    errorMessage = playwrightError[0].split('\n')[0]; // 첫 줄만
                                } else {
                                    errorMessage = err.message.split('\n')[0].substring(0, 100); // 첫 줄, 최대 100자
                                }
                            }
                            
                            // 2. 터미널 출력에서 더 구체적인 에러 찾기
                            if (terminalOutput) {
                                // "오류:", "Error:", "Failed:" 등의 패턴 찾기
                                const errorPatterns = [
                                    /오류:\s*([^\n]+)/,
                                    /Error:\s*([^\n]+)/,
                                    /Failed:\s*([^\n]+)/,
                                    /expect\([^)]+\)\.[^\s]+.*?failed/i
                                ];
                                
                                for (const pattern of errorPatterns) {
                                    const match = terminalOutput.match(pattern);
                                    if (match) {
                                        errorMessage = match[1] || match[0];
                                        errorMessage = errorMessage.substring(0, 150); // 최대 150자
                                        break;
                                    }
                                }
                            }
                        }
                        
                        error = errorMessage;
                    } else if ((browserClosed || hasExecutionError) && index < failurePoint) {
                        // failurePoint 이전 단계들 - 터미널에서 실제 duration 추출
                        status = 'pass';
                        const durationMatch = terminalOutput.match(new RegExp(`✅ ${test.name.replace(/[()]/g, '\\$&')}.*?PASS \\((\\d+(?:\\.\\d+)?)(?:ms|s)\\)`, 'i'));
                        if (durationMatch) {
                            const timeValue = parseFloat(durationMatch[1]);
                            duration = durationMatch[0].includes('s)') && !durationMatch[0].includes('ms') ? timeValue * 1000 : timeValue;
                        } else {
                            duration = 2000 + index * 500; // 기본값
                        }
                    } else if ((browserClosed || hasExecutionError) && index > failurePoint) {
                        // failurePoint 이후 단계들 - 무조건 not-test
                        status = 'not-test';
                        duration = 0;
                    } else if (test.pattern.test(terminalOutput)) {
                        // 정상 실행 시 PASS 확인
                        status = 'pass';
                        const durationMatch = terminalOutput.match(new RegExp(`✅ ${test.name.replace(/[()]/g, '\\$&')}.*?PASS \\((\\d+(?:\\.\\d+)?)(?:ms|s)\\)`, 'i'));
                        if (durationMatch) {
                            const timeValue = parseFloat(durationMatch[1]);
                            duration = durationMatch[0].includes('s)') && !durationMatch[0].includes('ms') ? timeValue * 1000 : timeValue;
                        } else {
                            duration = 2000 + index * 500; // 기본값
                        }
                    }
                    
                    // 시작 시간과 종료 시간 계산 (누적 duration 사용)
                    const testStartTime = new Date(baseStartTime.getTime() + accumulatedDuration);
                    const testEndTime = new Date(testStartTime.getTime() + duration);
                    
                    testResults.push({
                        name: test.name,
                        status: status,
                        duration: duration,
                        error: error,
                        startTime: testStartTime.toISOString(),
                        endTime: testEndTime.toISOString()
                    });
                    
                    // 누적 duration 업데이트
                    accumulatedDuration += duration;
                    
                    console.log(`📊 TROMBONE 터미널 파싱: ${test.name} -> ${status} (${duration}ms)`);
                });
                
                // 전체 상태 재계산
                if (testResults.some(t => t.status === 'fail')) {
                    overallStatus = browserClosed ? 'stopped' : 'fail';
                } else if (global.tromboneExecutionError) {
                    // execSync 오류가 발생한 경우 강제로 fail 처리
                    overallStatus = 'fail';
                } else if (testResults.every(t => t.status === 'pass')) {
                    overallStatus = 'pass';
                } else {
                    overallStatus = browserClosed ? 'stopped' : 'fail';
                }
                
                // 총 소요시간 재계산
                totalDuration = testResults.reduce((sum, test) => sum + test.duration, 0);
                
                console.log(`📊 TROMBONE 터미널 파싱 완료: ${testResults.length}개 테스트, 상태: ${overallStatus}, totalDuration: ${totalDuration}ms`);
                
                // 터미널 파싱 결과를 global.testResults에 저장 (성공/실패 모든 케이스)
                if (testResults.length > 0) {
                    // totalDuration을 "X분 Y초" 형식으로 변환
                    const totalSeconds = Math.round(totalDuration / 1000);
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    const formattedDuration = `${minutes}분 ${seconds}초`;
                    console.log(`📊 TROMBONE 터미널 파싱 duration 계산: ${totalDuration}ms → ${formattedDuration}`);
                    
                    const testResultsData = {
                        status: overallStatus,
                        duration: formattedDuration,
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        timestamp: new Date().toLocaleString('ko-KR'),
                        testCases: testResults
                    };
                    
                    if (!global.testResults) {
                        global.testResults = new Map();
                    }
                    global.testResults.set(`trombone-scenario-${scenarioId}`, testResultsData);
                    console.log(`📊 TROMBONE 터미널 파싱 결과 저장 완료: ${testResults.length}개 테스트 케이스`);
                    
                    // 공통 함수로 저장
                    saveGlobalTestResults(scenarioId, testResultsData, 'TROMBONE 터미널 파싱 결과 저장 완료');
                }
            }
        
        // 2. 실행 로그에서 추가 정보 파싱 (보조 정보) - stdout과 stderr 모두 캡처
        let output = '';
        try {
            if (typeof result !== 'undefined') {
                if (result.stdout) {
                    output += result.stdout.toString();
                }
                if (result.stderr) {
                    output += result.stderr.toString();
                }
            }
            
            // execSync 오류 발생 시 error 객체에서도 정보 추출
            if (global.tromboneExecutionError) {
                const error = global.tromboneExecutionError;
                if (error.stdout) {
                    output += error.stdout.toString();
                }
                if (error.stderr) {
                    output += error.stderr.toString();
                }
                if (error.message) {
                    output += error.message;
                }
            }
            
            console.log(`📊 TROMBONE output 길이: ${output.length}자`);
            if (output.length > 0) {
                console.log(`📊 TROMBONE output 샘플: ${output.substring(0, 300)}...`);
            }
        } catch (e) {
            console.log(`❌ output 추출 실패: ${e.message}`);
            output = '';
        }
        
        // 실행 로그에서 브라우저 종료 감지 (확장성 있는 TROMBONE 방식)
        if (output.includes('Target page, context or browser has been closed')) {
            console.log(`❌ TROMBONE 브라우저 강제 종료 감지`);
            
            // 브라우저 강제 종료 시점 추정 (실제 실행 시간 기반)
            const executionTime = Date.now() - startTime.getTime();
            let estimatedCompletedSteps = Math.floor(executionTime / 3000); // 평균 3초당 1단계
            estimatedCompletedSteps = Math.min(estimatedCompletedSteps, testResults.length - 1);
            
            console.log(`📊 TROMBONE 추정 완료 단계: ${estimatedCompletedSteps}개 (실행시간: ${executionTime}ms, 총 단계: ${testResults.length}개)`);
            
            // 브라우저 강제 종료로 인한 상태 업데이트 (확장성 있게)
            testResults = testResults.map((step, index) => {
                if (index < estimatedCompletedSteps) {
                    // 실제 완료된 단계는 pass 유지
                    return { ...step, status: 'pass' };
                } else if (index === estimatedCompletedSteps) {
                    // 브라우저 강제 종료가 발생한 단계
                    return { ...step, status: 'fail', error: '브라우저 강제 종료' };
                } else {
                    // 그 이후 단계들은 미실행
                    return { ...step, status: 'not-test', error: '브라우저 강제 종료로 인한 미실행' };
                }
            });
            
            overallStatus = 'stopped';
            console.log(`📊 TROMBONE 브라우저 강제 종료 처리 완료: ${testResults.filter(t => t.status === 'pass').length}개 성공, ${testResults.filter(t => t.status === 'fail').length}개 실패, ${testResults.filter(t => t.status === 'not-test').length}개 미실행`);
        }
        
        console.log(`📊 TROMBONE 최종 파싱 결과: ${testResults.length}개 테스트 케이스, 상태: ${overallStatus}, totalDuration: ${totalDuration}ms`);
        
        // global.testResults 초기화 (필요한 경우)
        if (!global.testResults) {
            global.testResults = new Map();
        }
        
        // 파싱된 결과를 global.testResults에 저장
        if (testResults.length > 0) {
            // totalDuration을 "X분 Y초" 형식으로 변환
            const totalSeconds = Math.round(totalDuration / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const formattedDuration = `${minutes}분 ${seconds}초`;
            console.log(`📊 TROMBONE 최종 파싱 duration 계산: ${totalDuration}ms → ${formattedDuration}`);
            
            const testResultsData = {
                status: overallStatus,
                duration: formattedDuration,
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                timestamp: new Date().toLocaleString('ko-KR'),
                testCases: testResults
            };
            
            global.testResults.set(`trombone-scenario-${scenarioId}`, testResultsData);
            console.log(`📊 TROMBONE 동적 파싱 결과 저장 완료: ${testResults.length}개 테스트 케이스`);
            
            // 공통 함수로 저장
            saveGlobalTestResults(scenarioId, testResultsData, 'TROMBONE 브라우저 강제 종료 결과 저장 완료');
        }
        
        console.log('\n============================================================');
        // 실행 완료 시간 계산
        const endTime = new Date();
        const endTimestamp = endTime.getTime();
        const durationMs = endTimestamp - startTimestamp;
        const durationSeconds = Math.round(durationMs / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        const durationRemainingSeconds = durationSeconds % 60;
        const durationFormatted = `${durationMinutes}분 ${durationRemainingSeconds}초`;
        
        console.log('✅ TROMBONE 시나리오 실행 완료');
        console.log(`⏰ 종료 시간: ${endTime.toLocaleString('ko-KR')}`);
        console.log(`⏱️ 총 실행시간: ${durationFormatted} (${durationMs}ms)`);
        console.log('📊 TROMBONE 구조 레포트 상태:');
        console.log('✅ 테스트가 성공적으로 완료되었습니다.');
        console.log('💡 Playwright HTML 레포트에서 결과 확인: playwright-report/index.html');
        
        // 새로운 커스텀 리포트 생성
        console.log('\n📊 새로운 커스텀 리포트 생성 중...');
        try {
            // TROMBONE의 report-generator.js를 직접 호출하여 커스텀 리포트 생성
            const reportGeneratorPath = path.join(__dirname, 'lib', 'report-generator.js');
            const fileUrl = `file://${reportGeneratorPath.replace(/\\/g, '/')}`;
            const reportGenerator = await import(fileUrl);
            const generator = new reportGenerator.default('trombone');
            
            // 실행시간 정보를 포함한 테스트 결과 데이터 생성 (실제 상태 사용)
            const successTestResultsData = {
                status: overallStatus, // 실제 상태 사용 (pass, fail, stopped 등)
                duration: durationFormatted,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                timestamp: startTime.toLocaleString('ko-KR'),
                testCases: testResults // 실제 파싱된 테스트 케이스 배열 사용
            };
            
            console.log(`📊 TROMBONE successTestResultsData 생성: status=${overallStatus}, testCases=${testResults.length}개`);
            console.log(`🔍 [electron-scenario-runner] overallStatus 최종 값: "${overallStatus}"`);
            console.log(`🔍 [electron-scenario-runner] successTestResultsData.status: "${successTestResultsData.status}"`);
            
            // 실제 Playwright 테스트 결과 파싱 (TROMBONE 독립적)
            try {
                const testResultsPath = path.join(__dirname, 'playwright-report/test-results.json');
                if (fs.existsSync(testResultsPath)) {
                    const testResultsData = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
                    
                    // 테스트 케이스 추출
                    const extractTestCases = (suite) => {
                        let cases = [];
                        if (suite.specs) {
                            suite.specs.forEach(spec => {
                                if (spec.tests && spec.tests.length > 0) {
                                    spec.tests.forEach(test => {
                                        if (test.results && test.results.length > 0) {
                                            const result = test.results[0];
                                            // Playwright에서 실제 테스트 실행 시간 가져오기
                                            const testStartTime = result.startTime ? new Date(result.startTime) : new Date(Date.now() - (result.duration || 0));
                                            const testEndTime = result.endTime ? new Date(result.endTime) : new Date(testStartTime.getTime() + (result.duration || 0));
                                            
                                            cases.push({
                                                name: spec.title,
                                                status: result.status === 'passed' ? 'pass' : 
                                                        result.status === 'skipped' ? 'not-test' : 'fail',
                                                duration: result.duration || 0,
                                                error: result.error?.message || null,
                                                startTime: testStartTime.toISOString(),
                                                endTime: testEndTime.toISOString()
                                            });
                                        } else {
                                            // 실행되지 않은 테스트는 "미수행"으로 표시
                                            cases.push({
                                                name: spec.title,
                                                status: 'not-test',
                                                duration: 0,
                                                error: null,
                                                startTime: null,
                                                endTime: null
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        if (suite.suites) {
                            suite.suites.forEach(subSuite => {
                                cases = cases.concat(extractTestCases(subSuite));
                            });
                        }
                        return cases;
                    };
                    
                    // 시나리오별 테스트 케이스 추출
                    if (testResultsData.suites && testResultsData.suites.length > 0) {
                        const scenarioSuite = testResultsData.suites.find(suite => 
                            suite.title.includes(`시나리오 ${scenarioId}`) || 
                            suite.title.includes(`scenario-${scenarioId}`) ||
                            suite.file && suite.file.includes(`scenario/scenario-${scenarioId}.spec.js`)
                        );
                        
                        if (scenarioSuite) {
                            // 기존 하드코딩된 로직 제거 - 새로운 동적 파싱 로직 사용
                            console.log(`📊 기존 하드코딩된 로직 건너뛰기 - 새로운 동적 파싱 로직 사용`);
                        }
                    }
                } else {
                    console.log('⚠️ Playwright 테스트 결과 파일을 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('❌ 테스트 결과 파싱 중 오류:', error.message);
            }
            
            // 커스텀 리포트 생성 (실행시간 정보 포함)
            
            // global.testResults Map에 저장 (TROMBONE 방식과 동일)
            if (!global.testResults) {
                global.testResults = new Map();
            }
            global.testResults.set(`trombone-scenario-${scenarioId}`, successTestResultsData);
            
            // 무조건 동적 결과만 사용 - 하드코딩 제거
            // 실제 파싱된 testResults 사용 (빈 배열이어도 실제 결과 반영)
            const finalTestResults = {
                status: overallStatus, // 실제 상태 사용 (stopped, fail 등)
                duration: durationFormatted,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                timestamp: startTime.toLocaleString('ko-KR'),
                testCases: testResults // 실제 파싱된 결과 사용 (브라우저 강제 종료 처리 포함)
            };
            
            // global.testResults 초기화 (필요한 경우)
            if (!global.testResults) {
                global.testResults = new Map();
            }
            global.testResults.set(`trombone-scenario-${scenarioId}`, finalTestResults);
            
            // 공통 함수로 저장
            saveGlobalTestResults(scenarioId, finalTestResults, 'global.testResults 저장 완료');
            
            const reportPath = await generator.saveReport(scenarioId, successTestResultsData);
            console.log('✅ TROMBONE 커스텀 리포트 생성 완료');
            
            // 시나리오 목록 업데이트 (duration 정보 포함)
            console.log(`🔍 [electron-scenario-runner] updateScenarioList 호출 전 - successTestResultsData.status: "${successTestResultsData.status}"`);
            generator.updateScenarioList(scenarioId, successTestResultsData);
            console.log('✅ TROMBONE 시나리오 목록 업데이트 완료');
            
            // main.js가 다시 처리하지 않도록 완료 플래그 파일 생성
            const completeFlagPath = path.join(__dirname, 'custom-reports', `scenario-${scenarioId}-complete.flag`);
            fs.writeFileSync(completeFlagPath, JSON.stringify({
                status: overallStatus,
                timestamp: new Date().toISOString(),
                processedBy: 'electron-scenario-runner.js'
            }), 'utf8');
            console.log(`✅ TROMBONE 시나리오 ${scenarioId} 완료 플래그 생성: ${completeFlagPath}`);
            
            // 실제 상태가 fail이나 stopped면 종료 코드 1로 종료
            if (overallStatus === 'fail' || overallStatus === 'stopped') {
                console.log(`⚠️ TROMBONE 시나리오 ${scenarioId} 실패 상태로 종료: ${overallStatus}`);
            }
            
            // 커스텀 리포트 자동으로 열기
            if (reportPath && fs.existsSync(reportPath)) {
                console.log(`🌐 커스텀 리포트 자동 열기: ${reportPath}`);
                try {
                    const platform = process.platform;
                    let command;
                    
                    if (platform === 'win32') {
                        command = `start "" "${reportPath}"`;
                    } else if (platform === 'darwin') {
                        command = `open "${reportPath}"`;
                    } else {
                        command = `xdg-open "${reportPath}"`;
                    }
                    
                    // execSync를 사용하여 리포트가 열릴 때까지 대기
                    try {
                        execSync(command, { windowsHide: true });
                        console.log('✅ 커스텀 리포트 브라우저에서 열림');
                    } catch (execError) {
                        console.warn(`⚠️ 리포트 자동 열기 실패 (무시): ${execError.message}`);
                    }
                } catch (openError) {
                    console.error(`⚠️ 리포트 자동 열기 실패: ${openError.message}`);
                }
            }
            
            // fail이나 stopped 상태면 종료 코드 1로 종료
            if (overallStatus === 'fail' || overallStatus === 'stopped') {
                console.log(`❌ TROMBONE 시나리오 ${scenarioId} ${overallStatus} 상태로 종료 (exit code: 1)`);
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ TROMBONE 커스텀 리포트 생성 실패:', error.message);
        }
        
    } catch (error) {
        // 실패 시에도 실행시간 계산
        const endTime = new Date();
        const endTimestamp = endTime.getTime();
        const durationMs = endTimestamp - startTimestamp;
        const durationSeconds = Math.round(durationMs / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        const durationRemainingSeconds = durationSeconds % 60;
        const durationFormatted = `${durationMinutes}분 ${durationRemainingSeconds}초`;
        
        console.log('\n============================================================');
        console.log(`❌ TROMBONE 시나리오 ${scenarioId} 실행 중 오류 발생`);
        console.log(`⏰ 종료 시간: ${endTime.toLocaleString('ko-KR')}`);
        console.log(`⏱️ 총 실행시간: ${durationFormatted} (${durationMs}ms)`);
        console.log(`오류 코드: ${error.code}`);
        console.log(`오류 메시지: ${error.message}`);
        
        console.log('\n📊 TROMBONE 구조 레포트 상태:');
        console.log('⚠️ 테스트가 완료되지 않아 일부 결과만 확인 가능합니다.');
        console.log('💡 Playwright HTML 레포트에서 중단 지점까지의 결과 확인: playwright-report/index.html');
        
        // 실패 케이스에도 커스텀 리포트 생성
        try {
            console.log('\n📊 실패 케이스 커스텀 리포트 생성 중...');
            const reportGeneratorPath = path.join(__dirname, 'lib', 'report-generator.js');
            const fileUrl = `file://${reportGeneratorPath.replace(/\\/g, '/')}`;
            const reportGenerator = await import(fileUrl);
            const generator = new reportGenerator.default('trombone');
            
            // 실제 Playwright 테스트 결과 파싱 (TROMBONE 방식과 동일)
            const testResults = {
                status: 'fail',
                duration: durationFormatted,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                timestamp: startTime.toLocaleString('ko-KR'),
                error: error.message,
                testCases: [] // 실제 테스트 케이스 결과는 파싱에서 추출
            };
            
            // 실제 실행 로그에서 실패한 테스트를 파싱
            try {
                console.log(`📊 TROMBONE 실제 실행 로그 파싱 시작`);
                
                // 실제 실행 로그에서 실패한 테스트를 찾기
                const failedTests = [];
                const pendingTests = [];
                
                // 실행 로그에서 실패 패턴 찾기
                if (error && error.message) {
                    const errorMessage = error.message;
                    console.log(`📊 TROMBONE 오류 메시지: ${errorMessage}`);
                    
                    // 브라우저 종료 오류가 있는 경우 (실제 실행 로그에서 확인)
                    // 실제 실행 로그에서 "❌ 로그인 실행: FAIL"과 같은 패턴이 있었음
                    console.log(`❌ TROMBONE 브라우저 종료 감지 - 실행 로그에서 실패한 테스트 찾기`);
                    
                    // TROMBONE 동적 테스트 결과 파싱 (TROMBONE 방식 참고)
                    console.log(`📊 TROMBONE 동적 테스트 결과 파싱 시작`);
                    
                    // 1. Playwright test-results.json 파일에서 실제 결과 파싱
                    const testResultsPath = path.join(__dirname, 'playwright-report', 'test-results.json');
                    let testResults = [];
                    let overallStatus = 'fail';
                    let totalDuration = 0;
                    
                    if (fs.existsSync(testResultsPath)) {
                        console.log(`📊 TROMBONE Playwright 결과 파일 발견: ${testResultsPath}`);
                        const testResultsData = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
                        
                // 시나리오 파일 패턴 매칭 (TROMBONE 방식) - 실제 파일 경로에 맞게 수정
                let scenarioSuite = null;
                const patterns = [
                    `scenario/scenario-${scenarioId}.spec.js`,  // 실제 경로
                    `tests/scenario/scenario-${scenarioId}.spec.js`,
                    `scenario-${scenarioId}.spec.js`
                ];
                
                console.log(`📊 TROMBONE 시나리오 ${scenarioId} 파일 패턴 검색 중...`);
                for (const pattern of patterns) {
                    scenarioSuite = testResultsData.suites?.find(suite => 
                        suite.file && (suite.file === pattern || suite.file.includes(pattern))
                    );
                    if (scenarioSuite) {
                        console.log(`✅ TROMBONE 시나리오 발견 (패턴: ${pattern}, 실제 파일: ${scenarioSuite.file})`);
                        break;
                    } else {
                        console.log(`❌ TROMBONE 패턴 매칭 실패: ${pattern}`);
                    }
                }
                
                // 디버깅: 사용 가능한 모든 suite 파일 출력
                if (!scenarioSuite && testResultsData.suites) {
                    console.log(`📊 TROMBONE 사용 가능한 suite 파일들:`);
                    testResultsData.suites.forEach((suite, index) => {
                        console.log(`  ${index}: ${suite.file || 'undefined'}`);
                    });
                }
                        
                        if (!scenarioSuite) {
                            console.log(`📊 TROMBONE 시나리오를 찾을 수 없음. 사용 가능한 파일들:`);
                            testResultsData.suites?.forEach((suite, index) => {
                                console.log(`  ${index + 1}. ${suite.file} (${suite.title})`);
                            });
                        }
                        
                        if (scenarioSuite) {
                            console.log(`📊 TROMBONE 시나리오 ${scenarioId} 테스트 결과 발견`);
                            
                            // 모든 테스트 스펙을 재귀적으로 찾기
                            const findAllSpecs = (suite) => {
                                let specs = [];
                        if (suite.specs) {
                                    specs = specs.concat(suite.specs);
                                }
                                if (suite.suites) {
                                    suite.suites.forEach(subSuite => {
                                        specs = specs.concat(findAllSpecs(subSuite));
                                    });
                                }
                                return specs;
                            };
                            
                            const allSpecs = findAllSpecs(scenarioSuite);
                            console.log(`📊 TROMBONE [실패 케이스] 발견된 테스트 스펙: ${allSpecs.length}개`);
                            
                            // 전체 테스트 목록과 results 유무 파악 (성공 케이스와 동일)
                            const allTests = [];
                            allSpecs.forEach(spec => {
                                if (spec.tests && spec.tests.length > 0) {
                                    spec.tests.forEach(test => {
                                        allTests.push({
                                            name: spec.title,
                                            hasResults: test.results && test.results.length > 0,
                                            test: test,
                                            result: test.results && test.results.length > 0 ? test.results[0] : null
                                        });
                                    });
                                }
                            });
                            
                            console.log(`📊 TROMBONE [실패 케이스] 전체 테스트: ${allTests.length}개, results 있음: ${allTests.filter(t => t.hasResults).length}개`);
                            
                            // results가 있는 테스트 파싱 (성공 케이스와 동일)
                            allTests.forEach(testInfo => {
                                if (testInfo.hasResults) {
                                    const result = testInfo.result;
                                            
                                            // 실제 결과 상태에 따라 상태 설정
                                            let status = 'fail';
                                            if (result.status === 'passed') {
                                                status = 'pass';
                                            } else if (result.status === 'failed' || result.status === 'timedOut') {
                                                status = 'fail';
                                            } else if (result.status === 'skipped') {
                                                status = 'not-test';
                                            }
                                            
                                            // 오류 메시지 추출
                                            let errorMessage = null;
                                            if (result.errors && result.errors.length > 0) {
                                                errorMessage = result.errors[0].message;
                                            } else if (result.error) {
                                                errorMessage = result.error.message;
                                            }
                                            
                                            testResults.push({
                                        name: testInfo.name,
                                                status: status,
                                                duration: result.duration || 0,
                                                error: errorMessage,
                                        hasResults: true,
                                                startTime: result.startTime ? new Date(result.startTime).toISOString() : new Date().toISOString(),
                                                endTime: result.endTime ? new Date(result.endTime).toISOString() : new Date().toISOString()
                                            });
                                            
                                            totalDuration += result.duration || 0;
                                } else {
                                    // results가 없는 테스트
                                    testResults.push({
                                        name: testInfo.name,
                                        status: 'not-test',
                                        duration: 0,
                                        error: '실행되지 않음',
                                        hasResults: false,
                                        startTime: new Date().toISOString(),
                                        endTime: new Date().toISOString()
                                    });
                                }
                            });
                            
                            // 브라우저 강제 종료 처리 (성공 케이스와 동일)
                            const hasTestsWithoutResults = testResults.some(t => !t.hasResults);
                            if (hasTestsWithoutResults) {
                                console.log(`⚠️ TROMBONE [실패 케이스] results가 없는 테스트 발견 - 브라우저 강제 종료 지점 탐지`);
                                
                                // 브라우저 강제 종료 지점 찾기:
                                // 1. 마지막 results 있는 테스트의 다음 테스트 (results 없는 첫 테스트)가 강제 종료 지점
                                let lastResultsIndex = -1;
                                for (let i = testResults.length - 1; i >= 0; i--) {
                                    if (testResults[i].hasResults) {
                                        lastResultsIndex = i;
                                        break;
                                    }
                                }
                                
                                let failIndex = -1;
                                if (lastResultsIndex >= 0 && lastResultsIndex + 1 < testResults.length) {
                                    // 다음 테스트 (results 없는 첫 테스트)가 강제 종료 지점
                                    failIndex = lastResultsIndex + 1;
                                    console.log(`⚠️ TROMBONE [실패 케이스] 브라우저 강제 종료 지점: ${testResults[failIndex].name} (인덱스: ${failIndex}, 마지막 results 있는 테스트 다음)`);
                                } else if (lastResultsIndex >= 0) {
                                    // 모든 테스트가 results를 가지고 있는데 hasTestsWithoutResults가 true?
                                    // 이 경우는 마지막 테스트를 fail로
                                    failIndex = lastResultsIndex;
                                    console.log(`⚠️ TROMBONE [실패 케이스] 브라우저 강제 종료 지점: ${testResults[failIndex].name} (인덱스: ${failIndex}, 마지막 테스트)`);
                                } else if (testResults.length > 0) {
                                    // results가 없는 테스트만 있는 경우, 첫 번째 테스트를 fail로
                                    failIndex = 0;
                                    console.log(`⚠️ TROMBONE [실패 케이스] 브라우저 강제 종료 지점: ${testResults[failIndex].name} (인덱스: ${failIndex}, 첫 번째 테스트)`);
                                }
                                
                                if (failIndex >= 0) {
                                    testResults[failIndex].status = 'fail';
                                    testResults[failIndex].error = '브라우저 강제 종료로 인한 테스트 중단';
                                    testResults[failIndex].duration = testResults[failIndex].duration || 0;
                                    testResults[failIndex].screenshots = []; // 스크린샷 없음 (브라우저 강제 종료)
                                    console.log(`✅ ${testResults[failIndex].name}을(를) fail로 변경 완료`);
                                    
                                    // 그 이후 테스트들은 이미 not-test로 되어 있음 (results 없는 테스트)
                                }
                            }
                            
                            // 전체 상태 계산
                            if (testResults.length === 0) {
                                overallStatus = 'fail';
                            } else if (testResults.some(step => step.status === 'fail')) {
                                overallStatus = 'fail';
                            } else if (testResults.every(step => step.status === 'pass')) {
                                overallStatus = 'pass';
                            } else {
                                overallStatus = 'fail';
                            }
                            
                            console.log(`📊 TROMBONE 파싱 결과: ${testResults.length}개 테스트, 상태: ${overallStatus}`);
                        } else {
                            console.log(`⚠️ TROMBONE 시나리오 ${scenarioId} 테스트 결과를 찾을 수 없음`);
                        }
                    } else {
                        console.log(`⚠️ TROMBONE test-results.json 파일이 존재하지 않음: ${testResultsPath}`);
                    }
                    
                    // 2. 실행 로그에서 추가 정보 파싱 (보조 정보)
                    let output = '';
                    try {
                        if (typeof result !== 'undefined' && result.stdout) {
                            output = result.stdout.toString();
                        }
                    } catch (e) {
                        console.log(`❌ output 추출 실패: ${e.message}`);
                        output = '';
                    }
                    
                    // 실행 로그에서 브라우저 종료 감지 (확장성 있는 TROMBONE 방식)
                    if (output.includes('Target page, context or browser has been closed')) {
                        console.log(`❌ TROMBONE 브라우저 강제 종료 감지`);
                        
                        // 브라우저 강제 종료 시점 추정 (실제 실행 시간 기반)
                        const executionTime = Date.now() - startTime.getTime();
                        let estimatedCompletedSteps = Math.floor(executionTime / 3000); // 평균 3초당 1단계
                        estimatedCompletedSteps = Math.min(estimatedCompletedSteps, testResults.length - 1);
                        
                        console.log(`📊 TROMBONE 추정 완료 단계: ${estimatedCompletedSteps}개 (실행시간: ${executionTime}ms, 총 단계: ${testResults.length}개)`);
                        
                        // 브라우저 강제 종료로 인한 상태 업데이트 (확장성 있게)
                        testResults = testResults.map((step, index) => {
                            if (index < estimatedCompletedSteps) {
                                // 실제 완료된 단계는 pass 유지
                                return { ...step, status: 'pass' };
                            } else if (index === estimatedCompletedSteps) {
                                // 브라우저 강제 종료가 발생한 단계
                                return { ...step, status: 'fail', error: '브라우저 강제 종료' };
                            } else {
                                // 그 이후 단계들은 미실행
                                return { ...step, status: 'not-test', error: '브라우저 강제 종료로 인한 미실행' };
                            }
                        });
                        
                        overallStatus = 'stopped';
                        console.log(`📊 TROMBONE 브라우저 강제 종료 처리 완료: ${testResults.filter(t => t.status === 'pass').length}개 성공, ${testResults.filter(t => t.status === 'fail').length}개 실패, ${testResults.filter(t => t.status === 'not-test').length}개 미실행`);
                    }
                    
                    console.log(`📊 TROMBONE 최종 파싱 결과: ${testResults.length}개 테스트 케이스, 상태: ${overallStatus}, totalDuration: ${totalDuration}ms`);
                    
                    // 파싱된 결과를 사용
                    const logPatterns = testResults;
                    
                    // TROMBONE 테스트 결과가 없는 경우에도 동적 결과만 사용
                    if (testResults.length === 0) {
                        console.log(`📊 TROMBONE 테스트 결과가 없음 - 동적 파싱 실패`);
                        // 하드코딩 제거 - 동적 결과만 사용
                        overallStatus = 'fail';
                        totalDuration = 0;
                    }
                    
                    // totalDuration을 "X분 Y초" 형식으로 변환
                    const totalSeconds = Math.round(totalDuration / 1000);
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    const formattedDuration = `${minutes}분 ${seconds}초`;
                    console.log(`📊 TROMBONE tromboneTestResultsData duration 계산: ${totalDuration}ms → ${formattedDuration}`);
                    
                    // TROMBONE 테스트 결과 데이터 생성 (커스텀 리포트용)
                    const tromboneTestResultsData = {
                        status: overallStatus,
                        duration: formattedDuration,
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        timestamp: new Date().toLocaleString('ko-KR'),
                        testCases: testResults
                    };
                    
                    console.log(`📊 TROMBONE 테스트 결과 데이터 생성 완료: ${testResults.length}개 테스트 케이스, 상태: ${overallStatus}`);
                    
                    // 실제 실행 시간 계산을 위한 시작 시간
                    const baseStartTime = new Date(startTime.getTime() - 11000); // 전체 실행 시간에서 역산
                    
                    logPatterns.forEach((pattern, index) => {
                        const stepStartTime = new Date(baseStartTime.getTime() + (index * 2000)); // 각 단계별 시작 시간
                        const stepEndTime = new Date(stepStartTime.getTime() + pattern.duration);
                        
                        testResults.testCases.push({
                            name: pattern.name,
                            status: pattern.status,
                            duration: pattern.duration,
                            error: pattern.status === 'fail' ? 'Target page, context or browser has been closed' : null,
                            startTime: stepStartTime.toISOString(),
                            endTime: stepEndTime.toISOString()
                        });
                    });
                    
                    console.log(`📊 TROMBONE 실제 실행 로그 기반 파싱 완료: ${testResults.testCases.length}개 테스트 케이스`);
                } else {
                    console.log(`⚠️ TROMBONE 오류 메시지가 없음 - 기본 파싱 시도`);
                    
            // ⚠️ 보수적 접근: 첫 번째 파싱과 두 번째 파싱 결과를 비교하여 더 나은 결과 선택
            const firstParseCount = testResults.testCases.length;
            console.log(`📊 TROMBONE 첫 번째 파싱 결과: ${firstParseCount}개 테스트 케이스`);
            
            // 기본 Playwright 결과 파싱 (임시 배열에 저장)
            const testResultsPath = path.join(__dirname, 'playwright-report/test-results.json');
            if (fs.existsSync(testResultsPath)) {
                console.log(`📊 Playwright 결과 파싱 시작 (비교용): ${testResultsPath}`);
                const testResultsData = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
                
                // 시나리오 파일 경로 패턴 (숫자도 문자열로 변환)
                const scenarioFilePattern = `scenario/scenario-${String(scenarioId)}.spec.js`;
                        
                        // 현재 시나리오의 테스트 결과 찾기
                        const scenarioSuite = testResultsData.suites?.find(suite => 
                            suite.file && suite.file.includes(scenarioFilePattern)
                        );
                        
                        if (scenarioSuite) {
                            console.log(`✅ TROMBONE 시나리오 ${scenarioId} 테스트 결과 발견`);
                            
                            // 임시 배열에 Playwright 파싱 결과 저장
                            const playwrightParsedCases = [];
                            
                            // 모든 테스트 스펙을 재귀적으로 찾기
                            const findAllSpecs = (suite) => {
                                let specs = [];
                                if (suite.specs) {
                                    specs = specs.concat(suite.specs);
                                }
                                if (suite.suites) {
                                    suite.suites.forEach(subSuite => {
                                        specs = specs.concat(findAllSpecs(subSuite));
                                    });
                                }
                                return specs;
                            };
                            
                            const allSpecs = findAllSpecs(scenarioSuite);
                            console.log(`📊 TROMBONE 발견된 스펙 수: ${allSpecs.length}`);
                            
                            // 각 테스트 스펙을 테스트 단계로 변환
                            allSpecs.forEach(spec => {
                                if (spec.tests && spec.tests.length > 0) {
                                    spec.tests.forEach(test => {
                                        if (test.results && test.results.length > 0) {
                                            const result = test.results[0];
                                            
                                            console.log(`📊 TROMBONE 테스트 결과: ${result.status}, 제목: ${spec.title}`);
                                            
                                            // 실제 결과 상태에 따라 상태 설정
                                            let status = 'pass';
                                            if (result.status === 'failed' || result.status === 'timedOut') {
                                                status = 'fail';
                                                console.log(`❌ TROMBONE 실패한 테스트 발견: ${spec.title}`);
                                            } else if (result.status === 'skipped') {
                                                status = 'skip';
                                            } else if (result.status === 'passed') {
                                                status = 'pass';
                                            }
                                            
                                            // 오류 메시지 추출
                                            let errorMessage = null;
                                            if (result.errors && result.errors.length > 0) {
                                                errorMessage = result.errors[0].message;
                                            } else if (result.error) {
                                                errorMessage = result.error.message;
                                            }
                                            
                                            playwrightParsedCases.push({
                                                name: spec.title,
                                                status: status,
                                                duration: result.duration || 0,
                                                error: errorMessage,
                                                startTime: result.startTime ? new Date(result.startTime).toISOString() : new Date().toISOString(),
                                                endTime: result.endTime ? new Date(result.endTime).toISOString() : new Date().toISOString()
                                            });
                                        }
                                    });
                                }
                            });
                            
                            const secondParseCount = playwrightParsedCases.length;
                            console.log(`📊 TROMBONE Playwright 파싱 결과: ${secondParseCount}개 테스트 케이스`);
                            
                            // 두 파싱 결과 비교: 더 많은 테스트 케이스를 캡처한 결과 선택
                            if (secondParseCount > firstParseCount) {
                                console.log(`✅ Playwright 파싱 결과가 더 많음 (${secondParseCount} > ${firstParseCount}), Playwright 결과 사용`);
                                testResults.testCases = playwrightParsedCases;
                            } else {
                                console.log(`✅ 첫 번째 파싱 결과 유지 (${firstParseCount} >= ${secondParseCount}), 기존 결과가 더 정확함`);
                            }
                        } else {
                            console.log(`⚠️ TROMBONE 시나리오 ${scenarioId} 테스트 결과를 찾을 수 없음`);
                        }
                    } else {
                        console.log(`⚠️ TROMBONE test-results.json 파일이 존재하지 않음: ${testResultsPath}`);
                    }
                }
            } catch (parseError) {
                console.error('❌ TROMBONE 테스트 결과 파싱 중 오류:', parseError.message);
            }
            
            // 커스텀 리포트 생성 (실패 정보 포함)
            
            // global.testResults Map에 저장 (TROMBONE 방식과 동일)
            if (!global.testResults) {
                global.testResults = new Map();
            }
            global.testResults.set(`trombone-scenario-${scenarioId}`, testResults);
            
            // 공통 함수로 저장
            saveGlobalTestResults(scenarioId, testResults, '실패 케이스 global.testResults 저장 완료');
            
            const reportPath = await generator.saveReport(scenarioId, testResults);
            console.log('✅ TROMBONE 실패 케이스 커스텀 리포트 생성 완료');
            
            // 실패 케이스도 시나리오 목록 업데이트 (duration 정보 포함)
            generator.updateScenarioList(scenarioId, testResults);
            console.log('✅ TROMBONE 실패 케이스 시나리오 목록 업데이트 완료');
            
            // 커스텀 리포트 자동으로 열기 (실패 케이스도)
            if (reportPath && fs.existsSync(reportPath)) {
                console.log(`🌐 실패 케이스 커스텀 리포트 자동 열기: ${reportPath}`);
                try {
                    const platform = process.platform;
                    let command;
                    
                    if (platform === 'win32') {
                        command = `start "" "${reportPath}"`;
                    } else if (platform === 'darwin') {
                        command = `open "${reportPath}"`;
                    } else {
                        command = `xdg-open "${reportPath}"`;
                    }
                    
                    // execSync를 사용하여 리포트가 열릴 때까지 대기
                    try {
                        execSync(command, { windowsHide: true });
                        console.log('✅ 실패 케이스 커스텀 리포트 브라우저에서 열림');
                    } catch (execError) {
                        console.warn(`⚠️ 리포트 자동 열기 실패 (무시): ${execError.message}`);
                    }
                } catch (openError) {
                    console.error(`⚠️ 리포트 자동 열기 실패: ${openError.message}`);
                }
            }
            
        } catch (reportError) {
            console.error('❌ TROMBONE 실패 케이스 커스텀 리포트 생성 실패:', reportError.message);
        }
        
        process.exit(1);
    }
}

// 명령행 인수 처리
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('사용법: node electron-scenario-runner.js run <시나리오ID>');
    console.log('예시: node electron-scenario-runner.js run 2');
    process.exit(1);
}

if (args[0] === 'run' && args[1]) {
    const scenarioId = args[1];
    runScenario(scenarioId).catch((error) => {
        console.error(`❌ 시나리오 실행 중 치명적인 오류 발생: ${error.message}`);
        process.exit(1);
    });
} else {
    console.log('잘못된 명령입니다.');
    console.log('사용법: node electron-scenario-runner.js run <시나리오ID>');
    process.exit(1);
}
