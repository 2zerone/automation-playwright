const fs = require('fs');
const path = require('path');

// Import the ReportGenerator class
const ReportGenerator = require('../../lib/report-generator');

console.log('🔍 수정 사항 검증 테스트 시작');

// Test the extractTestCasesFromScenarioFile function with the fixed path
function extractTestCasesFromScenarioFile(scenarioId, scenarioStatus = 'pass') {
  try {
         // 모든 시나리오에 대해 일관된 파일명 사용
     const scenarioFilePath = path.join(__dirname, '..', 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
    
    if (!fs.existsSync(scenarioFilePath)) {
      console.log(`❌ 시나리오 파일이 존재하지 않음: ${scenarioFilePath}`);
      return [];
    }
    
    console.log(`✅ 시나리오 파일 발견: ${scenarioFilePath}`);
    const fileContent = fs.readFileSync(scenarioFilePath, 'utf8');
    
    const testSteps = [];
    
    // test.step() 호출을 찾아서 테스트 단계 추출
    const testStepRegex = /test\.step\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
    let match;
    
    while ((match = testStepRegex.exec(fileContent)) !== null) {
      const stepName = match[1];
      
      // 시나리오 상태에 따라 기본 상태 설정
      let defaultStatus = 'pass';
      let errorMessage = null;
      let logContent = '';
      
      if (scenarioStatus === 'fail' || scenarioStatus === 'stopped') {
        defaultStatus = 'fail';
        errorMessage = '테스트 실행이 취소되어 실행되지 않았습니다.';
        logContent = `테스트 단계: ${stepName}\n상태: 실패\n오류: 테스트 실행이 취소되어 실행되지 않았습니다.\n소요시간: 0ms`;
      } else {
        logContent = `테스트 단계: ${stepName}\n상태: 성공\n소요시간: 0ms\n로그: 기본 테스트 단계입니다.`;
      }
      
      testSteps.push({
        name: stepName.replace(/중메뉴\s*:\s*/g, '').replace(/대메뉴\s*:\s*/g, '').replace(/메뉴\s*:\s*/g, '').trim(),
        status: defaultStatus,
        duration: 0,
        error: errorMessage,
        logs: logContent
      });
    }
    
    return testSteps;
  } catch (error) {
    console.error(`❌ 시나리오 ${scenarioId} 파일에서 테스트 케이스 추출 실패:`, error);
    return [];
  }
}

// Test 1: Extract test cases from scenario file
console.log('\n📋 테스트 1: 시나리오 파일에서 테스트 케이스 추출');
try {
  const testCases = extractTestCasesFromScenarioFile(1, 'pass');
  console.log(`✅ 추출된 테스트 케이스: ${testCases.length}개`);
  
  if (testCases.length > 0) {
    console.log('\n📝 추출된 테스트 케이스 목록 (처음 10개):');
    testCases.slice(0, 10).forEach((testCase, index) => {
      console.log(`${index + 1}. "${testCase.name}" (${testCase.status})`);
    });
    
    // Check if we have the expected test steps
    const expectedSteps = [
      '업무코드 메뉴 접근',
      '업무코드 등록 화면 열기',
      '업무코드 정보 입력',
      '업무코드 저장 및 확인'
    ];
    
    console.log('\n🔍 예상되는 테스트 스텝 확인:');
    expectedSteps.forEach(expectedStep => {
      const found = testCases.find(tc => tc.name.includes(expectedStep.replace(/중메뉴\s*:\s*/g, '')));
      if (found) {
        console.log(`✅ "${expectedStep}" → "${found.name}"`);
      } else {
        console.log(`❌ "${expectedStep}" - 찾을 수 없음`);
      }
    });
  } else {
    console.log('❌ 테스트 케이스를 추출할 수 없습니다.');
  }
} catch (error) {
  console.error('❌ 테스트 케이스 추출 실패:', error);
}

// Test 2: Generate a custom report using the extracted data
console.log('\n📊 테스트 2: 추출된 데이터로 커스텀 리포트 생성');
try {
  const testCases = extractTestCasesFromScenarioFile(1, 'pass');
  
  if (testCases.length > 0) {
    // Create test data structure
    const testResults = {
      testCases: testCases,
      status: 'pass',
      duration: 30000,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    // Create report data
    const reportData = {
      testResults: testResults,
      user: { id: 'yh.lee5', name: '이영호' },
              project: { code: "LYH007", name: "LYH 업무코드" },
        repository: { name: "LYH-REPO" },
      timestamp: new Date().toISOString()
    };
    
    // Generate custom report
    const reportGenerator = new ReportGenerator();
    const reportHtml = reportGenerator.generateCustomReport(1, reportData);
    
    // Save the report
    const reportDir = path.join(__dirname, 'custom-reports', 'scenario-1');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '');
    const reportPath = path.join(reportDir, `test-verification-${timestamp}.html`);
    fs.writeFileSync(reportPath, reportHtml, 'utf8');
    
    console.log(`✅ 커스텀 리포트 생성 완료: ${reportPath}`);
    
    // Check if the report contains the correct test case names
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const hasCorrectSteps = testCases.some(testCase => 
      reportContent.includes(testCase.name)
    );
    
    if (hasCorrectSteps) {
      console.log('✅ 커스텀 리포트에 올바른 테스트 케이스 이름이 포함되어 있습니다.');
    } else {
      console.log('❌ 커스텀 리포트에 올바른 테스트 케이스 이름이 포함되어 있지 않습니다.');
    }
    
  } else {
    console.log('❌ 테스트 케이스가 없어서 리포트를 생성할 수 없습니다.');
  }
} catch (error) {
  console.error('❌ 커스텀 리포트 생성 실패:', error);
}

console.log('\n�� 수정 사항 검증 테스트 완료'); 