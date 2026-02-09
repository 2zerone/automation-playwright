import { test, expect } from '@playwright/test';

// 대메뉴: 사용자 관리
test.describe.serial('사용자 관리', () => {
  
  // 중메뉴: 사용자 등록
  test.describe.serial('사용자 등록', () => {
    test('상세결과', async () => {
      console.log('👤 사용자 등록 시작...');
      await global.managers.userManager.createUser(global.config);
      console.log('✅ 사용자 등록 완료\n');
    });
  });
}); 