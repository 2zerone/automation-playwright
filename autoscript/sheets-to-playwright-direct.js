import { google } from 'googleapis';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { convertNaturalLanguageToPlaywright, checkMCPAvailability } from './playwright-mcp-helper.js';
import './config.js'; // API 키 자동 로드

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

// HTTPS 오류를 무시해야 하는 URL 감지 함수
function needsIgnoreHTTPSErrors(url) {
  if (!url) return false;
  
  // VIOLA, CONTRABASS, CMP에서 사용하는 URL 패턴들
  const httpsErrorUrls = [
    '305tst.console.bf.okestro.cloud',
    'cmp.okestro.cloud',
    'contrabass.okestro.cloud',
    'viola.okestro.cloud'
  ];
  
  return httpsErrorUrls.some(pattern => url.includes(pattern));
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
let mcpAvailable = false;
checkMCPAvailability().then(available => {
  mcpAvailable = available;
  if (available) {
    console.log('🤖 Playwright MCP 활성화됨');
  } else {
    console.log('⚠️ Playwright MCP 비활성화 - 파싱 실패 시 수동 처리 필요');
  }
});

// ACTION_DESC를 Playwright Selector와 Action으로 변환
async function descToSelectorAndAction(actionDesc) {
  let match; // 정규식 매칭 변수 선언
  
  // 페이지로 이동
  if (actionDesc === '페이지로 이동' || actionDesc.includes('페이지') && actionDesc.includes('이동')) {
    return { action: 'goto', selector: null };
  }
  
  // [role]에서 '[text]' N번째 클릭 패턴: "메뉴에서 '컴퓨트' 2번째 클릭" 또는 "메뉴에서 '컴퓨트' 2번째 클릭한다"
  match = actionDesc.match(/^(메뉴|버튼|링크|탭패널)에서\s*'([^']+)'\s*(\d+)번째\s*클릭한다?$/);
  if (match) {
    const [_, roleKr, text, nth] = match;
    const roleMap = { '메뉴': 'menu', '버튼': 'button', '링크': 'link', '탭패널': 'tabpanel' };
    const nthIndex = parseInt(nth) - 1; // 1-based → 0-based
    return {
      action: 'click',
      selector: `page.getByRole('${roleMap[roleKr]}').getByText('${text}').nth(${nthIndex})`
    };
  }
  
  // [role]에서 '[text]' 클릭 패턴: "메뉴에서 '컴퓨트' 클릭" 또는 "메뉴에서 '컴퓨트' 클릭한다"
  // 한글 role과 영문 role 모두 지원
  match = actionDesc.match(/^(메뉴|버튼|링크|탭패널|tabpanel|listitem|리스트항목)에서\s*'([^']+)'\s*클릭한다?$/);
  if (match) {
    const [_, roleKr, text] = match;
    const roleMap = { 
      '메뉴': 'menu', 
      '버튼': 'button', 
      '링크': 'link', 
      '탭패널': 'tabpanel',
      'tabpanel': 'tabpanel',
      'listitem': 'listitem',
      '리스트항목': 'listitem'
    };
    return {
      action: 'click',
      selector: `page.getByRole('${roleMap[roleKr]}').getByText('${text}')`
    };
  }
  
  // '[name]' [role] N번째 클릭
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|버튼|링크|제목|체크박스|라디오버튼|선택박스|탭|다이얼로그|알림|메뉴)\s*(\d+)번째\s*클릭한다?$/);
  if (match) {
    const [_, name, roleKr, nth] = match;
    const roleMap = {
      '텍스트박스': 'textbox',
      '버튼': 'button',
      '링크': 'link',
      '제목': 'heading',
      '체크박스': 'checkbox',
      '라디오버튼': 'radio',
      '선택박스': 'combobox',
      '탭': 'tab',
      '다이얼로그': 'dialog',
      '알림': 'alert',
      '메뉴': 'menu'
    };
    const nthIndex = parseInt(nth) - 1; // 1-based → 0-based
    return {
      action: 'click',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' }).nth(${nthIndex})`
    };
  }
  
  // '[name]' [role] 클릭
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|버튼|링크|제목|체크박스|라디오버튼|선택박스|탭|다이얼로그|알림|img|이미지)\s*클릭한다?$/);
  if (match) {
    const [_, name, roleKr] = match;
    const roleMap = {
      '텍스트박스': 'textbox',
      '버튼': 'button',
      '링크': 'link',
      '제목': 'heading',
      '체크박스': 'checkbox',
      '라디오버튼': 'radio',
      '선택박스': 'combobox',
      '탭': 'tab',
      '다이얼로그': 'dialog',
      '알림': 'alert',
      'img': 'img',
      '이미지': 'img'
    };
    return {
      action: 'click',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' })`
    };
  }
  
  // '[name]' [role]에 입력
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|입력필드)\s*에\s*입력한다?$/);
  if (match) {
    const [_, name] = match;
    return {
      action: 'fill',
      selector: `page.getByRole('textbox', { name: '${name}' })`
    };
  }
  
  // '[selector]' 내 '[text]' N번째 클릭 패턴
  match = actionDesc.match(/^'([^']+)'\s*내\s*'([^']+)'\s*(\d+)번째\s*클릭한다?$/);
  if (match) {
    const [_, selector, text, nth] = match;
    const nthIndex = parseInt(nth) - 1;
    return {
      action: 'click',
      selector: `page.locator('${selector}').getByText('${text}').nth(${nthIndex})`
    };
  }
  
  // '[selector]'에서 ... 포함된 항목 클릭
  match = actionDesc.match(/^'([^']+)'에서\s*(.+)\s*포함된\s*항목\s*클릭한다?$/);
  if (match) {
    const [_, selector, hasText] = match;
    return {
      action: 'click',
      selector: `page.locator('${selector}').filter({ hasText: ${hasText} })`
    };
  }
  
  // '[text]' 포함된 [role] 클릭
  match = actionDesc.match(/^'([^']+)'\s*포함된\s*(버튼|링크)\s*클릭한다?$/);
  if (match) {
    const [_, text, roleKr] = match;
    const roleMap = { '버튼': 'button', '링크': 'link' };
    return {
      action: 'click',
      selector: `page.getByRole('${roleMap[roleKr]}').filter({ hasText: '${text}' })`
    };
  }
  
  // '[text]' 텍스트 N번째 클릭 (exact match)
  match = actionDesc.match(/^'([^']+)'\s*텍스트\s*(\d+)번째\s*클릭한다?$/);
  if (match) {
    const text = match[1];
    const nth = parseInt(match[2]) - 1; // 1-based → 0-based
    return {
      action: 'click',
      selector: `page.getByText('${text}', { exact: true }).nth(${nth})`
    };
  }
  
  // '[text]' 텍스트 클릭 (정확히 일치) - exact: true 옵션
  match = actionDesc.match(/^'([^']+)'\s*텍스트\s*클릭한다?\s*\(정확히\s*일치\)$/);
  if (match) {
    return {
      action: 'click',
      selector: `page.getByText('${match[1]}', { exact: true })`
    };
  }
  
  // '[text]' 텍스트 클릭
  match = actionDesc.match(/^'([^']+)'\s*텍스트\s*클릭한다?$/);
  if (match) {
    return {
      action: 'click',
      selector: `page.getByText('${match[1]}')`
    };
  }
  
  // '[text]' 텍스트에 입력
  match = actionDesc.match(/^'([^']+)'\s*텍스트에\s*입력한다?$/);
  if (match) {
    return {
      action: 'fill',
      selector: `page.getByText('${match[1]}')`
    };
  }
  
  // '[rowName]' 행의 체크박스 선택
  match = actionDesc.match(/^'([^']+)'\s*행의\s*체크박스\s*선택한다?$/);
  if (match) {
    return {
      action: 'check',
      selector: `page.getByRole('row', { name: '${match[1]}' }).getByLabel('', { exact: true })`
    };
  }
  
  // '[label]' 레이블 체크박스 선택 (더 긴 패턴이 먼저)
  match = actionDesc.match(/^'([^']+)'\s*레이블\s*체크박스\s*선택한다?$/);
  if (match) {
    return {
      action: 'check',
      selector: `page.getByLabel('${match[1]}', { exact: true })`
    };
  }
  
  // '[checkboxName]' 체크박스 선택
  match = actionDesc.match(/^'([^']+)'\s*체크박스\s*선택한다?$/);
  if (match) {
    return {
      action: 'check',
      selector: `page.getByRole('checkbox', { name: '${match[1]}' })`
    };
  }
  
  // 체크박스 선택 (레이블 없음)
  match = actionDesc.match(/^체크박스\s*선택한다?$/);
  if (match) {
    return {
      action: 'check',
      selector: `page.getByLabel('', { exact: true })`
    };
  }
  
  // '[label]' 레이블 체크박스 해제
  match = actionDesc.match(/^'([^']+)'\s*레이블\s*체크박스\s*해제한다?$/);
  if (match) {
    return {
      action: 'uncheck',
      selector: `page.getByLabel('${match[1]}', { exact: true })`
    };
  }
  
  // 체크박스 해제 (레이블 없음)
  match = actionDesc.match(/^체크박스\s*해제한다?$/);
  if (match) {
    return {
      action: 'uncheck',
      selector: `page.getByLabel('', { exact: true })`
    };
  }
  
  // '[name]' [role] 호버
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|버튼|링크|제목|체크박스|라디오버튼|선택박스|탭|다이얼로그|알림)\s*호버한다?$/);
  if (match) {
    const [_, name, roleKr] = match;
    const roleMap = {
      '텍스트박스': 'textbox',
      '버튼': 'button',
      '링크': 'link',
      '제목': 'heading',
      '체크박스': 'checkbox',
      '라디오버튼': 'radio',
      '선택박스': 'combobox',
      '탭': 'tab',
      '다이얼로그': 'dialog',
      '알림': 'alert'
    };
    return {
      action: 'hover',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' })`
    };
  }
  
  // '[name]' [role] 더블 클릭
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|버튼|링크|제목|체크박스|라디오버튼|선택박스|탭|다이얼로그|알림)\s*더블\s*클릭한다?$/);
  if (match) {
    const [_, name, roleKr] = match;
    const roleMap = {
      '텍스트박스': 'textbox',
      '버튼': 'button',
      '링크': 'link',
      '제목': 'heading',
      '체크박스': 'checkbox',
      '라디오버튼': 'radio',
      '선택박스': 'combobox',
      '탭': 'tab',
      '다이얼로그': 'dialog',
      '알림': 'alert'
    };
    return {
      action: 'dblclick',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' })`
    };
  }
  
  // '[name]' [role]에 키 입력
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|버튼|링크)\s*에\s*키\s*입력한다?$/);
  if (match) {
    const [_, name, roleKr] = match;
    const roleMap = { '텍스트박스': 'textbox', '버튼': 'button', '링크': 'link' };
    return {
      action: 'press',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' })`
    };
  }
  
  // '[name]' [role] 대기
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|버튼|링크|제목|체크박스|라디오버튼|선택박스|탭|다이얼로그|알림)\s*대기한다?$/);
  if (match) {
    const [_, name, roleKr] = match;
    const roleMap = {
      '텍스트박스': 'textbox',
      '버튼': 'button',
      '링크': 'link',
      '제목': 'heading',
      '체크박스': 'checkbox',
      '라디오버튼': 'radio',
      '선택박스': 'combobox',
      '탭': 'tab',
      '다이얼로그': 'dialog',
      '알림': 'alert'
    };
    return {
      action: 'waitFor',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' })`
    };
  }
  
  // '[title]' 타이틀 요소 클릭
  match = actionDesc.match(/^'([^']+)'\s*타이틀\s*요소\s*클릭한다?$/);
  if (match) {
    return {
      action: 'click',
      selector: `page.getByTitle('${match[1]}')`
    };
  }
  
  // '[title]' 타이틀 요소에 입력
  match = actionDesc.match(/^'([^']+)'\s*타이틀\s*요소에\s*입력한다?$/);
  if (match) {
    return {
      action: 'fill',
      selector: `page.getByTitle('${match[1]}')`
    };
  }
  
  // '[placeholder]' 플레이스홀더 요소 클릭/입력
  match = actionDesc.match(/^'([^']+)'\s*플레이스홀더\s*요소\s*(클릭한다?|에\s*입력한다?)$/);
  if (match) {
    const action = match[2].includes('입력') ? 'fill' : 'click';
    return {
      action: action,
      selector: `page.getByPlaceholder('${match[1]}')`
    };
  }
  
  // '[label]' 레이블 요소 클릭/입력
  match = actionDesc.match(/^'([^']+)'\s*레이블\s*요소\s*(클릭한다?|에\s*입력한다?)$/);
  if (match) {
    const action = match[2].includes('입력') ? 'fill' : 'click';
    return {
      action: action,
      selector: `page.getByLabel('${match[1]}')`
    };
  }
  
  // 테스트ID '[testId]' [action]
  match = actionDesc.match(/^테스트ID\s*'([^']+)'\s*(클릭한다?|입력한다?|호버한다?|대기한다?|더블\s*클릭한다?)$/);
  if (match) {
    const [_, testId, actionKr] = match;
    // "한다" 제거하여 매핑
    const actionKrClean = actionKr.replace(/한다$/, '');
    const actionMap = {
      '클릭': 'click',
      '입력': 'fill',
      '호버': 'hover',
      '대기': 'waitFor',
      '더블 클릭': 'dblclick'
    };
    return {
      action: actionMap[actionKrClean] || actionKrClean,
      selector: `page.getByTestId('${testId}')`
    };
  }
  
  // 셀렉터(css)에 '값' 입력
  match = actionDesc.match(/^셀렉터\(([^)]+)\)에\s*'([^']+)'\s*입력한다?$/);
  if (match) {
    return {
      action: 'fill',
      selector: `page.locator('${match[1]}')`,
      data: match[2]
    };
  }
  
  // 셀렉터(css)에 입력 (값 없음)
  match = actionDesc.match(/^셀렉터\(([^)]+)\)에\s*입력한다?$/);
  if (match) {
    return {
      action: 'fill',
      selector: `page.locator('${match[1]}')`
    };
  }
  
  // 셀렉터(css) [action]
  match = actionDesc.match(/^셀렉터\(([^)]+)\)\s*(클릭한다?|호버한다?|대기한다?|더블\s*클릭한다?|[a-z]+)$/);
  if (match) {
    // "한다" 제거하여 매핑
    const actionKrClean = match[2].replace(/한다$/, '');
    const actionMap = {
      '클릭': 'click',
      '호버': 'hover',
      '대기': 'waitFor',
      '더블 클릭': 'dblclick'
    };
    return {
      action: actionMap[actionKrClean] || match[2],
      selector: `page.locator('${match[1]}')`
    };
  }
  
  // '[name]' [role]에서 '[text]' 포함된 '[locator]' 클릭
  match = actionDesc.match(/^'([^']+)'\s*(버튼|링크|행|셀)에서\s*(.+)\s*포함된\s*'([^']+)'\s*클릭한다?$/);
  if (match) {
    const [_, name, roleKr, hasText, locator] = match;
    const roleMap = { '버튼': 'button', '링크': 'link', '행': 'row', '셀': 'cell' };
    return {
      action: 'click',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' }).filter({ hasText: ${hasText} }).locator('${locator}')`
    };
  }
  
  // [role]에서 ... 포함된 '[locator]' 클릭
  // 정규식 리터럴(/^...$/)과 공백 처리 개선
  match = actionDesc.match(/^(행|셀|버튼|리스트항목|listitem)에서\s*(.+?)\s*포함된\s*'([^']+)'\s*클릭한다?$/);
  if (match) {
    const [_, roleKr, hasText, locator] = match;
    const roleMap = { '행': 'row', '셀': 'cell', '버튼': 'button', '리스트항목': 'listitem', 'listitem': 'listitem' };
    // hasText가 문자열이면 따옴표 추가, 정규식이면 그대로 사용
    let hasTextValue = hasText.trim();
    // 정규식 리터럴 처리: /^...$/ -> 정규식으로 변환
    if (hasTextValue.startsWith('/') && hasTextValue.endsWith('/')) {
      // 정규식 리터럴을 문자열로 변환 (^와 $ 제거)
      const regexContent = hasTextValue.slice(1, -1).replace(/^\^/, '').replace(/\$$/, '');
      hasTextValue = `'${regexContent}'`;
    } else if (!hasTextValue.startsWith('/') && !hasTextValue.startsWith("'") && !hasTextValue.startsWith('"')) {
      hasTextValue = `'${hasTextValue}'`;
    }
    return {
      action: 'click',
      selector: `page.getByRole('${roleMap[roleKr]}').filter({ hasText: ${hasTextValue} }).locator('${locator}')`
    };
  }
  
  // row 내부 체크박스 패턴: "행 '[rowName]' 내부 체크박스 체크" 또는 "행 '[rowName]' 내부 체크박스 해제"
  // rowName은 부분 텍스트 매칭으로 처리 (예: 'yh-pod-63', 'user-123' 등)
  match = actionDesc.match(/^행\s*'([^']+)'\s*내부\s*체크박스\s*(체크|해제)$/);
  if (match) {
    const [_, rowName, actionType] = match;
    return {
      action: actionType === '체크' ? 'check' : 'uncheck',
      selector: `page.getByRole('row', { name: /${rowName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/ }).getByLabel('')`,
      rowPattern: true,
      dynamicRowName: rowName
    };
  }
  
  // row 내부 특정 label 체크박스: "행 '[rowName]' 내부 '[label]' 체크박스 체크"
  // rowName은 부분 텍스트 매칭으로 처리
  match = actionDesc.match(/^행\s*'([^']+)'\s*내부\s*'([^']*)'\s*체크박스\s*(체크|해제)$/);
  if (match) {
    const [_, rowName, label, actionType] = match;
    return {
      action: actionType === '체크' ? 'check' : 'uncheck',
      selector: `page.getByRole('row', { name: /${rowName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/ }).getByLabel('${label}')`,
      rowPattern: true,
      dynamicRowName: rowName,
      label: label
    };
  }
  
  // expect 패턴: "'텍스트' 텍스트 표시 확인"
  match = actionDesc.match(/^'([^']+)'\s*텍스트\s*표시\s*확인한다?$/);
  if (match) {
    return {
      action: 'expect',
      selector: `page.getByText('${match[1]}')`,
      data: 'toBeVisible'
    };
  }
  
  // expect 패턴: "'이름' [role] 표시 확인"
  match = actionDesc.match(/^'([^']+)'\s*(텍스트박스|버튼|링크|제목|체크박스|라디오버튼|선택박스|탭|다이얼로그|알림)\s*표시\s*확인한다?$/);
  if (match) {
    const [_, name, roleKr] = match;
    const roleMap = {
      '텍스트박스': 'textbox',
      '버튼': 'button',
      '링크': 'link',
      '제목': 'heading',
      '체크박스': 'checkbox',
      '라디오버튼': 'radio',
      '선택박스': 'combobox',
      '탭': 'tab',
      '다이얼로그': 'dialog',
      '알림': 'alert'
    };
    return {
      action: 'expect',
      selector: `page.getByRole('${roleMap[roleKr]}', { name: '${name}' })`,
      data: 'toBeVisible'
    };
  }
  
  // expect 패턴: "'플레이스홀더' 플레이스홀더 요소 표시 확인"
  match = actionDesc.match(/^'([^']+)'\s*플레이스홀더\s*요소\s*표시\s*확인한다?$/);
  if (match) {
    return {
      action: 'expect',
      selector: `page.getByPlaceholder('${match[1]}')`,
      data: 'toBeVisible'
    };
  }
  
  // expect 패턴: "'레이블' 레이블 요소 표시 확인"
  match = actionDesc.match(/^'([^']+)'\s*레이블\s*요소\s*표시\s*확인한다?$/);
  if (match) {
    return {
      action: 'expect',
      selector: `page.getByLabel('${match[1]}')`,
      data: 'toBeVisible'
    };
  }
  
  // expect 패턴: "요소 표시 확인" (복잡한 selector)
  match = actionDesc.match(/^요소\s*표시\s*확인한다?$/);
  if (match) {
    return {
      action: 'expect',
      data: 'toBeVisible'
      // selector는 원본에서 가져와야 함
    };
  }
  
  // 셀렉터(css) [action]
  match = actionDesc.match(/^셀렉터\(([^)]+)\)\s*(클릭한다?|에\s*입력한다?|\w+)$/);
  if (match) {
    // "한다" 제거하여 매핑
    const actionKrClean = match[2].replace(/한다$/, '');
    const action = actionKrClean.includes('입력') ? 'fill' : actionKrClean === '클릭' ? 'click' : match[2];
    return {
      action: action,
      selector: `page.locator('${match[1]}')`
    };
  }
  
  // 복잡한 셀렉터 - 원본 유지 (fallback)
  if (actionDesc.includes('복잡한 셀렉터:')) {
    // 이 경우는 별도 처리 필요 - 경고 발생
    console.warn('⚠️ 복잡한 셀렉터는 수동 처리가 필요합니다:', actionDesc);
    return {
      action: 'click',
      selector: 'COMPLEX_SELECTOR_ERROR',
      error: true
    };
  }
  
  // Playwright 코드로 직접 입력된 경우 (fallback)
  if (actionDesc.includes('page.')) {
    // 이미 Playwright 코드인 경우
    const actionMatch = actionDesc.match(/\.(click|fill|hover|press|waitFor)\(/);
    return {
      action: actionMatch ? actionMatch[1] : 'click',
      selector: actionDesc.replace(/\.(click|fill|hover|press|waitFor)\(.*?\)/, ''),
      raw: true  // 원본 코드 플래그
    };
  }
  
  // 🤖 Groq AI 사용: 파싱 실패 시 Groq로 변환 시도 (기본 활성화)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey && process.env.ENABLE_AI_CONVERSION !== 'false') {
    console.log(`🤖 파싱 실패 - Groq AI로 변환 시도: "${actionDesc}"`);
    try {
      const { getGroqClient } = await import('./ai-converter/groq-client.js');
      const groqClient = getGroqClient(groqApiKey);
      
      // 자연어를 Playwright 코드로 변환 요청
      const prompt = `다음 자연어 설명을 Playwright 코드로 변환해주세요.
답변은 Playwright 코드만 작성하고, 추가 설명은 하지 마세요.

예시:
- 입력: 3번째 카드 클릭
- 출력: await page.locator('.card').nth(2).click();

자연어:
${actionDesc}

Playwright 코드:`;
      
      const playwrightCode = await groqClient.convert(prompt);
      
      // 변환된 코드에서 action과 selector 파싱
      const actionMatch = playwrightCode.match(/\.(click|fill|hover|press|waitFor|type|check|uncheck|selectOption)\(/);
      const action = actionMatch ? actionMatch[1] : 'click';
      const selector = playwrightCode.replace(/await\s+/, '').replace(/\.(click|fill|hover|press|waitFor|type|check|uncheck|selectOption)\(.*?\);?/, '').trim();
      
      return {
        action: action,
        selector: selector,
        groq: true  // Groq 변환 플래그
      };
    } catch (groqError) {
      console.error(`❌ Groq 변환 실패:`, groqError.message);
      throw new Error(`⚠️ 파싱 불가 (Groq 포함): ${actionDesc}\n표준 형식을 사용하거나 API 설정을 확인하세요.`);
    }
  }
  
  // 🤖 MCP 사용: Groq 없을 때 MCP로 변환 시도
  if (mcpAvailable) {
    console.log(`🤖 파싱 실패 - MCP로 변환 시도: "${actionDesc}"`);
    try {
      const mcpResult = await convertNaturalLanguageToPlaywright(actionDesc);
      return {
        action: mcpResult.action,
        selector: mcpResult.selector,
        mcp: true  // MCP 변환 플래그
      };
    } catch (mcpError) {
      console.error(`❌ MCP 변환 실패:`, mcpError.message);
      throw new Error(`⚠️ 파싱 불가 (MCP 포함): ${actionDesc}\n표준 형식을 사용하거나 MCP 설정을 확인하세요.`);
    }
  }
  
  throw new Error(`⚠️ 파싱 불가: ${actionDesc}\n표준 형식을 사용해주세요. 예: '로그인' 버튼 클릭`);
}

