import fs from 'fs';
import path from 'path';

/**
 * 설정 파일 동적 업데이트 유틸리티
 */
class ConfigUpdater {
  /**
   * 시나리오별 설정 파일 경로 가져오기
   * @param {number} scenarioId - 시나리오 ID
   * @returns {string} 설정 파일 경로
   */
  static getConfigPath(scenarioId) {
    const configPath = path.join(__dirname, `../../config/scenario/test-settings-${scenarioId}.json`);
    const defaultConfigPath = path.join(__dirname, '../../config/test-settings.json');
    
    // 시나리오별 설정 파일이 존재하는지 확인
    if (fs.existsSync(configPath)) {
      return configPath;
    } else {
      return defaultConfigPath;
    }
  }

  /**
   * 설정 파일 읽기
   * @param {number} scenarioId - 시나리오 ID
   * @returns {Object} 설정 객체
   */
  static loadConfig(scenarioId) {
    const configPath = this.getConfigPath(scenarioId);
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      // 동적으로 생성되는 값들
      config.repository.group = config.project.code;
      return config;
    } catch (error) {
      console.error('설정 파일 읽기 실패:', error.message);
      throw error;
    }
  }

  /**
   * 설정 파일 업데이트
   * @param {number} scenarioId - 시나리오 ID
   * @param {Object} updatedConfig - 업데이트할 설정 객체
   */
  static updateConfig(scenarioId, updatedConfig) {
    const configPath = this.getConfigPath(scenarioId);
    
    try {
      // 기존 설정 파일 읽기
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      
      // 업데이트된 값들 병합
      config = { ...config, ...updatedConfig };
      
      // 설정 파일 저장
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      
      console.log(`✅ 설정 파일 업데이트 완료: ${configPath}`);
    } catch (error) {
      console.error('설정 파일 업데이트 실패:', error.message);
      throw error;
    }
  }

  /**
   * 업무코드 관련 설정 업데이트
   * @param {number} scenarioId - 시나리오 ID
   * @param {string} taskCode - 새로운 업무코드
   * @param {string} taskName - 새로운 업무명
   */
  static updateTaskCodeConfig(scenarioId, taskCode, taskName) {
    const updatedConfig = {
      project: {
        code: taskCode,
        name: taskName
      }
    };
    
    this.updateConfig(scenarioId, updatedConfig);
  }

  /**
   * 모든 관련 설정 업데이트 (업무코드, 저장소, 사용자 정보 등)
   * @param {number} scenarioId - 시나리오 ID
   * @param {Object} dynamicConfig - 동적 생성된 설정 객체
   */
  static updateAllConfig(scenarioId, dynamicConfig) {
    const updatedConfig = {
      project: dynamicConfig.project,
      repository: dynamicConfig.repository,
      user: dynamicConfig.user
    };
    
    ConfigUpdater.updateConfig(scenarioId, updatedConfig);
  }
}

export default ConfigUpdater; 