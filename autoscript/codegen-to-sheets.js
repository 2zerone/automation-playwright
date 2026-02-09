import { google } from 'googleapis';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';
import { convertPlaywrightToNaturalLanguage, checkMCPAvailability } from './playwright-mcp-helper.js';
import './config.js'; // API 키 자동 로드

// ====== AI Converter 추가 (기본 활성화) ======
// GROQ_API_KEY가 있으면 자동으로 AI 변환 활성화
// 환경 변수 ENABLE_AI_CONVERSION=false로 명시적으로 비활성화 가능
// 로드 메시지는 나중에 출력 (사용자 입력 프롬프트 방해 방지)
let aiConverter = null;
let aiConverterLoadAttempted = false;
if (process.env.ENABLE_AI_CONVERSION !== 'false' && process.env.GROQ_API_KEY) {
  try {
    const module = await import('./ai-converter/index.js');
    aiConverter = module;
    aiConverterLoadAttempted = true;
    // 메시지는 나중에 출력
  } catch (error) {
    aiConverterLoadAttempted = true;
    // 에러도 나중에 출력
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Google Sheets 설정
const SHEET_ID = "1UhI2li9ep1l77_9njpqVBY-g8bDDbyX5E7VmZ7Yc3AA";

// 플랫폼별 시트 범위 설정 (ENABLED, TIMEOUT_MS 제거: J → G)
const SHEET_RANGES = {
  trombone: 'TROMBONE!A1:G9999',
  viola: 'VIOLA!A1:G9999',
  contrabass: 'CONTRABASS!A1:G9999',
  cmp: 'CMP!A1:G9999'
};

// 플랫폼 감지 함수
function detectPlatform(url) {
  if (url.includes('trombone')) return 'trombone';
  if (url.includes('cmp') || url.includes('304test')) {
    // URL만으로는 VIOLA, CONTRABASS, CMP 구분이 어려우므로 기본값 사용
    return 'viola'; // 기본값으로 VIOLA 사용, 필요시 수동 지정
  }
  return 'trombone'; // 기본값
}

// 시트 범위 가져오기 함수
function getSheetRange(url, platform = null) {
  const detectedPlatform = platform || detectPlatform(url);
  return SHEET_RANGES[detectedPlatform] || SHEET_RANGES.trombone;
}

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

// MCP 사용 가능 여부 (초기화 시 체크)
// 메시지는 조용히 (사용자 입력 프롬프트 방해 방지)
let mcpAvailable = false;
checkMCPAvailability().then(available => {
  mcpAvailable = available;
  // 메시지는 출력하지 않음 (필요시 나중에)
});

// Playwright codegen 실행
async function runPlaywrightCodegen(url, outputFile) {
  return new Promise((resolve, reject) => {
    console.log(`🎭 Playwright codegen 실행 중...`);
    console.log(`🎭 URL: ${url}`);
    console.log(`🎭 출력 파일: ${outputFile}`);
    
    const codegen = spawn('npx', [
      'playwright', 'codegen',
      url,
      '--output', outputFile,
      '--viewport-size=1920,1080'
    ], {
      stdio: 'inherit',
      shell: true
    });

    codegen.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Playwright codegen 완료');
        resolve();
      } else {
        reject(new Error(`Playwright codegen 실패 (종료 코드: ${code})`));
      }
    });

    codegen.on('error', (error) => {
      reject(new Error(`Playwright codegen 실행 오류: ${error.message}`));
    });
  });
}

