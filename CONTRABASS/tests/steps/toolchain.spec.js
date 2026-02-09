import { test, expect } from '@playwright/test';

// 대메뉴: 툴체인 관리
test.describe.serial('툴체인 관리', () => {
  
  // 중메뉴: 툴체인 메뉴 접근
  test.describe.serial('툴체인 메뉴 접근', () => {
    test('상세결과', async () => {
      console.log('📝 툴체인 메뉴 접근 시작...');
      
      try {
        await global.managers.toolchainManager.navigateToToolchainMenu();
        console.log('✅ 툴체인 메뉴 접근 성공');
      } catch (error) {
        console.log('❌ 툴체인 메뉴 접근 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 툴체인 등록 화면 열기
  test.describe.serial('툴체인 등록 화면 열기', () => {
    test('상세결과', async () => {
      console.log('📝 툴체인 등록 화면 열기 시작...');
      
      try {
        await global.managers.toolchainManager.openRegistrationForm();
        console.log('✅ 툴체인 등록 화면 열기 성공');
      } catch (error) {
        console.log('❌ 툴체인 등록 화면 열기 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 툴체인 기본 정보 입력
  test.describe.serial('툴체인 기본 정보 입력', () => {
    test('상세결과', async () => {
      console.log('📝 툴체인 기본 정보 입력 시작...');
      
      try {
        await global.managers.toolchainManager.fillBasicInfo(global.config);
        console.log('✅ 툴체인 기본 정보 입력 성공');
      } catch (error) {
        console.log('❌ 툴체인 기본 정보 입력 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 툴체인 저장 및 확인
  test.describe.serial('툴체인 저장 및 확인', () => {
    test('상세결과', async () => {
      console.log('📝 툴체인 저장 및 확인 시작...');
      
      try {
        await global.managers.toolchainManager.saveAndVerifyToolchain(global.config);
        console.log('✅ 툴체인 저장 및 확인 성공');
      } catch (error) {
        console.log('❌ 툴체인 저장 및 확인 실패');
        throw error;
      }
    });
  });
}); 