import { test, expect } from '@playwright/test';

// 대메뉴: 파이프라인 관리
test.describe.serial('파이프라인 관리', () => {
  
  // 중메뉴: 파이프라인 등록
  test.describe.serial('파이프라인 등록', () => {
    test('상세결과', async () => {
      console.log('🔄 파이프라인 등록 시작...');
      await global.managers.pipelineManager.createPipeline(`${global.config.project.code}-STG`, 'STG', './tests/pipeline-stg.txt', global.config);
      await global.managers.pipelineManager.createPipeline(`${global.config.project.code}-PRD`, 'PRD', './tests/pipeline-prd.txt', global.config);
      console.log('✅ 파이프라인 등록 완료\n');
    });
  });
}); 