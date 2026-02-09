import { google } from 'googleapis';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Google Sheets 설정
const SHEET_ID = "1UhI2li9ep1l77_9njpqVBY-g8bDDbyX5E7VmZ7Yc3AA";

// 플랫폼별 시트 범위 설정
const SHEET_RANGES = {
  trombone: 'TROMBONE!A1:I9999',
  viola: 'VIOLA!A1:I9999',
  contrabass: 'CONTRABASS!A1:I9999',
  cmp: 'CMP!A1:I9999'
};

// 명령행 인수에서 플랫폼 추출
const args = process.argv.slice(2);
let platform = 'trombone'; // 기본값

// 플랫폼 감지 로직
if (args.length > 0) {
  const platformArg = args.find(arg => ['trombone', 'viola', 'contrabass', 'cmp'].includes(arg.toLowerCase()));
  if (platformArg) {
    platform = platformArg.toLowerCase();
  }
}

const SHEET_RANGE = SHEET_RANGES[platform];

// Google Sheets 인증
let credentials;
try {
  const keyPath = join(__dirname, 'balmy-state-471105-h5-c819a6c1e5f3.json');
  credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  console.log('✅ Google Sheets 인증 파일 로드 성공');
} catch (error) {
  console.error('❌ Google Sheets 인증 파일 로드 실패:', error.message);
  process.exit(1);
}

// Google Sheets 클라이언트 생성
function createSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Google Sheets에서 데이터 조회
async function getSheetData() {
  try {
    console.log('📊 Google Sheets 데이터 조회 중...');
    
    const sheets = createSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    
    const values = response.data.values || [];
    console.log(`📊 총 ${values.length}개 행이 조회되었습니다.`);
    
    return values;
  } catch (error) {
    console.error('❌ Google Sheets 조회 실패:', error.message);
    throw error;
  }
}

// 특정 케이스 ID로 테스트 코드 생성
function generateTestCodeForCase(sheetData, caseId) {
  // 헤더 제거 (첫 번째 행)
  const dataRows = sheetData.slice(1);
  
  if (dataRows.length === 0) {
    return null;
  }
  
  // 특정 케이스 ID 필터링
  const filteredRows = dataRows.filter(row => row[1] === caseId);
  
  if (filteredRows.length === 0) {
    console.log(`⚠️ 케이스 ID ${caseId}에 해당하는 데이터가 없습니다.`);
    return null;
  }
  
  const testTitle = filteredRows[0][2]; // TITLE
  const enabledRows = filteredRows.filter(row => row[0] === 'TRUE');
  
  if (enabledRows.length === 0) {
    console.log(`⚠️ 케이스 ID ${caseId}에 활성화된 액션이 없습니다.`);
    return null;
  }
  
  // 테스트 코드 생성
  let testCode = `test('${testTitle}', async ({ page }) => {\n`;
  
  // 각 액션을 Playwright 코드로 변환
  for (const row of enabledRows) {
    const [enabled, caseId, title, stepNo, selector, action, data, assert, timeoutMs] = row;
    
    testCode += `  // Step ${stepNo}: ${action}\n`;
    
    switch (action) {
      case 'goto':
        testCode += `  await page.goto('${data}');\n`;
        // 페이지 로드 완료까지 대기
        testCode += `  await page.waitForLoadState('domcontentloaded');\n`;
        testCode += `  await page.waitForLoadState('networkidle');\n`;
        testCode += `  await page.waitForTimeout(2000);\n`;
        testCode += `  console.log('Step ${stepNo}: 페이지 이동 완료');\n`;
        if (assert && assert.startsWith('url:')) {
          const urlPattern = assert.replace('url:', '');
          testCode += `  await expect(page).toHaveURL(${urlPattern});\n`;
        }
        break;
        
      case 'click':
        testCode += `  await page.click('${selector}');\n`;
        // 클릭 후 요소가 안정화될 때까지 대기
        testCode += `  await page.waitForLoadState('domcontentloaded');\n`;
        testCode += `  await page.waitForLoadState('networkidle');\n`;
        testCode += `  await page.waitForTimeout(1500);\n`;
        testCode += `  console.log('Step ${stepNo}: 클릭 완료');\n`;
        if (assert === 'visible') {
          testCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
        }
        break;
        
      case 'fill':
        testCode += `  await page.fill('${selector}', '${data}');\n`;
        // 입력 완료 후 값이 설정될 때까지 대기
        testCode += `  await page.locator('${selector}').blur();\n`;
        testCode += `  await page.waitForTimeout(1000);\n`;
        testCode += `  console.log('Step ${stepNo}: 입력 완료');\n`;
        if (assert === 'visible') {
          testCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
        }
        break;
        
      case 'press':
        testCode += `  await page.press('${selector}', '${data}');\n`;
        if (assert === 'visible') {
          testCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
        }
        break;
        
      case 'hover':
        testCode += `  await page.hover('${selector}');\n`;
        if (assert === 'visible') {
          testCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
        }
        break;
        
      case 'waitFor':
        if (selector) {
          testCode += `  await page.waitForSelector('${selector}');\n`;
        } else if (data) {
          testCode += `  await page.waitForTimeout(${data});\n`;
        }
        break;
        
      default:
        testCode += `  // Unknown action: ${action}\n`;
    }
    
    // 타임아웃 설정
    if (timeoutMs && timeoutMs !== '0') {
      testCode += `  await page.waitForTimeout(${timeoutMs});\n`;
    } else {
      // 기본 타임아웃이 없는 경우 1초 대기
      testCode += `  await page.waitForTimeout(1000);\n`;
    }
    
    testCode += '\n';
  }
  
  testCode += `});\n\n`;
  
  return {
    code: testCode,
    testTitle,
    actionCount: enabledRows.length
  };
}

