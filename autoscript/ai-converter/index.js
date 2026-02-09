/**
 * AI Converter 메인 인터페이스
 * 
 * 안전한 AI 변환을 제공:
 * 1. Groq API 시도 (무료!)
 * 2. 실패하면 Fallback (수동 모드)
 * 3. 모든 에러 격리
 * 
 * 사용법:
 *   import { convertWithAI } from './ai-converter/index.js';
 *   const results = await convertWithAI(failedLines);
 */

import { getGroqClient } from './groq-client.js';
import { fallbackToManual, handlePartialFailure } from './fallback.js';

/**
 * AI를 사용한 코드 변환 (메인 함수)
 * 
 * @param {Array} failedLines - 파싱 실패한 라인들 [{line, lineNumber}, ...]
 * @param {Object} options - 옵션
 * @returns {Promise<Array>} 변환 결과 배열
 */
export async function convertWithAI(failedLines, options = {}) {
  const {
    testCaseId = 'TC000',
    testTitle = '테스트',
    timeout = 30000,
    debug = process.env.DEBUG_IPC === 'true'
  } = options;

  if (!failedLines || failedLines.length === 0) {
    return [];
  }

  console.log(`\n🤖 AI 변환 시작: ${failedLines.length}개 라인`);

  // ====== Groq API 시도 ======
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    console.warn('⚠️  GROQ_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.warn('⚠️  수동 모드로 전환합니다.');
    return fallbackToManual(failedLines);
  }

  console.log('🚀 Groq API 사용 중...');
  
  try {
    const results = await convertWithGroq(failedLines, groqApiKey, { debug });
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;
    
    console.log(`\n📊 Groq 변환 완료:`);
    console.log(`   ✅ 성공: ${successCount}개`);
    console.log(`   ❌ 실패: ${failedCount}개`);
    
    // 모두 실패한 경우
    if (successCount === 0 && failedCount > 0) {
      console.warn('\n⚠️  모든 변환 실패 - 수동 모드로 전환');
      return fallbackToManual(failedLines);
    }
    
    // 일부 실패한 경우
    if (failedCount > 0) {
      const failedResults = results.filter(r => !r.success);
      return handlePartialFailure(
        results.filter(r => r.success),
        failedResults.map(f => ({ lineNumber: f.lineNumber, line: f.originalLine, result: f }))
      );
    }
    
    return results;
    
  } catch (error) {
    console.error(`❌ Groq API 오류: ${error.message}`);
    console.warn('⚠️  수동 모드로 전환합니다.');
    return fallbackToManual(failedLines);
  }
}

/**
 * Groq API를 사용한 변환
 */
async function convertWithGroq(failedLines, apiKey, options = {}) {
  const { debug = false } = options;
  const groqClient = getGroqClient(apiKey);
  
  const results = [];
  
  for (let i = 0; i < failedLines.length; i++) {
    const { line, lineNumber } = failedLines[i];
    
    try {
      if (debug) {
        console.log(`\n🔄 [${i + 1}/${failedLines.length}] 변환 중...`);
        console.log(`   라인 ${lineNumber}: ${line.substring(0, 50)}...`);
      } else {
        process.stdout.write(`\r🔄 [${i + 1}/${failedLines.length}] 변환 중...`);
      }
      
      const converted = await groqClient.convert(line);
      
      if (converted && converted.trim()) {
        results.push({
          success: true,
          lineNumber,
          originalLine: line,
          converted: converted
        });
        
        if (debug) {
          console.log(`   ✅ 결과: ${converted}`);
        }
      } else {
        throw new Error('빈 응답');
      }
      
    } catch (error) {
      if (debug) {
        console.error(`   ❌ 실패: ${error.message}`);
      }
      
      results.push({
        success: false,
        lineNumber,
        originalLine: line,
        error: error.message
      });
    }
    
    // API 속도 제한 방지 (약간의 딜레이)
    if (i < failedLines.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  if (!debug) {
    console.log(''); // 줄바꿈
  }
  
  return results;
}

/**
 * AI 변환 기능 사용 가능 여부 확인
 * @returns {boolean}
 */
export function isAIConversionAvailable() {
  // 환경 변수로 명시적으로 비활성화한 경우
  if (process.env.ENABLE_AI_CONVERSION === 'false') {
    return false;
  }
  
  // Groq API 키가 있으면 자동 활성화 (기본값: true)
  return !!process.env.GROQ_API_KEY;
}

