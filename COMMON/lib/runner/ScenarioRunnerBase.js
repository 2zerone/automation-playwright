#!/usr/bin/env node
/**
 * COMMON/lib/runner/ScenarioRunnerBase.js
 * 
 * 보수적 리팩터링: 4개 제품(TROMBONE, CMP, CONTRABASS, VIOLA) 공통 시나리오 실행기
 * 
 * 원칙:
 * - 퍼블릭 API/CLI/출력/로그/에러 메시지/파일명/경로 100% 동일 유지
 * - lib/classes는 각 제품별로 유지 (비즈니스 로직은 제품 고유)
 * - I/O(파일/네트워크/시간/랜덤/IPC)는 DI 패턴으로 격리
 * - A/B 토글: REFACTOR_CORE=0(기존), 1(신규) 환경변수로 제어
 * 
 * 변경이력:
 * - 2025-10-13: 초기 생성 (TROMBONE electron-scenario-runner.js 604줄 기반)
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export class ScenarioRunnerBase {
  /**
   * @param {Object} productConfig - 제품별 설정
   * @param {string} productConfig.name - 제품명 ('trombone'|'cmp'|'contrabass'|'viola')
   * @param {string} productConfig.displayName - 표시 이름 ('TROMBONE'|'CMP'|'CONTRABASS'|'VIOLA')
   * @param {string} productConfig.icon - 이모지 아이콘 ('🎺'|'🎵'|'🎻'|etc)
   * @param {Function} productConfig.reportFunction - 제품별 리포트 출력 함수
   * @param {string} productConfig.rootDir - 제품 루트 디렉토리 절대 경로
   * @param {Object} [productConfig.features] - 제품별 기능 플래그
   */
  constructor(productConfig) {
    // 설정 검증
    if (!productConfig || !productConfig.name || !productConfig.rootDir) {
      throw new Error('productConfig.name과 productConfig.rootDir는 필수입니다.');
    }

    this.config = productConfig;
    this.productName = productConfig.name.toLowerCase();
    this.displayName = productConfig.displayName || productConfig.name.toUpperCase();
    this.productIcon = productConfig.icon || '🎯';
    this.rootDir = productConfig.rootDir;
    this.features = productConfig.features || {};
    
    // I/O 인터페이스 (DI 가능)
    this.fs = productConfig.fs || fs;
    this.exec = productConfig.exec || exec;
    this.console = productConfig.console || console;
  }

  /**
   * 시나리오 실행 (메인 로직)
   * 기존 electron-scenario-runner.js의 runScenario 함수와 동일한 동작 보장
   * 
   * @param {string} scenarioId - 시나리오 ID
   */
  async runScenario(scenarioId) {
    const startTime = new Date();
    const startTimestamp = startTime.getTime();
    
    try {
      // 1. 시작 로그 (기존 포맷 그대로)
      this.console.log(`${this.productIcon} ${this.displayName} 시나리오 ${scenarioId} 실행을 시작합니다...\n`);
      this.console.log(`⏰ 시작 시간: ${startTime.toLocaleString('ko-KR')}`);
      
      // 2. 제품별 리포트 함수 호출 (DI)
      if (this.config.reportFunction) {
        this.config.reportFunction(scenarioId);
      }
      
      this.console.log('\n🔄 Playwright 테스트 실행 중...');
      this.console.log('='.repeat(60));
      
      // 3. 파일 경로 계산 (기존 동일)
      const testFile = path.join(this.rootDir, 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
      const configFile = path.join(this.rootDir, 'playwright.config.js');
      
      this.console.log(`📂 실행할 테스트 파일: ${testFile}`);
      
      // 4. 파일 존재 확인 (기존 동일)
      if (!this.fs.existsSync(testFile)) {
        throw new Error(`테스트 파일이 존재하지 않습니다: ${testFile}`);
      }
      
      if (!this.fs.existsSync(configFile)) {
        throw new Error(`설정 파일이 존재하지 않습니다: ${configFile}`);
      }
      
      // 5. Playwright 테스트 실행 (기존 로직 보존)
      this.console.log('🔍 Playwright 테스트 직접 실행');
      this.console.log('--- PLAYWRIGHT DEBUG ---');
      this.console.log(`CWD: ${this.rootDir}`);
      this.console.log(`testFile (raw): ${testFile}`);
      
      const testFilePosix = testFile.replace(/\\/g, '/');
      const configPosix = configFile.replace(/\\/g, '/');
      
      this.console.log(`testFile (posix): ${testFilePosix}`);
      this.console.log(`config (posix): ${configPosix}`);
      
      // 시나리오 디렉토리 확인 (기존 동일)
      const scenarioDir = path.join(this.rootDir, 'tests', 'scenario');
      this.console.log(`scenarioDir: ${scenarioDir}`);
      
      if (this.fs.existsSync(scenarioDir)) {
        const files = this.fs.readdirSync(scenarioDir);
        this.console.log('scenarioDir file list:');
        files.forEach(file => {
          this.console.log(` - ${file}`);
        });
      }
      
      this.console.log(`exists(testFile): ${this.fs.existsSync(testFile)}`);
      this.console.log(`exists(config): ${this.fs.existsSync(configFile)}`);
      this.console.log('--- /PLAYWRIGHT DEBUG ---');
      
      // 6. PLAN-A: execSync로 실행 (기존 로직 그대로)
      this.console.log('\n🚀 PLAN-A: execSync로 실행 (POSIX 경로)');
      this.console.log(`📂 실행 명령: npx playwright test "${testFilePosix}" --project=chromium`);
      
      try {
        const command = `npx playwright test "${testFilePosix}" --project=chromium --headed`;
        this.console.log(`📂 실행 명령: ${command}`);
        
        await new Promise((resolve, reject) => {
          this.exec(command, {
            cwd: this.rootDir,
            env: {
              ...process.env,
              PLAYWRIGHT_HEADLESS: 'false',
              NODE_ENV: 'test'
            }
          }, (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
        
        this.console.log('✅ PLAN-A 성공: Playwright 테스트 실행 완료');
        
      } catch (planAError) {
        this.console.log(`⚠️ PLAN-A failed: ${planAError.message}`);
        
        // PLAN-B: 상대 경로로 실행 (기존 동일)
        this.console.log('\n🚀 PLAN-B: 상대 경로로 실행');
        const relativeTestFile = `tests/scenario/scenario-${scenarioId}.spec.js`;
        this.console.log(`📂 실행 명령: npx playwright test "${relativeTestFile}" --project=chromium`);
        
        try {
          const command = `npx playwright test "${relativeTestFile}" --project=chromium --headed`;
          this.console.log(`📂 실행 명령: ${command}`);
          
          await new Promise((resolve, reject) => {
            this.exec(command, {
              cwd: this.rootDir,
              env: {
                ...process.env,
                PLAYWRIGHT_HEADLESS: 'false',
                NODE_ENV: 'test'
              }
            }, (error, stdout, stderr) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          });
          
          this.console.log('✅ PLAN-B 성공: Playwright 테스트 실행 완료');
          
        } catch (planBError) {
          this.console.log(`⚠️ PLAN-B failed: ${planBError.message}`);
          throw new Error(`모든 실행 방법이 실패했습니다. PLAN-A: ${planAError.message}, PLAN-B: ${planBError.message}`);
        }
      }
      
      // 7. 실행 완료 시간 계산 (기존 동일)
      const endTime = new Date();
      const endTimestamp = endTime.getTime();
      const durationMs = endTimestamp - startTimestamp;
      const durationSeconds = Math.round(durationMs / 1000);
      const durationMinutes = Math.floor(durationSeconds / 60);
      const durationRemainingSeconds = durationSeconds % 60;
      const durationFormatted = `${durationMinutes}분 ${durationRemainingSeconds}초`;
      
      this.console.log('\n' + '='.repeat(60));
      this.console.log(`✅ ${this.displayName} 시나리오 실행 완료`);
      this.console.log(`⏰ 종료 시간: ${endTime.toLocaleString('ko-KR')}`);
      this.console.log(`⏱️ 총 실행시간: ${durationFormatted} (${durationMs}ms)`);
      this.console.log(`📊 ${this.displayName} 구조 레포트 상태:`);
      this.console.log('✅ 테스트가 성공적으로 완료되었습니다.');
      this.console.log('💡 Playwright HTML 레포트에서 결과 확인: playwright-report/index.html');
      
      // 8. 커스텀 리포트 생성 (기존 동일, 각 제품의 report-generator 사용)
      await this._generateCustomReport(scenarioId, {
        status: 'pass',
        duration: durationFormatted,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timestamp: startTime.toLocaleString('ko-KR')
      });
      
    } catch (error) {
      // 9. 에러 처리 (기존 동일)
      await this._handleError(scenarioId, error, startTime, startTimestamp);
      process.exit(1);
    }
  }

  /**
   * 커스텀 리포트 생성 (내부 메서드)
   * 각 제품의 lib/report-generator.js를 사용 (제품별 로직 보존)
   */
  async _generateCustomReport(scenarioId, testResults) {
    this.console.log('\n📊 새로운 커스텀 리포트 생성 중...');
    try {
      const reportGeneratorPath = path.join(this.rootDir, 'lib', 'report-generator.js');
      
      if (!this.fs.existsSync(reportGeneratorPath)) {
        this.console.log(`⚠️ report-generator를 찾을 수 없습니다: ${reportGeneratorPath}`);
        return;
      }
      
      const fileUrl = `file://${reportGeneratorPath.replace(/\\/g, '/')}`;
      const reportGenerator = await import(fileUrl);
      const generator = new reportGenerator.default(this.productName);
      
      await generator.saveReport(scenarioId, testResults);
      this.console.log(`✅ ${this.displayName} 커스텀 리포트 생성 완료`);
      
    } catch (error) {
      this.console.error(`❌ ${this.displayName} 커스텀 리포트 생성 실패:`, error.message);
    }
  }

  /**
   * 에러 처리 (내부 메서드)
   * 기존 로직 그대로 보존
   */
  async _handleError(scenarioId, error, startTime, startTimestamp) {
    const endTime = new Date();
    const endTimestamp = endTime.getTime();
    const durationMs = endTimestamp - startTimestamp;
    const durationSeconds = Math.round(durationMs / 1000);
    const durationMinutes = Math.floor(durationSeconds / 60);
    const durationRemainingSeconds = durationSeconds % 60;
    const durationFormatted = `${durationMinutes}분 ${durationRemainingSeconds}초`;
    
    this.console.log('\n' + '='.repeat(60));
    this.console.log(`❌ ${this.displayName} 시나리오 ${scenarioId} 실행 중 오류 발생`);
    this.console.log(`⏰ 종료 시간: ${endTime.toLocaleString('ko-KR')}`);
    this.console.log(`⏱️ 총 실행시간: ${durationFormatted} (${durationMs}ms)`);
    this.console.log(`오류 코드: ${error.code}`);
    this.console.log(`오류 메시지: ${error.message}`);
    
    this.console.log(`\n📊 ${this.displayName} 구조 레포트 상태:`);
    this.console.log('⚠️ 테스트가 완료되지 않아 일부 결과만 확인 가능합니다.');
    this.console.log('💡 Playwright HTML 레포트에서 중단 지점까지의 결과 확인: playwright-report/index.html');
    
    // 실패 케이스 리포트 생성
    try {
      this.console.log('\n📊 실패 케이스 커스텀 리포트 생성 중...');
      const reportGeneratorPath = path.join(this.rootDir, 'lib', 'report-generator.js');
      
      if (this.fs.existsSync(reportGeneratorPath)) {
        const fileUrl = `file://${reportGeneratorPath.replace(/\\/g, '/')}`;
        const reportGenerator = await import(fileUrl);
        const generator = new reportGenerator.default(this.productName);
        
        const testResults = {
          status: 'fail',
          duration: durationFormatted,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timestamp: startTime.toLocaleString('ko-KR'),
          error: error.message
        };
        
        await generator.saveReport(scenarioId, testResults);
        this.console.log(`✅ ${this.displayName} 실패 케이스 커스텀 리포트 생성 완료`);
      }
      
    } catch (reportError) {
      this.console.error(`❌ ${this.displayName} 실패 케이스 커스텀 리포트 생성 실패:`, reportError.message);
    }
  }

  // 추가 기능 메서드들 (TROMBONE의 scenarioOptions 기능들)
  // (다음 커밋에서 추가 예정: list, status, dashboard, report, clean, showHelp)
}

export default ScenarioRunnerBase;

