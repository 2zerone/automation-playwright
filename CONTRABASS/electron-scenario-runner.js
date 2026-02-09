#!/usr/bin/env node

import { execFileSync, spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎺 CONTRABASS Electron 시나리오 실행기\n');

// 공통 함수: global-test-results.json 저장 (VIOLA 방식)
function saveGlobalTestResults(scenarioId, testResultsData, logMessage) {
    console.log(`\n🔍 [CONTRABASS DEBUG] saveGlobalTestResults 호출됨!`);
    console.log(`🔍 [CONTRABASS DEBUG] scenarioId: ${scenarioId}, 타입: ${typeof scenarioId}`);
    console.log(`🔍 [CONTRABASS DEBUG] testResultsData.testCases?.length: ${testResultsData.testCases?.length}`);
    
    const globalTestResultsPath = path.join(__dirname, 'custom-reports', 'global-test-results.json');
    let globalTestResultsData = {};
    
    // 기존 파일이 있으면 읽어오기
    if (fs.existsSync(globalTestResultsPath)) {
        try {
            const existingData = fs.readFileSync(globalTestResultsPath, 'utf8');
            globalTestResultsData = JSON.parse(existingData);
            console.log(`🔍 [CONTRABASS DEBUG] 기존 키 개수: ${Object.keys(globalTestResultsData).length}`);
        } catch (error) {
            console.log(`⚠️ 기존 global-test-results.json 파싱 실패, 새로 생성: ${error.message}`);
            globalTestResultsData = {};
        }
    }
    
    // 키 저장
    const key = `scenario-${scenarioId}`;
    console.log(`🔍 [CONTRABASS DEBUG] 저장할 키: ${key}`);
    globalTestResultsData[key] = testResultsData;
    console.log(`🔍 [CONTRABASS DEBUG] 저장 후 키 개수: ${Object.keys(globalTestResultsData).length}`);
    
    fs.writeFileSync(globalTestResultsPath, JSON.stringify(globalTestResultsData, null, 2), 'utf8');
    console.log(`💾 ${logMessage}: ${globalTestResultsPath}`);
    console.log(`💾 저장 키: ${key}\n`);
}

// CONTRABASS 시나리오 구조 레포트 출력 함수
function printContrabassReport(scenarioId) {
    console.log(`\n📊 CONTRABASS 시나리오 ${scenarioId} 구조 레포트`);
    console.log('=' .repeat(60));
    
    // CONTRABASS 시나리오 목록
    const contrabassScenarios = [
        'CONTRABASS 기본 로그인 및 대시보드 확인',
        'CONTRABASS 워크플로우 생성 및 관리',
        'CONTRABASS 티켓 생성 및 승인 프로세스',
        'CONTRABASS GitLab 연동 테스트',
        'CONTRABASS 파이프라인 실행 및 모니터링',
        'CONTRABASS SonarQube 정적 분석',
        'CONTRABASS JUnit 테스트 결과 확인',
        'CONTRABASS 배포 파이프라인 생성'
    ];
    
    console.log('\n📋 CONTRABASS 시나리오 목록');
    console.log('-'.repeat(40));
    contrabassScenarios.forEach((scenario, index) => {
        console.log(`${index + 1}. ${scenario}`);
    });
    
    console.log('\n📋 테스트 파일 사용: scenario-' + scenarioId + '.spec.js');
}

// 메인 실행 함수
async function runScenario(scenarioId) {
    const startTime = new Date();
    const startTimestamp = startTime.getTime();
    
    try {
        console.log(`🎻 CONTRABASS 시나리오 ${scenarioId} 실행을 시작합니다...\n`);
        console.log(`⏰ 시작 시간: ${startTime.toLocaleString('ko-KR')}`);
        
        // CONTRABASS 시나리오 구조 레포트 출력
        printContrabassReport(scenarioId);
        
        console.log('\n🔄 Playwright 테스트 실행 중...');
        console.log('=' .repeat(60));
        
        // VIOLA 폴더 내의 시나리오 파일 경로
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
        
        // CONTRABASS 시나리오 실행 (상대 경로 사용)
        console.log('\n🚀 CONTRABASS 시나리오 실행 시작');
        const relativeTestFile = `tests/scenario/scenario-${scenarioId}.spec.js`;
        const command = `npx playwright test "${relativeTestFile}" --project=chromium --headed`;
        console.log(`📂 실행 명령: ${command}`);
        
        let testExitCode = 0;
        let playwrightOutput = '';
        let playwrightError = '';
        
        try {
            await new Promise((resolve, reject) => {
                const child = exec(command, {
                    cwd: __dirname,
                    env: {
                        ...process.env,
                        PLAYWRIGHT_HEADLESS: 'false',
                        NODE_ENV: 'test'
                    },
                    maxBuffer: 10 * 1024 * 1024 // 10MB 버퍼
                }, (error, stdout, stderr) => {
                    playwrightOutput = stdout || '';
                    playwrightError = stderr || '';
                    
                    if (error) {
                        testExitCode = error.code || 1;
                        console.log(`⚠️ Playwright 종료 코드: ${testExitCode} (테스트 실패 가능)`);
                    }
                    
                    // 테스트 실패해도 resolve (실행은 완료됨)
                    resolve();
                });
                
                // 실시간 로그 출력 - 터미널에 표시 (TROMBONE/main.js로 전달)
                child.stdout.on('data', (data) => {
                    const dataStr = data.toString();
                    // process.stdout.write로 직접 출력하여 터미널에 표시 (TROMBONE/main.js가 캡처)
                    process.stdout.write(dataStr);
                    // 출력 데이터를 누적 (전체 데이터)
                    playwrightOutput += dataStr;
                });
                
                child.stderr.on('data', (data) => {
                    const dataStr = data.toString();
                    // process.stderr.write로 직접 출력하여 터미널에 표시 (TROMBONE/main.js가 캡처)
                    process.stderr.write(dataStr);
                    // 출력 데이터를 누적
                    playwrightError += dataStr;
                });
            });
            
            console.log('✅ CONTRABASS 시나리오 실행 완료');
            
        } catch (error) {
            console.log(`❌ CONTRABASS 시나리오 실행 실패: ${error.message}`);
            throw error;
        }
        
        // 실행 완료 시간 계산
        const endTime = new Date();
        const endTimestamp = endTime.getTime();
        const durationMs = endTimestamp - startTimestamp;
        const durationSeconds = Math.round(durationMs / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        const durationRemainingSeconds = durationSeconds % 60;
        const durationFormatted = `${durationMinutes}분 ${durationRemainingSeconds}초`;
        
        console.log('\n============================================================');
        console.log(`${testExitCode === 0 ? '✅' : '⚠️'} CONTRABASS 시나리오 실행 완료`);
        console.log(`⏰ 종료 시간: ${endTime.toLocaleString('ko-KR')}`);
        console.log(`⏱️ 총 실행시간: ${durationFormatted} (${durationMs}ms)`);
        console.log(`📊 종료 코드: ${testExitCode} (${testExitCode === 0 ? '성공' : '실패 또는 강제 종료'})`);
        console.log('💡 Playwright HTML 레포트에서 결과 확인: playwright-report/index.html');
        
        // 새로운 커스텀 리포트 생성
        console.log('\n📊 새로운 커스텀 리포트 생성 중...');
        try {
            // CONTRABASS의 report-generator.js를 직접 호출하여 커스텀 리포트 생성
            const reportGeneratorPath = path.join(__dirname, 'lib', 'report-generator.js');
            const fileUrl = `file://${reportGeneratorPath.replace(/\\/g, '/')}`;
            const reportGenerator = await import(fileUrl);
            const generator = new reportGenerator.default('contrabass');
            
            // Playwright test-results.json 파일에서 실제 결과 파싱 (VIOLA 방식)
            let parsedResults = { status: 'fail', testCases: [] };
            const testResultsPath = path.join(__dirname, 'playwright-report', 'test-results.json');
            
            console.log(`📊 [CONTRABASS] test-results.json 파일 확인: ${testResultsPath}`);
            
            if (fs.existsSync(testResultsPath)) {
                try {
                    console.log(`📊 [CONTRABASS] Playwright 결과 파일 발견`);
                    const testResultsData = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
                    
                    console.log(`🔍 [CONTRABASS DEBUG] testExitCode: ${testExitCode}`);
                    console.log(`🔍 [CONTRABASS DEBUG] test-results.json suites 수: ${testResultsData.suites ? testResultsData.suites.length : 0}`);
                    
                    // 시나리오 파일 패턴 매칭 (VIOLA 방식 - 여러 패턴 시도)
                    const patterns = [
                        `scenario/scenario-${scenarioId}.spec.js`,  // 실제 경로
                        `tests/scenario/scenario-${scenarioId}.spec.js`,
                        `scenario-${scenarioId}.spec.js`
                    ];
                    
                    let scenarioSuite = null;
                    console.log(`📊 [CONTRABASS] 시나리오 ${scenarioId} 파일 패턴 검색 중...`);
                    for (const pattern of patterns) {
                        scenarioSuite = testResultsData.suites?.find(suite => 
                            suite.file && (suite.file === pattern || suite.file.includes(pattern))
                        );
                        if (scenarioSuite) {
                            console.log(`✅ [CONTRABASS] 시나리오 발견 (패턴: ${pattern}, 실제 파일: ${scenarioSuite.file})`);
                            break;
                        } else {
                            console.log(`❌ [CONTRABASS] 패턴 매칭 실패: ${pattern}`);
                        }
                    }
                    
                    // 디버깅: 사용 가능한 모든 suite 파일 출력
                    if (!scenarioSuite && testResultsData.suites) {
                        console.log(`📊 [CONTRABASS] 사용 가능한 suite 파일들:`);
                        testResultsData.suites.forEach((suite, index) => {
                            console.log(`  ${index}: ${suite.file || 'undefined'}`);
                        });
                    }
                    
                    if (scenarioSuite) {
                        console.log(`✅ [CONTRABASS] 시나리오 ${scenarioId} 테스트 결과 발견`);
                        
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
                        console.log(`📊 [CONTRABASS] 발견된 테스트 스펙: ${allSpecs.length}개`);
                        
                        // 전체 테스트 목록과 results 유무 파악 (VIOLA 방식)
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
                        
                        console.log(`📊 [CONTRABASS] 전체 테스트: ${allTests.length}개, results 있음: ${allTests.filter(t => t.hasResults).length}개`);
                        
                        const testCases = [];
                        
                        // results가 있는 테스트 파싱 (VIOLA 방식)
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
                                    calculatedStartTime = new Date(result.startTime).toISOString();
                                    // endTime이 없으면 startTime + duration으로 계산
                                    if (result.endTime) {
                                        calculatedEndTime = new Date(result.endTime).toISOString();
                                    } else {
                                        calculatedEndTime = new Date(new Date(result.startTime).getTime() + (result.duration || 0)).toISOString();
                                    }
                                } else {
                                    // startTime도 없으면 현재 시간 사용 (fallback)
                                    calculatedStartTime = new Date().toISOString();
                                    calculatedEndTime = new Date().toISOString();
                                }
                                
                                testCases.push({
                                    name: testInfo.name,
                                    status: status,
                                    duration: result.duration || 0,
                                    error: errorMessage,
                                    hasResults: true,
                                    startTime: calculatedStartTime,
                                    endTime: calculatedEndTime
                                });
                            } else {
                                // results가 없는 테스트 - 나중에 처리 (브라우저 강제 종료로 실행되지 않은 경우)
                                // 마지막으로 실행된 테스트의 endTime을 사용 (있는 경우)
                                let notExecutedTime = new Date().toISOString();
                                if (testCases.length > 0 && testCases[testCases.length - 1].endTime) {
                                    notExecutedTime = testCases[testCases.length - 1].endTime;
                                }
                                
                                testCases.push({
                                    name: testInfo.name,
                                    status: 'not-test',
                                    duration: 0,
                                    error: '실행되지 않음',
                                    hasResults: false,
                                    startTime: notExecutedTime,
                                    endTime: notExecutedTime
                                });
                            }
                        });
                        
                        // 전체 상태 계산
                        if (testCases.length === 0) {
                            parsedResults.status = 'fail';
                        } else if (testCases.some(tc => tc.status === 'fail')) {
                            parsedResults.status = 'fail';
                        } else if (testCases.every(tc => tc.status === 'pass')) {
                            parsedResults.status = 'pass';
                        } else {
                            parsedResults.status = 'fail';
                        }
                        
                        parsedResults.testCases = testCases;
                        console.log(`📊 [CONTRABASS] 파싱된 테스트 케이스: ${testCases.length}개, 파싱 상태: ${parsedResults.status}`);
                        
                        // 브라우저 강제 종료 처리 (VIOLA 방식 - testExitCode와 관계없이 항상 체크)
                        if (testCases.length > 0) {
                            console.log(`📊 [CONTRABASS] 브라우저 강제 종료 지점 탐색 시작 (총 ${testCases.length}개 테스트)`);
                            console.log(`📊 [CONTRABASS] testCases 상세:`, testCases.map((t, i) => `[${i}] ${t.name}: ${t.status} (hasResults: ${t.hasResults})`).join(', '));
                            
                            // results가 없는 테스트가 있는지 확인 (VIOLA 방식)
                            const hasTestsWithoutResults = testCases.some(t => !t.hasResults);
                            console.log(`📊 [CONTRABASS] hasTestsWithoutResults: ${hasTestsWithoutResults}`);
                            
                            if (hasTestsWithoutResults) {
                                console.log(`⚠️ [CONTRABASS] results가 없는 테스트 발견 - 브라우저 강제 종료 지점 탐지`);
                                parsedResults.status = 'fail';  // 브라우저 강제 종료로 fail 처리
                                console.log(`📊 [CONTRABASS] overallStatus를 fail로 변경`);
                                
                                // 브라우저 강제 종료 지점 찾기 (VIOLA 방식):
                                // 1. 마지막 results 있는 테스트의 다음 테스트 (results 없는 첫 테스트)가 강제 종료 지점
                                let lastResultsIndex = -1;
                                for (let i = testCases.length - 1; i >= 0; i--) {
                                    if (testCases[i].hasResults) {
                                        lastResultsIndex = i;
                                        break;
                                    }
                                }
                                
                                console.log(`📊 [CONTRABASS] lastResultsIndex: ${lastResultsIndex}`);
                                
                                let failIndex = -1;
                                if (lastResultsIndex >= 0 && lastResultsIndex + 1 < testCases.length) {
                                    // 다음 테스트 (results 없는 첫 테스트)가 강제 종료 지점
                                    failIndex = lastResultsIndex + 1;
                                    console.log(`⚠️ [CONTRABASS] 브라우저 강제 종료 지점: ${testCases[failIndex].name} (인덱스: ${failIndex}, 마지막 results 있는 테스트 다음)`);
                                } else if (lastResultsIndex >= 0) {
                                    // 모든 테스트가 results를 가지고 있는데 hasTestsWithoutResults가 true?
                                    // 이 경우는 마지막 테스트를 fail로
                                    failIndex = lastResultsIndex;
                                    console.log(`⚠️ [CONTRABASS] 브라우저 강제 종료 지점: ${testCases[failIndex].name} (인덱스: ${failIndex}, 마지막 테스트)`);
                                } else if (testCases.length > 0) {
                                    // results가 없는 테스트만 있는 경우, 첫 번째 테스트를 fail로
                                    failIndex = 0;
                                    console.log(`⚠️ [CONTRABASS] 브라우저 강제 종료 지점: ${testCases[failIndex].name} (인덱스: ${failIndex}, 첫 번째 테스트)`);
                                }
                                
                                if (failIndex >= 0) {
                                    testCases[failIndex].status = 'fail';
                                    testCases[failIndex].error = '브라우저 강제 종료로 인한 테스트 중단';
                                    testCases[failIndex].duration = testCases[failIndex].duration || 0;
                                    testCases[failIndex].hasResults = true;
                                    console.log(`✅ [CONTRABASS] ${testCases[failIndex].name}을(를) fail로 변경 완료`);
                                    
                                    // 그 이후 테스트들은 이미 not-test로 되어 있음 (results 없는 테스트)
                                }
                                
                                console.log(`📊 [CONTRABASS] 브라우저 강제 종료 처리 완료: ${testCases.filter(t => t.status === 'pass').length}개 성공, ${testCases.filter(t => t.status === 'fail').length}개 실패, ${testCases.filter(t => t.status === 'not-test').length}개 미수행`);
                            }
                        }
                        
                    } else {
                        console.log(`⚠️ [CONTRABASS] 시나리오 ${scenarioId} 결과를 test-results.json에서 찾을 수 없음`);
                        parsedResults.status = 'fail';
                    }
                    
                } catch (parseError) {
                    console.log(`⚠️ [CONTRABASS] test-results.json 파싱 실패: ${parseError.message}`);
                    console.log(`📦 [CONTRABASS] 시나리오 파일에서 테스트 목록 추출 시도`);
                    
                    // VIOLA 방식: 시나리오 파일에서 테스트 목록 추출
                    try {
                        const scenarioFilePath = path.join(__dirname, 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
                        if (fs.existsSync(scenarioFilePath)) {
                            const scenarioContent = fs.readFileSync(scenarioFilePath, 'utf8');
                            const testNamePattern = /test\(['"]([^'"]+)['"]/g;
                            let match;
                            const extractedTests = [];
                            
                            while ((match = testNamePattern.exec(scenarioContent)) !== null) {
                                extractedTests.push(match[1]);
                            }
                            
                            console.log(`✅ [CONTRABASS] 시나리오 파일에서 ${extractedTests.length}개 테스트 추출`);
                            
                            // 모든 테스트를 not-test로 초기화
                            extractedTests.forEach(testName => {
                                parsedResults.testCases.push({
                                    name: testName,
                                    status: 'not-test',
                                    duration: 0,
                                    error: '실행되지 않음',
                                    hasResults: false
                                });
                            });
                            
                            // 첫 번째 테스트를 fail로 설정
                            if (parsedResults.testCases.length > 0) {
                                parsedResults.testCases[0].status = 'fail';
                                parsedResults.testCases[0].error = '브라우저 강제 종료 또는 실행 실패';
                                parsedResults.testCases[0].hasResults = true;
                                console.log(`⚠️ [CONTRABASS] 첫 번째 테스트를 fail로 설정: ${parsedResults.testCases[0].name}`);
                            }
                        }
                    } catch (extractError) {
                        console.log(`❌ [CONTRABASS] 시나리오 파일 추출 실패: ${extractError.message}`);
                    }
                    
                    parsedResults.status = 'fail';
                }
            } else {
                console.log(`⚠️ [CONTRABASS] test-results.json 파일이 없음, 종료 코드로 상태 판단`);
                console.log(`📦 [CONTRABASS] 시나리오 파일에서 테스트 목록 추출 시도`);
                
                // VIOLA 방식: 시나리오 파일에서 테스트 목록 추출
                try {
                    const scenarioFilePath = path.join(__dirname, 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
                    if (fs.existsSync(scenarioFilePath)) {
                        const scenarioContent = fs.readFileSync(scenarioFilePath, 'utf8');
                        const testNamePattern = /test\(['"]([^'"]+)['"]/g;
                        let match;
                        const extractedTests = [];
                        
                        while ((match = testNamePattern.exec(scenarioContent)) !== null) {
                            extractedTests.push(match[1]);
                        }
                        
                        console.log(`✅ [CONTRABASS] 시나리오 파일에서 ${extractedTests.length}개 테스트 추출`);
                        
                        // 모든 테스트를 not-test로 초기화
                        extractedTests.forEach(testName => {
                            parsedResults.testCases.push({
                                name: testName,
                                status: 'not-test',
                                duration: 0,
                                error: '실행되지 않음',
                                hasResults: false
                            });
                        });
                        
                        // 첫 번째 테스트를 fail로 설정
                        if (parsedResults.testCases.length > 0) {
                            parsedResults.testCases[0].status = 'fail';
                            parsedResults.testCases[0].error = '브라우저 강제 종료 또는 실행 실패';
                            parsedResults.testCases[0].hasResults = true;
                            console.log(`⚠️ [CONTRABASS] 첫 번째 테스트를 fail로 설정: ${parsedResults.testCases[0].name}`);
                        }
                    }
                } catch (extractError) {
                    console.log(`❌ [CONTRABASS] 시나리오 파일 추출 실패: ${extractError.message}`);
                }
                
                parsedResults.status = 'fail';
            }
            
            // 실행시간 정보를 포함한 테스트 결과 데이터 생성
            // VIOLA 방식: 빈 배열이어도 그대로 전달 (동적 데이터 보존)
            const testResults = {
                status: parsedResults.status,
                testCases: parsedResults.testCases, // 빈 배열이어도 그대로 전달
                duration: durationFormatted,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                timestamp: startTime.toLocaleString('ko-KR')
            };
            
            console.log(`📊 [CONTRABASS] testResults 생성: testCases ${parsedResults.testCases.length}개 (동적 데이터)`);
            
            // 커스텀 리포트 생성 (실행시간 정보 포함)
            const reportPath = await generator.saveReport(scenarioId, testResults);
            console.log('✅ CONTRABASS 커스텀 리포트 생성 완료');
            
            // 시나리오 목록 업데이트 (saveReport 내부에서도 호출되지만 명시적으로 한 번 더 호출)
            generator.updateScenarioList(scenarioId, testResults);
            console.log('✅ CONTRABASS 시나리오 목록 업데이트 완료');
            
            // main.js가 다시 처리하지 않도록 완료 플래그 파일 생성
            const completeFlagPath = path.join(__dirname, 'custom-reports', `scenario-${scenarioId}-complete.flag`);
            fs.writeFileSync(completeFlagPath, JSON.stringify({
                status: parsedResults.status,
                timestamp: new Date().toISOString(),
                processedBy: 'electron-scenario-runner.js'
            }), 'utf8');
            console.log(`✅ CONTRABASS 시나리오 ${scenarioId} 완료 플래그 생성: ${completeFlagPath}`);
            
            // 커스텀 리포트 자동 열기 (VIOLA 방식)
            if (reportPath && fs.existsSync(reportPath)) {
                console.log(`\n🌐 커스텀 리포트 자동 열기: ${reportPath}`);
                try {
                    const { execSync } = await import('child_process');
                    const platform = process.platform;
                    
                    if (platform === 'win32') {
                        execSync(`start "" "${reportPath}"`, { stdio: 'ignore' });
                    } else if (platform === 'darwin') {
                        execSync(`open "${reportPath}"`, { stdio: 'ignore' });
                    } else {
                        execSync(`xdg-open "${reportPath}"`, { stdio: 'ignore' });
                    }
                    console.log('✅ 커스텀 리포트 브라우저에서 열림');
                } catch (openError) {
                    console.log(`⚠️ 리포트 자동 열기 실패 (무시됨): ${openError.message}`);
                }
            }
            
            // global-test-results.json에 저장 (VIOLA 방식)
            saveGlobalTestResults(scenarioId, testResults, 'CONTRABASS global-test-results.json 저장 완료');
            
            // ⚠️ testExitCode가 0이 아니면 실패로 종료 (VIOLA 방식)
            if (testExitCode !== 0) {
                console.log(`\n❌ CONTRABASS 시나리오 ${scenarioId} 실패로 종료 (testExitCode: ${testExitCode})`);
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ CONTRABASS 커스텀 리포트 생성 실패:', error.message);
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
        console.log(`❌ CONTRABASS 시나리오 ${scenarioId} 실행 중 오류 발생`);
        console.log(`⏰ 종료 시간: ${endTime.toLocaleString('ko-KR')}`);
        console.log(`⏱️ 총 실행시간: ${durationFormatted} (${durationMs}ms)`);
        console.log(`오류 코드: ${error.code}`);
        console.log(`오류 메시지: ${error.message}`);
        
        console.log('\n📊 CONTRABASS 구조 레포트 상태:');
        console.log('⚠️ 테스트가 완료되지 않아 일부 결과만 확인 가능합니다.');
        console.log('💡 Playwright HTML 레포트에서 중단 지점까지의 결과 확인: playwright-report/index.html');
        
        // 실패 케이스에도 커스텀 리포트 생성
        try {
            console.log('\n📊 실패 케이스 커스텀 리포트 생성 중...');
            const reportGeneratorPath = path.join(__dirname, 'lib', 'report-generator.js');
            const fileUrl = `file://${reportGeneratorPath.replace(/\\/g, '/')}`;
            const reportGenerator = await import(fileUrl);
            const generator = new reportGenerator.default('contrabass');
            
            // 실패 정보를 포함한 테스트 결과 데이터 생성
            const testResults = {
                status: 'fail',
                duration: durationFormatted,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                timestamp: startTime.toLocaleString('ko-KR'),
                error: error.message
            };
            
            // 커스텀 리포트 생성 (실패 정보 포함)
            await generator.saveReport(scenarioId, testResults);
            console.log('✅ CONTRABASS 실패 케이스 커스텀 리포트 생성 완료');
            
        } catch (reportError) {
            console.error('❌ CONTRABASS 실패 케이스 커스텀 리포트 생성 실패:', reportError.message);
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
    runScenario(scenarioId);
} else {
    console.log('잘못된 명령입니다.');
    console.log('사용법: node electron-scenario-runner.js run <시나리오ID>');
    process.exit(1);
}
