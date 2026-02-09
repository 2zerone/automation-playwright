const fs = require('fs');
const path = require('path');

// Extract the functions we need
function cleanStepName(stepName) {
  if (!stepName) return '';
  return stepName
    .replace(/중메뉴\s*:\s*/g, '')
    .replace(/대메뉴\s*:\s*/g, '')
    .replace(/메뉴\s*:\s*/g, '')
    .trim();
}

function extractTestCasesFromScenarioFile(scenarioId, scenarioStatus = 'pass') {
  try {
         // 모든 시나리오에 대해 일관된 파일명 사용
     const scenarioFilePath = path.join(__dirname, '..', 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
    
    if (!fs.existsSync(scenarioFilePath)) {
      console.log(`❌ 시나리오 파일이 존재하지 않음: ${scenarioFilePath}`);
      return [];
    }
    
    console.log(`📁 시나리오 파일 경로: ${scenarioFilePath}`);
    const fileContent = fs.readFileSync(scenarioFilePath, 'utf8');
    console.log(`📄 파일 크기: ${fileContent.length} 바이트`);
    
    const testSteps = [];
    
    // test.step() 호출을 찾아서 테스트 단계 추출 (우선순위)
    const testStepRegex = /test\.step\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
    let match;
    
    while ((match = testStepRegex.exec(fileContent)) !== null) {
      const stepName = match[1];
      console.log(`🔍 발견된 test.step: "${stepName}"`);
      
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
        name: cleanStepName(stepName),
        status: defaultStatus,
        duration: 0,
        error: errorMessage,
        logs: logContent
      });
    }
    
    // test.step()이 없는 경우 test() 함수 호출을 찾아서 테스트 케이스 추출
    if (testSteps.length === 0) {
      console.log('📋 test.step()을 찾지 못했습니다. test() 함수를 찾습니다.');
      const testRegex = /test\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
      
      while ((match = testRegex.exec(fileContent)) !== null) {
        const testName = match[1];
        console.log(`🔍 발견된 test(): "${testName}"`);
        
        let defaultStatus = 'pass';
        let errorMessage = null;
        let logContent = '';
        
        if (scenarioStatus === 'fail' || scenarioStatus === 'stopped') {
          defaultStatus = 'fail';
          errorMessage = '테스트 실행이 취소되어 실행되지 않았습니다.';
          logContent = `테스트 케이스: ${testName}\n상태: 실패\n오류: 테스트 실행이 취소되어 실행되지 않았습니다.\n소요시간: 0ms`;
        } else {
          logContent = `테스트 케이스: ${testName}\n상태: 성공\n소요시간: 0ms\n로그: 기본 테스트 케이스입니다.`;
        }
        
        testSteps.push({
          name: cleanStepName(testName),
          status: defaultStatus,
          duration: 0,
          error: errorMessage,
          logs: logContent
        });
      }
    }
    
    return testSteps;
  } catch (error) {
    console.error(`❌ 시나리오 ${scenarioId} 파일에서 테스트 케이스 추출 실패:`, error);
    return [];
  }
}

console.log('🔍 테스트 케이스 추출 테스트 시작');

// Test: Extract test cases from scenario file
console.log('\n📋 시나리오 파일에서 테스트 케이스 추출');
try {
  const testCases = extractTestCasesFromScenarioFile(1, 'pass');
  console.log('\n✅ 추출된 테스트 케이스:', testCases.length, '개');
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name} (${testCase.status})`);
  });
  
  // Show first few test cases with their cleaned names
  console.log('\n📝 정리된 테스트 케이스 이름 (처음 5개):');
  testCases.slice(0, 5).forEach((testCase, index) => {
    console.log(`${index + 1}. "${testCase.name}"`);
  });
  
} catch (error) {
  console.error('❌ 테스트 케이스 추출 실패:', error);
}

console.log('\n🔍 테스트 완료'); 