/**
 * Groq API 테스트
 * 
 * 실행 방법:
 * GROQ_API_KEY=your_api_key_here node autoscript/test-groq.js
 */

import { getGroqClient } from './ai-converter/groq-client.js';

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.log('\n사용법:');
    console.log('  GROQ_API_KEY=your_api_key node autoscript/test-groq.js');
    console.log('\nAPI 키 발급:');
    console.log('  1. https://console.groq.com 방문');
    console.log('  2. Sign Up (무료)');
    console.log('  3. API Keys 메뉴에서 생성');
    process.exit(1);
  }
  
  console.log('🧪 Groq API 테스트 시작...\n');
  
  // 테스트 코드들
  const testCases = [
    "await page.locator('.card').nth(2).click();",
    "await page.getByRole('button', { name: '저장' }).click();",
    "await page.fill('#username', 'admin');",
    "await expect(page.locator('.success')).toBeVisible();"
  ];
  
  const client = getGroqClient(apiKey);
  
  for (let i = 0; i < testCases.length; i++) {
    const code = testCases[i];
    
    try {
      console.log(`\n[${i + 1}/${testCases.length}] 변환 중...`);
      console.log(`📝 입력: ${code}`);
      
      const result = await client.convert(code);
      
      console.log(`✅ 결과: ${result}`);
      
    } catch (error) {
      console.error(`❌ 실패: ${error.message}`);
    }
    
    // API 속도 제한 방지
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n\n✅ 테스트 완료!');
  console.log('\n💡 이제 codegen에서 사용할 수 있습니다:');
  console.log('   GROQ_API_KEY=your_key ENABLE_AI_CONVERSION=true npm run codegen:auto:cmp');
}

testGroq().catch(error => {
  console.error('\n💥 테스트 실패:', error);
  process.exit(1);
});