// 기존 파일에 새로운 테스트 케이스 추가
export async function appendTestCases(existingFilePath, caseIds) {
  try {
    console.log('➕ 테스트 케이스 추가 시작');
    console.log(`📄 기존 파일: ${existingFilePath}`);
    console.log(`📋 추가할 케이스 ID들: ${caseIds.join(', ')}`);
    
    // 기존 파일이 존재하는지 확인
    if (!fs.existsSync(existingFilePath)) {
      throw new Error(`기존 파일을 찾을 수 없습니다: ${existingFilePath}`);
    }
    
    // 기존 파일 내용 읽기
    const existingContent = fs.readFileSync(existingFilePath, 'utf8');
    console.log('✅ 기존 파일 읽기 완료');
    
    // Google Sheets에서 데이터 조회
    const sheetData = await getSheetData();
    
    // 새로운 테스트 케이스들 생성
    let newTestCodes = [];
    let totalActions = 0;
    
    for (const caseId of caseIds) {
      const result = generateTestCodeForCase(sheetData, caseId);
      if (result) {
        newTestCodes.push(result);
        totalActions += result.actionCount;
        console.log(`✅ 케이스 ${caseId}: ${result.testTitle} (${result.actionCount}개 액션)`);
      } else {
        console.log(`⚠️ 케이스 ${caseId}: 건너뜀`);
      }
    }
    
    if (newTestCodes.length === 0) {
      console.log('❌ 추가할 수 있는 테스트 케이스가 없습니다.');
      return null;
    }
    
    // 기존 파일에 새로운 테스트 케이스들 추가
    const newTestCode = newTestCodes.map(test => test.code).join('');
    
    // 기존 파일의 마지막 부분에 추가
    // import 문이 있는지 확인하고, 없다면 추가
    let finalContent = existingContent;
    
    if (!finalContent.includes('import { test, expect }')) {
      // import 문이 없으면 맨 앞에 추가
      finalContent = `import { test, expect } from '@playwright/test';\n\n${finalContent}`;
    }
    
    // 기존 내용 끝에 새로운 테스트 케이스들 추가
    finalContent += `\n// Added test cases: ${caseIds.join(', ')}\n`;
    finalContent += `// Added at: ${new Date().toISOString()}\n\n`;
    finalContent += newTestCode;
    
    // 파일 저장
    fs.writeFileSync(existingFilePath, finalContent);
    
    console.log('✅ 파일 업데이트 완료!');
    console.log(`📄 파일: ${existingFilePath}`);
    console.log(`📋 추가된 케이스: ${newTestCodes.map(t => t.testTitle).join(', ')}`);
    console.log(`📊 총 추가된 액션 수: ${totalActions}개`);
    
    return {
      success: true,
      filePath: existingFilePath,
      addedTestCases: newTestCodes.map(t => t.testTitle),
      addedActionCount: totalActions
    };
    
  } catch (error) {
    console.error('❌ 테스트 케이스 추가 실패:', error.message);
    throw error;
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].includes('append-test-cases.js')) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('사용법:');
    console.log('  node append-test-cases.js <기존파일경로> <케이스ID1,케이스ID2,...>');
    console.log('');
    console.log('예시:');
    console.log('  node append-test-cases.js "tests/generated/TC001.spec.js" "TC002,TC003"');
    console.log('  node append-test-cases.js "tests/generated/merged-tests.spec.js" "TC004,TC005"');
    process.exit(1);
  }
  
  const [existingFilePath, caseIdsStr] = args;
  const caseIds = caseIdsStr.split(',').map(id => id.trim());
  
  appendTestCases(existingFilePath, caseIds)
    .then(result => {
      if (result) {
        console.log('\n🎉 성공!');
        console.log(`📄 파일: ${result.filePath}`);
        console.log(`📋 추가된 케이스: ${result.addedTestCases.join(', ')}`);
        console.log(`📊 추가된 액션 수: ${result.addedActionCount}개`);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실패:', error.message);
      process.exit(1);
    });
}
