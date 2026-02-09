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

// 특정 케이스 ID들로 테스트 코드 생성
function generateMergedTestCode(sheetData, caseIds, outputFileName) {
  // 헤더 제거 (첫 번째 행)
  const dataRows = sheetData.slice(1);
  
  if (dataRows.length === 0) {
    return null;
  }
  
  // 지정된 케이스 ID들만 필터링
  const filteredRows = dataRows.filter(row => caseIds.includes(row[1]));
  
  if (filteredRows.length === 0) {
    console.log('⚠️ 지정된 케이스 ID에 해당하는 데이터가 없습니다.');
    return null;
  }
  
  // 케이스별 그룹화
  const caseGroups = {};
  filteredRows.forEach(row => {
    const caseId = row[1];
    if (!caseGroups[caseId]) {
      caseGroups[caseId] = [];
    }
    caseGroups[caseId].push(row);
  });
  
  // 병합된 테스트 코드 생성
  let mergedCode = `// Generated Merged Playwright Tests
// Test Cases: ${caseIds.join(', ')}
// Generated at: ${new Date().toISOString()}
// Output File: ${outputFileName}

import { test, expect } from '@playwright/test';

`;

  let totalActions = 0;
  
  // 각 케이스를 개별 테스트로 변환
  Object.entries(caseGroups).forEach(([caseId, rows]) => {
    const testTitle = rows[0][2]; // TITLE
    const enabledRows = rows.filter(row => row[0] === 'TRUE');
    
    if (enabledRows.length === 0) {
      mergedCode += `// Test Case ${caseId}: ${testTitle} - DISABLED\n\n`;
      return;
    }
    
    mergedCode += `test('${testTitle}', async ({ page }) => {\n`;
    
    // 각 액션을 Playwright 코드로 변환
    for (const row of enabledRows) {
      const [enabled, caseId, title, stepNo, selector, action, data, assert, timeoutMs] = row;
      
      mergedCode += `  // Step ${stepNo}: ${action}\n`;
      
      switch (action) {
        case 'goto':
          mergedCode += `  await page.goto('${data}');\n`;
          // 페이지 로드 완료까지 대기
          mergedCode += `  await page.waitForLoadState('domcontentloaded');\n`;
          mergedCode += `  await page.waitForLoadState('networkidle');\n`;
          mergedCode += `  await page.waitForTimeout(2000);\n`;
          mergedCode += `  console.log('Step ${stepNo}: 페이지 이동 완료');\n`;
          if (assert && assert.startsWith('url:')) {
            const urlPattern = assert.replace('url:', '');
            mergedCode += `  await expect(page).toHaveURL(${urlPattern});\n`;
          }
          break;
          
        case 'click':
          mergedCode += `  await page.click('${selector}');\n`;
          // 클릭 후 요소가 안정화될 때까지 대기
          mergedCode += `  await page.waitForLoadState('domcontentloaded');\n`;
          mergedCode += `  await page.waitForLoadState('networkidle');\n`;
          mergedCode += `  await page.waitForTimeout(1500);\n`;
          mergedCode += `  console.log('Step ${stepNo}: 클릭 완료');\n`;
          if (assert === 'visible') {
            mergedCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
          }
          break;
          
        case 'fill':
          mergedCode += `  await page.fill('${selector}', '${data}');\n`;
          // 입력 완료 후 값이 설정될 때까지 대기
          mergedCode += `  await page.locator('${selector}').blur();\n`;
          mergedCode += `  await page.waitForTimeout(1000);\n`;
          mergedCode += `  console.log('Step ${stepNo}: 입력 완료');\n`;
          if (assert === 'visible') {
            mergedCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
          }
          break;
          
        case 'press':
          mergedCode += `  await page.press('${selector}', '${data}');\n`;
          if (assert === 'visible') {
            mergedCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
          }
          break;
          
        case 'hover':
          mergedCode += `  await page.hover('${selector}');\n`;
          if (assert === 'visible') {
            mergedCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
          }
          break;
          
        case 'waitFor':
          if (selector) {
            mergedCode += `  await page.waitForSelector('${selector}');\n`;
          } else if (data) {
            mergedCode += `  await page.waitForTimeout(${data});\n`;
          }
          break;
          
        default:
          mergedCode += `  // Unknown action: ${action}\n`;
      }
      
      // 타임아웃 설정
      if (timeoutMs && timeoutMs !== '0') {
        mergedCode += `  await page.waitForTimeout(${timeoutMs});\n`;
      } else {
        // 기본 타임아웃이 없는 경우 1초 대기
        mergedCode += `  await page.waitForTimeout(1000);\n`;
      }
      
      mergedCode += '\n';
      totalActions++;
    }
    
    mergedCode += `});\n\n`;
  });
  
  return {
    code: mergedCode,
    testCases: Object.keys(caseGroups),
    actionCount: totalActions
  };
}

// 메인 함수: 여러 케이스를 하나의 파일로 병합
export async function mergeTestCases(caseIds, outputFileName) {
  try {
    console.log('🔄 테스트 케이스 병합 시작');
    console.log(`📋 병합할 케이스 ID들: ${caseIds.join(', ')}`);
    console.log(`📄 출력 파일: ${outputFileName}`);
    
    // Google Sheets에서 데이터 조회
    const sheetData = await getSheetData();
    
    // 병합된 테스트 코드 생성
    const result = generateMergedTestCode(sheetData, caseIds, outputFileName);
    
    if (!result) {
      console.log('❌ 병합할 데이터가 없습니다.');
      return null;
    }
    
    // 출력 디렉토리 생성
    const outputDir = 'tests/generated';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 파일 저장
    const filePath = join(outputDir, outputFileName);
    fs.writeFileSync(filePath, result.code);
    
    console.log('✅ 병합 완료!');
    console.log(`📄 파일 저장: ${filePath}`);
    console.log(`📋 포함된 케이스: ${result.testCases.join(', ')}`);
    console.log(`📊 총 액션 수: ${result.actionCount}개`);
    
    return {
      success: true,
      filePath,
      testCases: result.testCases,
      actionCount: result.actionCount
    };
    
  } catch (error) {
    console.error('❌ 병합 실패:', error.message);
    throw error;
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].includes('merge-test-cases.js')) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('사용법:');
    console.log('  node merge-test-cases.js <케이스ID1,케이스ID2,...> <출력파일명>');
    console.log('');
    console.log('예시:');
    console.log('  node merge-test-cases.js "TC001,TC002" "merged-login-tests.spec.js"');
    console.log('  node merge-test-cases.js "TC001,TC002,TC003" "all-tests.spec.js"');
    process.exit(1);
  }
  
  const [caseIdsStr, outputFileName] = args;
  const caseIds = caseIdsStr.split(',').map(id => id.trim());
  
  mergeTestCases(caseIds, outputFileName)
    .then(result => {
      if (result) {
        console.log('\n🎉 성공!');
        console.log(`📄 파일: ${result.filePath}`);
        console.log(`📋 케이스: ${result.testCases.join(', ')}`);
        console.log(`📊 액션 수: ${result.actionCount}개`);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실패:', error.message);
      process.exit(1);
    });
}
