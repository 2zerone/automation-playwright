/**
 * raw Playwright 코드를 Manager 클래스 형식으로 변환
 */

import fs from 'fs';
import path from 'path';

/**
 * raw Playwright 코드에서 action 추출
 */
function parsePlaywrightActions(code) {
  const actions = [];
  
  // test() 함수 내부의 내용만 추출
  const testMatch = code.match(/test\([^,]+,\s*async\s*\(\s*\{\s*page\s*\}\s*\)\s*=>\s*\{([\s\S]*)\}\s*\);/);
  if (!testMatch) {
    console.warn('⚠️ test 함수를 찾을 수 없습니다. 전체 코드를 파싱합니다.');
  }
  
  const codeToparse = testMatch ? testMatch[1] : code;
  
  // await로 시작하는 action들 추출
  const awaitRegex = /await\s+page\.(.*?);/g;
  let match;
  
  while ((match = awaitRegex.exec(codeToparse)) !== null) {
    const action = match[1].trim();
    
    // 필터링: 불필요한 action 제외
    if (shouldSkipAction(action)) {
      console.log(`⏭️ 건너뜀: ${action}`);
      continue;
    }
    
    actions.push(action);
  }
  
  // 마지막 action이 goto()이면 제거 (Playwright codegen이 종료 시 자동 추가하는 것)
  if (actions.length > 1 && actions[actions.length - 1].includes('goto(')) {
    console.log(`⏭️ 마지막 불필요한 goto() 제거: ${actions[actions.length - 1]}`);
    actions.pop();
  }
  
  return actions;
}

/**
 * 불필요한 action인지 확인
 */
function shouldSkipAction(action) {
  // page.close() - 브라우저 닫기는 제외
  if (action.includes('close()')) {
    return true;
  }
  
  // waitForTimeout만 있는 경우 제외 (독립적인 대기)
  if (action.trim().startsWith('waitForTimeout(') && !action.includes('.')) {
    return true;
  }
  
  // 빈 action
  if (!action || action.trim() === '') {
    return true;
  }
  
  return false;
}

/**
 * action을 영어 테스트 케이스 이름으로 변환
 */
