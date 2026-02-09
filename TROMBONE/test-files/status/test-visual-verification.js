const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// 매니저 클래스 import
const TicketCreateManager = require('../lib/classes/TicketCreateManager');
const TromboneUtils = require('../lib/classes/TromboneUtils');

// 설정 파일에서 데이터를 읽어오는 함수
function loadTestSettings() {
  const scenarioId = 1;
  const configPath = path.join(__dirname, '..', 'config', 'scenario', `test-settings-${scenarioId}.json`);
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.repository.group = config.project.code;
    return config;
  } else {
    const defaultConfigPath = path.join(__dirname, '..', 'config', 'test-settings.json');
    const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    config.repository.group = config.project.code;
    return config;
  }
}

test('새 탭 생성 시각적 확인', async ({ page }) => {
  console.log('🎯 새 탭 생성 시각적 확인 테스트 시작\n');
  
  const config = loadTestSettings();
  const tromboneUtils = new TromboneUtils(page);
  const ticketCreateManager = new TicketCreateManager(tromboneUtils);
  let newPage = null;

  try {
    console.log('🚀 1단계: 원본 탭에서 빈 페이지 로딩');
    await page.goto('about:blank');
    await page.waitForTimeout(3000);
    console.log('✅ 원본 탭 준비 완료 - 3초 대기하여 확인하세요!\n');

    console.log('🚀 2단계: 새 탭 생성 (10초 대기)');
    const context = page.context();
    const pagesBefore = context.pages();
    console.log(`📊 새 탭 생성 전 페이지 수: ${pagesBefore.length}`);
    
    newPage = await context.newPage();
    await newPage.bringToFront();
    
    const pagesAfter = context.pages();
    console.log(`📊 새 탭 생성 후 페이지 수: ${pagesAfter.length}`);
    console.log('👀 새 탭이 생성되었습니다! 브라우저에서 확인하세요!');
    console.log('⏰ 10초 동안 대기합니다...');
    await newPage.waitForTimeout(10000);

    console.log('🚀 3단계: 새 탭에서 구글 접속 (10초 대기)');
    await newPage.goto('https://www.google.com');
    await newPage.waitForLoadState('networkidle');
    console.log('✅ 구글 페이지 로딩 완료');
    console.log('⏰ 10초 동안 대기합니다...');
    await newPage.waitForTimeout(10000);

    console.log('🚀 4단계: 원본 탭으로 전환 (5초 대기)');
    await page.bringToFront();
    console.log('✅ 원본 탭으로 전환됨');
    console.log('⏰ 5초 동안 대기합니다...');
    await page.waitForTimeout(5000);

    console.log('🚀 5단계: 다시 새 탭으로 전환 (5초 대기)');
    await newPage.bringToFront();
    console.log('✅ 새 탭으로 전환됨');
    console.log('⏰ 5초 동안 대기합니다...');
    await newPage.waitForTimeout(5000);

    console.log('🎉 테스트 완료! 새 탭이 정상적으로 작동했습니다!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    throw error;
  } finally {
    if (newPage && !newPage.isClosed()) {
      console.log('🗑️ 새 탭을 닫습니다...');
      await newPage.close();
      console.log('✅ 새 탭이 닫혔습니다.');
    }
  }
});