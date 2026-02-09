import fs from 'fs';

// 파이프라인 관리 클래스
import BaseManager from './BaseManager.js';

class PipelineManager extends BaseManager {
  constructor(utils) {
    super(utils);
  }

  // 파이프라인 메뉴 접근
  async navigateToPipelineMenu() {
    try {
      await this.utils.clickSubMenuOnly('파이프라인 관리');
      console.log('파이프라인 메뉴에 성공적으로 접근했습니다.');
    } catch (error) {
      console.error('파이프라인 메뉴 접근 실패:', error.message);
      throw new Error(`파이프라인 메뉴 접근 실패: ${error.message}`);
    }
  }

  // 파이프라인 등록 화면 열기
  async openPipelineRegistrationForm() {
    try {
      await this.utils.clickRegister();
      console.log('파이프라인 등록 화면을 성공적으로 열었습니다.');
    } catch (error) {
      console.error('파이프라인 등록 화면 열기 실패:', error.message);
      throw new Error(`파이프라인 등록 화면 열기 실패: ${error.message}`);
    }
  }

  // 파이프라인 기본 정보 입력
  async fillPipelineBasicInfo(pipelineName, config) {
    try {
      await this.utils.fillInput('#pplnNm', pipelineName);
      await this.utils.wait(1000); // 파이프라인 이름 입력 후 1초 대기
      
      const taskCodeText = `${config.project.name}(${config.project.code})`;
      await this.utils.fillInput('#root > div > main > div > div.box-content-wrap > form > div > div > div:nth-child(1) > div.table-wrap.mgt-base > table > tbody > tr:nth-child(1) > td:nth-child(4) > div > div > div > input', taskCodeText);
      await this.utils.wait(2000); // 업무코드 입력 후 1초 대기
      
      await this.utils.fillInput('#root > div > main > div > div.box-content-wrap > form > div > div > div:nth-child(1) > div.table-wrap.mgt-base > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > div > div > input', config.repository.name);
      await this.utils.wait(2000); // 저장소 이름 입력 후 1초 대기
      await this.utils.page.click('#root > div > main > div > div.box-content-wrap > form > div > div > div:nth-child(1) > div.table-wrap.mgt-base > table > tbody > tr:nth-child(2) > td:nth-child(4) > div > div > div > button');
      
      console.log('파이프라인 기본 정보를 성공적으로 입력했습니다.');
    } catch (error) {
      console.error('파이프라인 기본 정보 입력 실패:', error.message);
      throw new Error(`파이프라인 기본 정보 입력 실패: ${error.message}`);
    }
  }

  // 파이프라인 환경 설정 및 저장
  async configureAndSavePipeline(environment, pipelineFile) {
    try {
      const exists = await this.utils.elementExists(`text=${environment}`);
      
      if (exists) {
        await this.utils.page.click(`text=${environment}`);
        
        const pipelineContent = fs.readFileSync(pipelineFile, 'utf8');
        await this.utils.fillMonacoEditor(pipelineContent);
        
        await this.utils.saveAndConfirm();
        console.log(`${environment} 파이프라인이 정상적으로 등록되었습니다.`);
        await this.utils.wait(5000);
        
        return { success: true, message: '새로 등록됨' };
      } else {
        // 파이프라인이 이미 등록되어 있는 경우도 성공으로 처리
        await this.utils.cancelAndConfirm();
        console.log(`${environment} 파이프라인이 이미 등록되어 있습니다.`);
        await this.utils.wait(1000);
        
        return { success: true, message: '이미 등록됨' };
      }
    } catch (error) {
      console.error('파이프라인 환경 설정 및 저장 실패:', error.message);
      throw new Error(`파이프라인 환경 설정 및 저장 실패: ${error.message}`);
    }
  }

  // 파이프라인 생성 (단계별 재시도 적용)
  async createPipeline(pipelineName, environment, pipelineFile, config) {
    try {
      // 각 단계별로 개별 재시도 실행
      await this.executeWithRetry(() => this.navigateToPipelineMenu(), '파이프라인 메뉴 접근', 3);
      await this.executeWithRetry(() => this.openPipelineRegistrationForm(), '파이프라인 등록 화면 열기', 3);
      await this.executeWithRetry(() => this.fillPipelineBasicInfo(pipelineName, config), '파이프라인 기본 정보 입력', 3);
      await this.executeWithRetry(() => this.configureAndSavePipeline(environment, pipelineFile), '파이프라인 환경 설정 및 저장', 3);
      
      await this.captureSuccessScreenshot(`${environment}-파이프라인-등록`);
      return { success: true, message: '파이프라인 등록 완료' };
      
    } catch (error) {
      console.error('파이프라인 등록 중 오류 발생:', error.message);
      
      await this.captureFailureScreenshot(`${environment}-파이프라인-등록`);
      throw error;
    }
  }
}

export default PipelineManager; 