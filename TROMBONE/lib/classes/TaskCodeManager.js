// 업무 코드 관리 클래스
import { expect } from '@playwright/test';
import ConfigUpdater from '../utils/config-updater.js';
import BaseManager from './BaseManager.js';

class TaskCodeManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  /**
   * 중복되지 않는 업무코드 생성
   * @param {string} prefix - 업무코드 접두사 (예: 'TEST')
   * @param {number} min - 최소 숫자 (기본값: 0)
   * @param {number} max - 최대 숫자 (기본값: 9999)
   * @returns {string} 생성된 업무코드
   */
  generateUniqueTaskCode(prefix = 'LYH', min = 0, max = 9999) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return `${prefix}${randomNum.toString().padStart(4, '0')}`;
  }

  /**
   * 업무코드 중복 확인
   * @param {string} taskCode - 확인할 업무코드
   * @param {string} taskName - 확인할 업무명
   * @returns {boolean} 중복 여부 (true: 중복됨, false: 중복되지 않음)
   */
  async checkTaskCodeExists(taskCode, taskName) {
    try {
      // 업무코드 입력
      await this.utils.fillInput('#taskCd', taskCode);
      
      // 업무명 입력
      const taskNameSelectors = [
        '#taskNm',
        'input[name="taskNm"]',
        'input[placeholder*="업무명"]',
        'input[placeholder*="업무명을"]',
        'input[placeholder*="업무명을 입력"]'
      ];
      
      let taskNameInput = null;
      for (const selector of taskNameSelectors) {
        try {
          taskNameInput = this.utils.page.locator(selector);
          if (await taskNameInput.isVisible()) {
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (taskNameInput) {
        await taskNameInput.click();
        await taskNameInput.fill(taskName);
      }
      
      // 저장 버튼 상태 확인 - getByRole 사용
      const saveButton = this.utils.page.getByRole('button', { name: '저장' });
      await expect(saveButton).toBeVisible();
      const isDisabled = await saveButton.isDisabled();
      
      return isDisabled; // 저장 버튼이 비활성화되면 중복됨
    } catch (error) {
      console.error('업무코드 중복 확인 실패:', error.message);
      return false; // 에러 발생 시 중복되지 않은 것으로 간주
    }
  }

  /**
   * 중복되지 않는 업무코드 찾기
   * @param {string} prefix - 업무코드 접두사
   * @param {number} maxAttempts - 최대 시도 횟수 (기본값: 100)
   * @returns {string} 중복되지 않는 업무코드
   */
  async findUniqueTaskCode(prefix = 'LYH', maxAttempts = 100) {
    console.log(`🔍 중복되지 않는 업무코드 찾는 중... (접두사: ${prefix})`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const taskCode = this.generateUniqueTaskCode(prefix);
      const taskName = `${taskCode} 업무코드`;
      
      const exists = await this.checkTaskCodeExists(taskCode, taskName);
      
      if (!exists) {
        console.log(`✅ 중복되지 않는 업무코드 발견: ${taskCode}`);
        return taskCode;
      }
      
      // 중복된 경우 조용히 다시 시도 (로그 출력 제거)
    }
    
    throw new Error(`${maxAttempts}번 시도했지만 중복되지 않는 업무코드를 찾을 수 없습니다.`);
  }

  // 업무 코드 메뉴 접근
  async navigateToTaskCodeMenu() {
    try {
      await this.utils.clickSubMenuFirst('즐겨찾기0 0 24', '업무 코드');
      console.log('업무 코드 메뉴에 성공적으로 접근했습니다.');
    } catch (error) {
      console.error('업무 코드 메뉴 접근 실패:', error.message);
      throw new Error(`업무 코드 메뉴 접근 실패: ${error.message}`);
    }
  }

  // 업무 코드 등록 화면 열기
  async openRegistrationForm() {
    try {
      await this.utils.clickRegister();
      console.log('업무 코드 등록 화면을 성공적으로 열었습니다.');
    } catch (error) {
      console.error('업무 코드 등록 화면 열기 실패:', error.message);
      throw new Error(`업무 코드 등록 화면 열기 실패: ${error.message}`);
    }
  }

  // 업무 코드 정보 입력 (동적 업무코드 사용)
  async fillTaskCodeInfo(config) {
    try {
      // 중복되지 않는 업무코드 찾기 (이미 업무코드와 업무명이 입력되어 있음)
      const uniqueTaskCode = await this.findUniqueTaskCode('LYH');
      const taskName = `${uniqueTaskCode} 업무코드`;
      
      console.log(`✅ 최종 선택된 업무코드: ${uniqueTaskCode}`);
      console.log(`✅ 최종 선택된 업무명: ${taskName}`);
      
      console.log('업무 코드 정보 입력이 완료되었습니다.');
      
      // 모든 관련 필드 동적 생성
      const dynamicConfig = this.generateDynamicConfig(uniqueTaskCode);
      
      // config 객체 업데이트 (설정 파일 동적 업데이트를 위해)
      Object.assign(config, dynamicConfig);
      
      // 설정 파일 동적 업데이트
      try {
        ConfigUpdater.updateAllConfig(1, dynamicConfig); // 시나리오 1로 고정
        console.log(`📁 설정 파일에 모든 정보 업데이트 완료: ${uniqueTaskCode}`);
      } catch (error) {
        console.warn('⚠️ 설정 파일 업데이트 실패:', error.message);
      }
      
      return { taskCode: uniqueTaskCode, taskName: taskName, config: dynamicConfig };
    } catch (error) {
      console.error('업무 코드 정보 입력 실패:', error.message);
      throw new Error(`업무 코드 정보 입력 실패: ${error.message}`);
    }
  }

  /**
   * 업무코드 기반으로 모든 관련 설정 동적 생성
   * @param {string} taskCode - 업무코드
   * @returns {Object} 동적 생성된 설정 객체
   */
  generateDynamicConfig(taskCode) {
    const lowerTaskCode = taskCode.toLowerCase();
    
    return {
      project: {
        code: taskCode,
        name: `${taskCode} 업무코드`
      },
      repository: {
        name: `${taskCode}-REPO`,
        group: taskCode
      },
      user: {
        id: lowerTaskCode,
        name: `이영한${taskCode.slice(-4)}`, // 뒤 4자리만 사용
        email: `${lowerTaskCode}@okestro.com`,
        level: '개발자' // 기본 레벨 설정
      }
    };
  }

  // 업무 코드 저장 및 확인 (동적 업무코드 사용)
  async saveAndVerifyTaskCode(config) {
    try {
      // 저장 버튼의 상태 확인 - getByRole 사용
      const saveButton = this.utils.page.getByRole('button', { name: '저장' });
      await expect(saveButton).toBeVisible();
      const isDisabled = await saveButton.isDisabled();
      
      console.log(`저장 버튼 상태: ${isDisabled ? '비활성화' : '활성화'}`);
      
      if (!isDisabled) {
        // 저장 버튼이 활성화되어 있으면 저장 진행
        await this.utils.saveAndConfirm();
        // 성공 메시지가 실제로 화면에 표시되는지 검증
        await expect(this.utils.page.getByText('성공')).toBeVisible();
        console.log(`${config.project.code} 업무코드를 성공적으로 등록했습니다.`);
      } else {
        // 저장 버튼이 비활성화되어 있으면 업무코드가 이미 존재하는 것으로 판단
        console.log(`${config.project.code} 업무코드가 이미 존재합니다.`);
        
        // 중복된 경우 새로운 업무코드로 다시 시도
        console.log('🔄 새로운 업무코드로 다시 시도합니다...');
        
        // 현재 입력된 업무코드 지우기
        await this.utils.fillInput('#taskCd', '');
        
                 // 새로운 중복되지 않는 업무코드 찾기 (이미 업무코드와 업무명이 입력되어 있음)
         const uniqueTaskCode = await this.findUniqueTaskCode('LYH');
         const taskName = `${uniqueTaskCode} 업무코드`;
         
         console.log(`✅ 재시도 - 최종 선택된 업무코드: ${uniqueTaskCode}`);
         console.log(`✅ 재시도 - 최종 선택된 업무명: ${taskName}`);
         
         // 모든 관련 필드 동적 생성
         const dynamicConfig = this.generateDynamicConfig(uniqueTaskCode);
         
         // config 객체 업데이트
         Object.assign(config, dynamicConfig);
         
         // 설정 파일 동적 업데이트
         try {
           ConfigUpdater.updateAllConfig(1, dynamicConfig);
           console.log(`📁 설정 파일에 모든 정보 업데이트 완료: ${uniqueTaskCode}`);
         } catch (error) {
           console.warn('⚠️ 설정 파일 업데이트 실패:', error.message);
         }
        
        // 재귀적으로 다시 저장 시도
        return await this.saveAndVerifyTaskCode(config);
      }
    } catch (error) {
      console.error('업무코드 저장 및 확인 실패:', error.message);
      
      // 에러 발생 시 취소 시도
      try {
        await this.utils.cancelAndConfirm();
        console.log('오류로 인해 등록을 취소했습니다.');
      } catch (cancelError) {
        console.error('취소 중에도 오류 발생:', cancelError.message);
      }
      
      throw new Error(`업무코드 저장 및 확인 실패: ${error.message}`);
    }
  }



  // 기존 메서드 (하위 호환성을 위해 유지) - 단계별 재시도 적용
  async createTaskCode(config) {
    try {
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToTaskCodeMenu(), '업무코드 메뉴 접근', 3);
      await this.executeWithRetry(() => this.openRegistrationForm(), '업무코드 등록 화면 열기', 3);
      await this.executeWithRetry(() => this.fillTaskCodeInfo(config), '업무코드 정보 입력', 3);
      await this.executeWithRetry(() => this.saveAndVerifyTaskCode(config), '업무코드 저장 및 확인', 3);
      
      await this.captureSuccessScreenshot('업무코드-등록');
      return { success: true, message: '업무코드 등록 완료' };
      
    } catch (error) {
      console.error('업무코드 등록 실패:', error.message);
      throw error;
    }
  }
}

export default TaskCodeManager; 