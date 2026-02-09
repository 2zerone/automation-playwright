const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 시나리오 2 실행 테스트 시작...');

// 시나리오 2 실행
const testFile = path.join(__dirname, '..', '..', 'tests', 'scenario', 'scenario-2.spec.js');
const child = spawn('npx', ['playwright', 'test', testFile, '--headed'], {
  cwd: path.join(__dirname, '..', '..'),
  shell: true,
  env: { 
    ...process.env, 
    FORCE_COLOR: '0',
    LANG: 'ko_KR.UTF-8',
    LC_ALL: 'ko_KR.UTF-8'
  }
});

let output = '';
let errorOutput = '';
const processStartTime = Date.now();

child.stdout.on('data', (data) => {
  const cleanData = data.toString('utf8');
  output += cleanData;
  console.log(`[STDOUT] ${cleanData}`);
});

child.stderr.on('data', (data) => {
  const cleanData = data.toString('utf8');
  errorOutput += cleanData;
  console.log(`[STDERR] ${cleanData}`);
});

child.on('close', (code, signal) => {
  const processDuration = Date.now() - processStartTime;
  console.log(`\n🔄 테스트 완료 - 코드: ${code}, 시그널: ${signal}`);
  console.log(`⏱️ 소요시간: ${Math.floor(processDuration / 1000)}초`);
  
  // 결과 확인
  console.log('\n📊 결과 확인 중...');
  
  // test-results.json 확인
  const testResultsPath = path.join(__dirname, '..', '..', 'playwright-report', 'test-results.json');
  if (fs.existsSync(testResultsPath)) {
    console.log('✅ test-results.json 파일 존재');
    const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    console.log('📋 테스트 결과 구조:', Object.keys(testResults));
  } else {
    console.log('❌ test-results.json 파일 없음');
  }
  
  // scenario-list.json 확인
  const scenarioListPath = path.join(__dirname, '..', '..', 'test-results', 'scenario-list.json');
  if (fs.existsSync(scenarioListPath)) {
    console.log('✅ scenario-list.json 파일 존재');
    const scenarioList = JSON.parse(fs.readFileSync(scenarioListPath, 'utf8'));
    const scenario2 = scenarioList.scenarios.find(s => s.id === 2);
    if (scenario2) {
      console.log('📋 시나리오 2 상태:', scenario2.status);
      console.log('📋 시나리오 2 이름:', scenario2.name);
    }
  } else {
    console.log('❌ scenario-list.json 파일 없음');
  }
  
  // 마스터 리포트 확인
  const masterReportPath = path.join(__dirname, '..', '..', 'test-results', 'test_results_master.html');
  if (fs.existsSync(masterReportPath)) {
    console.log('✅ 마스터 리포트 파일 존재');
  } else {
    console.log('❌ 마스터 리포트 파일 없음');
  }
  
  // 커스텀 리포트 확인
  const customReportPath = path.join(__dirname, '..', '..', 'test-results', 'scenario-2', 'custom-report.html');
  if (fs.existsSync(customReportPath)) {
    console.log('✅ 커스텀 리포트 파일 존재');
  } else {
    console.log('❌ 커스텀 리포트 파일 없음');
  }
  
  console.log('\n🏁 테스트 완료');
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ 테스트 실행 오류:', error);
  process.exit(1);
}); 