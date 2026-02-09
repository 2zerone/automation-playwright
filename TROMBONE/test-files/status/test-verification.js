const fs = require('fs');
const path = require('path');

// Import the ReportGenerator class
const ReportGenerator = require('./lib/report-generator');

console.log('🔍 수정 사항 최종 검증 테스트 시작');

// Test: Generate a custom report using the new extractTestCasesFromScenarioFile method
console.log('\n📊 새로운 extractTestCasesFromScenarioFile 메서드로 커스텀 리포트 생성');
try {
  const reportGenerator = new ReportGenerator();
  
  // Test the extractTestCasesFromScenarioFile method directly
  console.log('\n📋 시나리오 파일에서 테스트 케이스 추출 테스트');
  const testCases = reportGenerator.extractTestCasesFromScenarioFile(1, 'pass');
  console.log(`✅ 추출된 테스트 케이스: ${testCases.length}개`);
  
  if (testCases.length > 0) {
    console.log('\n📝 추출된 테스트 케이스 목록 (처음 10개):');
    testCases.slice(0, 10).forEach((testCase, index) => {
      console.log(`${index + 1}. "${testCase.name}" (${testCase.status})`);
    });
    
    // Check if we have the expected test steps (without "중메뉴:" prefix)
    const expectedSteps = [
      '업무코드 메뉴 접근',
      '업무코드 등록 화면 열기',
      '업무코드 정보 입력',
      '업무코드 저장 및 확인'
    ];
    
    console.log('\n🔍 예상되는 테스트 스텝 확인:');
    expectedSteps.forEach(expectedStep => {
      const found = testCases.find(tc => tc.name === expectedStep);
      if (found) {
        console.log(`✅ "${expectedStep}" - 찾음`);
      } else {
        console.log(`❌ "${expectedStep}" - 찾을 수 없음`);
      }
    });
    
    // Generate custom report
    console.log('\n📊 커스텀 리포트 생성');
    const reportData = {
      testResults: {
        testCases: testCases,
        status: 'pass',
        duration: 30000,
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
    const reportPath = path.join(reportDir, `verification-test-${timestamp}.html`);
    fs.writeFileSync(reportPath, reportHtml, 'utf8');
    
    console.log(`✅ 커스텀 리포트 생성 완료: ${reportPath}`);
    
    // Check if the report contains the correct test case names
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const hasCorrectSteps = testCases.some(testCase => 
      reportContent.includes(testCase.name)
    );
    
    if (hasCorrectSteps) {
      console.log('✅ 커스텀 리포트에 올바른 테스트 케이스 이름이 포함되어 있습니다.');
      
      // Show some examples from the report
      console.log('\n📝 리포트에서 확인된 테스트 케이스 예시:');
      testCases.slice(0, 5).forEach(testCase => {
        if (reportContent.includes(testCase.name)) {
          console.log(`✅ "${testCase.name}" - 리포트에 포함됨`);
        } else {
          console.log(`❌ "${testCase.name}" - 리포트에 포함되지 않음`);
        }
      });
    } else {
      console.log('❌ 커스텀 리포트에 올바른 테스트 케이스 이름이 포함되어 있지 않습니다.');
    }
    
  } else {
    console.log('❌ 테스트 케이스를 추출할 수 없습니다.');
  }
} catch (error) {
  console.error('❌ 테스트 실패:', error);
}

console.log('\n🔍 수정 사항 최종 검증 테스트 완료'); 