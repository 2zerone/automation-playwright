/**
 * Playwright MCP Helper
 * Playwright의 자연어 설명을 Playwright 코드로 변환하는 헬퍼
 * 
 * Note: @anthropic-ai/sdk는 선택적 의존성입니다.
 * 설치하려면: npm install @anthropic-ai/sdk
 */

let Anthropic = null;
let anthropic = null;

// Anthropic SDK를 동적으로 로드 (선택적)
async function loadAnthropicSDK() {
  if (Anthropic) return true;
  
  try {
    const module = await import('@anthropic-ai/sdk');
    Anthropic = module.default;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      // 조용히 실패
      return false;
    }
    
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    return true;
  } catch (error) {
    // 조용히 실패 (사용자 입력 프롬프트 방해 방지)
    // console.warn('⚠️ @anthropic-ai/sdk 패키지가 설치되지 않았습니다.');
    // console.warn('💡 MCP를 사용하려면: npm install @anthropic-ai/sdk');
    return false;
  }
}

/**
 * 자연어 액션 설명을 Playwright 코드로 변환
 * @param {string} naturalLanguageDescription - 자연어 액션 설명 (예: "3번째 카드의 설정 아이콘 클릭")
 * @param {string} context - 추가 컨텍스트 정보 (선택사항)
 * @returns {Promise<{selector: string, action: string, code: string}>}
 */
export async function convertNaturalLanguageToPlaywright(naturalLanguageDescription, context = '') {
  // SDK 로드 시도
  const sdkLoaded = await loadAnthropicSDK();
  if (!sdkLoaded || !anthropic) {
    throw new Error('Anthropic SDK를 사용할 수 없습니다. npm install @anthropic-ai/sdk를 실행하고 ANTHROPIC_API_KEY를 설정하세요.');
  }
  
  try {
    console.log(`🤖 MCP를 활용하여 변환 중: "${naturalLanguageDescription}"`);
    
    const systemPrompt = `당신은 Playwright 테스트 자동화 전문가입니다.
사용자가 제공하는 자연어 설명을 정확한 Playwright 코드로 변환하세요.

응답 형식은 반드시 다음 JSON 구조를 따라야 합니다:
{
  "selector": "page.getByRole('button', { name: '로그인' })",
  "action": "click",
  "code": "await page.getByRole('button', { name: '로그인' }).click();"
}

규칙:
- selector는 page.getByRole(), page.getByText(), page.locator() 등 Playwright 선택자
- action은 click, fill, hover, press, waitFor 등
- code는 완전한 실행 가능한 Playwright 코드 (await 포함)
- 한국어 설명도 영문 Playwright 코드로 변환
- 복잡한 체이닝도 지원 (filter, nth 등)`;

    const userPrompt = context 
      ? `컨텍스트: ${context}\n\n액션: ${naturalLanguageDescription}`
      : `액션: ${naturalLanguageDescription}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // 응답에서 JSON 추출
    const responseText = response.content[0].text;
    
    // JSON 추출 시도
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('MCP 응답에서 JSON을 찾을 수 없습니다.');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    console.log(`✅ MCP 변환 성공:`);
    console.log(`   Selector: ${result.selector}`);
    console.log(`   Action: ${result.action}`);
    console.log(`   Code: ${result.code}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ MCP 변환 실패:', error.message);
    
    // Fallback: 기본 구조 반환
    return {
      selector: `// MCP 변환 실패: ${naturalLanguageDescription}`,
      action: 'error',
      code: `// TODO: 수동으로 처리 필요 - "${naturalLanguageDescription}"`
    };
  }
}

/**
 * Playwright 코드를 자연어 ACTION_DESC로 변환
 * @param {string} playwrightCode - Playwright 코드 라인
 * @returns {Promise<string>}
 */
export async function convertPlaywrightToNaturalLanguage(playwrightCode) {
  // SDK 로드 시도
  const sdkLoaded = await loadAnthropicSDK();
  if (!sdkLoaded || !anthropic) {
    throw new Error('Anthropic SDK를 사용할 수 없습니다.');
  }
  
  try {
    console.log(`🤖 MCP를 활용하여 자연어 변환 중: "${playwrightCode}"`);
    
    const systemPrompt = `당신은 Playwright 테스트 자동화 전문가입니다.
Playwright 코드를 읽기 쉬운 한국어 자연어 설명으로 변환하세요.

응답 형식은 간단한 한국어 문장으로 작성:
- 예: '로그인' 버튼 클릭
- 예: '이메일' 텍스트박스에 입력
- 예: 3번째 카드의 '수정' 버튼 클릭

간결하고 명확하게 작성하세요.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `다음 Playwright 코드를 한국어로 설명하세요:\n\n${playwrightCode}`
        }
      ]
    });

    const naturalLanguage = response.content[0].text.trim();
    
    console.log(`✅ 자연어 변환 성공: "${naturalLanguage}"`);
    
    return naturalLanguage;
    
  } catch (error) {
    console.error('❌ 자연어 변환 실패:', error.message);
    
    // Fallback: 코드 그대로 반환
    return `// 변환 실패: ${playwrightCode}`;
  }
}

/**
 * Playwright 코드 블록에서 파싱할 수 없는 라인들을 MCP로 변환
 * @param {string[]} unparsedLines - 파싱 실패한 코드 라인들
 * @returns {Promise<Array<{code: string, selector: string, action: string, naturalLanguage: string}>>}
 */
export async function batchConvertUnparsedCode(unparsedLines) {
  const results = [];
  
  for (const line of unparsedLines) {
    try {
      const naturalLanguage = await convertPlaywrightToNaturalLanguage(line);
      const playwrightResult = await convertNaturalLanguageToPlaywright(naturalLanguage);
      
      results.push({
        originalCode: line,
        naturalLanguage,
        selector: playwrightResult.selector,
        action: playwrightResult.action,
        code: playwrightResult.code
      });
    } catch (error) {
      console.error(`❌ 라인 변환 실패: ${line}`, error.message);
      results.push({
        originalCode: line,
        naturalLanguage: `// 변환 실패: ${line}`,
        selector: `// 변환 실패`,
        action: 'error',
        code: line
      });
    }
  }
  
  return results;
}

/**
 * MCP가 사용 가능한지 체크
 * @returns {Promise<boolean>}
 */
export async function checkMCPAvailability() {
  try {
    // SDK 로드 시도
    const sdkLoaded = await loadAnthropicSDK();
    
    if (!sdkLoaded) {
      return false;
    }
    
    if (!anthropic) {
      return false;
    }
    
    // 조용히 성공 (메시지는 실제 사용 시에만)
    return true;
  } catch (error) {
    console.error('❌ MCP 사용 불가:', error.message);
    return false;
  }
}

