import { test, expect } from '@playwright/test';

// 대메뉴: GitLab 파일 수정
test.describe.serial('GitLab 파일 수정', () => {
  
  // 중메뉴: GitLab 파일 수정 실행
  test.describe.serial('GitLab 파일 수정 실행', () => {
    test('상세결과', async () => {
      console.log('🔧 GitLab 파일 수정 시작...');
      
      try {
        await global.managers.gitlabManager.modifyFileInGitLabInNewTab(
          global.browser,
          global.config,
          'src/main/resources/templates/memberList.html',
          9,
          '<h1> 자동화 테스트 </h1>',
          'Auto-test: Update memberList.html with automation test'
        );
        console.log('✅ GitLab 파일 수정 완료');
      } catch (error) {
        console.log('❌ GitLab 파일 수정 실패');
        throw error;
      }
    });
  });
});
