const fs = require('fs');
const path = require('path');

// Import the ReportGenerator class
const ReportGenerator = require('./lib/report-generator');

console.log('🔍 PASS/FAIL 상태 수정 테스트 시작\n');

// Test different scenarios
const testScenarios = [
  { 
    scenarioStatus: 'pass', 
    failedAtStep: null, 
    description: '성공한 테스트 시나리오' 
  },
  { 
    scenarioStatus: 'fail', 
    failedAtStep: '로그인', 
    description: '로그인에서 실패한 테스트 시나리오' 
  },
  { 
    scenarioStatus: 'fail', 
    failedAtStep: '업무코드', 
    description: '업무코드 단계에서 실패한 테스트 시나리오' 
  },
  { 
    scenarioStatus: 'fail', 
    failedAtStep: null, 
    description: '실패 지점을 알 수 없는 테스트 시나리오' 
  },
  { 
    scenarioStatus: 'stopped', 
    failedAtStep: null, 
    description: '중단된 테스트 시나리오' 
  }
];

const reportGenerator = new ReportGenerator();

testScenarios.forEach((scenario, index) => {
  console.log(`📋 테스트 ${index + 1}: ${scenario.description}`);
  console.log(`   상태: ${scenario.scenarioStatus}, 실패지점: ${scenario.failedAtStep || '없음'}`);
  
  try {
    const testCases = reportGenerator.extractTestCasesFromScenarioFile(
      1, 
      scenario.scenarioStatus, 
      scenario.failedAtStep
    );
    
    console.log(`   추출된 테스트 케이스: ${testCases.length}개\n`);
    
    // Show first 5 test cases with their status
    console.log('   📝 테스트 케이스 상태 (처음 5개):');
    testCases.slice(0, 5).forEach((testCase, i) => {
      const statusEmoji = testCase.status === 'pass' ? '✅' : '❌';
      console.log(`      ${i + 1}. ${statusEmoji} ${testCase.name} (${testCase.status})`);
      if (testCase.error) {
        console.log(`         오류: ${testCase.error}`);
      }
    });
    
    // Count PASS/FAIL
    const passCount = testCases.filter(tc => tc.status === 'pass').length;
    const failCount = testCases.filter(tc => tc.status === 'fail').length;
    console.log(`   📊 결과: PASS ${passCount}개, FAIL ${failCount}개\n`);
    
  } catch (error) {
    console.error(`   ❌ 테스트 실패:`, error.message);
  }
  
  console.log('─'.repeat(50));
});

console.log('\n🔍 테스트 완료');

// 실제 커스텀 리포트 생성 테스트
console.log('\n📊 실제 커스텀 리포트 생성 테스트');
try {
  const testCases = reportGenerator.extractTestCasesFromScenarioFile(1, 'fail', '로그인');
  
  const reportData = {
    testResults: {
      testCases: testCases,
      status: 'fail',
      duration: 15000,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      timestamp: new Date().toISOString()
    },
    user: { id: 'yh.lee5', name: '이영호' },
            project: { code: "LYH007", name: "LYH 업무코드" },
        repository: { name: "LYH-REPO" },
    timestamp: new Date().toISOString()
  };
  
  const reportHtml = reportGenerator.generateCustomReport(1, reportData);
  
  // Save the report
  const reportDir = path.join(__dirname, 'custom-reports', 'scenario-1');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '');
  const reportPath = path.join(reportDir, `status-test-${timestamp}.html`);
  fs.writeFileSync(reportPath, reportHtml, 'utf8');
  
  console.log(`✅ 상태 테스트 리포트 생성 완료: ${reportPath}`);
  
  // Verify the report contains both PASS and FAIL statuses
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  const hasPassStatus = reportContent.includes('status-badge pass') || reportContent.includes('PASS');
  const hasFailStatus = reportContent.includes('status-badge fail') || reportContent.includes('FAIL');
  
  console.log(`📋 리포트 검증:`);
  console.log(`   PASS 상태 포함: ${hasPassStatus ? '✅' : '❌'}`);
  console.log(`   FAIL 상태 포함: ${hasFailStatus ? '✅' : '❌'}`);
  
  if (hasPassStatus && hasFailStatus) {
    console.log('✅ 성공: 리포트에 PASS와 FAIL 상태가 모두 정확히 반영되었습니다!');
  } else {
    console.log('❌ 문제: 리포트에서 상태가 올바르게 반영되지 않았습니다.');
  }
  
} catch (error) {
  console.error('❌ 리포트 생성 테스트 실패:', error);
}