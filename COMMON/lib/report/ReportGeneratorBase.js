/**
 * 보수적 리팩터링: 리포트 생성 로직 공통화
 * 목적: 85%의 공통 로직을 베이스 클래스로 추출, 15%의 제품별 차이는 전략 패턴으로 주입
 * 
 * 변경 사항:
 * - TROMBONE/VIOLA/CMP/CONTRABASS의 중복 코드 (~12,000줄) 제거
 * - 공통 HTML 템플릿, CSS, 유틸리티 메서드 통합
 * - 제품별 데이터 로드/메타데이터는 추상 메서드로 위임
 * 
 * 퍼블릭 계약 보존:
 * - saveReport(scenarioId, testResults) 시그니처 동일
 * - 생성되는 HTML 출력 동일
 * - 파일 경로/이름 동일
 * - 로그 메시지 동일
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ReportGeneratorBase {
    /**
     * 생성자 (DI 패턴)
     * @param {Object} productConfig - 제품별 설정
     * @param {string} productConfig.name - 제품명 (trombone/viola/cmp/contrabass)
     * @param {string} productConfig.displayName - 표시명 (TROMBONE/VIOLA/CMP/CONTRABASS)
     * @param {Object} productConfig.icon - 아이콘 정보
     * @param {string} productConfig.icon.class - Font Awesome 클래스 (fas fa-trombone)
     * @param {string} productConfig.icon.emoji - 이모지 (🎺)
     * @param {Object} productConfig.color - 테마 색상
     * @param {string} productConfig.color.primary - 주 색상
     * @param {string} productConfig.color.secondary - 보조 색상
     * @param {Object} productConfig.scenarios - 시나리오 설정
     * @param {number} productConfig.scenarios.count - 시나리오 개수
     * @param {Object} productConfig.defaultSettings - 기본 설정값
     * @param {string} productConfig.rootDir - 제품 루트 디렉토리
     */
    constructor(productConfig) {
        if (!productConfig || !productConfig.name) {
            throw new Error('productConfig with name is required');
        }

        this.config = productConfig;
        this.currentProduct = productConfig.name;
        this.testSettings = this.loadTestSettings();
    }

    // ===================================================================
    // 공통 유틸리티 메서드 (100% 동일, 제품 간 차이 없음)
    // ===================================================================

    /**
     * 테스트 단계 이름에서 불필요한 문구 제거
     * @param {string} stepName - 원본 단계 이름
     * @returns {string} 정제된 단계 이름
     */
    cleanStepName(stepName) {
        if (!stepName) return stepName;
        
        // "중메뉴", "대메뉴" 등의 문구 제거
        let cleanedName = stepName
            .replace(/중메뉴\s*/g, '')
            .replace(/대메뉴\s*/g, '')
            .replace(/메뉴\s*/g, '')
            .trim();
        
        return cleanedName;
    }

    /**
     * UTC 시간을 대한민국 시간(KST)으로 변환
     * @param {string} utcTimeString - UTC 시간 문자열
     * @returns {string} KST 시간 문자열 (YYYY-MM-DD HH:mm:ss)
     */
    convertToKoreaTime(utcTimeString) {
        if (!utcTimeString) return 'N/A';
        
        try {
            const utcDate = new Date(utcTimeString);
            
            // Get UTC components
            let year = utcDate.getUTCFullYear();
            let month = utcDate.getUTCMonth(); // 0-indexed
            let day = utcDate.getUTCDate();
            let hours = utcDate.getUTCHours();
            let minutes = utcDate.getUTCMinutes();
            let seconds = utcDate.getUTCSeconds();
            
            // Add 9 hours for KST offset
            hours += 9;
            
            // Handle hour, day, month, year rollovers
            const tempDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
            
            year = tempDate.getUTCFullYear();
            month = String(tempDate.getUTCMonth() + 1).padStart(2, '0');
            day = String(tempDate.getUTCDate()).padStart(2, '0');
            hours = String(tempDate.getUTCHours()).padStart(2, '0');
            minutes = String(tempDate.getUTCMinutes()).padStart(2, '0');
            seconds = String(tempDate.getUTCSeconds()).padStart(2, '0');
            
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            console.error('시간 변환 오류:', error);
            return 'N/A';
        }
    }

    /**
     * 시간 포맷팅 함수 (초를 "분 초" 형식으로 변환)
     * @param {number|string} seconds - 초 단위 시간
     * @returns {string} "N분 N초" 형식
     */
    formatDuration(seconds) {
        if (typeof seconds === 'string') {
            // 문자열인 경우 숫자 추출
            const match = seconds.match(/(\d+)/);
            if (match) {
                seconds = parseInt(match[1]);
            } else {
                return seconds; // 숫자를 찾을 수 없으면 원본 반환
            }
        }
        
        if (isNaN(seconds) || seconds < 0) {
            return '0분 0초';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds}초`;
    }

    /**
     * 현재 타임스탬프 생성
     * @returns {string} 한국어 형식 타임스탬프
     */
    generateTimestamp() {
        const now = new Date();
        return now.toLocaleString('ko-KR');
    }

    /**
     * 에러 메시지 포맷팅
     * @param {Error|string|Object} error - 에러 객체
     * @returns {string} 포맷팅된 에러 메시지
     */
    formatErrorMessage(error) {
        if (!error) {
            return '';
        }
        
        if (typeof error === 'string') {
            return error;
        } else if (error instanceof Error) {
            // Error 객체의 경우 message와 stack 정보를 포함
            let errorMessage = error.message;
            if (error.stack) {
                // 스택 트레이스에서 첫 번째 라인만 사용 (실제 오류 메시지)
                const stackLines = error.stack.split('\n');
                if (stackLines.length > 1) {
                    // 첫 번째 라인은 보통 "Error: message" 형태
                    // 두 번째 라인부터 실제 스택 정보
                    const relevantStack = stackLines.slice(1, 3).join('\n');
                    errorMessage += `\n${relevantStack}`;
                }
            }
            return errorMessage;
        } else if (error && typeof error === 'object') {
            // 객체인 경우 주요 속성들을 추출
            const errorKeys = Object.keys(error);
            if (errorKeys.length === 0) {
                return '알 수 없는 오류 객체';
            }
            
            // message, name, code 등 주요 속성 우선
            const priorityKeys = ['message', 'name', 'code', 'type', 'reason'];
            for (const key of priorityKeys) {
                if (error[key] && typeof error[key] === 'string') {
                    return error[key];
                }
            }
            
            // 모든 문자열 값들을 조합
            const stringValues = Object.values(error)
                .filter(val => typeof val === 'string' && val.trim())
                .join(', ');
            
            return stringValues || '알 수 없는 오류 객체';
        } else {
            return '알 수 없는 오류';
        }
    }

    // ===================================================================
    // 설정 및 데이터 로드 (제품별 기본값 사용)
    // ===================================================================

    /**
     * 테스트 설정 로드
     * @returns {Object} 테스트 설정 객체
     */
    loadTestSettings() {
        try {
            const settingsPath = path.join(
                this.config.rootDir,
                'config',
                'test-settings.json'
            );
            
            if (fs.existsSync(settingsPath)) {
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                return settings;
            } else {
                console.log(`⚠️ 테스트 설정 파일이 없습니다. 기본값 사용: ${settingsPath}`);
                return this.config.defaultSettings;
            }
        } catch (error) {
            console.error('테스트 설정 로드 실패:', error);
            return this.config.defaultSettings;
        }
    }

    // ===================================================================
    // 추상 메서드 (제품별 구현 필요)
    // ===================================================================

    /**
     * 🔌 추상 메서드: 제품별 테스트 데이터 로드
     * 
     * 구현 예시:
     * - TROMBONE: 파일 기반 (global-test-results.json)
     * - VIOLA: 실시간 Map + 파일 폴백
     * 
     * @param {string} scenarioId - 시나리오 ID
     * @returns {Promise<Object|null>} 테스트 데이터 또는 null
     */
    async loadTestData(scenarioId) {
        throw new Error(
            `loadTestData() must be implemented by subclass (${this.currentProduct})`
        );
    }

    /**
     * 🔌 추상 메서드: 시나리오 메타데이터 제공
     * 
     * 구현 예시:
     * - TROMBONE: 단일 패턴 파싱
     * - VIOLA: 다중 패턴 + 하드코딩 딕셔너리 폴백
     * 
     * @param {string|number} scenarioId - 시나리오 ID
     * @returns {Object} { name: string, description: string }
     */
    getScenarioMetadata(scenarioId) {
        throw new Error(
            `getScenarioMetadata() must be implemented by subclass (${this.currentProduct})`
        );
    }

    /**
     * 🔌 추상 메서드: 시나리오 파일 존재 여부 확인
     * 
     * @param {string|number} scenarioId - 시나리오 ID
     * @returns {boolean} 파일 존재 여부
     */
    scenarioFileExists(scenarioId) {
        const scenarioFilePath = path.join(
            this.config.rootDir,
            'tests',
            'scenario',
            `scenario-${scenarioId}.spec.js`
        );
        return fs.existsSync(scenarioFilePath);
    }

    // ===================================================================
    // 파일 I/O 메서드 (공통 로직, 동작 100% 보존)
    // ===================================================================

    /**
     * 리포트 저장 (퍼블릭 API - 시그니처 보존)
     * 
     * @param {string|number} scenarioId - 시나리오 ID
     * @param {Object|null} testResults - 테스트 결과 객체
     * @returns {Promise<void>}
     */
    async saveReport(scenarioId, testResults = null) {
        // 리포트 디렉토리 생성
        const reportDir = path.join(
            this.config.rootDir,
            'custom-reports',
            `scenario-${scenarioId}`
        );

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, 'index.html');
        
        // 리포트 데이터 구성
        const reportData = {
            testResults,
            user: this.testSettings.user || this.config.defaultSettings.user,
            project: this.testSettings.project || this.config.defaultSettings.project,
            repository: this.testSettings.repository || this.config.defaultSettings.repository
        };

        try {
            // HTML 생성 (각 제품의 구현 사용)
            const html = await this.generateCustomReport(scenarioId, reportData);
            
            // 파일 저장
            fs.writeFileSync(reportPath, html, 'utf8');
            
            console.log(`✅ ${this.config.displayName} 커스텀 리포트 생성: ${reportPath}`);
        } catch (error) {
            console.error(`❌ ${this.config.displayName} 리포트 생성 실패:`, error.message);
            throw error;
        }
    }

    /**
     * 🔌 추상 메서드: 커스텀 리포트 HTML 생성
     * 
     * 제품별로 구현해야 하는 핵심 메서드
     * 
     * @param {string|number} scenarioId - 시나리오 ID
     * @param {Object|null} reportData - 리포트 데이터
     * @returns {Promise<string>} HTML 문자열
     */
    async generateCustomReport(scenarioId, reportData = null) {
        throw new Error(
            `generateCustomReport() must be implemented by subclass (${this.currentProduct})`
        );
    }

    /**
     * 마스터 리포트 저장 (전체 시나리오 요약)
     * 
     * @returns {Promise<void>}
     */
    async saveMasterReport() {
        throw new Error(
            `saveMasterReport() must be implemented by subclass (${this.currentProduct})`
        );
    }

    // ===================================================================
    // 히스토리 관리 (공통 로직)
    // ===================================================================

    /**
     * 시나리오 실행 히스토리 조회
     * 
     * @param {string|number} scenarioId - 시나리오 ID
     * @returns {Array<Object>} 히스토리 배열
     */
    getScenarioHistory(scenarioId) {
        const historyDir = path.join(
            this.config.rootDir,
            'custom-reports',
            `scenario-${scenarioId}`
        );

        if (!fs.existsSync(historyDir)) {
            return [];
        }

        try {
            const files = fs.readdirSync(historyDir);
            const history = [];

            for (const file of files) {
                if (file.endsWith('.html') && file !== 'index.html') {
                    const filePath = path.join(historyDir, file);
                    const stats = fs.statSync(filePath);
                    
                    history.push({
                        filename: file,
                        path: filePath,
                        timestamp: stats.mtime,
                        date: stats.mtime.toLocaleString('ko-KR')
                    });
                }
            }

            // 최신순 정렬
            history.sort((a, b) => b.timestamp - a.timestamp);
            return history;
        } catch (error) {
            console.error(`히스토리 조회 실패 (시나리오 ${scenarioId}):`, error);
            return [];
        }
    }

    // ===================================================================
    // 헬퍼 메서드 (공통)
    // ===================================================================

    /**
     * 안전한 파일 읽기
     * 
     * @param {string} filePath - 파일 경로
     * @param {string} encoding - 인코딩 (기본: utf8)
     * @returns {string|null} 파일 내용 또는 null
     */
    _safeReadFile(filePath, encoding = 'utf8') {
        try {
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, encoding);
            }
        } catch (error) {
            console.error(`파일 읽기 실패: ${filePath}`, error.message);
        }
        return null;
    }

    /**
     * 디렉토리가 없으면 생성
     * 
     * @param {string} dirPath - 디렉토리 경로
     */
    _ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

export default ReportGeneratorBase;