// Playwright Selector + Action을 자연어로 변환
function selectorAndActionToDesc(selector, action, data = '') {
  // GOTO
  if (action === 'goto') {
    return '페이지로 이동';
  }
  
  // page.getByRole('role', { name: 'xxx' })
  const roleMatch = selector.match(/page\.getByRole\('([^']+)',\s*\{\s*name:\s*['"]([^'"]+)['"]\s*\}\)/);
  if (roleMatch) {
    const [_, role, name] = roleMatch;
    
    const roleMap = {
      'textbox': '텍스트박스',
      'button': '버튼',
      'link': '링크',
      'heading': '제목',
      'checkbox': '체크박스',
      'radio': '라디오버튼',
      'combobox': '선택박스',
      'tab': '탭',
      'dialog': '다이얼로그',
      'alert': '알림'
    };
    
    const roleKr = roleMap[role] || role;
    
    if (action === 'click') {
      return `'${name}' ${roleKr} 클릭한다`;
    } else if (action === 'fill') {
      return `'${name}' ${roleKr}에 입력한다`;
    } else if (action === 'hover') {
      return `'${name}' ${roleKr} 호버한다`;
    } else if (action === 'press') {
      return `'${name}' ${roleKr}에 키 입력한다`;
    } else if (action === 'waitFor') {
      return `'${name}' ${roleKr} 대기한다`;
    }
  }
  
  // page.getByText('xxx')
  const textMatch = selector.match(/page\.getByText\(['"]([^'"]+)['"]\)/);
  if (textMatch) {
    const text = textMatch[1];
    if (action === 'click') {
      return `'${text}' 텍스트 클릭한다`;
    } else if (action === 'fill') {
      return `'${text}' 텍스트에 입력한다`;
    }
  }
  
  // page.getByTitle('xxx')
  const titleMatch = selector.match(/page\.getByTitle\(['"]([^'"]+)['"]\)/);
  if (titleMatch) {
    const title = titleMatch[1];
    if (action === 'click') {
      return `'${title}' 타이틀 요소 클릭한다`;
    } else if (action === 'fill') {
      return `'${title}' 타이틀 요소에 입력한다`;
    }
  }
  
  // page.getByPlaceholder('xxx')
  const placeholderMatch = selector.match(/page\.getByPlaceholder\(['"]([^'"]+)['"]\)/);
  if (placeholderMatch) {
    const placeholder = placeholderMatch[1];
    if (action === 'click') {
      return `'${placeholder}' 플레이스홀더 요소 클릭한다`;
    } else if (action === 'fill') {
      return `'${placeholder}' 플레이스홀더 요소에 입력한다`;
    }
  }
  
  // page.getByLabel('xxx')
  const labelMatch = selector.match(/page\.getByLabel\(['"]([^'"]+)['"]\)/);
  if (labelMatch) {
    const label = labelMatch[1];
    if (action === 'click') {
      return `'${label}' 레이블 요소 클릭한다`;
    } else if (action === 'fill') {
      return `'${label}' 레이블 요소에 입력한다`;
    }
  }
  
  // page.getByTestId('xxx')
  const testIdMatch = selector.match(/page\.getByTestId\(['"]([^'"]+)['"]\)/);
  if (testIdMatch) {
    const testId = testIdMatch[1];
    return `테스트ID '${testId}' ${action}`;
  }
  
  // page.locator('css-selector') - 간단한 경우
  const locatorMatch = selector.match(/^page\.locator\(['"]([^'"]+)['"]\)$/);
  if (locatorMatch) {
    const cssSelector = locatorMatch[1];
    if (action === 'click') {
      return `셀렉터(${cssSelector}) 클릭한다`;
    } else if (action === 'fill') {
      return `셀렉터(${cssSelector})에 입력한다`;
    }
    return `셀렉터(${cssSelector}) ${action}한다`;
  }
  
  // 복잡한 체이닝 (filter, nth 등)
  if (selector.includes('.filter(') || selector.includes('.nth(') || selector.includes('.locator(')) {
    const shortSelector = selector.length > 60 ? selector.substring(0, 60) + '...' : selector;
    return `복잡한 셀렉터: ${shortSelector}`;
  }
  
  // 파싱 실패 시 원본 반환
  return `${selector} (${action})`;
}

