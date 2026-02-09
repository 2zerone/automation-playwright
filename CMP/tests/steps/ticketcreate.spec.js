import { fileURLToPath } from 'url';
import path from 'path';
import { test, expect } from '@playwright/test';
import fs from 'fs';
  import utils from '../../lib/classes/TromboneUtils.js';
    import LoginManager from '../../lib/classes/LoginManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// 설정 파일에서 데이터를 읽어오는 함수
function loadTestSettings() {
  try {
    const settingsPath = path.join(__dirname, '../../config/test-settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return settings;
  } catch (error) {
    console.error('테스트 설정 로드 실패:', error);
    return {
      project: { code: "LYH007", name: "LYH 업무코드" },
      repository: { name: "LYH-REPO" },
      user: { id: "yh.lee6", name: "이영한", email: "yh.lee6@okestro.com" },
      gitlab: { username: "yh.lee6", password: "password123" }
    };
  }
}

// 매니저 클래스들을 초기화하는 함수
function initializeManagers(page) {
  const tromboneUtils = new utils(page);
  
  return {
    utils: tromboneUtils,
    ticketCreateManager: new (require('../../lib/classes/TicketCreateManager'))(tromboneUtils),
    gitlabManager: new (require('../../lib/classes/GitLabManager'))(page)
  };
}

// 대메뉴: 티켓 생성
test.describe.serial('티켓 생성', () => {
  let page, config, managers;
  
  test.beforeAll(async ({ browser }) => {
    // 브라우저 페이지 생성
    page = await browser.newPage();
    
    // 설정 로드
    config = loadTestSettings();
    
    // 매니저 초기화
    managers = initializeManagers(page);
    
    // 로그인
    const loginManager = new LoginManager(page);
    await loginManager.login(config);
  });
  
  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });
  
  // 중메뉴: 티켓 관리 메뉴 접근
  test.describe.serial('티켓 관리 메뉴 접근', () => {
    test('상세결과', async () => {
      console.log('📝 티켓 관리 메뉴 접근 시작...');
      
      try {
        await managers.ticketCreateManager.navigateToTicketMenu();
        console.log('✅ 티켓 관리 메뉴 접근 성공');
      } catch (error) {
        console.log('❌ 티켓 관리 메뉴 접근 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 티켓 등록 화면 열기
  test.describe.serial('티켓 등록 화면 열기', () => {
    test('상세결과', async () => {
      console.log('📝 티켓 등록 화면 열기 시작...');
      
      try {
        await managers.ticketCreateManager.openTicketRegistrationForm();
        console.log('✅ 티켓 등록 화면 열기 성공');
      } catch (error) {
        console.log('❌ 티켓 등록 화면 열기 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 티켓 기본 정보 입력
  test.describe.serial('티켓 기본 정보 입력', () => {
    test('상세결과', async () => {
      console.log('📝 티켓 기본 정보 입력 시작...');
      
      try {
        await managers.ticketCreateManager.fillTicketBasicInfo(config);
        console.log('✅ 티켓 기본 정보 입력 성공');
      } catch (error) {
        console.log('❌ 티켓 기본 정보 입력 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 워크플로우 및 결재 정보 설정
  test.describe.serial('워크플로우 및 결재 정보 설정', () => {
    test('상세결과', async () => {
      console.log('📝 워크플로우 및 결재 정보 설정 시작...');
      
      try {
        await managers.ticketCreateManager.configureWorkflowAndApproval();
        console.log('✅ 워크플로우 및 결재 정보 설정 성공');
      } catch (error) {
        console.log('❌ 워크플로우 및 결재 정보 설정 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 개발 담당자 및 배포 예정일 설정
  test.describe.serial('개발 담당자 및 배포 예정일 설정', () => {
    test('상세결과', async () => {
      console.log('📝 개발 담당자 및 배포 예정일 설정 시작...');
      
      try {
        await managers.ticketCreateManager.configureDeveloperAndDeploymentDate(config);
        console.log('✅ 개발 담당자 및 배포 예정일 설정 성공');
      } catch (error) {
        console.log('❌ 개발 담당자 및 배포 예정일 설정 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 릴리즈 노트 입력
  test.describe.serial('릴리즈 노트 입력', () => {
    test('상세결과', async () => {
      console.log('📝 릴리즈 노트 입력 시작...');
      
      try {
        await managers.ticketCreateManager.fillReleaseNotes(config);
        console.log('✅ 릴리즈 노트 입력 성공');
      } catch (error) {
        console.log('❌ 릴리즈 노트 입력 실패');
        throw error;
      }
    });
  });

  // 중메뉴: GitLab에서 랜덤 브랜치 생성
  test.describe.serial('GitLab 랜덤 브랜치 생성', () => {
    test('상세결과', async () => {
      console.log('📝 GitLab에서 랜덤 브랜치 생성 시작...');
      
      try {
        await managers.gitlabManager.loginAndCreateBranchInNewTab(config);
        const randomBranchName = managers.gitlabManager.getRandomBranchName();
        console.log(`✅ GitLab 랜덤 브랜치 생성 성공: ${randomBranchName}`);
      } catch (error) {
        console.log('❌ GitLab 랜덤 브랜치 생성 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 저장소 및 브랜치 선택
  test.describe.serial('저장소 및 브랜치 선택', () => {
    test('상세결과', async () => {
      console.log('📝 저장소 및 브랜치 선택 시작...');
      
      try {
        const randomBranchName = managers.gitlabManager.getRandomBranchName();
        await managers.ticketCreateManager.selectRepositoryAndBranch(config, randomBranchName);
        console.log(`✅ 저장소 및 브랜치 선택 성공: ${randomBranchName}`);
      } catch (error) {
        console.log('❌ 저장소 및 브랜치 선택 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 티켓 저장
  test.describe.serial('티켓 저장', () => {
    test('상세결과', async () => {
      console.log('📝 티켓 저장 시작...');
      
      try {
        await managers.ticketCreateManager.saveTicket();
        console.log('✅ 티켓 저장 성공');
      } catch (error) {
        console.log('❌ 티켓 저장 실패');
        throw error;
      }
    });
  });

  // 전체 티켓 생성 프로세스 (통합 테스트)
  test.describe.serial('전체 티켓 생성 프로세스', () => {
    test('상세결과', async () => {
      console.log('📝 전체 티켓 생성 프로세스 시작...');
      
      try {
        await managers.ticketCreateManager.createTicket(config, managers.gitlabManager);
        console.log('✅ 전체 티켓 생성 프로세스 성공');
      } catch (error) {
        console.log('❌ 전체 티켓 생성 프로세스 실패');
        throw error;
      }
    });
  });
});