// Google Sheets에서 데이터 조회
export async function getSheetData() {
  try {
    console.log('📊 Google Sheets 데이터 조회 중...');
    console.log(`📊 플랫폼: ${platform.toUpperCase()}`);
    console.log(`📊 Sheet ID: ${SHEET_ID}`);
    console.log(`📊 Range: ${SHEET_RANGE}`);
    
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

// 클릭 로그 메시지 생성 함수
function generateClickLogMessage(selector) {
  // getByRole('button', { name: '로그인' }) -> "버튼 '로그인'"
  const roleMatch = selector.match(/getByRole\('([^']+)',\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)/);
  if (roleMatch) {
    return `${roleMatch[1]} '${roleMatch[2]}'`;
  }
  
  // getByText('Example Domain') -> "텍스트 'Example Domain'"
  const textMatch = selector.match(/getByText\(['"`]([^'"`]+)['"`]\)/);
  if (textMatch) {
    return `텍스트 '${textMatch[1]}'`;
  }
  
  // getByRole('textbox', { name: '아이디' }) -> "텍스트박스 '아이디'"
  const textboxMatch = selector.match(/getByRole\('textbox',\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)/);
  if (textboxMatch) {
    return `텍스트박스 '${textboxMatch[1]}'`;
  }
  
  // 기본값
  return selector;
}

// 입력 로그 메시지 생성 함수
function generateFillLogMessage(selector, data) {
  // getByRole('textbox', { name: '아이디' }) -> "텍스트박스 '아이디'에 'data' 입력"
  const textboxMatch = selector.match(/getByRole\('textbox',\s*\{\s*name:\s*['"`]([^'"`]*)['"`]\s*\}\)/);
  if (textboxMatch) {
    return `텍스트박스 '${textboxMatch[1]}'에 '${data}' 입력`;
  }
  
  // getByRole('textbox') -> "텍스트박스에 'data' 입력"
  const textboxSimpleMatch = selector.match(/getByRole\('textbox'\)/);
  if (textboxSimpleMatch) {
    return `텍스트박스에 '${data}' 입력`;
  }
  
  // getByText('Example Domain') -> "텍스트 'Example Domain'에 'data' 입력"
  const textMatch = selector.match(/getByText\(['"`]([^'"`]+)['"`]\)/);
  if (textMatch) {
    return `텍스트 '${textMatch[1]}'에 '${data}' 입력`;
  }
  
  // 기본값
  return `${selector}에 '${data}' 입력`;
}

// ========== Manager 클래스 생성 관련 함수들 ==========

/**
 * 키워드 추출 (한글/영문)
 */
function extractKeywords(text) {
  const keywords = {
    'login': ['로그인', 'login', '이메일', 'email', '비밀번호', 'password'],
    'navigation': ['메뉴', 'menu', '이동', 'navigate', 'apps', '선택'],
    'cluster': ['클러스터', 'cluster', 'kubernetes', 'k8s'],
    'catalog': ['카탈로그', 'catalog', '서비스'],
    'create': ['생성', 'create', '등록', 'register'],
    'input': ['입력', 'fill', 'input', '작성'],
    'click': ['클릭', 'click', '버튼', 'button']
  };
  
  const found = [];
  for (const [key, words] of Object.entries(keywords)) {
    if (words.some(w => text.includes(w))) {
      found.push(key);
    }
  }
  return found;
}

/**
 * Step들을 자동으로 그룹핑 (AI 기반)
 */
function autoGroupSteps(steps) {
  if (steps.length === 0) return [];
  
  const groups = [];
  let currentGroup = {
    name: '',
    methodName: '',
    steps: [],
    keywords: []
  };
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const nextStep = steps[i + 1];
    
    currentGroup.steps.push(step);
    
    // 그룹 종료 조건 체크
    const shouldEndGroup = !nextStep || isNewGroupByPattern(step, nextStep, currentGroup);
    
    if (shouldEndGroup) {
      // 그룹 이름 생성
      const groupInfo = generateGroupName(currentGroup.steps);
      currentGroup.name = groupInfo.name;
      currentGroup.methodName = groupInfo.methodName;
      currentGroup.keywords = groupInfo.keywords;
      
      groups.push({ ...currentGroup });
      currentGroup = { name: '', methodName: '', steps: [], keywords: [] };
    }
  }
  
  return groups;
}

/**
 * 패턴 기반으로 새 그룹 시작 여부 판단
 */
function isNewGroupByPattern(currentStep, nextStep, currentGroup) {
  // 규칙 1: 같은 selector에 대한 클릭 → 입력은 같은 그룹
  if (
    currentStep.action === 'click' &&
    nextStep.action === 'fill' &&
    currentStep.selector === nextStep.selector
  ) {
    return false;
  }
  
  // 규칙 2: 같은 요소명이 포함되면 같은 그룹 (예: "이메일 입력 클릭" → "이메일 입력")
  const currentText = currentStep.actionDesc.replace(/클릭|입력|버튼|링크/g, '').trim();
  const nextText = nextStep.actionDesc.replace(/클릭|입력|버튼|링크/g, '').trim();
  if (currentText && nextText && currentText === nextText) {
    return false;
  }
  
  // 규칙 3: goto는 항상 새 그룹 시작
  if (nextStep.action === 'goto') {
    return true;
  }
  
  // 규칙 4: 키워드가 변경되면 새 그룹 (더 세밀한 그룹핑)
  const currentKeywords = extractKeywords(currentStep.actionDesc);
  const nextKeywords = extractKeywords(nextStep.actionDesc);
  const commonKeywords = currentKeywords.filter(k => nextKeywords.includes(k));
  
  // 공통 키워드가 없으면 새 그룹
  if (commonKeywords.length === 0 && currentGroup.steps.length >= 2) {
    return true;
  }
  
  // 규칙 5: 로그인 완료 후 네비게이션 시작 (명확한 경계)
  if (currentKeywords.includes('login') && nextKeywords.includes('navigation')) {
    return true;
  }
  
  // 규칙 6: 그룹이 너무 커지면 강제 분리 (7개 이상)
  if (currentGroup.steps.length >= 7) {
    return true;
  }
  
  return false;
}

/**
 * 그룹 이름 자동 생성 (키워드 기반만)
 */
function generateGroupName(steps) {
  // 모든 Step의 키워드 추출
  const allKeywords = steps.flatMap(s => extractKeywords(s.actionDesc));
  const keywordCounts = {};
  allKeywords.forEach(k => {
    keywordCounts[k] = (keywordCounts[k] || 0) + 1;
  });
  
  // 가장 많이 나온 키워드 찾기
  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  
  const topKeyword = sortedKeywords[0] || 'action';
  const secondKeyword = sortedKeywords[1];
  
  // 복합 키워드 기반 이름 매핑
  if (topKeyword === 'login' && secondKeyword === 'input') {
    return {
      name: '로그인 정보 입력',
      methodName: 'fillLoginCredentials',
      keywords: sortedKeywords
    };
  }
  
  // 단일 키워드 기반 이름 매핑
  const nameMap = {
    'login': { name: '로그인 프로세스', methodName: 'loginProcess' },
    'navigation': { name: '네비게이션', methodName: 'navigate' },
    'cluster': { name: '클러스터 선택', methodName: 'selectCluster' },
    'catalog': { name: '카탈로그 접근', methodName: 'navigateToCatalog' },
    'create': { name: '리소스 생성', methodName: 'createResource' },
    'input': { name: '정보 입력', methodName: 'fillInformation' },
    'click': { name: '항목 선택', methodName: 'selectItem' }
  };
  
  const result = nameMap[topKeyword] || {
    name: `작업 그룹 ${steps[0].stepNo}-${steps[steps.length-1].stepNo}`,
    methodName: `executeSteps_${steps[0].stepNo}_to_${steps[steps.length-1].stepNo}`
  };
  
  return {
    ...result,
    keywords: sortedKeywords
  };
}

/**
 * Manager 클래스 코드 생성 (자동 그룹핑)
 */
async function convertSheetsToManager(sheetData, caseId = null) {
  const dataRows = sheetData.slice(1);
  
  if (dataRows.length === 0) {
    return null;
  }
  
  // 병합된 셀 처리: 빈 값은 이전 행의 값을 유지
  let lastCaseId = '';
  let lastTitle = '';
  const processedRows = dataRows.map(row => {
    const currentCaseId = row[0] || lastCaseId; // 빈 값이면 이전 값 사용
    const currentTitle = row[1] || lastTitle; // 빈 값이면 이전 값 사용
    
    if (row[0]) lastCaseId = row[0]; // 값이 있으면 업데이트
    if (row[1]) lastTitle = row[1]; // 값이 있으면 업데이트
    
    return [currentCaseId, currentTitle, ...row.slice(2)];
  });
  
  const filteredRows = caseId 
    ? processedRows.filter(row => row[0] === caseId) // CASE_ID (인덱스 변경: 1 → 0)
    : processedRows;
  
  if (filteredRows.length === 0) {
    return null;
  }
  
  const testCaseId = filteredRows[0][0]; // CASE_ID (인덱스 변경: 1 → 0)
  const testTitle = filteredRows[0][1]; // TITLE (인덱스 변경: 2 → 1)
  const managerName = `${testCaseId}Manager`;
  
  // Step 데이터 파싱
  const steps = [];
  for (const row of filteredRows) {
    const [caseId, title, stepNo, actionDesc, data, variable, assert] = row;
    
    let parsed;
    try {
      parsed = await descToSelectorAndAction(actionDesc);
    } catch (error) {
      console.warn(`⚠️ Step ${stepNo} 파싱 실패:`, error.message);
      continue;
    }
    
    steps.push({
      stepNo,
      actionDesc,
      data,
      variable,
      assert,
      timeoutMs: 1000, // 기본값 1000ms (TIMEOUT_MS 컬럼 제거로 인해 고정값 사용)
      action: parsed.action,
      selector: parsed.selector,
      groq: parsed.groq,
      mcp: parsed.mcp
    });
  }
  
  // 자동 그룹핑
  const groups = autoGroupSteps(steps);
  
  console.log(`📦 자동 그룹핑 완료: ${steps.length}개 Step → ${groups.length}개 그룹`);
  groups.forEach((g, idx) => {
    console.log(`   그룹 ${idx + 1}: ${g.name} (Step ${g.steps[0].stepNo}-${g.steps[g.steps.length-1].stepNo}, ${g.steps.length}개)`);
  });
  
  // Manager 클래스 코드 생성
  let code = `// ${managerName} - ${testTitle}
// Generated at: ${new Date().toISOString()}
// Platform: ${platform.toUpperCase()}
// Auto-grouped: ${groups.length} groups from ${steps.length} steps

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class ${managerName} extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * ${testTitle} 전체 프로세스
   * @param {Object} config - 설정 객체
   * @returns {Object} 실행 결과
   */
  async process${testCaseId}(config) {
    try {
      console.log('🚀 ${testTitle} 프로세스 시작...');
      
`;

  // 각 그룹을 executeWithRetry로 호출
  groups.forEach((group, idx) => {
    const comment = group.steps.some(s => s.groq || s.mcp) 
      ? ` // ${group.steps.filter(s => s.groq || s.mcp).length}개 AI 변환 포함`
      : '';
    code += `      // 그룹 ${idx + 1}: ${group.name} (Step ${group.steps[0].stepNo}-${group.steps[group.steps.length-1].stepNo})${comment}\n`;
    code += `      await this.executeWithRetry(() => this.${group.methodName}_${idx + 1}(config), '${group.name}', 3);\n`;
    code += `      \n`;
  });
  
  code += `      console.log('✅ ${testTitle} 프로세스 완료');
      return { success: true, message: '${testTitle} 완료' };
      
    } catch (error) {
      console.error('${testTitle} 실패:', error.message);
      throw error;
    }
  }

`;

  // 각 그룹 메서드 생성
  for (let i = 0; i < groups.length; i++) {
    code += await generateGroupMethod(groups[i], testCaseId, i + 1);
    code += '\n';
  }
  
  code += `}

export default ${managerName};
`;

  return {
    code,
    managerName,
    testCaseId,
    testTitle,
    groupCount: groups.length,
    stepCount: steps.length
  };
}

/**
 * 그룹 메서드 코드 생성
 */
async function generateGroupMethod(group, testCaseId, groupIndex) {
  const emoji = getGroupEmoji(group.keywords[0] || 'action');
  const aiSteps = group.steps.filter(s => s.groq || s.mcp);
  const aiComment = aiSteps.length > 0 ? ` (🤖 ${aiSteps.length}개 AI 변환)` : '';
  
  let code = `  /**
   * ${group.name} (Step ${group.steps[0].stepNo}-${group.steps[group.steps.length-1].stepNo})${aiComment}
   */
  async ${group.methodName}_${groupIndex}(config) {
    console.log('${emoji} ${group.name} 중...');
    
`;

  // 각 Step 코드 생성
  for (const step of group.steps) {
    const { stepNo, action, selector, data, variable, actionDesc, groq, mcp } = step;
    const aiFlag = groq ? ' 🤖Groq' : mcp ? ' 🤖MCP' : '';
    const cleanDesc = actionDesc.replace(/'/g, "\\'"); // 따옴표 이스케이프
    
    code += `    // Step ${stepNo}: ${cleanDesc}${aiFlag}\n`;
    
    switch (action) {
      case 'goto':
        code += `    await this.page.goto(config.loginUrl || '${data}');\n`;
        code += `    await this.page.waitForTimeout(2000);\n`;
        break;
        
      case 'click':
        if (selector.includes('page.')) {
          code += `    await this.${selector}.click();\n`;
        } else {
          code += `    await this.page.locator('${selector}').click();\n`;
        }
        // 버튼/링크 클릭 시 대기
        if (selector.includes('button') || selector.includes('link')) {
          code += `    await this.page.waitForTimeout(1000);\n`;
        }
        break;
        
      case 'fill':
        // VARIABLE 처리
        if (variable === 'TRUE') {
          const varName = `dynamic_${stepNo}`;
          code += `    const ${varName} = \`${data}_\${Date.now()}\`;\n`;
          if (selector.includes('page.')) {
            code += `    await this.${selector}.fill(${varName});\n`;
            code += `    await this.${selector}.blur();\n`;
          } else {
            code += `    await this.page.locator('${selector}').fill(${varName});\n`;
            code += `    await this.page.locator('${selector}').blur();\n`;
          }
          code += `    console.log('  ✅ ${cleanDesc}:', ${varName});\n`;
        } else if (variable === 'RANDOM') {
          const varName = `random_${stepNo}`;
          code += `    const ${varName} = \`${data}_\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`;\n`;
          if (selector.includes('page.')) {
            code += `    await this.${selector}.fill(${varName});\n`;
            code += `    await this.${selector}.blur();\n`;
          } else {
            code += `    await this.page.locator('${selector}').fill(${varName});\n`;
            code += `    await this.page.locator('${selector}').blur();\n`;
          }
          code += `    console.log('  ✅ ${cleanDesc}:', ${varName});\n`;
        } else {
          if (selector.includes('page.')) {
            code += `    await this.${selector}.fill('${data}');\n`;
            code += `    await this.${selector}.blur();\n`;
          } else {
            code += `    await this.page.locator('${selector}').fill('${data}');\n`;
            code += `    await this.page.locator('${selector}').blur();\n`;
          }
          code += `    console.log('  ✅ ${cleanDesc} 완료');\n`;
        }
        break;
        
      case 'press':
        code += `    await this.page.keyboard.press('${data}');\n`;
        break;
        
      case 'check':
        if (selector.includes('page.')) {
          code += `    await this.${selector}.check();\n`;
        } else {
          code += `    await this.page.locator('${selector}').check();\n`;
        }
        break;
        
      case 'uncheck':
        if (selector.includes('page.')) {
          code += `    await this.${selector}.uncheck();\n`;
        } else {
          code += `    await this.page.locator('${selector}').uncheck();\n`;
        }
        break;
        
      case 'hover':
        if (selector.includes('page.')) {
          code += `    await this.${selector}.hover();\n`;
        } else {
          code += `    await this.page.locator('${selector}').hover();\n`;
        }
        break;
    }
    
    code += `    \n`;
  }
  
  // 그룹 완료 시 스크린샷
  const screenshotName = group.methodName.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1);
  code += `    await this.captureScreenshot('${screenshotName}');\n`;
  code += `    console.log('✅ ${group.name} 완료');\n`;
  code += `  }\n`;
  
  return code;
}

/**
 * 그룹 이모지
 */
function getGroupEmoji(keyword) {
  const emojiMap = {
    'login': '🔐',
    'navigation': '🧭',
    'cluster': '⚙️',
    'catalog': '📦',
    'create': '🆕',
    'input': '✍️',
    'click': '🖱️'
  };
  return emojiMap[keyword] || '🔄';
}

// ========== 기존 함수들 ==========

// Google Sheets 데이터를 Playwright JS 코드로 변환
async function convertSheetsToPlaywright(sheetData, caseId = null) {
  // 헤더 제거 (첫 번째 행)
  const dataRows = sheetData.slice(1);
  
  if (dataRows.length === 0) {
    return null;
  }
  
  // 병합된 셀 처리: 빈 값은 이전 행의 값을 유지
  let lastCaseId = '';
  let lastTitle = '';
  const processedRows = dataRows.map(row => {
    const currentCaseId = row[0] || lastCaseId; // 빈 값이면 이전 값 사용
    const currentTitle = row[1] || lastTitle; // 빈 값이면 이전 값 사용
    
    if (row[0]) lastCaseId = row[0]; // 값이 있으면 업데이트
    if (row[1]) lastTitle = row[1]; // 값이 있으면 업데이트
    
    return [currentCaseId, currentTitle, ...row.slice(2)];
  });
  
  // 특정 케이스 ID 필터링 (선택사항)
  const filteredRows = caseId 
    ? processedRows.filter(row => row[0] === caseId) // CASE_ID 컬럼 (인덱스 변경: 1 → 0)
    : processedRows;
  
  if (filteredRows.length === 0) {
    return null;
  }
  
  // 테스트 케이스 정보 추출
  const testCaseId = filteredRows[0][0]; // CASE_ID (인덱스 변경: 1 → 0)
  const testTitle = filteredRows[0][1]; // TITLE (인덱스 변경: 2 → 1)
  
  // Playwright 코드 생성
  let code = `// Generated Playwright Test: ${testTitle}
// Test Case ID: ${testCaseId}
// Generated at: ${new Date().toISOString()}

import { test, expect } from '@playwright/test';

test('${testTitle}', async ({ page }) => {
  // 전역 카운터 (INCREMENT 변수용)
  let globalCounter = 0;
`;

  // 각 액션을 Playwright 코드로 변환
  for (const row of filteredRows) {
    const [caseId, title, stepNo, actionDesc, data, variable, assert] = row;
    
    // actionDesc가 없으면 스킵
    if (!actionDesc) {
      continue;
    }
    
    // ACTION_DESC 파싱 (async 함수로 변경)
    let parsed;
    try {
      parsed = await descToSelectorAndAction(actionDesc);
    } catch (error) {
      code += `  // Step ${stepNo}: ⚠️ 파싱 실패 - ${actionDesc}\n`;
      code += `  // Error: ${error.message}\n\n`;
      continue;
    }
    
    const { action, selector, mcp, groq } = parsed;
    
    // selector가 없으면 스킵
    if (!selector && action !== 'goto') {
      code += `  // Step ${stepNo}: ⚠️ selector 없음 - ${actionDesc}\n\n`;
      continue;
    }
    
    // AI로 변환된 경우 표시
    if (groq) {
      code += `  // Step ${stepNo}: ${actionDesc} (🤖 Groq AI 변환)\n`;
    } else if (mcp) {
      code += `  // Step ${stepNo}: ${actionDesc} (🤖 MCP 변환)\n`;
    } else {
      code += `  // Step ${stepNo}: ${actionDesc}\n`;
    }
    
    switch (action) {
      case 'goto':
        code += `  await page.goto('${data}');\n`;
        // 페이지 로드 대기 (팝업/새창 환경 대응)
        code += `  await page.waitForTimeout(2000);\n`;
        code += `  console.log('Step ${stepNo}: 페이지 이동 완료');\n`;
        if (assert && assert.startsWith('url:')) {
          const urlPattern = assert.replace('url:', '');
          code += `  await expect(page).toHaveURL(${urlPattern});\n`;
        }
        break;
        
      case 'click':
        // selector가 Playwright locator인 경우 (page.getByRole() 등)
        if (selector && selector.includes('page.')) {
          code += `  await ${selector}.click();\n`;
        } else if (selector) {
          code += `  await page.click('${selector}');\n`;
        } else {
          code += `  // Step ${stepNo}: selector 없음으로 스킵\n`;
          break;
        }
        
        // 특정 요소 클릭 시에만 대기 추가 (버튼, 링크, 네비게이션 등)
        const needsWait = (selector && (selector.includes('button') || 
                         selector.includes('link') || 
                         selector.includes('getByRole(\'button\'') ||
                         selector.includes('getByRole(\'link\''))) ||
                         (data && (data.includes('로그인') ||
                         data.includes('선택') ||
                         data.includes('apps')));
        
        if (needsWait) {
          code += `  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)\n`;
          code += `  await page.waitForTimeout(1000);\n`;
        }
        code += `  console.log('Step ${stepNo}: 클릭 완료');\n`;
        if (assert === 'visible') {
          const locatorPart = selector.includes('page.') ? selector : `page.locator('${selector}')`;
          code += `  await expect(${locatorPart}).toBeVisible();\n`;
        }
        break;
        
      case 'fill':
        // 🎯 VARIABLE 컬럼 처리
        let fillValue = data;
        let isDynamic = false;
        
        if (variable === 'TRUE' && data) {
          // TRUE: timestamp 추가
          fillValue = `\${data}_\${Date.now()}`;
          isDynamic = true;
          code += `  const dynamicData_${stepNo} = \`${data}_\${Date.now()}\`;\n`;
        } else if (variable === 'RANDOM' && data) {
          // RANDOM: 랜덤 6자리 추가
          fillValue = `\${data}_\${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          isDynamic = true;
          code += `  const dynamicData_${stepNo} = \`${data}_\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`;\n`;
        } else if (variable === 'INCREMENT' && data) {
          // INCREMENT: 카운터 증가
          fillValue = `\${data}_\${++globalCounter}`;
          isDynamic = true;
          code += `  const dynamicData_${stepNo} = \`${data}_\${++globalCounter}\`;\n`;
        } else if (variable === 'UUID' && data) {
          // UUID: crypto.randomUUID() 사용
          fillValue = `\${data}_\${crypto.randomUUID().split('-')[0]}`;
          isDynamic = true;
          code += `  const dynamicData_${stepNo} = \`${data}_\${crypto.randomUUID().split('-')[0]}\`;\n`;
        }
        
        // selector가 Playwright locator인 경우 (page.getByRole() 등)
        if (selector.includes('page.')) {
          if (isDynamic) {
            code += `  await ${selector}.fill(dynamicData_${stepNo});\n`;
            code += `  await ${selector}.blur();\n`;
            code += `  console.log('Step ${stepNo}: 입력 완료 (동적 값):', dynamicData_${stepNo});\n`;
          } else {
            code += `  await ${selector}.fill('${data}');\n`;
            code += `  await ${selector}.blur();\n`;
            code += `  console.log('Step ${stepNo}: 입력 완료 (고정 값)');\n`;
          }
        } else {
          if (isDynamic) {
            code += `  await page.fill('${selector}', dynamicData_${stepNo});\n`;
            code += `  await page.locator('${selector}').blur();\n`;
            code += `  console.log('Step ${stepNo}: 입력 완료 (동적 값):', dynamicData_${stepNo});\n`;
          } else {
            code += `  await page.fill('${selector}', '${data}');\n`;
            code += `  await page.locator('${selector}').blur();\n`;
            code += `  console.log('Step ${stepNo}: 입력 완료 (고정 값)');\n`;
          }
        }
        
        if (assert === 'visible') {
          const locatorPart = selector.includes('page.') ? selector : `page.locator('${selector}')`;
          code += `  await expect(${locatorPart}).toBeVisible();\n`;
        }
        break;
        
      case 'press':
        // selector가 Playwright locator인 경우 (page.getByRole() 등)
        if (selector.includes('page.')) {
          code += `  await ${selector}.press('${data}');\n`;
        } else {
          code += `  await page.press('${selector}', '${data}');\n`;
        }
        if (assert === 'visible') {
          const locatorPart = selector.includes('page.') ? selector : `page.locator('${selector}')`;
          code += `  await expect(${locatorPart}).toBeVisible();\n`;
        }
        break;
        
      case 'check':
        // 체크박스 체크
        if (selector.includes('page.')) {
          code += `  await ${selector}.check();\n`;
        } else {
          code += `  await page.locator('${selector}').check();\n`;
        }
        code += `  console.log('Step ${stepNo}: 체크박스 체크 완료');\n`;
        break;
        
      case 'uncheck':
        // 체크박스 해제
        if (selector.includes('page.')) {
          code += `  await ${selector}.uncheck();\n`;
        } else {
          code += `  await page.locator('${selector}').uncheck();\n`;
        }
        code += `  console.log('Step ${stepNo}: 체크박스 해제 완료');\n`;
        break;
        
      case 'hover':
        code += `  await page.hover('${selector}');\n`;
        // 호버 효과가 적용될 때까지 대기
        code += `  // Wait 500ms - removed for performance\n`;
        if (assert === 'visible') {
          code += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
        }
        break;
        
      case 'waitFor':
        if (selector) {
          code += `  await page.waitForSelector('${selector}');\n`;
        } else if (data) {
          code += `  // Wait ${data}ms - removed for performance\n`;
        }
        break;
        
      case 'expect':
        if (data === 'toBeVisible') {
          code += `  await expect(${selector}).toBeVisible();\n`;
        } else if (data === 'toHaveURL') {
          code += `  await expect(${selector}).toHaveURL(${assert});\n`;
        }
        break;
        
      default:
        code += `  // Unknown action: ${action}\n`;
    }
    
    // 타임아웃은 action별로 하드코딩됨 (goto: 2000ms, click: 1000ms 등)
    
    code += '\n';
  }
  
  code += `});\n`;
  
  return {
    code,
    testCaseId,
    testTitle,
    actionCount: filteredRows.length
  };
}

// 모든 테스트 케이스를 케이스별로 분리하여 변환
async function convertAllSheetsToPlaywright(sheetData) {
  // 헤더 제거 (첫 번째 행)
  const dataRows = sheetData.slice(1);
  
  if (dataRows.length === 0) {
    return null;
  }
  
  // 병합된 셀 처리: 빈 값은 이전 행의 값을 유지
  let lastCaseId = '';
  let lastTitle = '';
  const processedRows = dataRows.map(row => {
    const currentCaseId = row[0] || lastCaseId; // 빈 값이면 이전 값 사용
    const currentTitle = row[1] || lastTitle; // 빈 값이면 이전 값 사용
    
    if (row[0]) lastCaseId = row[0]; // 값이 있으면 업데이트
    if (row[1]) lastTitle = row[1]; // 값이 있으면 업데이트
    
    return [currentCaseId, currentTitle, ...row.slice(2)];
  });
  
  // 케이스별 그룹화
  const caseGroups = {};
  processedRows.forEach(row => {
    const caseId = row[0]; // CASE_ID (인덱스 변경: 1 → 0)
    if (!caseId) return; // CASE_ID가 없으면 스킵
    if (!caseGroups[caseId]) {
      caseGroups[caseId] = [];
    }
    caseGroups[caseId].push(row);
  });
  
  // 각 케이스를 개별 테스트로 변환
  let allCode = `// Generated Playwright Tests
// Generated at: ${new Date().toISOString()}

import { test, expect } from '@playwright/test';

`;

  let totalActions = 0;
  
  // forEach 대신 for...of 사용 (await 지원)
  for (const [caseId, rows] of Object.entries(caseGroups)) {
    const testTitle = rows[0][1]; // TITLE (인덱스 변경: 2 → 1)
    
    allCode += `test('${testTitle}', async ({ page }) => {\n`;
    allCode += `  // 전역 카운터 (INCREMENT 변수용)\n`;
    allCode += `  let globalCounter = 0;\n`;
    
    // 각 액션을 Playwright 코드로 변환
    for (const row of rows) {
      const [caseId, title, stepNo, actionDesc, data, variable, assert] = row;
      
      // ACTION_DESC 파싱
      let parsed;
      try {
        parsed = await descToSelectorAndAction(actionDesc);
      } catch (error) {
        allCode += `  // Step ${stepNo}: ⚠️ 파싱 실패 - ${actionDesc}\n`;
        allCode += `  // Error: ${error.message}\n\n`;
        continue;
      }
      
      const { action, selector } = parsed;
      
      allCode += `  // Step ${stepNo}: ${actionDesc}\n`;
      
      switch (action) {
        case 'goto':
          allCode += `  await page.goto('${data}');\n`;
          // 페이지 로드 대기 (팝업/새창 환경 대응)
          allCode += `  await page.waitForTimeout(2000);\n`;
          allCode += `  console.log('Step ${stepNo}: 페이지 이동 완료');\n`;
          if (assert && assert.startsWith('url:')) {
            const urlPattern = assert.replace('url:', '');
            allCode += `  await expect(page).toHaveURL(${urlPattern});\n`;
          }
          break;
          
        case 'click':
          // selector가 Playwright locator인 경우 (page.getByRole() 등)
          if (selector.includes('page.')) {
            allCode += `  await ${selector}.click();\n`;
          } else {
            allCode += `  await page.click('${selector}');\n`;
          }
          
          // 특정 요소 클릭 시에만 대기 추가 (버튼, 링크, 네비게이션 등)
          const needsWait = selector.includes('button') || 
                           selector.includes('link') || 
                           selector.includes('getByRole(\'button\'') ||
                           selector.includes('getByRole(\'link\'') ||
                           data.includes('로그인') ||
                           data.includes('선택') ||
                           data.includes('apps');
          
          if (needsWait) {
            allCode += `  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)\n`;
            allCode += `  await page.waitForTimeout(1000);\n`;
          }
          allCode += `  console.log('Step ${stepNo}: 클릭 완료');\n`;
          if (assert === 'visible') {
            const locatorPart = selector.includes('page.') ? selector : `page.locator('${selector}')`;
            allCode += `  await expect(${locatorPart}).toBeVisible();\n`;
          }
          break;
          
        case 'fill':
          // 🎯 VARIABLE 컬럼 처리
          let fillValue = data;
          let isDynamic = false;
          
          if (variable === 'TRUE' && data) {
            // TRUE: timestamp 추가
            fillValue = `\${data}_\${Date.now()}`;
            isDynamic = true;
            allCode += `  const dynamicData_${stepNo} = \`${data}_\${Date.now()}\`;\n`;
          } else if (variable === 'RANDOM' && data) {
            // RANDOM: 랜덤 6자리 추가
            fillValue = `\${data}_\${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            isDynamic = true;
            allCode += `  const dynamicData_${stepNo} = \`${data}_\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`;\n`;
          } else if (variable === 'INCREMENT' && data) {
            // INCREMENT: 카운터 증가
            fillValue = `\${data}_\${++globalCounter}`;
            isDynamic = true;
            allCode += `  const dynamicData_${stepNo} = \`${data}_\${++globalCounter}\`;\n`;
          } else if (variable === 'UUID' && data) {
            // UUID: crypto.randomUUID() 사용
            fillValue = `\${data}_\${crypto.randomUUID().split('-')[0]}`;
            isDynamic = true;
            allCode += `  const dynamicData_${stepNo} = \`${data}_\${crypto.randomUUID().split('-')[0]}\`;\n`;
          }
          
          // selector가 Playwright locator인 경우 (page.getByRole() 등)
          if (selector.includes('page.')) {
            if (isDynamic) {
              allCode += `  await ${selector}.fill(dynamicData_${stepNo});\n`;
              allCode += `  await ${selector}.blur();\n`;
              allCode += `  console.log('Step ${stepNo}: 입력 완료 (동적 값):', dynamicData_${stepNo});\n`;
            } else {
              allCode += `  await ${selector}.fill('${data}');\n`;
              allCode += `  await ${selector}.blur();\n`;
              allCode += `  console.log('Step ${stepNo}: 입력 완료 (고정 값)');\n`;
            }
          } else {
            if (isDynamic) {
              allCode += `  await page.fill('${selector}', dynamicData_${stepNo});\n`;
              allCode += `  await page.locator('${selector}').blur();\n`;
              allCode += `  console.log('Step ${stepNo}: 입력 완료 (동적 값):', dynamicData_${stepNo});\n`;
            } else {
              allCode += `  await page.fill('${selector}', '${data}');\n`;
              allCode += `  await page.locator('${selector}').blur();\n`;
              allCode += `  console.log('Step ${stepNo}: 입력 완료 (고정 값)');\n`;
            }
          }
          
          if (assert === 'visible') {
            const locatorPart = selector.includes('page.') ? selector : `page.locator('${selector}')`;
            allCode += `  await expect(${locatorPart}).toBeVisible();\n`;
          }
          break;
          
        case 'press':
          // selector가 Playwright locator인 경우 (page.getByRole() 등)
          if (selector.includes('page.')) {
            allCode += `  await ${selector}.press('${data}');\n`;
          } else {
            allCode += `  await page.press('${selector}', '${data}');\n`;
          }
          if (assert === 'visible') {
            const locatorPart = selector.includes('page.') ? selector : `page.locator('${selector}')`;
            allCode += `  await expect(${locatorPart}).toBeVisible();\n`;
          }
          break;
          
        case 'check':
          // 체크박스 체크
          if (selector.includes('page.')) {
            allCode += `  await ${selector}.check();\n`;
          } else {
            allCode += `  await page.locator('${selector}').check();\n`;
          }
          allCode += `  console.log('Step ${stepNo}: 체크박스 체크 완료');\n`;
          break;
          
        case 'uncheck':
          // 체크박스 해제
          if (selector.includes('page.')) {
            allCode += `  await ${selector}.uncheck();\n`;
          } else {
            allCode += `  await page.locator('${selector}').uncheck();\n`;
          }
          allCode += `  console.log('Step ${stepNo}: 체크박스 해제 완료');\n`;
          break;
          
        case 'hover':
          allCode += `  await page.hover('${selector}');\n`;
          // 호버 효과가 적용될 때까지 대기
          allCode += `  // Wait 500ms - removed for performance\n`;
          if (assert === 'visible') {
            allCode += `  await expect(page.locator('${selector}')).toBeVisible();\n`;
          }
          break;
          
        case 'waitFor':
          if (selector) {
            allCode += `  await page.waitForSelector('${selector}');\n`;
          } else if (data) {
            allCode += `  // Wait ${data}ms - removed for performance\n`;
          }
          break;
          
        case 'expect':
          if (data === 'toBeVisible') {
            allCode += `  await expect(${selector}).toBeVisible();\n`;
          } else if (data === 'toHaveURL') {
            allCode += `  await expect(${selector}).toHaveURL(${assert});\n`;
          }
          break;
          
        default:
          allCode += `  // Unknown action: ${action}\n`;
      }
      
      // 타임아웃은 action별로 하드코딩됨 (goto: 2000ms, click: 1000ms 등)
      
      allCode += '\n';
      totalActions++;
    }
    
    allCode += `});\n\n`;
  }
  
  return {
    code: allCode,
    testCaseId: 'ALL',
    testTitle: 'All Test Cases',
    actionCount: totalActions
  };
}

// 특정 케이스 ID로 테스트 코드 생성
export async function generateTestCode(caseId) {
  try {
    console.log(`📊 테스트 케이스 ${caseId} 코드 생성 중...`);
    
    const sheetData = await getSheetData();
    const result = convertSheetsToPlaywright(sheetData, caseId);
    
    if (!result) {
      console.log(`⚠️ 케이스 ID ${caseId}에 해당하는 데이터가 없습니다.`);
      return null;
    }
    
    console.log(`✅ 테스트 코드 생성 완료:`);
    console.log(`   - 케이스 ID: ${result.testCaseId}`);
    console.log(`   - 제목: ${result.testTitle}`);
    console.log(`   - 액션 수: ${result.actionCount}개`);
    
    return result;
  } catch (error) {
    console.error('❌ 테스트 코드 생성 실패:', error.message);
    throw error;
  }
}

// 모든 테스트 케이스 코드 생성
export async function generateAllTestCodes() {
  try {
    console.log('📊 모든 테스트 케이스 코드 생성 중...');
    
    const sheetData = await getSheetData();
    const result = convertAllSheetsToPlaywright(sheetData);
    
    if (!result) {
      console.log('⚠️ 생성할 테스트 데이터가 없습니다.');
      return null;
    }
    
    console.log(`✅ 모든 테스트 코드 생성 완료:`);
    console.log(`   - 제목: ${result.testTitle}`);
    console.log(`   - 액션 수: ${result.actionCount}개`);
    
    return result;
  } catch (error) {
    console.error('❌ 테스트 코드 생성 실패:', error.message);
    throw error;
  }
}

// 테스트 케이스 목록 조회
export async function listTestCases() {
  try {
    console.log('📋 사용 가능한 테스트 케이스 목록');
    
    const sheetData = await getSheetData();
    const dataRows = sheetData.slice(1); // 헤더 제거
    
    const cases = {};
    dataRows.forEach(row => {
      const caseId = row[0]; // CASE_ID (인덱스 변경: 1 → 0)
      const title = row[1]; // TITLE (인덱스 변경: 2 → 1)
      if (!cases[caseId]) {
        cases[caseId] = {
          caseId,
          title,
          stepCount: 0
        };
      }
      cases[caseId].stepCount++;
    });
    
    console.log(`📊 총 ${Object.keys(cases).length}개의 테스트 케이스`);
    Object.values(cases).forEach(testCase => {
      console.log(`  - ${testCase.caseId}: ${testCase.title} (${testCase.stepCount}단계)`);
    });
    
    return Object.values(cases);
    
  } catch (error) {
    console.error('❌ 테스트 케이스 목록 조회 실패:', error.message);
    throw error;
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].includes('sheets-to-playwright-direct.js')) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'generate') {
    // 플랫폼 인수를 고려한 파싱
    let caseId, outputDir, useManager;
    
    // --manager 플래그 체크
    useManager = args.includes('--manager');
    
    // npm run에서 전달되는 '--' 구분자 및 플래그들 제거
    const filteredArgs = args.filter(arg => arg !== '--' && !arg.startsWith('--'));
    
    // 플랫폼이 이미 감지된 경우 (상단에서 처리됨)
    const platformIndex = filteredArgs.findIndex(arg => ['trombone', 'viola', 'contrabass', 'cmp'].includes(arg.toLowerCase()));
    
    if (platformIndex > 0) {
      // 플랫폼 인수가 있는 경우: generate [platform] [caseId] [outputDir]
      caseId = filteredArgs[platformIndex + 1];
      
      // outputDir이 지정되지 않으면 플랫폼별 lib/classes 폴더 사용
      const nextArg = filteredArgs[platformIndex + 2];
      if (nextArg) {
        outputDir = nextArg;
      } else {
        outputDir = join(__dirname, `../${platform.toUpperCase()}/lib/classes`);
      }
    } else {
      // 플랫폼 인수가 없는 경우: generate [caseId] [outputDir]
      caseId = filteredArgs[1];
      
      const nextArg = filteredArgs[2];
      if (nextArg) {
        outputDir = nextArg;
      } else {
        outputDir = 'tests/generated';
      }
    }
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    if (caseId) {
      // Manager 형식 또는 일반 테스트 형식 선택
      if (useManager) {
        // Manager 클래스 생성
        console.log('📦 Manager 클래스 형식으로 생성 중...');
        getSheetData().then(sheetData => convertSheetsToManager(sheetData, caseId)).then(result => {
          if (result) {
            const fileName = `${result.managerName}.js`;
            const filePath = join(outputDir, fileName);
            
            fs.writeFileSync(filePath, result.code);
            console.log(`\n✅ Manager 클래스 생성 완료!`);
            console.log(`📁 저장 위치: ${filePath}`);
            console.log(`📊 Manager 이름: ${result.managerName}`);
            console.log(`📊 제목: ${result.testTitle}`);
            console.log(`📊 그룹 수: ${result.groupCount}개`);
            console.log(`📊 총 Step 수: ${result.stepCount}개`);
            console.log(`\n💡 사용 방법:`);
            console.log(`   import ${result.managerName} from './lib/classes/${result.managerName}.js';`);
            console.log(`   const manager = new ${result.managerName}(page);`);
            console.log(`   await manager.process${result.testCaseId}(config);`);
          }
          process.exit(0);
        }).catch(error => {
          console.error('❌ 오류:', error.message);
          process.exit(1);
        });
      } else {
        // 일반 테스트 파일 생성
        generateTestCode(caseId).then(result => {
          if (result) {
            const fileName = `${result.testCaseId}.spec.js`;
            const filePath = join(outputDir, fileName);
            
            fs.writeFileSync(filePath, result.code);
            console.log(`\n📄 생성된 코드가 저장되었습니다: ${filePath}`);
            console.log(`📁 저장 위치: ${filePath}`);
            console.log(`📊 케이스 ID: ${result.testCaseId}`);
            console.log(`📊 제목: ${result.testTitle}`);
            console.log(`📊 액션 수: ${result.actionCount}개`);
          }
          process.exit(0);
        }).catch(error => {
          console.error('❌ 오류:', error.message);
          process.exit(1);
        });
      }
    } else {
      // 모든 케이스로 생성
      generateAllTestCodes().then(result => {
        if (result) {
          const fileName = `all-tests.spec.js`;
          const filePath = join(outputDir, fileName);
          
          fs.writeFileSync(filePath, result.code);
          console.log(`\n📄 생성된 코드가 저장되었습니다: ${filePath}`);
          console.log(`📊 제목: ${result.testTitle}`);
          console.log(`📊 액션 수: ${result.actionCount}개`);
        }
        process.exit(0);
      }).catch(error => {
        console.error('❌ 오류:', error.message);
        process.exit(1);
      });
    }
  } else if (command === 'generate-all') {
    // 모든 테스트 케이스 생성
    const outputDir = args[1] || 'tests/generated';
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    generateAllTestCodes().then(result => {
      if (result) {
        const fileName = `all-tests.spec.js`;
        const filePath = join(outputDir, fileName);
        
        fs.writeFileSync(filePath, result.code);
        console.log(`\n📄 생성된 코드가 저장되었습니다: ${filePath}`);
        console.log(`📊 제목: ${result.testTitle}`);
        console.log(`📊 액션 수: ${result.actionCount}개`);
      }
      process.exit(0);
    }).catch(error => {
      console.error('❌ 오류:', error.message);
      process.exit(1);
    });
  } else if (command === 'list') {
    // 테스트 케이스 목록 조회
    listTestCases().then(() => {
      process.exit(0);
    }).catch(error => {
      console.error('❌ 오류:', error.message);
      process.exit(1);
    });
  } else {
    console.log('사용법:');
    console.log('  node sheets-to-playwright-direct.js generate [플랫폼] [케이스ID] [출력디렉토리(선택)]');
    console.log('  node sheets-to-playwright-direct.js generate [케이스ID] [출력디렉토리]');
    console.log('  node sheets-to-playwright-direct.js generate-all [출력디렉토리]');
    console.log('  node sheets-to-playwright-direct.js list');
    console.log('');
    console.log('예시:');
    console.log('  # 플랫폼 지정 시 자동으로 해당 제품의 lib/classes 폴더에 저장');
    console.log('  node sheets-to-playwright-direct.js generate viola TC05');
    console.log('  node sheets-to-playwright-direct.js generate trombone TC12');
    console.log('  node sheets-to-playwright-direct.js generate cmp TC03');
    console.log('');
    console.log('  # Manager 클래스 형식으로 생성 (자동 그룹핑)');
    console.log('  node sheets-to-playwright-direct.js generate cmp TC05 --manager');
    console.log('  npm run autoscript:cmp TC05 --manager');
    console.log('');
    console.log('  # 커스텀 경로 지정');
    console.log('  node sheets-to-playwright-direct.js generate viola TC05 tests/custom');
    console.log('');
    console.log('  # 기존 방식 (tests/generated 폴더)');
    console.log('  node sheets-to-playwright-direct.js generate TC001');
    console.log('  node sheets-to-playwright-direct.js generate-all');
  }
}
