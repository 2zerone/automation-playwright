import { test, expect } from '@playwright/test';

// 대메뉴: 사용자 업무코드 관리
test.describe.serial('사용자 업무코드 관리', () => {
  
  // 중메뉴: 사용자 업무코드 할당
  test.describe.serial('사용자 업무코드 할당', () => {
    test('상세결과', async () => {
      console.log('👥 사용자 업무 코드 할당 시작...');
      await global.managers.userTaskCodeManager.assignUserTaskCode(global.config);
      console.log('✅ 사용자 업무 코드 할당 완료\n');
    });
  });
});