// Playwright 코드를 스프레드시트 형식으로 파싱
export async function parsePlaywrightCode(code, testCaseId, testTitle) {
  const lines = code.split('\n');
  const actions = [];
  const unparsedLines = []; // 파싱 실패한 라인들
  let stepNo = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // page.goto() 파싱
    if (line.includes('page.goto(')) {
      const urlMatch = line.match(/page\.goto\(['"`]([^'"`]+)['"`]\)/);
      if (urlMatch) {
        const url = urlMatch[1];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: selectorAndActionToDesc('', 'goto', url),
          data: url,
          assert: ''
        });
      }
    }
    
    // page.click() 파싱 (기존 방식)
    else if (line.includes('page.click(')) {
      const selectorMatch = line.match(/page\.click\(['"`]([^'"`]+)['"`]\)/);
      if (selectorMatch) {
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `셀렉터(${selectorMatch[1]}) 클릭한다`,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.locator().click() 파싱 (새로운 방식) - 단순한 locator만
    else if (line.includes('page.locator(') && line.includes('.click()') && !line.includes('.getByText(') && !line.includes('.filter(') && !line.includes('.nth(')) {
      const locatorMatch = line.match(/page\.locator\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (locatorMatch) {
        const selector = `page.locator('${locatorMatch[1]}')`;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: selectorAndActionToDesc(selector, 'click'),
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByRole().click() 파싱 - SELECTOR, ACTION 분리 (name + exact 옵션)
    else if (line.includes('page.getByRole(') && line.includes('.click()') && line.includes('name:') && line.includes('exact:') && !line.includes('.getByText(') && !line.includes('.filter(')) {
      const roleExactMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*,\s*exact:\s*(true|false)\s*\}\)\.click\(\)/);
      if (roleExactMatch) {
        const selector = `page.getByRole('${roleExactMatch[1]}', { name: '${roleExactMatch[2]}', exact: ${roleExactMatch[3]} })`;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: selectorAndActionToDesc(`page.getByRole('${roleExactMatch[1]}', { name: '${roleExactMatch[2]}' })`, 'click'),
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByRole().nth().click() 파싱 - name 옵션 + nth
    else if (line.includes('page.getByRole(') && line.includes('.nth(') && line.includes('.click()') && line.includes('name:')) {
      const roleNthMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.nth\((\d+)\)\.click\(\)/);
      if (roleNthMatch) {
        const role = roleNthMatch[1];
        const name = roleNthMatch[2];
        const nth = parseInt(roleNthMatch[3]) + 1; // 0-based → 1-based
        
        const roleKr = role === 'button' ? '버튼' : 
                       role === 'link' ? '링크' : 
                       role === 'menu' ? '메뉴' : 
                       role === 'tab' ? '탭' : role;
        
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${name}' ${roleKr} ${nth}번째 클릭한다`,
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByRole().click() 파싱 - SELECTOR, ACTION 분리 (name 옵션만)
    else if (line.includes('page.getByRole(') && line.includes('.click()') && line.includes('name:') && !line.includes('exact:') && !line.includes('.getByText(') && !line.includes('.filter(') && !line.includes('.nth(')) {
      const roleMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.click\(\)/);
      if (roleMatch) {
        const selector = `page.getByRole('${roleMatch[1]}', { name: '${roleMatch[2]}' })`;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: selectorAndActionToDesc(selector, 'click'),
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByText().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByText(') && line.includes('.click()')) {
      const textMatch = line.match(/page\.getByText\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (textMatch) {
        const selector = `page.getByText('${textMatch[1]}')`;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: selectorAndActionToDesc(selector, 'click'),
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByRole().filter().click() 파싱 - 전체 코드 유지 (name 옵션이 있고 locator가 없는 경우만)
    else if (line.includes('page.getByRole(') && line.includes('.filter(') && line.includes('.click()') && line.includes('name:') && !line.includes('.locator(')) {
      const filterMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.filter\(\{\s*hasText:\s*['"`]([^'"`]*)['"`]\s*\}\)\.click\(\)/);
      if (filterMatch) {
        const roleKr = filterMatch[1] === 'button' ? '버튼' : filterMatch[1] === 'link' ? '링크' : filterMatch[1];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${filterMatch[2]}' ${roleKr}에서 '${filterMatch[3]}' 포함된 항목 클릭한다`,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByRole().getByText().nth().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByRole(') && line.includes('.getByText(') && line.includes('.nth(') && line.includes('.click()')) {
      const roleTextNthMatch = line.match(/page\.getByRole\('([^']+)'\)\.getByText\('([^']+)'\)\.nth\((\d+)\)\.click\(\)/);
      if (roleTextNthMatch) {
        const roleKr = roleTextNthMatch[1] === 'menu' ? '메뉴' : 
                       roleTextNthMatch[1] === 'button' ? '버튼' : 
                       roleTextNthMatch[1] === 'link' ? '링크' : roleTextNthMatch[1];
        const nth = parseInt(roleTextNthMatch[3]) + 1; // 0-based → 1-based
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `${roleKr}에서 '${roleTextNthMatch[2]}' ${nth}번째 클릭한다`,
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByRole().getByText().click() 파싱 - SELECTOR, ACTION 분리 (새로운 정규식)
    else if (line.includes('page.getByRole(') && line.includes('.getByText(') && line.includes('.click()') && !line.includes('.nth(')) {
      // await 키워드 선택적 허용
      const roleTextMatch = line.match(/(?:await\s+)?page\.getByRole\('([^']+)'\)\.getByText\('([^']+)'\)\.click\(\)/);
      if (roleTextMatch) {
        const roleKr = roleTextMatch[1] === 'menu' ? '메뉴' : 
                       roleTextMatch[1] === 'button' ? '버튼' : 
                       roleTextMatch[1] === 'link' ? '링크' : 
                       roleTextMatch[1] === 'tabpanel' ? '탭패널' : roleTextMatch[1];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `${roleKr}에서 '${roleTextMatch[2]}' 클릭한다`,
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByRole().filter().locator().click() 파싱 (name 옵션 없음) - SELECTOR, ACTION 분리
    else if (line.includes('page.getByRole(') && line.includes('.filter(') && line.includes('.locator(') && line.includes('.click()')) {
      // await 키워드 선택적 허용, 정규식 리터럴(/^...$/) 및 문자열 모두 지원
      const complexMatch2 = line.match(/(?:await\s+)?page\.getByRole\('([^']+)'\)\.filter\(\{\s*hasText:\s*([^}]+)\s*\}\)\.locator\('([^']+)'\)\.click\(\)/);
      if (complexMatch2) {
        const roleKr = complexMatch2[1] === 'row' ? '행' : 
                       complexMatch2[1] === 'cell' ? '셀' : 
                       complexMatch2[1] === 'listitem' ? '리스트항목' : complexMatch2[1];
        // 정규식 리터럴(/^...$/)을 문자열로 변환
        let hasText = complexMatch2[2].trim();
        if (hasText.startsWith('/') && hasText.endsWith('/')) {
          // 정규식 리터럴을 문자열로 변환 (^와 $ 제거)
          hasText = hasText.slice(1, -1).replace(/^\^/, '').replace(/\$$/, '');
        }
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `${roleKr}에서 '${hasText}' 포함된 '${complexMatch2[3]}' 클릭한다`,
          data: '',
          assert: ''
        });
      }
    }
    
    // page.locator().getByText().nth().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.locator(') && line.includes('.getByText(') && line.includes('.nth(') && line.includes('.click()')) {
      const locatorTextNthMatch = line.match(/page\.locator\(['"`]([^'"`]+)['"`]\)\.getByText\(['"`]([^'"`]*)['"`]\)\.nth\((\d+)\)\.click\(\)/);
      if (locatorTextNthMatch) {
        const nth = parseInt(locatorTextNthMatch[3]) + 1;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${locatorTextNthMatch[1]}' 내 '${locatorTextNthMatch[2]}' ${nth}번째 클릭한다`,
          data: '',
          assert: ''
        });
      }
    }
    
    // page.locator().filter().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.locator(') && line.includes('.filter(') && line.includes('.click()')) {
      const locatorFilterMatch = line.match(/page\.locator\(['"`]([^'"`]+)['"`]\)\.filter\(\{\s*hasText:\s*([^}]+)\s*\}\)\.click\(\)/);
      if (locatorFilterMatch) {
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${locatorFilterMatch[1]}'에서 ${locatorFilterMatch[2]} 포함된 항목 클릭한다`,
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByRole().filter().locator().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByRole(') && line.includes('.filter(') && line.includes('.locator(') && line.includes('.click()')) {
      // 정규식 패턴을 더 유연하게 수정 (정규식 리터럴 포함)
      const complexMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.filter\(\{\s*hasText:\s*([^}]+)\s*\}\)\.locator\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (complexMatch) {
        const roleKr = complexMatch[1] === 'row' ? '행' : complexMatch[1];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${complexMatch[2]}' ${roleKr}에서 ${complexMatch[3]} 포함된 '${complexMatch[4]}' 클릭한다`,
          data: '',
          assert: ''
        });
      }
    }
    
    // page.getByRole().filter().locator().click() 파싱 (name 옵션 없음) - 중복 제거
    
    // page.getByRole().filter().click() 파싱 (button filter) - 원본 코드 유지
    else if (line.includes('page.getByRole(') && line.includes('.filter(') && line.includes('.click()')) {
      const buttonFilterMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`]\)\.filter\(\{\s*hasText:\s*['"`]([^'"`]*)['"`]\s*\}\)\.click\(\)/);
      if (buttonFilterMatch) {
        const roleKr = buttonFilterMatch[1] === 'button' ? '버튼' : buttonFilterMatch[1] === 'link' ? '링크' : buttonFilterMatch[1];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${buttonFilterMatch[2]}' 포함된 ${roleKr} 클릭한다`,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByText('text', { exact: true }).nth(N).click() 파싱
    else if (line.includes('page.getByText(') && line.includes('exact: true') && line.includes('.nth(') && line.includes('.click()')) {
      const exactTextNthMatch = line.match(/page\.getByText\(['"`]([^'"`]+)['"`],\s*\{\s*exact:\s*true\s*\}\)\.nth\((\d+)\)\.click\(\)/);
      if (exactTextNthMatch) {
        const text = exactTextNthMatch[1];
        const nth = parseInt(exactTextNthMatch[2]) + 1; // 0-based → 1-based
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${text}' 텍스트 ${nth}번째 클릭한다`,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByText('text', { exact: true }).click() 파싱 (exact match, nth 없음)
    else if (line.includes('page.getByText(') && line.includes('exact: true') && line.includes('.click()') && !line.includes('.nth(')) {
      const exactTextMatch = line.match(/page\.getByText\(['"`]([^'"`]+)['"`],\s*\{\s*exact:\s*true\s*\}\)\.click\(\)/);
      if (exactTextMatch) {
        const text = exactTextMatch[1];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${text}' 텍스트 클릭한다 (정확히 일치)`,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByText().click() 파싱 (단순 텍스트)
    else if (line.includes('page.getByText(') && line.includes('.click()')) {
      const simpleTextMatch = line.match(/page\.getByText\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (simpleTextMatch) {
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${simpleTextMatch[1]}' 텍스트 클릭한다`,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.fill() 파싱 (기존 방식)
    else if (line.includes('page.fill(')) {
      const fillMatch = line.match(/page\.fill\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]*)['"`]\)/);
      if (fillMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: fillMatch[1],
          action: 'fill',
          data: fillMatch[2],
          assert: 'visible'
        });
      }
    }
    
    // page.locator().fill() 파싱
    else if (line.includes('page.locator(') && line.includes('.fill(')) {
      const locatorFillMatch = line.match(/page\.locator\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/);
      if (locatorFillMatch) {
        const selector = locatorFillMatch[1];
        const value = locatorFillMatch[2];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: value ? `셀렉터(${selector})에 '${value}' 입력한다` : `셀렉터(${selector})에 입력한다`,
          selector: selector,
          action: 'fill',
          data: value,
          assert: 'visible'
        });
      }
    }
    
    // page.getByRole().fill() 파싱 - SELECTOR, ACTION, DATA 분리
    else if (line.includes('page.getByRole(') && line.includes('.fill(')) {
      const roleFillMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.fill\(['"`]([^'"`]*)['"`]\)/);
      if (roleFillMatch) {
        const selector = `page.getByRole('${roleFillMatch[1]}', { name: '${roleFillMatch[2]}' })`;
        const data = roleFillMatch[3];
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: selectorAndActionToDesc(selector, 'fill', data),
          data: data,
          assert: ''
        });
      }
    }
    
    // page.getByText().fill() 파싱 - SELECTOR, ACTION, DATA 분리
    else if (line.includes('page.getByText(') && line.includes('.fill(')) {
      const textFillMatch = line.match(/page\.getByText\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/);
      if (textFillMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByText('${textFillMatch[1]}')`,
          action: 'fill',
          data: textFillMatch[2],
          assert: ''
        });
      }
    }
    
    // page.getByRole('row', { name: '...' }).getByLabel('', { exact: true }).check() 파싱
    else if (line.includes('page.getByRole(') && line.includes('row') && line.includes('.getByLabel(') && line.includes('.check()')) {
      const rowCheckMatch = line.match(/page\.getByRole\(['"`]row['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.getByLabel\(['"`]([^'"`]*)['"`](?:,\s*\{\s*exact:\s*true\s*\})?\)\.check\(\)/);
      if (rowCheckMatch) {
        const rowName = rowCheckMatch[1];
        const label = rowCheckMatch[2];
        const actionDesc = `'${rowName}' 행의 체크박스 선택`;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: actionDesc,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByRole('checkbox', { name: '...' }).check() 파싱
    else if (line.includes('page.getByRole(') && line.includes('checkbox') && line.includes('.check()')) {
      const checkboxMatch = line.match(/page\.getByRole\(['"`]checkbox['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.check\(\)/);
      if (checkboxMatch) {
        const checkboxName = checkboxMatch[1];
        const actionDesc = `'${checkboxName}' 체크박스 선택`;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: actionDesc,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByLabel('', { exact: true }).check() 파싱
    else if (line.includes('page.getByLabel(') && line.includes('exact: true') && line.includes('.check()')) {
      const labelCheckMatch = line.match(/page\.getByLabel\(['"`]([^'"`]*)['"`],\s*\{\s*exact:\s*true\s*\}\)\.check\(\)/);
      if (labelCheckMatch) {
        const label = labelCheckMatch[1];
        const actionDesc = label ? `'${label}' 레이블 체크박스 선택` : '체크박스 선택';
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: actionDesc,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByLabel('', { exact: true }).uncheck() 파싱
    else if (line.includes('page.getByLabel(') && line.includes('exact: true') && line.includes('.uncheck()')) {
      const labelUncheckMatch = line.match(/page\.getByLabel\(['"`]([^'"`]*)['"`],\s*\{\s*exact:\s*true\s*\}\)\.uncheck\(\)/);
      if (labelUncheckMatch) {
        const label = labelUncheckMatch[1];
        const actionDesc = label ? `'${label}' 레이블 체크박스 해제` : '체크박스 해제';
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: actionDesc,
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.press() 파싱
    else if (line.includes('page.press(')) {
      const pressMatch = line.match(/page\.press\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]*)['"`]\)/);
      if (pressMatch) {
        const selector = pressMatch[1];
        const key = pressMatch[2];
        // selector가 Playwright locator인지 확인 (page.getByRole 등)
        if (selector.includes('page.')) {
          // selector가 이미 Playwright locator인 경우
          actions.push({
            caseId: testCaseId,
            title: testTitle,
            stepNo: stepNo++,
            actionDesc: `셀렉터(${selector})에 ${key} 키 입력한다`,
            selector: selector,
            action: 'press',
            data: key,
            assert: ''
          });
        } else {
          // selector가 CSS 셀렉터인 경우
          actions.push({
            caseId: testCaseId,
            title: testTitle,
            stepNo: stepNo++,
            actionDesc: `셀렉터(${selector})에 ${key} 키 입력한다`,
            selector: selector,
            action: 'press',
            data: key,
            assert: 'visible'
          });
        }
      }
    }
    
    // page.getByRole().press() 파싱 - SELECTOR, ACTION, DATA 분리
    else if (line.includes('page.getByRole(') && line.includes('.press(')) {
      const rolePressMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.press\(['"`]([^'"`]*)['"`]\)/);
      if (rolePressMatch) {
        const role = rolePressMatch[1];
        const name = rolePressMatch[2];
        const key = rolePressMatch[3];
        const roleMap = {
          'textbox': '텍스트박스',
          'button': '버튼',
          'link': '링크',
          'heading': '제목',
          'checkbox': '체크박스',
          'radio': '라디오버튼',
          'combobox': '선택박스',
          'tab': '탭',
          'dialog': '다이얼로그',
          'alert': '알림'
        };
        const roleKr = roleMap[role] || role;
        const selector = `page.getByRole('${role}', { name: '${name}' })`;
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `'${name}' ${roleKr}에 ${key} 키 입력한다`,
          selector: selector,
          action: 'press',
          data: key,
          assert: ''
        });
      }
    }
    
    // page.hover() 파싱
    else if (line.includes('page.hover(')) {
      const hoverMatch = line.match(/page\.hover\(['"`]([^'"`]+)['"`]\)/);
      if (hoverMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: hoverMatch[1],
          action: 'hover',
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.waitForSelector() 파싱
    else if (line.includes('page.waitForSelector(')) {
      const waitMatch = line.match(/page\.waitForSelector\(['"`]([^'"`]+)['"`]\)/);
      if (waitMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: waitMatch[1],
          action: 'waitFor',
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.waitForTimeout() 파싱
    else if (line.includes('page.waitForTimeout(')) {
      const timeoutMatch = line.match(/page\.waitForTimeout\((\d+)\)/);
      if (timeoutMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: '',
          action: 'waitFor',
          data: timeoutMatch[1],
          assert: '',
          timeoutMs: timeoutMatch[1],
          remarks: '비고'
        });
      }
    }
    
    // expect().toBeVisible() 파싱
    else if (line.includes('expect(') && line.includes('.toBeVisible()')) {
      // 더 정확한 정규식으로 중첩된 괄호 처리 (exact: true 옵션 포함)
      const expectMatch = line.match(/expect\(([^)]+(?:\([^)]*\))*[^)]*)\)\.toBeVisible\(\)/);
      if (expectMatch) {
        const selector = expectMatch[1].trim();
        
        // selector에서 텍스트 추출 시도
        let actionDesc = '';
        const getByTextMatch = selector.match(/getByText\(['"`]([^'"`]+)['"`]\)/);
        const getByRoleMatch = selector.match(/getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]+)['"`]/);
        const getByPlaceholderMatch = selector.match(/getByPlaceholder\(['"`]([^'"`]+)['"`]\)/);
        const getByLabelMatch = selector.match(/getByLabel\(['"`]([^'"`]+)['"`]\)/);
        
        if (getByTextMatch) {
          actionDesc = `'${getByTextMatch[1]}' 텍스트 표시 확인`;
        } else if (getByRoleMatch) {
          const roleMap = {
            'button': '버튼',
            'link': '링크',
            'textbox': '텍스트박스',
            'heading': '제목',
            'dialog': '다이얼로그'
          };
          const roleKr = roleMap[getByRoleMatch[1]] || getByRoleMatch[1];
          actionDesc = `'${getByRoleMatch[2]}' ${roleKr} 표시 확인`;
        } else if (getByPlaceholderMatch) {
          actionDesc = `'${getByPlaceholderMatch[1]}' 플레이스홀더 요소 표시 확인`;
        } else if (getByLabelMatch) {
          actionDesc = `'${getByLabelMatch[1]}' 레이블 요소 표시 확인`;
        } else {
          // 복잡한 selector는 간단히 표현
          actionDesc = `요소 표시 확인`;
        }
        
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: actionDesc,
          selector: selector,
          action: 'expect',
          data: 'toBeVisible',
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // expect().toHaveURL() 파싱
    else if (line.includes('expect(') && line.includes('.toHaveURL(')) {
      // 더 정확한 정규식으로 중첩된 괄호 처리
      const expectUrlMatch = line.match(/expect\(([^)]+(?:\([^)]*\))*[^)]*)\)\.toHaveURL\(([^)]+)\)/);
      if (expectUrlMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: expectUrlMatch[1].trim(),
          action: 'expect',
          data: 'toHaveURL',
          assert: expectUrlMatch[2].trim(),
          timeoutMs: '1000',
          remarks: '비고'
        });
      }
    }
    
    // page.locator().waitFor() 파싱
    else if (line.includes('page.locator(') && line.includes('.waitFor(')) {
      const locatorWaitMatch = line.match(/page\.locator\(['"`]([^'"`]+)['"`]\)\.waitFor\(\)/);
      if (locatorWaitMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: locatorWaitMatch[1],
          action: 'waitFor',
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByRole().waitFor() 파싱
    else if (line.includes('page.getByRole(') && line.includes('.waitFor(')) {
      const roleWaitMatch = line.match(/page\.getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)\.waitFor\(\)/);
      if (roleWaitMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `[role="${roleWaitMatch[1]}"][name="${roleWaitMatch[2]}"]`,
          action: 'waitFor',
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByText().waitFor() 파싱
    else if (line.includes('page.getByText(') && line.includes('.waitFor(')) {
      const textWaitMatch = line.match(/page\.getByText\(['"`]([^'"`]+)['"`]\)\.waitFor\(\)/);
      if (textWaitMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `text="${textWaitMatch[1]}"`,
          action: 'waitFor',
          data: '',
          assert: 'visible'
        });
      }
    }
    
    // page.getByTitle().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByTitle(') && line.includes('.click()') && !line.includes('.locator(')) {
      const titleMatch = line.match(/page\.getByTitle\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (titleMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByTitle('${titleMatch[1]}')`,
          action: 'click',
          data: '',
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByTitle().locator().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByTitle(') && line.includes('.locator(') && line.includes('.click()')) {
      const titleLocatorMatch = line.match(/page\.getByTitle\(['"`]([^'"`]+)['"`]\)\.locator\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (titleLocatorMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByTitle('${titleLocatorMatch[1]}').locator('${titleLocatorMatch[2]}')`,
          action: 'click',
          data: '',
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByTitle().fill() 파싱 - SELECTOR, ACTION, DATA 분리
    else if (line.includes('page.getByTitle(') && line.includes('.fill(')) {
      const titleFillMatch = line.match(/page\.getByTitle\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/);
      if (titleFillMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByTitle('${titleFillMatch[1]}')`,
          action: 'fill',
          data: titleFillMatch[2],
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByTitle().waitFor() 파싱
    else if (line.includes('page.getByTitle(') && line.includes('.waitFor(')) {
      const titleWaitMatch = line.match(/page\.getByTitle\(['"`]([^'"`]+)['"`]\)\.waitFor\(\)/);
      if (titleWaitMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByTitle('${titleWaitMatch[1]}')`,
          action: 'waitFor',
          data: '',
          assert: 'visible',
          timeoutMs: '1000',
          remarks: '비고'
        });
      }
    }
    
    // page.getByPlaceholder().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByPlaceholder(') && line.includes('.click()') && !line.includes('.locator(')) {
      const placeholderMatch = line.match(/page\.getByPlaceholder\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (placeholderMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByPlaceholder('${placeholderMatch[1]}')`,
          action: 'click',
          data: '',
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByPlaceholder().fill() 파싱 - SELECTOR, ACTION, DATA 분리
    else if (line.includes('page.getByPlaceholder(') && line.includes('.fill(')) {
      const placeholderFillMatch = line.match(/page\.getByPlaceholder\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/);
      if (placeholderFillMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByPlaceholder('${placeholderFillMatch[1]}')`,
          action: 'fill',
          data: placeholderFillMatch[2],
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByLabel().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByLabel(') && line.includes('.click()') && !line.includes('.locator(')) {
      const labelMatch = line.match(/page\.getByLabel\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (labelMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByLabel('${labelMatch[1]}')`,
          action: 'click',
          data: '',
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByLabel().fill() 파싱 - SELECTOR, ACTION, DATA 분리
    else if (line.includes('page.getByLabel(') && line.includes('.fill(')) {
      const labelFillMatch = line.match(/page\.getByLabel\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/);
      if (labelFillMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByLabel('${labelFillMatch[1]}')`,
          action: 'fill',
          data: labelFillMatch[2],
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByTestId().click() 파싱 - SELECTOR, ACTION 분리
    else if (line.includes('page.getByTestId(') && line.includes('.click()') && !line.includes('.locator(')) {
      const testIdMatch = line.match(/page\.getByTestId\(['"`]([^'"`]+)['"`]\)\.click\(\)/);
      if (testIdMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByTestId('${testIdMatch[1]}')`,
          action: 'click',
          data: '',
          assert: '',
          remarks: '비고'
        });
      }
    }
    
    // page.getByTestId().fill() 파싱 - SELECTOR, ACTION, DATA 분리
    else if (line.includes('page.getByTestId(') && line.includes('.fill(')) {
      const testIdFillMatch = line.match(/page\.getByTestId\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/);
      if (testIdFillMatch) {
        actions.push({
          enabled: 'TRUE',
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          selector: `page.getByTestId('${testIdFillMatch[1]}')`,
          action: 'fill',
          data: testIdFillMatch[2],
          assert: '',
          remarks: '비고'
        });
      }
    }
    // 🤖 MCP: 파싱되지 않은 라인 (await 포함하고 주석/공백/import 아님)
    else if (line.includes('await page.') && !line.startsWith('//') && !line.startsWith('import')) {
      console.log(`⚠️ 파싱 실패한 라인: ${line}`);
      unparsedLines.push({ line, lineNumber: i + 1 });
    }
  }
  
  // ====== AI Converter로 파싱 실패한 라인 변환 (선택적) ======
  if (unparsedLines.length > 0 && aiConverter) {
    try {
      // AI Converter 활성화 메시지 (처음 사용 시에만)
      if (aiConverterLoadAttempted) {
        console.log('\n✅ AI Converter 활성화됨');
        aiConverterLoadAttempted = false; // 한 번만 출력
      }
      console.log(`\n🤖 AI Converter로 ${unparsedLines.length}개 라인 변환 중...`);
      
      const converted = await aiConverter.convertWithAI(unparsedLines, {
        testCaseId,
        testTitle
      });
      
      // stepNo 조정
      converted.forEach(item => {
        item.caseId = testCaseId;
        item.title = testTitle;
        item.stepNo = stepNo++;
      });
      
      actions.push(...converted);
      
    } catch (error) {
      console.error('❌ AI Converter 실행 실패:', error.message);
      console.warn('⚠️ TODO로 저장합니다.');
      
      // Fallback: TODO로 저장
      unparsedLines.forEach(({ line, lineNumber }) => {
        actions.push({
          caseId: testCaseId,
          title: testTitle,
          stepNo: stepNo++,
          actionDesc: `// TODO: 수동 변환 필요 - ${line}`,
          data: '',
          variable: '',
          assert: ''
        });
      });
    }
  } else if (unparsedLines.length > 0) {
    console.log(`\n⚠️ ${unparsedLines.length}개 라인 파싱 실패 (AI Converter 비활성화)`);
    
    // TODO로 저장
    unparsedLines.forEach(({ line, lineNumber }) => {
      console.log(`  라인 ${lineNumber}: ${line}`);
      actions.push({
        caseId: testCaseId,
        title: testTitle,
        stepNo: stepNo++,
        actionDesc: `// TODO: 수동 변환 필요 - ${line}`,
        data: '',
        variable: '',
        assert: ''
      });
    });
  }
  
  return actions;
}

// Google Sheets에 데이터 추가
async function addDataToSheets(actions, sheetRange) {
  try {
    console.log('📊 Google Sheets에 데이터 추가 중...');
    console.log(`📊 대상 시트: ${sheetRange}`);
    
    const sheets = createSheetsClient();
    
    // 기존 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: sheetRange,
    });
    
    const existingData = response.data.values || [];
    console.log(`📊 기존 데이터: ${existingData.length}개 행`);
    
    // 새 데이터를 2차원 배열로 변환 (VARIABLE 컬럼 추가)
    const newRows = actions.map(action => [
      action.caseId,
      action.title,
      action.stepNo,
      action.actionDesc,
      action.data,
      action.variable || '',  // VARIABLE 컬럼 (기본값: 빈 문자열)
      action.assert
    ]);
    
    // 기존 데이터와 새 데이터 합치기
    const allData = [...existingData, ...newRows];
    
    // Google Sheets에 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: sheetRange,
      valueInputOption: 'RAW',
      resource: {
        values: allData
      }
    });
    
    console.log(`✅ Google Sheets에 ${newRows.length}개 행이 추가되었습니다.`);
    console.log(`📊 총 데이터: ${allData.length}개 행`);
    
    return true;
  } catch (error) {
    console.error('❌ Google Sheets 데이터 추가 실패:', error.message);
    throw error;
  }
}

// 메인 함수: codegen 실행 후 스프레드시트에 추가
export async function codegenToSheets(url, testCaseId, testTitle, code = null, platform = null) {
  try {
    const detectedPlatform = platform || detectPlatform(url);
    const sheetRange = getSheetRange(url, detectedPlatform);
    
    console.log('🚀 Playwright Codegen to Google Sheets 시작');
    console.log(`🎯 플랫폼: ${detectedPlatform.toUpperCase()}`);
    console.log(`📊 시트 범위: ${sheetRange}`);
    console.log(`📋 테스트 케이스 ID: ${testCaseId}`);
    console.log(`📋 테스트 제목: ${testTitle}`);
    
    let playwrightCode = code;
    
    // 코드가 제공되지 않은 경우 codegen 실행
    if (!playwrightCode) {
      const tempFile = join(__dirname, `temp-codegen-${Date.now()}.js`);
      
      try {
        // 1. Playwright codegen 실행
        await runPlaywrightCodegen(url, tempFile);
        
        // 2. 생성된 코드 읽기
        if (!fs.existsSync(tempFile)) {
          throw new Error('생성된 코드 파일을 찾을 수 없습니다.');
        }
        
        playwrightCode = fs.readFileSync(tempFile, 'utf8');
        console.log('✅ Playwright 코드 생성 완료');
        
      } finally {
        // 임시 파일 정리
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log('🧹 임시 파일 정리 완료');
        }
      }
    } else {
      console.log('✅ 제공된 Playwright 코드 사용');
    }
    
    // 3. 코드를 스프레드시트 형식으로 파싱
    const actions = await parsePlaywrightCode(playwrightCode, testCaseId, testTitle);
    console.log(`✅ ${actions.length}개 액션 파싱 완료`);
    
    // 4. Google Sheets에 데이터 추가
    await addDataToSheets(actions, sheetRange);
    
    console.log('🎉 모든 작업이 완료되었습니다!');
    
    return {
      success: true,
      testCaseId,
      testTitle,
      actionCount: actions.length,
      actions
    };
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    throw error;
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].includes('codegen-to-sheets.js')) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('사용법:');
    console.log('  node codegen-to-sheets.js <URL> <케이스ID> <테스트제목>');
    console.log('');
    console.log('예시:');
    console.log('  node codegen-to-sheets.js "http://trombone.qa.okestro.cloud/" "TC001" "로그인 테스트"');
    process.exit(1);
  }
  
  const [url, testCaseId, testTitle] = args;
  
  codegenToSheets(url, testCaseId, testTitle)
    .then(result => {
      console.log('\n🎉 성공!');
      console.log(`📋 케이스 ID: ${result.testCaseId}`);
      console.log(`📋 제목: ${result.testTitle}`);
      console.log(`📋 액션 수: ${result.actionCount}개`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실패:', error.message);
      process.exit(1);
    });
}
