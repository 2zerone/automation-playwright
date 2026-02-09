const fs = require('fs');
const path = require('path');

// Import the ReportGenerator class
const ReportGenerator = require('../../lib/report-generator');

console.log('🔍 최종 PASS/FAIL 상태 테스트\n');

const reportGenerator = new ReportGenerator();

// 테스트 시나리오들
const scenarios = [
  {
    name: '성공한 테스트',
    testResults: {
      testCases: [], // 빈 배열로 시작해서 extractTestCasesFromScenarioFile 호출 유도
      status: 'pass',
      duration: 30000
    }
  },
  {
    name: '로그인에서 실패한 테스트',
    testResults: {
      testCases: [], // 빈 배열로 시작
      status: 'fail',
      duration: 5000,
      error: { message: 'LoginManager 로그인 실패' }
    }
  },
  {
    name: '업무코드에서 실패한 테스트',
    testResults: {
      testCases: [], // 빈 배열로 시작
      status: 'fail',
      duration: 15000,
      error: { message: '업무코드 등록 중 오류 발생' }
    }
  },
  {
    name: '중단된 테스트',
    testResults: {
      testCases: [], // 빈 배열로 시작
      status: 'stopped',
      duration: 10000,
      error: { message: '테스트가 수동으로 중단됨' }
    }
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`📋 테스트 ${index + 1}: ${scenario.name}`);
  
  try {
    const reportData = {
      testResults: scenario.testResults,
      user: { id: 'yh.lee5', name: '이영호' },
              project: { code: "LYH007", name: "LYH 업무코드" },
        repository: { name: "LYH-REPO" },
      timestamp: new Date().toISOString()
    };
    
    console.log('   🔍 generateCustomReport 호출...');
    const reportHtml = reportGenerator.generateCustomReport(1, reportData);
    
    // Save the report
    const reportDir = path.join(__dirname, 'custom-reports', 'scenario-1');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '');
    const reportPath = path.join(reportDir, `status-test-${index + 1}-${timestamp}.html`);
    fs.writeFileSync(reportPath, reportHtml, 'utf8');
    
    console.log(`   ✅ 리포트 생성: ${reportPath}`);
    
    // Check the report content for PASS/FAIL status
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const passMatches = (reportContent.match(/status-badge pass/g) || []).length;
    const failMatches = (reportContent.match(/status-badge fail/g) || []).length;
    
    console.log(`   📊 결과: PASS ${passMatches}개, FAIL ${failMatches}개`);
    
    // Expected results validation
    if (scenario.testResults.status === 'pass') {
      if (passMatches > 0 && failMatches === 0) {
        console.log(`   ✅ 정확함: 성공 테스트에서 모든 단계가 PASS`);
      } else {
        console.log(`   ❌ 문제: 성공 테스트인데 FAIL이 있음`);
      }
    } else {
      if (passMatches > 0 && failMatches > 0) {
        console.log(`   ✅ 정확함: 실패 테스트에서 PASS와 FAIL이 혼재`);
      } else if (failMatches > 0 && passMatches === 0) {
        console.log(`   ✅ 정확함: 실패 테스트에서 모든 단계가 FAIL`);
      } else {
        console.log(`   ❌ 문제: 실패 테스트인데 모든 단계가 PASS`);
      }
    }
    
  } catch (error) {
    console.error(`   ❌ 테스트 실패:`, error.message);
  }
  
  console.log('─'.repeat(60));
});

console.log('🔍 최종 테스트 완료');