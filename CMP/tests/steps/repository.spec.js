import { test, expect } from '@playwright/test';

// 대메뉴: 저장소 관리
test.describe.serial('저장소 관리', () => {
  
  // 중메뉴: 저장소 등록
  test.describe.serial('저장소 등록', () => {
    test('상세결과', async () => {
      console.log('📦 저장소 생성 시작...');
      await global.managers.repositoryManager.createRepository(global.config);
      console.log('✅ 저장소 생성 완료\n');
    });
  });
}); 