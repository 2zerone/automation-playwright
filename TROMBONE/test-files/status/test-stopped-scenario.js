const fs = require('fs');
const path = require('path');

// Import the ReportGenerator class
const ReportGenerator = require('./lib/report-generator');

console.log('🔍 중단된 시나리오 테스트\n');

const reportGenerator = new ReportGenerator();

// 중단된 테스트 시뮬레이션
const stoppedTestData = {
  testResults: {
    testCases: [], // 빈 배열로 시작해서 extractTestCasesFromScenarioFile 호출
    status: 'stopped',
    duration: '15초',
    startTime: new Date(Date.now() - 15000).toISOString(),
    endTime: new Date().toISOString(),
    error: { message: '테스트가 수동으로 중단됨' }
  },
  user: { id: 'yh.lee5', name: '이영호' },
          project: { code: "LYH007", name: "LYH 업무코드" },
        repository: { name: "LYH-REPO" },
  timestamp: new Date().toISOString()
};

console.log('📋 중단된 테스트 시나리오 리포트 생성');
console.log(`   상태: ${stoppedTestData.testResults.status}`);
console.log(`   소요시간: ${stoppedTestData.testResults.duration}`);

try {
  console.log('   🔍 generateCustomReport 호출...');
  const reportHtml = reportGenerator.generateCustomReport(1, stoppedTestData);
  
  // Save the report
  const reportDir = path.join(__dirname, 'custom-reports', 'scenario-1');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '');
  const reportPath = path.join(reportDir, `stopped-test-${timestamp}.html`);
  fs.writeFileSync(reportPath, reportHtml, 'utf8');
  
  console.log(`   ✅ 리포트 생성: ${reportPath}`);
  
  // Check the report content for PASS/FAIL status
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  const passMatches = (reportContent.match(/status-badge pass/g) || []).length;
  const failMatches = (reportContent.match(/status-badge fail/g) || []).length;
  
  console.log(`   📊 결과: PASS ${passMatches}개, FAIL ${failMatches}개`);
  
  // Check duration display
  const durationMatch = reportContent.match(/실행시간: ([^<]+)/);
  const displayedDuration = durationMatch ? durationMatch[1].trim() : 'N/A';
  console.log(`   ⏱️ 표시된 소요시간: ${displayedDuration}`);
  
  // Expected: All steps should be FAIL for stopped test
  if (failMatches > 0 && passMatches === 0) {
    console.log(`   ✅ 정확함: 중단된 테스트에서 모든 단계가 FAIL`);
  } else if (failMatches > 0 && passMatches > 0) {
    console.log(`   ⚠️ 부분적 성공: PASS와 FAIL이 혼재 (예상: 모든 단계 FAIL)`);
  } else {
    console.log(`   ❌ 문제: 중단된 테스트인데 FAIL이 없거나 모든 단계가 PASS`);
  }
  
  if (displayedDuration !== 'N/A' && displayedDuration !== '15초') {
    console.log(`   ⚠️ 소요시간 표시 문제: 예상 '15초', 실제 '${displayedDuration}'`);
  } else if (displayedDuration === '15초') {
    console.log(`   ✅ 소요시간 정확함: ${displayedDuration}`);
  }
  
} catch (error) {
  console.error(`   ❌ 테스트 실패:`, error.message);
}

console.log('\n🔍 중단 시나리오 테스트 완료');