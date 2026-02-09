import { test, expect } from '@playwright/test';

// 대메뉴: 업무코드 등록
test.describe.serial('업무코드 등록', () => {
  
  // 중메뉴: 업무 코드 메뉴 접근
  test.describe.serial('업무 코드 메뉴 접근', () => {
    test('상세결과', async () => {
      console.log('📝 업무 코드 메뉴 접근 시작...');
      
      try {
        await global.managers.taskCodeManager.navigateToTaskCodeMenu();
        console.log('✅ 업무 코드 메뉴 접근 성공');
      } catch (error) {
        console.log('❌ 업무 코드 메뉴 접근 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 업무 코드 등록 화면 열기
  test.describe.serial('업무 코드 등록 화면 열기', () => {
    test('상세결과', async () => {
      console.log('📝 업무 코드 등록 화면 열기 시작...');
      
      try {
        await global.managers.taskCodeManager.openRegistrationForm();
        console.log('✅ 업무 코드 등록 화면 열기 성공');
      } catch (error) {
        console.log('❌ 업무 코드 등록 화면 열기 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 업무 코드 정보 입력
  test.describe.serial('업무 코드 정보 입력', () => {
    test('상세결과', async () => {
      console.log('📝 업무 코드 정보 입력 시작...');
      
      try {
        await global.managers.taskCodeManager.fillTaskCodeInfo(global.config);
        console.log('✅ 업무 코드 정보 입력 성공');
      } catch (error) {
        console.log('❌ 업무 코드 정보 입력 실패');
        throw error;
      }
    });
  });

  // 중메뉴: 업무 코드 저장 및 확인
  test.describe.serial('업무 코드 저장 및 확인', () => {
    test('상세결과', async () => {
      console.log('📝 업무 코드 저장 및 확인 시작...');
      
      try {
        await global.managers.taskCodeManager.saveAndVerifyTaskCode(global.config);
        console.log('✅ 업무 코드 저장 및 확인 성공');
      } catch (error) {
        console.log('❌ 업무 코드 저장 및 확인 실패');
        throw error;
      }
    });
  });
}); 