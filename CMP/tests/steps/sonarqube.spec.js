import { test, expect } from '@playwright/test';

// 대메뉴: SonarQube 관리
test.describe.serial('SonarQube 관리', () => {
  
  // 중메뉴: SonarQube 등록
  test.describe.serial('SonarQube 등록', () => {
    test('상세결과', async () => {
      console.log('🔍 SonarQube 등록 시작...');
      await global.managers.sonarQubeManager.createSonarQube(global.config);
      console.log('✅ SonarQube 등록 완료\n');
    });
  });
}); 