function actionToStepName(action, index) {
  // goto
  if (action.startsWith('goto(')) {
    return 'Navigate to page';
  }
  
  // getByLabel, getByRole, getByText 등의 선택자
  if (action.includes('.click()')) {
    if (action.includes('getByLabel')) {
      const labelMatch = action.match(/getByLabel\(['"](.+?)['"]\)/);
      if (labelMatch) return `Click ${sanitizeLabel(labelMatch[1])}`;
    }
    if (action.includes('getByRole')) {
      const roleMatch = action.match(/getByRole\(.+?name:\s*['"](.+?)['"]/);
      if (roleMatch) return `Click ${sanitizeLabel(roleMatch[1])} button`;
      
      const buttonMatch = action.match(/getByRole\(['"]button['"]/);
      if (buttonMatch) return 'Click button';
    }
    if (action.includes('getByText')) {
      const textMatch = action.match(/getByText\(['"](.+?)['"]\)/);
      if (textMatch) return `Click ${sanitizeLabel(textMatch[1])}`;
    }
    return 'Click element';
  }
  
  // fill
  if (action.includes('.fill(')) {
    if (action.includes('getByLabel')) {
      const labelMatch = action.match(/getByLabel\(['"](.+?)['"]\)/);
      if (labelMatch) return `Fill ${sanitizeLabel(labelMatch[1])}`;
    }
    if (action.includes('getByRole')) {
      const roleMatch = action.match(/getByRole\(.+?name:\s*['"](.+?)['"]/);
      if (roleMatch) return `Fill ${sanitizeLabel(roleMatch[1])}`;
    }
    return 'Fill field';
  }
  
  // type
  if (action.includes('.type(')) {
    return 'Type text';
  }
  
  // press
  if (action.includes('.press(')) {
    const keyMatch = action.match(/press\(['"](.+?)['"]\)/);
    if (keyMatch) return `Press ${sanitizeLabel(keyMatch[1])} key`;
    return 'Press key';
  }
  
  // select
  if (action.includes('.selectOption(')) {
    return 'Select option';
  }
  
  // check/uncheck
  if (action.includes('.check()')) {
    return 'Check checkbox';
  }
  if (action.includes('.uncheck()')) {
    return 'Uncheck checkbox';
  }
  
  // wait
  if (action.includes('waitForSelector') || action.includes('waitForLoadState')) {
    return 'Wait';
  }
  
  if (action.includes('waitForTimeout')) {
    return 'Wait';
  }
  
  return `Step ${index + 1}`;
}

/**
 * 라벨을 영어로 변환하거나 정리
 */
function sanitizeLabel(label) {
  const koreanToEnglish = {
    '아이디': 'username',
    '아이디를 입력해 주세요': 'username',
    '사용자명': 'username',
    '비밀번호': 'password',
    '비밀번호를 입력해 주세요': 'password',
    '로그인': 'login',
    '로그아웃': 'logout',
    '검색': 'search',
    '저장': 'save',
    '취소': 'cancel',
    '확인': 'confirm',
    '삭제': 'delete',
    '추가': 'add',
    '수정': 'edit',
    '생성': 'create',
    '등록': 'register',
    '이름': 'name',
    '이메일': 'email',
    '전화번호': 'phone',
    '주소': 'address'
  };
  
  // 정확히 일치하는 한글 찾기
  if (koreanToEnglish[label]) {
    return koreanToEnglish[label];
  }
  
  // 부분 매칭
  for (const [korean, english] of Object.entries(koreanToEnglish)) {
    if (label.includes(korean)) {
      return english;
    }
  }
  
  // 한글이면 transliteration
  if (/[가-힣]/.test(label)) {
    return 'field';
  }
  
  // 영어는 그대로 소문자로
  return label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * 연속된 action들을 병합 (click → fill 등)
 */
function mergeConsecutiveActions(actions) {
  const merged = [];
  let i = 0;
  
  while (i < actions.length) {
    const currentAction = actions[i];
    const nextAction = actions[i + 1];
    
    // click() 다음에 fill()이 오고, 같은 selector를 사용하는지 확인
    if (nextAction && 
        currentAction.includes('.click()') && 
        nextAction.includes('.fill(')) {
      
      // selector 추출 (getByRole, getByLabel 등)
      const clickSelector = extractSelector(currentAction);
      const fillSelector = extractSelector(nextAction);
      
      // 같은 selector면 병합
      if (clickSelector && fillSelector && clickSelector === fillSelector) {
        console.log(`🔗 병합: click + fill → ${clickSelector}`);
        
        // fill의 label에서 이름 추출
        const labelMatch = nextAction.match(/name:\s*['"](.+?)['"]/);
        const label = labelMatch ? sanitizeLabel(labelMatch[1]) : 'field';
        
        merged.push({
          action: nextAction, // fill action을 기본으로 사용 (click은 자동 포함)
          mergedActions: [currentAction, nextAction],
          mergedName: `Fill ${label}`
        });
        
        i += 2; // 두 개를 건너뜀
        continue;
      }
    }
    
    // 병합되지 않으면 그대로 추가
    merged.push(currentAction);
    i++;
  }
  
  return merged;
}

/**
 * action에서 selector 추출
 */
function extractSelector(action) {
  // getByRole('textbox', { name: '...' }) 형태 추출
  const roleMatch = action.match(/getByRole\(['"](\w+)['"],\s*\{\s*name:\s*['"](.+?)['"]/);
  if (roleMatch) {
    return `${roleMatch[1]}:${roleMatch[2]}`;
  }
  
  // getByLabel('...') 형태 추출
  const labelMatch = action.match(/getByLabel\(['"](.+?)['"]\)/);
  if (labelMatch) {
    return `label:${labelMatch[1]}`;
  }
  
  // getByText('...') 형태 추출
  const textMatch = action.match(/getByText\(['"](.+?)['"]\)/);
  if (textMatch) {
    return `text:${textMatch[1]}`;
  }
  
  return null;
}

/**
 * 한글 라벨을 간단한 영어로 변환 (주요 UI 요소)
 */
function toEnglishLabel(koreanLabel) {
  const translations = {
    '아이디를 입력해 주세요': 'username',
    '아이디': 'username',
    '비밀번호를 입력해 주세요': 'password',
    '비밀번호': 'password',
    '로그인': 'login',
    '확인': 'confirm',
    '취소': 'cancel',
    '저장': 'save',
    '삭제': 'delete',
    '수정': 'edit',
    '추가': 'add',
    '검색': 'search',
    '닫기': 'close',
    '다음': 'next',
    '이전': 'previous',
    '완료': 'complete',
    '제출': 'submit'
  };
  
  // 정확히 일치하는 번역이 있으면 사용
  if (translations[koreanLabel]) {
    return translations[koreanLabel];
  }
  
  // 부분 일치 확인
  for (const [korean, english] of Object.entries(translations)) {
    if (koreanLabel.includes(korean)) {
      return english;
    }
  }
  
  // 번역이 없으면 원본 반환 (영어인 경우 그대로)
  return koreanLabel;
}

/**
 * raw Playwright 코드를 Manager 클래스로 변환
 */
export function convertRawToManager(rawFilePath, product, caseId, title) {
  const productUpper = product.toUpperCase();
  
  // raw 파일 읽기
  const rawCode = fs.readFileSync(rawFilePath, 'utf8');
  
  // action 추출
  const actions = parsePlaywrightActions(rawCode);
  
  console.log(`📝 추출된 action 개수: ${actions.length}`);
  
  // 연속된 패턴 병합 (click → fill 등)
  const mergedActions = mergeConsecutiveActions(actions);
  
  console.log(`🔗 병합 후 action 개수: ${mergedActions.length}`);
  
  // 각 action을 step으로 변환
  const steps = mergedActions.map((action, index) => ({
    index: index + 1,
    name: action.mergedName || actionToStepName(action.action || action, index),
    action: action.action || action,
    mergedActions: action.mergedActions || null
  }));
  
  // 중복 메서드명 처리 (camelCase에서 번호 추가)
  const uniqueSteps = [];
  const methodNameCount = {};
  
  steps.forEach(step => {
    // action 코드를 기반으로 메서드명 생성 (한글 단계명이 아닌 Playwright action 분석)
    const methodName = actionToMethodName(step.action);
    
    if (methodNameCount[methodName]) {
      methodNameCount[methodName]++;
      uniqueSteps.push({
        ...step,
        methodNameSuffix: methodNameCount[methodName],
        uniqueMethodName: `${methodName}${methodNameCount[methodName]}`
      });
    } else {
      methodNameCount[methodName] = 1;
      uniqueSteps.push({
        ...step,
        methodNameSuffix: null,
        uniqueMethodName: methodName
      });
    }
  });
  
  // 클래스명 생성 (camelCase)
  const className = `AutoRecorded_${caseId.replace(/[-_]/g, '_')}`;
  
  // Manager 클래스 코드 생성
  const managerCode = generateManagerClass(productUpper, className, title, uniqueSteps);
  
  return {
    className,
    code: managerCode,
    steps: uniqueSteps,
    title
  };
}

/**
 * Manager 클래스 코드 생성
 */
function generateManagerClass(product, className, title, steps) {
  // process 메서드의 executeWithRetry 호출 목록
  const processSteps = steps.map(step => 
    `      await this.executeWithRetry(() => this.${step.uniqueMethodName}(config), '${step.name}', 3);`
  ).join('\n');
  
  // 각 step 메서드들
  const stepMethods = steps.map(step => {
    if (step.mergedActions && step.mergedActions.length > 0) {
      // 병합된 action들 (click + fill)
      const clickAction = step.mergedActions[0];
      const fillAction = step.mergedActions[1];
      
      return `
  /**
   * ${step.name}
   */
  async ${step.uniqueMethodName}(config) {
    console.log('📝 Executing: ${step.name}...');
    await this.page.${clickAction};
    await this.page.${fillAction};
    await this.page.waitForTimeout(${getWaitTime(fillAction)});
    await this.captureScreenshot('${step.uniqueMethodName}');
    console.log('✅ Completed: ${step.name}');
  }`;
    } else {
      // 일반 action
      return `
  /**
   * ${step.name}
   */
  async ${step.uniqueMethodName}(config) {
    console.log('📝 Executing: ${step.name}...');
    await this.page.${step.action};
    await this.page.waitForTimeout(${getWaitTime(step.action)});
    await this.captureScreenshot('${step.uniqueMethodName}');
    console.log('✅ Completed: ${step.name}');
  }`;
    }
  }).join('\n');

  return `// Generated at: ${new Date().toISOString()}
// Platform: ${product}
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class ${className} extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * ${title} process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async process${titleToCamelCase(title)}(config) {
    try {
      console.log('🚀 Starting ${title} process...');
      
${processSteps}
      
      console.log('✅ ${title} process completed');
      return { success: true, message: '${title} completed' };
      
    } catch (error) {
      console.error('❌ ${title} failed:', error.message);
      throw error;
    }
  }
${stepMethods}
}

export default ${className};
`;
}

/**
 * Playwright action 코드를 분석하여 영어 메서드명 생성 (camelCase)
 */
function actionToMethodName(action) {
  // goto
  if (action.startsWith('goto(')) {
    return 'navigateToPage';
  }
  
  // click
  if (action.includes('.click()')) {
    const selector = extractSelectorInfo(action);
    if (selector) {
      const label = translateToEnglish(selector.label);
      const role = selector.role ? capitalizeFirst(selector.role) : '';
      return `click${capitalizeFirst(label)}${role}`;
    }
    return 'clickElement';
  }
  
  // fill
  if (action.includes('.fill(')) {
    const selector = extractSelectorInfo(action);
    if (selector) {
      const label = translateToEnglish(selector.label);
      const role = selector.role ? capitalizeFirst(selector.role) : '';
      return `fill${capitalizeFirst(label)}${role}`;
    }
    return 'fillField';
  }
  
  // type
  if (action.includes('.type(')) {
    return 'typeText';
  }
  
  // press
  if (action.includes('.press(')) {
    const keyMatch = action.match(/press\(['"](.+?)['"]\)/);
    if (keyMatch) {
      const key = keyMatch[1].replace(/[^a-zA-Z0-9]/g, ''); // 특수문자 제거
      return `press${capitalizeFirst(key)}Key`;
    }
    return 'pressKey';
  }
  
  // selectOption
  if (action.includes('.selectOption(')) {
    return 'selectOption';
  }
  
  // check/uncheck
  if (action.includes('.check()')) {
    return 'checkCheckbox';
  }
  if (action.includes('.uncheck()')) {
    return 'uncheckCheckbox';
  }
  
  // wait
  if (action.includes('waitForTimeout') || action.includes('waitForSelector')) {
    return 'wait';
  }
  
  return 'performAction';
}

/**
 * action에서 selector 정보 추출 (role, label)
 */
function extractSelectorInfo(action) {
  // getByRole('role', { name: 'label' })
  const roleMatch = action.match(/getByRole\(['"](\w+)['"],\s*\{\s*name:\s*['"](.+?)['"]/);
  if (roleMatch) {
    return {
      role: roleMatch[1],        // textbox, button 등
      label: roleMatch[2]        // 아이디를 입력해 주세요, 로그인 등
    };
  }
  
  // getByLabel('label')
  const labelMatch = action.match(/getByLabel\(['"](.+?)['"]\)/);
  if (labelMatch) {
    return {
      role: '',
      label: labelMatch[1]
    };
  }
  
  // getByText('text')
  const textMatch = action.match(/getByText\(['"](.+?)['"]\)/);
  if (textMatch) {
    return {
      role: '',
      label: textMatch[1]
    };
  }
  
  return null;
}

/**
 * 한글을 영어로 변환 (주요 UI 용어)
 */
function translateToEnglish(text) {
  if (!text) return 'field';
  
  const koreanMap = {
    '아이디': 'username',
    '아이디를 입력해 주세요': 'username',
    '사용자명': 'username',
    '비밀번호': 'password',
    '비밀번호를 입력해 주세요': 'password',
    '로그인': 'login',
    '로그아웃': 'logout',
    '검색': 'search',
    '저장': 'save',
    '취소': 'cancel',
    '확인': 'confirm',
    '삭제': 'delete',
    '추가': 'add',
    '수정': 'edit',
    '생성': 'create',
    '등록': 'register',
    '이름': 'name',
    '이메일': 'email',
    '전화번호': 'phone',
    '주소': 'address',
    '제목': 'title',
    '내용': 'content',
    '설명': 'description',
    '날짜': 'date',
    '시간': 'time'
  };
  
  // 정확히 일치하는 경우
  if (koreanMap[text]) {
    return koreanMap[text];
  }
  
  // 부분 일치 찾기
  for (const [ko, en] of Object.entries(koreanMap)) {
    if (text.includes(ko)) {
      return en;
    }
  }
  
  // 한글이면 'field' 반환
  if (/[가-힣]/.test(text)) {
    return 'field';
  }
  
  // 영어는 소문자로 변환하고 특수문자 제거
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * 첫 글자를 대문자로 변환
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * title을 camelCase로 변환 (프로세스명용)
 */
function titleToCamelCase(title) {
  if (!title) return 'Test';
  
  // 특수문자와 공백을 기준으로 단어 분리
  const words = title
    .replace(/[^\w\s가-힣]/g, ' ')  // 특수문자를 공백으로
    .split(/\s+/)                    // 공백으로 분리
    .filter(word => word.length > 0);
  
  // 각 단어를 영어로 변환하고 첫 글자 대문자
  return words
    .map(word => {
      const english = translateToEnglish(word);
      return capitalizeFirst(english);
    })
    .join('');
}

/**
 * action에 따라 적절한 대기 시간 반환 (ms)
 */
function getWaitTime(action) {
  if (action.includes('.click()')) {
    // 버튼 클릭은 더 길게
    if (action.includes('button') || action.includes('Button')) {
      return 1000;
    }
    return 500;
  }
  
  if (action.includes('.fill(') || action.includes('.type(')) {
    return 300;
  }
  
  if (action.includes('.check()') || action.includes('.uncheck()')) {
    return 300;
  }
  
  if (action.includes('.selectOption(')) {
    return 500;
  }
  
  if (action.includes('goto(')) {
    return 1000;
  }
  
  return 300;
}

// CLI로 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, rawFilePath, product, caseId, title] = process.argv;
  
  if (!rawFilePath || !product || !caseId) {
    console.error('Usage: node convert-raw-to-manager.js <rawFilePath> <product> <caseId> [title]');
    process.exit(1);
  }
  
  const result = convertRawToManager(
    rawFilePath,
    product,
    caseId,
    title || 'Auto-generated test'
  );
  
  console.log(result.code);
}
