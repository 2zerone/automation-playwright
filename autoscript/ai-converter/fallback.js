/**
 * Fallback 모드
 * Extension 연결 실패 시 수동 모드로 전환
 * 
 * 안전장치:
 * - Extension 없어도 스크립트 계속 실행
 * - 사용자에게 명확한 안내
 * - 원본 데이터 보존
 */

/**
 * 수동 모드로 전환
 * Extension이 없거나 연결 실패 시 호출
 */
export function fallbackToManual(failedLines) {
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  AI 변환 불가 - 수동 모드로 전환');
  console.log('='.repeat(60));
  console.log('\n📋 다음 라인들을 수동으로 변환해주세요:\n');
  
  const results = [];
  
  failedLines.forEach(({ line, lineNumber }, index) => {
    console.log(`${index + 1}. [라인 ${lineNumber}]`);
    console.log(`   코드: ${line}`);
    console.log(`   → Cursor에서: "이 Playwright 코드를 한국어로 설명해줘: ${line}"`);
    console.log('');
    
    // 원본 유지하되 TODO 표시
    results.push({
      enabled: 'TRUE',
      actionDesc: `// TODO: 수동 변환 필요 - ${line}`,
      data: '',
      variable: '',
      assert: '',
      timeoutMs: '1000',
      originalLine: line,
      lineNumber: lineNumber,
      manual: true
    });
  });
  
  console.log('='.repeat(60));
  console.log('💡 Tip: Extension을 설치하면 자동 변환됩니다!');
  console.log('   설치 방법은 AI_CONVERSION_GUIDE.md를 참고하세요.');
  console.log('='.repeat(60) + '\n');
  
  return results;
}

/**
 * 부분적 실패 처리
 * 일부는 성공, 일부는 실패한 경우
 */
export function handlePartialFailure(successList, failedList) {
  console.log('\n⚠️  일부 라인 변환 실패:');
  console.log(`   성공: ${successList.length}개`);
  console.log(`   실패: ${failedList.length}개`);
  
  if (failedList.length > 0) {
    console.log('\n실패한 라인:');
    failedList.forEach(({ line, lineNumber, error }) => {
      console.log(`   - [라인 ${lineNumber}] ${line}`);
      console.log(`     에러: ${error}`);
    });
  }
  
  // 실패한 것들은 TODO로 변환
  const fallbackResults = failedList.map(({ line, lineNumber }) => ({
    enabled: 'TRUE',
    actionDesc: `// TODO: AI 변환 실패 - ${line}`,
    data: '',
    variable: '',
    assert: '',
    timeoutMs: '1000',
    originalLine: line,
    lineNumber: lineNumber,
    conversionFailed: true
  }));
  
  return [...successList, ...fallbackResults];
}

/**
 * 타임아웃 처리
 */
export function handleTimeout(line, lineNumber) {
  console.log(`⏱️  타임아웃: [라인 ${lineNumber}] ${line}`);
  
  return {
    enabled: 'TRUE',
    actionDesc: `// TODO: AI 변환 타임아웃 - ${line}`,
    data: '',
    variable: '',
    assert: '',
    timeoutMs: '1000',
    originalLine: line,
    lineNumber: lineNumber,
    timeout: true
  };
}

