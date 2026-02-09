// 기본 매니저 클래스 - 공통 기능 제공
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BaseManager {
  constructor(utils) {
    this.utils = utils;
  }

  // 스크린샷 캡처 함수 - 모든 매니저 클래스에서 공통 사용
  async captureScreenshot(stepName, scenarioId = null, suffix = '') {
    try {
      // 시나리오 ID가 전달되지 않으면 현재 실행 중인 시나리오 감지
      if (!scenarioId) {
        scenarioId = this.detectCurrentScenario();
      }
      
      console.log(`📸 스크린샷 캡처 시작: ${stepName} (시나리오 ${scenarioId})`);
      
      // UI 안정화를 위해 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = suffix ? `screenshot-${stepName}-${suffix}-${timestamp}.png` : `screenshot-${stepName}-${timestamp}.png`;
      const screenshotPath = path.join(__dirname, `../../custom-reports/scenario-${scenarioId}`, fileName);
      
      console.log(`📁 스크린샷 저장 경로: ${screenshotPath}`);
      
      // 디렉토리가 없으면 생성
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 디렉토리 생성: ${dir}`);
      }
      
      // utils.page 확인
      if (!this.utils || !this.utils.page) {
        console.error(`❌ this.utils.page가 없습니다! this.utils: ${this.utils}`);
        throw new Error('this.utils.page가 null이거나 undefined입니다.');
      }
      
      // 스크린샷 찍기
      await this.utils.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`✅ 스크린샷 저장 성공: ${fileName}`);
      return screenshotPath;
    } catch (error) {
      console.error(`❌ 스크린샷 저장 실패 (${stepName}): ${error.message}`);
      console.error(`   스택: ${error.stack}`);
      return null;
    }
  }

  // 현재 실행 중인 시나리오 감지
  detectCurrentScenario() {
    try {
      // 스택 트레이스를 통해 현재 실행 중인 시나리오 파일명 확인
      const stack = new Error().stack;
      const scenarioMatch = stack.match(/scenario-(\d+)\.spec\.js/);
      
      if (scenarioMatch) {
        const scenarioId = parseInt(scenarioMatch[1]);
        console.log(`🔍 감지된 시나리오 ID: ${scenarioId}`);
        return scenarioId;
      }
      
      // 감지 실패 시 기본값 1 반환
      console.log(`⚠️ 시나리오 ID 감지 실패, 기본값 1 사용`);
      return 1;
    } catch (error) {
      console.log(`⚠️ 시나리오 ID 감지 중 오류, 기본값 1 사용: ${error.message}`);
      return 1;
    }
  }

  // 성공 시 스크린샷 캡처
  async captureSuccessScreenshot(stepName, scenarioId = 1) {
    return await this.captureScreenshot(stepName, scenarioId, '완료');
  }

  // 실패 시 스크린샷 캡처 (즉시 캡처)
  async captureFailureScreenshot(stepName, scenarioId = 1) {
    try {
      // 시나리오 ID가 전달되지 않으면 현재 실행 중인 시나리오 감지
      if (!scenarioId) {
        scenarioId = this.detectCurrentScenario();
      }
      
      console.log(`📸 ${stepName} 실패 순간 스크린샷 촬영 중...`);
      
      // 실패 상태 캡처를 위해 0.5초만 대기 (즉시 캡처)
      console.log(`⏳ 실패 상태 캡처를 위해 0.5초 대기 중...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `screenshot-${stepName}-실패-${timestamp}.png`;
      const screenshotPath = path.join(__dirname, `../../custom-reports/scenario-${scenarioId}`, fileName);
      
      // 디렉토리가 없으면 생성
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 스크린샷 찍기 (완료까지 대기)
      await this.utils.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`✅ ${stepName} 실패 순간 스크린샷 저장 완료: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error(`❌ 실패 스크린샷 저장 실패: ${error.message}`);
      return null;
    }
  }

  // 단계별 재시도 실행 메서드 (새로 추가)
  async executeStepsWithRetry(steps, maxRetries = 3) {
    console.log(`🚀 ${steps.length}개 단계를 순차적으로 실행합니다...`);
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`📋 단계 ${i + 1}/${steps.length}: ${step.name}`);
      
      await this.executeWithRetry(
        step.function,
        step.name,
        maxRetries
      );
      
      console.log(`✅ 단계 ${i + 1} 완료: ${step.name}`);
    }
    
    console.log(`🎉 모든 단계가 성공적으로 완료되었습니다!`);
  }

  // 재시도 로직이 포함된 실행 메서드
  async executeWithRetry(operation, operationName, maxRetries = 3, verificationFn = null) {
    let lastError = null;
    let attempt = 1;
    
    while (attempt <= maxRetries) {
      try {
        console.log(`🔄 ${operationName} 실행 시도 ${attempt}/${maxRetries}`);
        
        // 실제 작업 실행
        const result = await operation();
        
        // 검증 함수가 있으면 결과 검증
        if (verificationFn) {
          const isValid = await verificationFn(result);
          if (!isValid) {
            throw new Error(`${operationName} 검증 실패: 결과가 예상과 다릅니다.`);
          }
        }
        
        console.log(`✅ ${operationName} 성공 (시도 ${attempt}/${maxRetries})`);
        return result;
        
      } catch (error) {
        lastError = error;
        console.log(`❌ ${operationName} 실패 (시도 ${attempt}/${maxRetries}): ${error.message}`);
        
        if (attempt < maxRetries) {
          console.log(`⏳ 2초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        attempt++;
      }
    }
    
    // 수동으로 닫힌 테스트인지 확인
    const isManuallyClosed = global.manuallyClosedTests && global.manuallyClosedTests.has('scenario-1');
    
    if (isManuallyClosed) {
      console.log(`💥 ${operationName} 수동 중단: ${maxRetries}번의 시도 중 중단됨`);
      await this.captureFailureScreenshot(operationName);
      this.logFailure(operationName, lastError);
      throw new Error(`${operationName} 수동 중단: ${lastError.message}`);
    } else {
      // 모든 재시도 실패 시 실패 스크린샷 캡처
      console.log(`💥 ${operationName} 최종 실패: ${maxRetries}번의 시도 모두 실패`);
      await this.captureFailureScreenshot(operationName);
      
      // 실패 로그 기록
      this.logFailure(operationName, lastError);
      
      throw new Error(`${operationName} 실패: ${maxRetries}번의 시도 모두 실패. 마지막 오류: ${lastError?.message || 'Unknown error'}`);
    }
  }

  // 실패 로그 기록
  logFailure(operationName, error) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      operation: operationName,
      error: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      // 추가 상세 정보
      errorType: error?.constructor?.name || 'UnknownError',
      fullError: error?.toString() || 'Error object is null or undefined',
      // 시나리오 정보 추가
      scenarioId: this.detectCurrentScenario(),
      // 브라우저 상태 정보
      pageUrl: this.utils?.page?.url() || 'unknown',
      pageTitle: this.utils?.page?.title() || 'unknown'
    };
    
    // 전역 실패 로그에 추가 (커스텀 리포트에서 사용)
    if (!global.failureLogs) {
      global.failureLogs = [];
    }
    global.failureLogs.push(logEntry);
    
    console.log(`📝 실패 로그 기록: ${operationName} - ${error?.message || 'Unknown error'}`);
  }

  // 페이지에서 특정 텍스트가 나타나는지 확인하는 검증 함수
  async verifyTextAppears(text, timeout = 5000) {
    try {
      await this.utils.page.waitForSelector(`text=${text}`, { timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 페이지에서 특정 요소가 사라지는지 확인하는 검증 함수
  async verifyElementDisappears(selector, timeout = 5000) {
    try {
      await this.utils.page.waitForSelector(selector, { state: 'detached', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 성공 메시지나 완료 표시가 나타나는지 확인하는 검증 함수
  async verifySuccessMessage(successTexts = ['성공', '완료', '등록', '생성', '저장']) {
    try {
      for (const text of successTexts) {
        const isVisible = await this.verifyTextAppears(text, 2000);
        if (isVisible) {
          console.log(`✅ 성공 메시지 확인: "${text}"`);
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // 페이지 전체를 렌더링하기 위해 끝까지 스크롤
  async forceRenderFullPage() {
    try {
      console.log('📜 페이지 전체 렌더링을 위해 스크롤 중...');
      
      // 페이지 끝까지 스크롤
      await this.utils.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // 렌더링 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 다시 맨 위로
      await this.utils.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      // 안정화 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ 페이지 전체 렌더링 완료');
      return true;
    } catch (error) {
      console.warn(`⚠️ 전체 페이지 렌더링 실패: ${error.message}`);
      return false;
    }
  }

  // 색상으로 요소를 찾는 유틸리티 메서드
  async findElementByColor(selector, color, options = {}) {
    try {
      const { timeout = 5000, exact = false } = options;
      
      // 다양한 색상 형식으로 시도
      const colorVariations = [
        color, // 원본 색상
        color.replace('#', ''), // # 제거
        color.replace('#', 'rgb(') + ')', // RGB 변환 시도
        color.replace('#', 'rgba(') + ', 1)', // RGBA 변환 시도
      ];
      
      // CSS 속성 패턴들
      const stylePatterns = [
        `color: ${color}`,
        `color:${color}`,
        `color: ${color.replace('#', '')}`,
        `color:${color.replace('#', '')}`,
      ];
      
      // RGB 변환 시도
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        stylePatterns.push(`color: rgb(${r}, ${g}, ${b})`);
        stylePatterns.push(`color:rgb(${r}, ${g}, ${b})`);
      }
      
      // 각 패턴으로 시도
      for (const pattern of stylePatterns) {
        try {
          const locator = this.utils.page.locator(`${selector}[style*="${pattern}"]`);
          if (exact) {
            const element = await locator.first();
            if (await element.isVisible()) {
              console.log(`✅ 색상으로 요소 찾기 성공: ${pattern}`);
              return element;
            }
          } else {
            const element = await locator.first();
            if (await element.isVisible()) {
              console.log(`✅ 색상으로 요소 찾기 성공: ${pattern}`);
              return element;
            }
          }
        } catch (error) {
          // 다음 패턴 시도
          continue;
        }
      }
      
      throw new Error(`색상 ${color}으로 요소를 찾을 수 없습니다.`);
    } catch (error) {
      console.log(`❌ 색상으로 요소 찾기 실패: ${error.message}`);
      throw error;
    }
  }
}

export default BaseManager;
