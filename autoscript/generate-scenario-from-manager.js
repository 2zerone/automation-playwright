/**
 * Manager 클래스에서 Scenario 파일 생성
 */

import fs from 'fs';
import path from 'path';

/**
 * Manager 클래스 파일에서 정보 추출
 */
function parseManagerClass(managerFilePath) {
  const content = fs.readFileSync(managerFilePath, 'utf8');
  
  // 클래스명 추출
  const classMatch = content.match(/class\s+(\w+)\s+extends/);
  const className = classMatch ? classMatch[1] : 'UnknownManager';
  
  // 제목 추출 (process 메서드 주석에서, 영어/한글 모두 지원)
  let titleMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s+process/);
  if (!titleMatch) {
    titleMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s+프로세스/);
  }
  const title = titleMatch ? titleMatch[1] : 'Automated test';
  
  // process 메서드명 추출
  const processMatch = content.match(/async\s+(process\w+)\(config\)/);
  const processMethod = processMatch ? processMatch[1] : 'processTest';
  
  // process 메서드에서 executeWithRetry 호출 순서 추출 (이게 실제 실행 순서!)
  const processMethodMatch = content.match(/async\s+process\w+\(config\)\s*\{([\s\S]*?)\n\s*\}/);
  if (!processMethodMatch) {
    console.error('❌ process 메서드를 찾을 수 없습니다!');
    return { className, title, steps: [], processMethod };
  }
  
  const processBody = processMethodMatch[1];
  const executeWithRetryMatches = [...processBody.matchAll(/executeWithRetry\(\(\)\s*=>\s*this\.(\w+)\(config\),\s*['"](.+?)['"]/g)];
  
  const steps = executeWithRetryMatches.map(match => ({
    methodName: match[1].trim(),
    stepName: match[2].trim()
  }));
  
  console.log(`📦 파싱된 step 개수: ${steps.length} (process 메서드 호출 순서 기준)`);
  
  return {
    className,
    title,
    steps,
    processMethod
  };
}

/**
 * Manager에서 Scenario 파일 생성
 */
export function generateScenarioFromManager(managerClassName, scenarioNumber, product, managerFilePath) {
  const productUpper = product.toUpperCase();
  
  // Manager 파일 정보 추출
  const managerInfo = parseManagerClass(managerFilePath);
  
  // 중복된 step 이름 처리
  const stepNameCount = {};
  const uniqueSteps = managerInfo.steps.map(step => {
    const originalName = step.stepName;
    
    if (stepNameCount[originalName]) {
      stepNameCount[originalName]++;
      return {
        ...step,
        uniqueStepName: `${originalName} ${stepNameCount[originalName]}`
      };
    } else {
      stepNameCount[originalName] = 1;
      return {
        ...step,
        uniqueStepName: originalName
      };
    }
  });
  
  // testCases 배열 생성 (중복 제거된 이름 사용)
  const testCases = uniqueSteps.map(step => 
    `  { name: '${step.uniqueStepName}', status: 'pending' }`
  ).join(',\n');
  
  // 각 test 생성 (중복 제거된 이름 사용)
  const tests = uniqueSteps.map(step => `
  test('${step.uniqueStepName}', async () => {
    await test.step('${step.uniqueStepName}', async () => {
      await runTestStep('${step.uniqueStepName}', async () => {
        console.log('📝 Executing: ${step.uniqueStepName}...');
        await managers.${toCamelCase(managerClassName)}.${step.methodName}(config);
        console.log('✅ Completed: ${step.uniqueStepName}');
      }, page, ${scenarioNumber});
    });
  });`).join('\n');

  const scenarioContent = `import { test } from '@playwright/test';
import { testResults, initializeTestResults, runTestStep, setupScenarioBeforeAll, setupScenarioAfterAll } from './scenario-common.js';
import ${managerClassName} from '../../lib/classes/${managerClassName}.js';

const allPlannedTestCases = [
${testCases}
];

initializeTestResults(allPlannedTestCases);

function initializeManagers(page) {
  return {
    ${toCamelCase(managerClassName)}: new ${managerClassName}(page)
  };
}

test.describe.serial('시나리오 ${scenarioNumber}: ${managerInfo.title}', () => {
  let page;
  let browser;
  let config;
  let managers;

  test.beforeAll(async ({ browser: newBrowser }) => {
    const result = await setupScenarioBeforeAll(newBrowser, ${scenarioNumber}, initializeManagers);
    browser = result.browser;
    page = result.page;
    config = result.config;
    managers = result.managers;
  });

  test.afterAll(async () => {
    await setupScenarioAfterAll(page, browser, ${scenarioNumber}, '시나리오 ${scenarioNumber}: ${managerInfo.title}', '${productUpper}');
  });
${tests}
});
`;

  // 시나리오 제목 포함하여 반환
  return {
    content: scenarioContent,
    title: managerInfo.title,
    stepCount: managerInfo.steps.length
  };
}

/**
 * 클래스명을 camelCase로 변환
 */
function toCamelCase(className) {
  return className.charAt(0).toLowerCase() + className.slice(1);
}

// CLI로 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, managerFilePath, scenarioNumber, product] = process.argv;
  
  if (!managerFilePath || !scenarioNumber || !product) {
    console.error('Usage: node generate-scenario-from-manager.js <managerFilePath> <scenarioNumber> <product>');
    process.exit(1);
  }
  
  const managerClassName = path.basename(managerFilePath, '.js');
  
  const result = generateScenarioFromManager(
    managerClassName,
    parseInt(scenarioNumber),
    product,
    managerFilePath
  );
  
  console.log(result.content);
}
