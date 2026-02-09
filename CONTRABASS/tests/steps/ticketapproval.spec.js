import { fileURLToPath } from 'url';
import path from 'path';
import { test, expect } from '@playwright/test';
import fs from 'fs';
import TicketApproval from '../../lib/classes/TicketApproval.js';
import TromboneUtils from '../../lib/classes/TromboneUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// 매니저 클래스 import

// 설정 파일에서 데이터를 읽어오는 함수
function loadTestSettings() {
  const scenarioId = 1; // 현재 시나리오 ID
  const configPath = path.join(__dirname, `../../config/scenario/test-settings-${scenarioId}.json`);
  
  // 시나리오별 설정 파일이 존재하는지 확인
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    // 동적으로 생성되는 값들
    config.repository.group = config.project.code;
    return config;
  } else {
    // 시나리오별 설정 파일이 없으면 기본 설정 파일 사용
    const defaultConfigPath = path.join(__dirname, '../../config/test-settings.json');
    const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    // 동적으로 생성되는 값들
    config.repository.group = config.project.code;
    return config;
  }
}

test.describe('티켓 승인 - 새 탭 로그인 테스트', () => {
  let config;
  let tromboneUtils;
  let ticketApproval;
  let newPage; // 새로운 탭을 위한 페이지 변수

  test.beforeAll(async () => {
    // 설정 파일 로드
    config = loadTestSettings();
    console.log('✅ 티켓 승인 테스트 설정이 로드되었습니다.\n');
  });

  test.beforeEach(async ({ page }) => {
    // 매니저 클래스 초기화
    tromboneUtils = new TromboneUtils(page);
    ticketApproval = new TicketApproval(tromboneUtils);
  });

  test.afterEach(async () => {
    // 새 탭이 열려있다면 닫기
    if (newPage) {
      await ticketApproval.closeNewTab(newPage);
      newPage = null;
    }
  });

  test('새로운 탭에서 Trombone 로그인', async ({ page, browser }) => {
    console.log('🎯 새로운 탭에서 Trombone 로그인 테스트 시작\n');

    await test.step('새 탭 생성 및 로그인', async () => {
      console.log('📝 새 탭 생성 및 로그인 시작...');
      try {
        // 새 탭에서 로그인 수행 (browser 객체 전달)
        newPage = await ticketApproval.loginInNewTab(config, browser);
        
        // 로그인 성공 확인
        expect(newPage).toBeTruthy();
        expect(newPage.isClosed()).toBeFalsy();
        
        // URL 확인
        const currentURL = newPage.url();
        expect(currentURL).toBe('http://trombone.qa.okestro.cloud/');
        
        console.log('✅ 새 탭 생성 및 로그인 성공');
      } catch (error) {
        console.log('❌ 새 탭 생성 및 로그인 실패');
        throw error;
      }
    });

    await test.step('탭 간 전환 테스트', async () => {
      console.log('📝 탭 간 전환 테스트 시작...');
      try {
        // 원본 탭과 새 탭 간의 전환 테스트
        await ticketApproval.switchBetweenTabs(page, newPage);
        
        // 두 탭 모두 정상적으로 작동하는지 확인
        expect(page.isClosed()).toBeFalsy();
        expect(newPage.isClosed()).toBeFalsy();
        
        console.log('✅ 탭 간 전환 테스트 성공');
      } catch (error) {
        console.log('❌ 탭 간 전환 테스트 실패');
        throw error;
      }
    });

    await test.step('새 탭에서 로그인 상태 확인', async () => {
      console.log('📝 새 탭에서 로그인 상태 확인 시작...');
      try {
        // 새 탭으로 포커스 이동
        await newPage.bringToFront();
        
        // 로그인 상태 확인 (예: 사용자 메뉴 또는 로그아웃 버튼 존재 확인)
        // Trombone 특성에 맞게 로그인 확인 요소를 선택
        await newPage.waitForSelector('body', { timeout: 5000 });
        
        // 현재 URL이 로그인 페이지가 아닌지 확인
        const currentURL = newPage.url();
        expect(currentURL).not.toContain('/login');
        
        console.log('✅ 새 탭에서 로그인 상태 확인 성공');
      } catch (error) {
        console.log('❌ 새 탭에서 로그인 상태 확인 실패');
        throw error;
      }
    });

    console.log('🏁 새로운 탭에서 Trombone 로그인 테스트 완료\n');
  });
}); 