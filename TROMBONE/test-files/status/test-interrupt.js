const { test, expect } = require('@playwright/test');

test('중단 테스트', async ({ page }) => {
  console.log('🚀 중단 테스트 시작...');
  
  // 2초 대기
  await page.waitForTimeout(2000);
  
  console.log('⚠️ 의도적으로 오류 발생...');
  
  // 의도적으로 오류 발생 (시뮬레이션)
  throw new Error('사용자에 의해 중단됨 (시뮬레이션)');
  
  console.log('✅ 중단 테스트 완료');
}); 