import { test, expect } from '@playwright/test';

// 대메뉴: JUnit 관리
test.describe.serial('JUnit 관리', () => {
  
  // 중메뉴: JUnit 등록
  test.describe.serial('JUnit 등록', () => {
    test('상세결과', async () => {
      console.log('🧪 JUnit 등록 시작...');
      await global.managers.jUnitManager.createJUnit(global.config);
      console.log('✅ JUnit 등록 완료\n');
    });
  });
}); 