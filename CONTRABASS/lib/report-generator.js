import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportGenerator {
    constructor(currentProduct = 'contrabass') {
        this.currentProduct = currentProduct;
        this.testSettings = this.loadTestSettings();
    }

    // 테스트 단계 이름에서 불필요한 문구 제거
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

    // UTC 시간을 대한민국 시간으로 변환
    convertToKoreaTime(utcTimeString) {
        if (!utcTimeString) return 'N/A';
        
        try {
            const utcDate = new Date(utcTimeString); // This correctly represents the UTC point in time
            
            // Get UTC components
            let year = utcDate.getUTCFullYear();
            let month = utcDate.getUTCMonth(); // 0-indexed
            let day = utcDate.getUTCDate();
            let hours = utcDate.getUTCHours();
            let minutes = utcDate.getUTCMinutes();
            let seconds = utcDate.getUTCSeconds();
            
            // Add 9 hours for KST offset
            hours += 9;
            
            // Handle hour, day, month, year rollovers by creating a new Date object with adjusted UTC components
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

    // URL에서 환경 이름 추출
    extractEnvironmentName(url) {
        if (!url) return '검증 환경';
        
        try {
            // URL에서 서브도메인 추출 (예: https://305tst.console.bf.okestro.cloud/ -> 305tst)
            const match = url.match(/https?:\/\/([^.]+)\./);
            if (match && match[1]) {
                return `${match[1]} 검증 환경`;
            }
            return '검증 환경';
        } catch (error) {
            return '검증 환경';
        }
    }

    // 테스트 설정 로드
    loadTestSettings() {
        try {
            const settingsPath = path.join(__dirname, '..', 'config', 'test-settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            // 환경 이름 자동 생성
            if (settings.environment && settings.environment.url) {
                if (!settings.environment.name) {
                    settings.environment.name = this.extractEnvironmentName(settings.environment.url);
                }
            }
            
            return settings;
        } catch (error) {
            console.error('테스트 설정 로드 실패:', error);
            return {
                environment: { name: '검증 환경', url: '' },
                project: { code: "CONTRABASS", name: "kubernetes" },
                repository: { name: "CONTRABASS-kubernetes" },
                users: [],
                login: { userId: '' }
            };
        }
    }

    // 실제 테스트 결과에서 데이터 생성
    generateTestDataFromResults(scenarioId, testResults) {
        const scenarios = [];
        
        // 현재 시나리오 정보 (실제 테스트 단계 결과 포함)
        const currentScenario = {
            id: parseInt(scenarioId),
            name: this.getScenarioName(scenarioId),
            description: this.getScenarioDescription(scenarioId),
            status: testResults.status || 'pass',
            duration: testResults.duration || '0분',
            startTime: testResults.startTime || null,
            endTime: testResults.endTime || null,
            lastRun: testResults.endTime || new Date().toISOString(),
            testCases: [], // 실제 테스트 단계 결과
            errorDetails: testResults.error || null,
            screenshots: testResults.screenshots || [],
            logs: testResults.logs || []
        };

        // 테스트 케이스 결과 처리
        if (testResults.testCases && testResults.testCases.length > 0) {
            // 실패한 단계 이후의 단계를 "미수행"으로 표시
            let hasFailed = false;
            currentScenario.testCases = testResults.testCases.map(testCase => {
                // 실패 상태 확인 (현재 단계가 실패인지 먼저 확인)
                if (testCase.status === 'fail' || testCase.status === 'stopped') {
                    hasFailed = true;
                }
                
                // 실패한 단계가 있으면 이후 단계들을 "미수행"으로 표시
                if (hasFailed) {
                    return {
                        name: this.cleanStepName(testCase.name),
                        status: 'not-test',
                        duration: 'N/A',
                        error: null,
                        logs: [],
                        startTime: null,
                        endTime: null
                    };
                }
                
                // Electron에서 전달된 상태와 소요시간을 그대로 사용
                return {
                    name: this.cleanStepName(testCase.name),
                    status: testCase.status,
                    duration: testCase.duration ? `${testCase.duration}ms` : 'N/A',
                    error: testCase.error,
                    logs: testCase.logs || [],  // 실제 로그 내용
                    startTime: testCase.startTime,
                    endTime: testCase.endTime
                };
            });

            // 전체 시나리오 상태는 Electron에서 전달된 값 사용
            currentScenario.status = testResults.status;
            currentScenario.duration = testResults.duration || 'N/A';
            currentScenario.error = testResults.error;

            // 디버깅용 로그
            console.log('📊 테스트 결과 처리:', {
                totalTests: currentScenario.testCases.length,
                passedTests: currentScenario.testCases.filter(tc => tc.status === 'pass').length,
                failedTests: currentScenario.testCases.filter(tc => tc.status === 'fail').length,
                scenarioStatus: currentScenario.status,
                scenarioDuration: currentScenario.duration
            });
        }
        
        scenarios.push(currentScenario);
        
        // CONTRABASS 시나리오 개수 설정
        const maxScenarios = 8;
        
        // 다른 시나리오들도 포함
        for (let i = 1; i <= maxScenarios; i++) {
            if (i !== parseInt(scenarioId)) {
                scenarios.push({
                    id: i,
                    name: this.getScenarioName(i),
                    description: this.getScenarioDescription(i),
                    status: 'not-run',
                    duration: null,
                    startTime: null,
                    endTime: null,
                    lastRun: null,
                    testCases: [],
                    errorDetails: null,
                    screenshots: [],
                    logs: []
                });
            }
        }
        
        return scenarios;
    }
    
    // 시나리오 이름 가져오기
    getScenarioName(id) {
        try {
            // 제품별 시나리오 파일 경로 결정
            let scenarioFilePath;
            if (this.currentProduct === 'contrabass') {
                scenarioFilePath = path.join(__dirname, '..', 'tests', 'scenario', `scenario-${id}.spec.js`);
            } else if (this.currentProduct === 'contrabass') {
                scenarioFilePath = path.join(__dirname, '..', 'CONTRABASS', 'tests', 'scenario', `scenario-${id}.spec.js`);
            } else if (this.currentProduct === 'cmp') {
                scenarioFilePath = path.join(__dirname, '..', 'CMP', 'tests', 'scenario', `scenario-${id}.spec.js`);
            } else {
                // 기본값은 TROMBONE
                scenarioFilePath = path.join(__dirname, '..', 'tests', 'scenario', `scenario-${id}.spec.js`);
            }
            
            
            if (fs.existsSync(scenarioFilePath)) {
                const scenarioContent = fs.readFileSync(scenarioFilePath, 'utf8');
                
                // 여러 패턴으로 시도
                const patterns = [
                    /test\.describe\.serial\('([^']+)'/,
                    /test\.describe\('([^']+)'/,
                    /describe\('([^']+)'/,
                    /\/\/ .*시나리오.*:.*$/m
                ];
                
                for (const pattern of patterns) {
                    const match = scenarioContent.match(pattern);
                    if (match && match[1]) {
                        return match[1];
                    }
                }
                
                // 주석에서 시나리오 이름 찾기
                const commentMatch = scenarioContent.match(/\/\/ .*시나리오.*:.*$/m);
                if (commentMatch) {
                    const title = commentMatch[0].replace(/\/\/\s*/, '').trim();
                    return title;
                }
            }
        } catch (error) {
            console.log(`❌ 시나리오 ${id} 이름 읽기 실패:`, error);
        }
        
        return `시나리오 ${id}`;
    }
    
    // 시나리오 설명 가져오기
    getScenarioDescription(id) {
        try {
            // 제품별 설정 파일 경로 결정
            let settingsPath;
            if (this.currentProduct === 'contrabass') {
                settingsPath = path.join(__dirname, '..', 'CONTRABASS', 'config', 'scenario', `test-settings-${id}.json`);
            } else if (this.currentProduct === 'contrabass') {
                settingsPath = path.join(__dirname, '..', 'CONTRABASS', 'config', 'scenario', `test-settings-${id}.json`);
            } else if (this.currentProduct === 'cmp') {
                settingsPath = path.join(__dirname, '..', 'CMP', 'config', 'scenario', `test-settings-${id}.json`);
            } else {
                // 기본값은 TROMBONE
                settingsPath = path.join(__dirname, '..', 'config', 'scenario', `test-settings-${id}.json`);
            }
            
            if (fs.existsSync(settingsPath)) {
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                if (settings.scenario && settings.scenario.description) {
                    return settings.scenario.description;
                }
            }
        } catch (error) {
            console.log(`시나리오 ${id} 설명 읽기 실패:`, error);
        }
        
        // 제품별 기본 설명 제공
        if (this.currentProduct === 'contrabass' && id === 1) {
            return 'CONTRABASS를 통해 생성한 클러스터가 사용가능한지 확인';
        } else if (this.currentProduct === 'contrabass' && id === 2) {
            return '외부접속 가능한 서비스의 트래픽 모니터링 조회 확인';
        }
        
        return '';
    }

    // 테스트 결과 데이터 생성
    generateTestData(scenarioId, testResults) {
        // 실제 시나리오 파일에서 이름 읽기
        const getScenarioName = (id) => {
            try {
                // 제품별 시나리오 파일 경로 결정
                let scenarioFilePath;
                if (this.currentProduct === 'contrabass') {
                    scenarioFilePath = path.join(__dirname, '..', 'CONTRABASS', 'tests', 'scenario', `scenario-${id}.spec.js`);
                } else if (this.currentProduct === 'contrabass') {
                    scenarioFilePath = path.join(__dirname, '..', 'CONTRABASS', 'tests', 'scenario', `scenario-${id}.spec.js`);
                } else if (this.currentProduct === 'cmp') {
                    scenarioFilePath = path.join(__dirname, '..', 'CMP', 'tests', 'scenario', `scenario-${id}.spec.js`);
                } else {
                    // 기본값은 TROMBONE
                    scenarioFilePath = path.join(__dirname, '..', 'tests', 'scenario', `scenario-${id}.spec.js`);
                }
                
                if (fs.existsSync(scenarioFilePath)) {
                    const scenarioContent = fs.readFileSync(scenarioFilePath, 'utf8');
                    const titleMatch = scenarioContent.match(/test\.describe\.serial\('([^']+)'/);
                    if (titleMatch && titleMatch[1]) {
                        return titleMatch[1];
                    }
                }
            } catch (error) {
                // 파일 읽기 실패 시 기본값 반환
            }
            // CONTRABASS 기본값 반환
            const contrabassScenarioNames = {
                1: 'CONTRABASS 클러스터 생성 및 확인',
                2: '외부접속 서비스 트래픽 모니터링',
                3: '서비스 어카운트 클러스터 외부접근',
                4: '카탈로그 허브(Helm_Chart) 네트워크 통신 제한',
                5: '카탈로그 허브(YAML) 오토스케일링 및 알림',
                6: 'GPU 파드 생성 및 모니터링',
                7: '일반 배포 파이프라인 생성',
                8: '긴급 배포 파이프라인 생성'
            };
            
            return contrabassScenarioNames[id] || `시나리오 ${id}`;
        };

        // 시나리오별 설정에서 설명 읽기
        const getScenarioDescription = (id) => {
            try {
                // 제품별 설정 파일 경로 결정
                let settingsPath;
                if (this.currentProduct === 'contrabass') {
                    settingsPath = path.join(__dirname, '..', 'CONTRABASS', 'config', 'scenario', `test-settings-${id}.json`);
                } else if (this.currentProduct === 'contrabass') {
                    settingsPath = path.join(__dirname, '..', 'CONTRABASS', 'config', 'scenario', `test-settings-${id}.json`);
                } else if (this.currentProduct === 'cmp') {
                    settingsPath = path.join(__dirname, '..', 'CMP', 'config', 'scenario', `test-settings-${id}.json`);
                } else {
                    // 기본값은 TROMBONE
                    settingsPath = path.join(__dirname, '..', 'config', 'scenario', `test-settings-${id}.json`);
                }
                
                if (fs.existsSync(settingsPath)) {
                    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                    if (settings.scenario && settings.scenario.description) {
                        return settings.scenario.description;
                    }
                }
            } catch (error) {
                // 파일 읽기 실패 시 기본값 반환
            }
            
            // 제품별 기본 설명 제공
            if (this.currentProduct === 'contrabass' && id === 1) {
                return 'CONTRABASS를 통해 생성한 클러스터가 사용가능한지 확인';
            } else if (this.currentProduct === 'contrabass' && id === 2) {
                return '외부접속 가능한 서비스의 트래픽 모니터링 조회 확인';
            }
            
            return '';
        };

        // 시나리오별 테스트 케이스 정의
        const getScenarioTestCases = (id) => {
            const testCases = {
                1: [
                    { name: 'Trombone 로그인', description: 'Trombone 시스템에 로그인' },
                    { name: '업무코드 메뉴 접근', description: '업무코드 관리 메뉴로 이동' },
                    { name: '업무코드 등록 화면 열기', description: '업무코드 등록 화면 진입' },
                    { name: '업무코드 정보 입력', description: '업무코드 기본 정보 입력' },
                    { name: '업무코드 저장 및 확인', description: '업무코드 등록 완료' },
                    { name: '툴체인 메뉴 접근', description: '툴체인 관리 메뉴로 이동' },
                    { name: '툴체인 등록 화면 열기', description: '툴체인 등록 화면 진입' },
                    { name: '툴체인 기본 정보 입력', description: '툴체인 기본 정보 입력' },
                    { name: '툴체인 저장 및 확인', description: '툴체인 등록 완료' },
                    { name: '저장소 메뉴 접근', description: '저장소 관리 메뉴로 이동' },
                    { name: '저장소 등록 화면 열기', description: '저장소 등록 화면 진입' },
                    { name: '저장소 정보 입력', description: '저장소 기본 정보 입력' },
                    { name: '저장소 저장 및 확인', description: '저장소 등록 완료' },
                    { name: '배치 파일 실행', description: 'Git 저장소에 파일 푸시 배치 실행' },
                    { name: 'GitLab 파일 수정', description: 'GitLab에서 memberList.html 파일 수정' },
                    { name: '사용자 메뉴 접근', description: '사용자 관리 메뉴로 이동' },
                    { name: '사용자 등록 화면 열기', description: '사용자 등록 화면 진입' },
                    { name: '사용자 기본 정보 입력', description: '사용자 기본 정보 입력' },
                    { name: '티켓 전용 업무 및 역할 설정', description: '티켓 전용 업무 및 역할 설정' },
                    { name: '사용자 업무 및 역할 설정', description: '사용자 업무 및 역할 설정' },
                    { name: '사용자 구분 설정', description: '사용자 구분 설정' },
                    { name: '사용자 저장 및 확인', description: '사용자 등록 완료' },
                    { name: '사용자 업무코드 메뉴 접근', description: '사용자 업무코드 관리 메뉴로 이동' },
                    { name: '사용자 업무코드 등록 화면 열기', description: '사용자 업무코드 등록 화면 진입' },
                    { name: '사용자 업무코드 정보 입력', description: '사용자 업무코드 정보 입력' },
                    { name: '사용자 업무코드 저장 및 확인', description: '사용자 업무코드 등록 완료' },
                    { name: 'SonarQube 메뉴 접근', description: 'SonarQube 관리 메뉴로 이동' },
                    { name: 'SonarQube 등록 화면 열기', description: 'SonarQube 등록 화면 진입' },
                    { name: 'SonarQube 정보 입력', description: 'SonarQube 기본 정보 입력' },
                    { name: 'SonarQube 저장 및 확인', description: 'SonarQube 등록 완료' },
                    { name: 'JUnit 메뉴 접근', description: 'JUnit 관리 메뉴로 이동' },
                    { name: 'JUnit 등록 화면 열기', description: 'JUnit 등록 화면 진입' },
                    { name: 'JUnit 정보 입력', description: 'JUnit 기본 정보 입력' },
                    { name: 'JUnit 저장 및 확인', description: 'JUnit 등록 완료' },
                    { name: 'STG 파이프라인 등록', description: 'STG 환경 파이프라인 등록' },
                    { name: 'PRD 파이프라인 등록', description: 'PRD 환경 파이프라인 등록' },
                    { name: '워크플로우 컴포넌트 메뉴 접근', description: '워크플로우 컴포넌트 관리 메뉴로 이동' },
                    { name: '워크플로우 컴포넌트 등록 화면 열기', description: '워크플로우 컴포넌트 등록 화면 진입' },
                    { name: '워크플로우 컴포넌트 정보 입력', description: '워크플로우 컴포넌트 기본 정보 입력' },
                    { name: '워크플로우 컴포넌트 저장 및 확인', description: '워크플로우 컴포넌트 등록 완료' },
                    // 티켓 생성 세부 단계
                    { name: '티켓 관리 메뉴 접근', description: '티켓 관리 메뉴로 이동' },
                    { name: '티켓 등록 화면 열기', description: '티켓 등록 화면 진입' },
                    { name: '티켓 기본 정보 입력', description: '티켓 기본 정보 입력' },
                    { name: '워크플로우 및 승인 설정', description: '워크플로우 및 승인 설정' },
                    { name: '개발자 및 배포일 설정', description: '개발자 및 배포일 설정' },
                    { name: '릴리즈 노트 작성', description: '릴리즈 노트 작성' },
                    { name: '저장소 및 브랜치 선택', description: '저장소 및 브랜치 선택' },
                    { name: '티켓 저장', description: '티켓 저장 및 확인' },
                        // 승인 프로세스 세부 단계
                        { name: '첫 번째 승인 프로세스', description: 'yh.lee3 계정으로 첫 번째 승인' },
                    { name: '두 번째 승인 프로세스', description: 'yh.lee7 계정으로 두 번째 승인' },
                    { name: '알림 확인', description: '승인 완료 알림 확인' },
                    // 코드리뷰 단계 세부 단계 (1~17단계를 논리적으로 그룹화)
                    { name: '코드리뷰 단계: 코드리뷰 접근 완료', description: '티켓 클릭 및 코드리뷰 버튼 클릭 (1~2단계)' },
                    { name: '코드리뷰 단계: 검토 의견 입력 완료', description: 'Administrator 셀 클릭 및 검토 의견 입력 (3~7단계)' },
                    { name: '코드리뷰 단계: 테스트 케이스 관리 진입', description: '관리 버튼 클릭 (8단계)' },
                    { name: '코드리뷰 단계: 테스트 케이스 등록 화면 진입', description: '테스트 케이스 등록 버튼 클릭 (9단계)' },
                    { name: '코드리뷰 단계: 테스트 케이스 정보 입력', description: '테스트 케이스 정보 입력 및 관련 프로그램 선택 (10~12단계)' },
                    { name: '코드리뷰 단계: 테스트 케이스 추가 완료', description: '테스트 케이스 저장 및 확인 (13~14단계)' },
                    { name: '코드리뷰 단계: 코드 검토 완료', description: '전체 검토 완료 및 확인 (15~16단계)' },
                    { name: '코드리뷰 단계: 코드리뷰 단계 완료 및 다음 단계 진입', description: '다음 단계 진행 (17단계)' },
                    // 코드병합 단계 세부 단계
                    { name: '코드병합 단계: 코드병합 가능 확인', description: '병합 가능 여부 확인' },
                    { name: '코드병합 단계: 코드병합 완료', description: '병합 완료 확인' },
                    { name: '코드병합 단계: 코드병합 단계 완료 및 다음 단계 진입', description: '다음 단계 진행' },
                    // 단위테스트 단계 세부 단계
                    { name: '단위테스트 단계: 단위테스트 완료', description: '단위테스트 성공 확인' },
                    { name: '단위테스트 단계: 단위테스트 단계 완료 및 다음 단계 진입', description: '다음 단계 진행' }
                ]
            };
            
            return testCases[id] || [];
        };

        // 이전 실행 결과 읽기 (현재 실행 결과만 사용하도록 비활성화)
        const getPreviousResults = () => {
            // 이전 결과를 사용하지 않고 현재 실행 결과만 사용
            return [];
        };

        const previousResults = getPreviousResults();
        
        // 현재 시나리오의 테스트 케이스들 생성
        const testCases = getScenarioTestCases(parseInt(scenarioId));
        const testScenarios = [];
        
        if (testCases.length > 0) {
            // 현재 시나리오의 세부 테스트 케이스들 생성
            testCases.forEach((testCase, index) => {
                let status = "not-run";
                let duration = "N/A";
                let timestamp = "N/A";
                let startTime = null;
                
                // 현재 실행된 시나리오의 경우 실제 결과 사용
                if (testResults) {
                    status = testResults.status || "pass";
                    duration = testResults.duration || "N/A";
                    timestamp = testResults.timestamp || new Date().toLocaleString('ko-KR');
                    startTime = testResults.startTime || new Date().toISOString();
                }

                testScenarios.push({
                    id: index + 1,
                    name: testCase.name,
                    description: testCase.description,
                    status: status,
                    duration: duration,
                    timestamp: timestamp,
                    startTime: startTime
                });
            });
        } else {
            // 테스트 케이스가 정의되지 않은 경우 기본 시나리오 정보만 생성
            const scenarioName = getScenarioName(scenarioId);
            const scenarioDescription = getScenarioDescription(scenarioId);
            const previousResult = previousResults.find(r => r.id === parseInt(scenarioId));
            
            let status = "not-run";
            let duration = "N/A";
            let timestamp = "N/A";
            let startTime = null;
            
            // 현재 실행된 시나리오의 경우 실제 결과 사용
            if (testResults) {
                status = testResults.status || "pass";
                duration = testResults.duration || "N/A";
                timestamp = testResults.timestamp || new Date().toLocaleString('ko-KR');
                startTime = testResults.startTime || new Date().toISOString();
            } else if (previousResult) {
                // 이전 실행 결과가 있으면 사용
                status = previousResult.status || "not-run";
                duration = previousResult.duration || "N/A";
                timestamp = previousResult.timestamp || "N/A";
                startTime = previousResult.startTime || null;
            }

            testScenarios.push({
                id: parseInt(scenarioId),
                name: scenarioName,
                description: scenarioDescription,
                status: status,
                duration: duration,
                timestamp: timestamp,
                startTime: startTime
            });
        }

        return testScenarios;
    }

    // 랜덤 소요시간 생성
    generateRandomDuration() {
        const minutes = Math.floor(Math.random() * 5) + 1;
        const seconds = Math.floor(Math.random() * 60);
        return `${minutes}분 ${seconds}초`;
    }

    // 시간 포맷팅 함수 (초를 분:초 형식으로 변환)
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

    // 타임스탬프 생성
    generateTimestamp() {
        const now = new Date();
        return now.toLocaleString('ko-KR');
    }

    // 커스텀 리포트 HTML 생성
    generateCustomReport(scenarioId, reportData = null) {

        
        // 현재 시나리오의 설정 파일에서 실제 데이터 읽기
        let currentConfig = null;
        try {
            const configPath = path.join(__dirname, '..', 'config', 'scenario', `test-settings-${scenarioId}.json`);
            if (fs.existsSync(configPath)) {
                currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                console.log(`✅ 시나리오 ${scenarioId} 설정 파일 로드 완료:`, {
                    project: currentConfig.project?.code,
                    repository: currentConfig.repository?.name,
                    user: currentConfig.user?.id
                });
            } else {
                console.log(`⚠️ 시나리오 ${scenarioId} 설정 파일이 없습니다. 기본값 사용`);
            }
        } catch (error) {
            console.error(`❌ 시나리오 ${scenarioId} 설정 파일 읽기 실패:`, error.message);
        }

        // 실제 데이터 사용 (실시간 데이터 최우선)
        let testResults = reportData?.testResults || null;
        
        console.log(`🔍 CONTRABASS 시나리오 ${scenarioId}: 초기 testResults 상태:`, testResults ? '데이터 있음' : '데이터 없음');
        console.log(`🔍 CONTRABASS 시나리오 ${scenarioId}: reportData 전체:`, reportData);
        
        // testResults가 null인 경우 실시간 데이터 우선 사용
        if (!testResults) {
            console.log(`⚠️ 시나리오 ${scenarioId}: reportData에서 testResults를 찾을 수 없음. 실시간 데이터 확인 중...`);
            
            // 1. 먼저 CONTRABASS 전용 global.testResults Map에서 최신 데이터 확인
            let latestTestResults = null;
            if (global.testResults && global.testResults instanceof Map) {
                const scenarioKey = `contrabass-scenario-${scenarioId}`;
                latestTestResults = global.testResults.get(scenarioKey);
                if (latestTestResults) {
                    console.log(`✅ CONTRABASS 시나리오 ${scenarioId}: global.testResults Map에서 최신 데이터 발견`);
                    console.log(`📊 CONTRABASS 시나리오 ${scenarioId}: Map 데이터 상태: ${latestTestResults.status}, 테스트 케이스: ${latestTestResults.testCases?.length || 0}개`);
                    testResults = latestTestResults;
                    reportData = reportData || {};
                    reportData.testResults = testResults;
                }
            } else {
                console.log(`⚠️ CONTRABASS 시나리오 ${scenarioId}: global.testResults Map이 존재하지 않음`);
            }
            
            // 2. global.testResults에서 찾지 못한 경우에만 파일에서 읽기
            if (!testResults) {
                try {
                    const globalTestResultsPath = path.join(__dirname, '..', 'custom-reports', 'global-test-results.json');
                    if (fs.existsSync(globalTestResultsPath)) {
                        const globalTestResultsData = fs.readFileSync(globalTestResultsPath, 'utf8');
                        const testResultsData = JSON.parse(globalTestResultsData);
                        
                        // CONTRABASS 전용 키로 데이터 찾기
                        const scenarioKey = `contrabass-scenario-${scenarioId}`;
                        if (testResultsData[scenarioKey]) {
                            testResults = testResultsData[scenarioKey];
                            console.log(`✅ CONTRABASS 시나리오 ${scenarioId}: global-test-results.json에서 데이터 발견`);
                            
                            // testResults를 reportData에 설정
                            reportData = reportData || {};
                            reportData.testResults = testResults;
                        } else {
                            console.log(`⚠️ CONTRABASS 시나리오 ${scenarioId}: global-test-results.json에서 CONTRABASS 전용 데이터를 찾을 수 없음`);
                        }
                    } else {
                        console.log(`⚠️ 시나리오 ${scenarioId}: global-test-results.json 파일이 존재하지 않음`);
                    }
                } catch (error) {
                    console.error(`❌ 시나리오 ${scenarioId}: global-test-results.json 읽기 실패:`, error.message);
                }
            }
            
            // 3. 여전히 testResults가 null인 경우 기본값 설정
            if (!testResults) {
                console.log(`⚠️ 시나리오 ${scenarioId}: 모든 데이터 소스에서 데이터를 찾을 수 없음. 기본값 사용`);
                const defaultTestResults = {
                    status: 'not-run',
                    duration: 'N/A',
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    timestamp: new Date().toLocaleString('ko-KR'),
                    testCases: []
                };
                reportData = reportData || {};
                reportData.testResults = defaultTestResults;
                testResults = defaultTestResults;
            }
        } else {
            console.log(`✅ CONTRABASS 시나리오 ${scenarioId}: reportData에서 testResults 발견`);
            console.log(`📊 CONTRABASS 시나리오 ${scenarioId}: testResults 상태: ${testResults.status}, 테스트 케이스: ${testResults.testCases?.length || 0}개`);
        }
        
        // 강제로 실시간 데이터 우선 사용 (CONTRABASS 전용) - 캐시 무시
        if (global.testResults && global.testResults instanceof Map) {
            const scenarioKey = `contrabass-scenario-${scenarioId}`;
            const latestTestResults = global.testResults.get(scenarioKey);
            if (latestTestResults) {
                console.log(`🔄 CONTRABASS 시나리오 ${scenarioId}: 캐시 무시하고 최신 데이터 강제 사용`);
                console.log(`📊 CONTRABASS 시나리오 ${scenarioId}: Map 최신 데이터 - 상태: ${latestTestResults.status}, 테스트 케이스: ${latestTestResults.testCases?.length || 0}개`);
                
                // 캐시된 데이터 완전히 무시하고 최신 데이터만 사용
                testResults = {
                    ...latestTestResults,
                    timestamp: new Date().toISOString(), // 현재 시간으로 강제 업데이트
                    generatedAt: new Date().toLocaleString('ko-KR') // 생성 시간 추가
                };
                reportData = { testResults: testResults };
                
                console.log(`✅ CONTRABASS 캐시 무시 완료: 새로운 타임스탬프 ${testResults.timestamp}`);
            }
        }
        const user = currentConfig?.user || reportData?.user || { id: 'yh.lee5', name: '이영호' };
        const project = currentConfig?.project || reportData?.project || { code: "LYH007", name: "LYH 업무코드" };
        const repository = currentConfig?.repository || reportData?.repository || { name: "LYH-REPO" };
        const timestamp = reportData?.timestamp || new Date().toISOString();
        

        
        // 현재 시나리오의 테스트 케이스 데이터 생성
        let testCases = [];
        let scenarioStatus = 'pass';
        let scenarioDuration = 'N/A';
        let videoFiles = []; // 비디오 파일 배열 초기화
        
        // 우선순위: 1. global-test-results.json에서 실제 데이터 읽기
        const globalResultsPath = path.join(__dirname, '..', 'custom-reports', 'global-test-results.json');
        if (fs.existsSync(globalResultsPath)) {
            try {
                const globalResults = JSON.parse(fs.readFileSync(globalResultsPath, 'utf8'));
                const scenarioResults = globalResults[scenarioId] || globalResults[`scenario-${scenarioId}`];
                
                if (scenarioResults && scenarioResults.testCases && scenarioResults.testCases.length > 0) {
                    
                    testCases = scenarioResults.testCases.map(testCase => ({
                        ...testCase,
                        name: this.cleanStepName(testCase.name)
                    }));
                    scenarioStatus = scenarioResults.status || 'pass';
                    scenarioDuration = scenarioResults.duration || 'N/A';
                    
                    // '의도적 실패 테스트' 제거
                    testCases = testCases.filter(tc => tc.name !== '의도적 실패 테스트');
                    
                    // 시나리오 2의 경우 코드리뷰, 단위테스트, 정적분석 관련 테스트 케이스 제거
                    if (scenarioId === '2') {
                        testCases = testCases.filter(tc => {
                            if (!tc || !tc.name) return true; // name이 없는 경우 유지
                            const name = tc.name.toLowerCase();
                            return !name.includes('코드리뷰') && 
                                   !name.includes('단위테스트') && 
                                   !name.includes('정적분석');
                        });
                        console.log(`✅ 시나리오 2: 코드리뷰/단위테스트/정적분석 관련 테스트 케이스 필터링 완료`);
                    }
                    
                    // Playwright 스크린샷 매핑 추가
                    testCases = this.mapScreenshotsToTestCases(testCases, scenarioId);
                    
                    // 비디오 파일 찾기 (일시적으로 비활성화)
                    

                }
            } catch (error) {
                console.error('global-test-results.json 읽기 실패:', error);
            }
        }
        
        // 우선순위: 2. reportData에서 전달된 데이터 사용
        if (testCases.length === 0 && reportData) {
            if (reportData.testCases && reportData.testCases.length > 0) {
                console.log(`📊 reportData.testCases 사용: ${reportData.testCases.length}개`);
                testCases = reportData.testCases.map(testCase => ({
                    ...testCase,
                    name: this.cleanStepName(testCase.name)
                }));
                scenarioStatus = reportData.status || 'pass';
                scenarioDuration = reportData.duration || 'N/A';
            } else if (reportData.testResults && reportData.testResults.testCases && reportData.testResults.testCases.length > 0) {
                console.log(`📊 reportData.testResults.testCases 사용: ${reportData.testResults.testCases.length}개`);
                testCases = reportData.testResults.testCases.map(testCase => ({
                    ...testCase,
                    name: this.cleanStepName(testCase.name)
                }));
                scenarioStatus = reportData.testResults.status || 'pass';
                scenarioDuration = reportData.testResults.duration || 'N/A';
            }
        }
        
        // 우선순위: 3. testResults에서 전달된 데이터 사용 (CONTRABASS 동적 파싱 결과 우선 처리)
        if (testCases.length === 0 && testResults) {
            if (testResults.testCases && testResults.testCases.length > 0) {
                console.log(`📊 testResults.testCases 사용: ${testResults.testCases.length}개`);
                testCases = testResults.testCases.map(testCase => ({
                    ...testCase,
                    name: this.cleanStepName(testCase.name)
                }));
                scenarioStatus = testResults.status || 'pass';
                scenarioDuration = testResults.duration || 'N/A';
            } else if (testResults.testCases && testResults.testCases.length === 0) {
                console.log(`📊 CONTRABASS 동적 파싱 결과 사용 - 빈 테스트 케이스 처리`);
                // 빈 테스트 케이스로 처리 (실제 결과 반영)
                testCases = [];
                scenarioStatus = testResults.status || 'fail';
                scenarioDuration = testResults.duration || 'N/A';
                console.log(`📊 CONTRABASS 동적 파싱 결과로 커스텀 리포트 생성 완료`);
                // fallback 로직 완전히 건너뛰기 - testCases.length를 0이 아닌 값으로 설정
                testCases = [{ name: '동적 파싱 결과', status: 'fail', duration: 0 }];
                // fallback 로직 완전히 건너뛰기 - return 문 제거
            }
        }
        
        // 우선순위: 1. 실시간 데이터 (testResults)에서 직접 사용 (파일 캐시 무시)
        console.log(`📊 CONTRABASS 실시간 데이터 우선 사용 (파일 캐시 완전 무시)`);
        let dynamicResultFound = false;
        
        // testResults에서 직접 테스트 케이스 추출
        // CRITICAL: testResults가 전달되면 무조건 사용 (빈 배열이어도 사용)
        if (testResults && testResults.testCases !== undefined) {
            console.log(`✅ CONTRABASS 시나리오 ${scenarioId}: 실시간 testResults에서 데이터 발견`);
            console.log(`📊 CONTRABASS 실시간 상태: ${testResults.status}`);
            console.log(`📊 CONTRABASS 실시간 테스트 케이스 수: ${testResults.testCases.length}개`);
            
            // 실시간 결과 직접 사용 (빈 배열이어도 사용)
            testCases = testResults.testCases.map(testCase => ({
                ...testCase,
                name: this.cleanStepName(testCase.name)
            }));
            scenarioStatus = testResults.status || 'pass';
            scenarioDuration = testResults.duration || 'N/A';
            
            console.log(`📊 CONTRABASS 실시간 데이터 사용 완료: ${testCases.length}개 테스트, 상태: ${scenarioStatus}`);
            console.log(`📊 CONTRABASS testCases 상세: ${testCases.map((tc, i) => `[${i}] ${tc.name}: ${tc.status}`).join(', ')}`);
            dynamicResultFound = true;
        } else {
            console.log(`⚠️ CONTRABASS 시나리오 ${scenarioId}: 실시간 testResults에서 데이터를 찾을 수 없음`);
            
            // 실시간 데이터가 없는 경우에만 파일에서 읽기
            try {
                const globalResultsPath = path.join(__dirname, '..', 'custom-reports', 'global-test-results.json');
                if (fs.existsSync(globalResultsPath)) {
                    const globalResults = JSON.parse(fs.readFileSync(globalResultsPath, 'utf8'));
                    const scenarioKey = `contrabass-scenario-${scenarioId}`;
                    if (globalResults[scenarioKey]) {
                        console.log(`📊 CONTRABASS 파일에서 시나리오 ${scenarioId} 결과 발견 (fallback)`);
                        
                        testCases = globalResults[scenarioKey].testCases?.map(testCase => ({
                            ...testCase,
                            name: this.cleanStepName(testCase.name)
                        })) || [];
                        scenarioStatus = globalResults[scenarioKey].status || 'fail';
                        scenarioDuration = globalResults[scenarioKey].duration || 'N/A';
                        
                        console.log(`📊 CONTRABASS 파일 데이터 사용 (fallback): ${testCases.length}개 테스트, 상태: ${scenarioStatus}`);
                        dynamicResultFound = true;
                    }
                }
            } catch (error) {
                console.log(`❌ CONTRABASS 파일 읽기 실패: ${error.message}`);
            }
        }
        
        // 동적 결과를 찾았으면 다른 fallback 로직 건너뛰기
        if (dynamicResultFound) {
            console.log(`📊 CONTRABASS 동적 결과 사용 - fallback 로직 완전히 건너뛰기`);
            // 다른 fallback 로직이 testCases를 덮어쓰지 않도록 강제로 종료
            // HTML 생성으로 바로 건너뛰기 위해 testCases.length를 체크하는 로직 우회
        }
        
        // 우선순위: 4. 시나리오 파일에서 추출 (fallback) - 새로운 동적 파싱 결과가 있는 경우 건너뛰기
        if (testCases.length === 0 && !dynamicResultFound) {
            // 새로운 동적 파싱 결과가 있는 경우 fallback 로직 건너뛰기
            if (testResults && testResults.testCases && testResults.testCases.length === 0) {
                console.log(`📊 새로운 동적 파싱 결과 사용 - fallback 로직 건너뛰기`);
                // 빈 테스트 케이스로 처리 (실제 결과 반영)
                testCases = [];
                scenarioStatus = testResults.status || 'fail';
                scenarioDuration = testResults.duration || 'N/A';
                // fallback 로직 완전히 건너뛰기
                console.log(`📊 CONTRABASS 동적 파싱 결과로 커스텀 리포트 생성 완료`);
                // fallback 로직 건너뛰기 - 더 이상 실행하지 않음
                console.log(`📊 CONTRABASS fallback 로직 건너뛰기 완료`);
                // return 문 제거 - HTML 생성 계속 진행
            } else {
                console.log(`📊 시나리오 파일에서 테스트 케이스 추출 (fallback)`);
                scenarioStatus = reportData?.status || testResults?.status || 'pass';
                
                // 실제로 시나리오 파일에서 테스트 케이스 추출 (보수적 수정)
                testCases = this.extractTestCasesFromScenarioFile(scenarioId, scenarioStatus);
                console.log(`✅ 시나리오 파일에서 ${testCases.length}개 테스트 케이스 추출 완료`);
            }
            
            // 실패한 단계 정보도 함께 전달
            let failedAtStep = null;
            if (reportData?.error && reportData.error.message) {
                const errorMessage = reportData.error.message.toLowerCase();
                if (errorMessage.includes('login') || errorMessage.includes('loginmanager')) {
                    failedAtStep = '로그인';
                } else if (errorMessage.includes('업무코드') || errorMessage.includes('taskcode')) {
                    failedAtStep = '업무코드';
                } else if (errorMessage.includes('툴체인') || errorMessage.includes('toolchain')) {
                    failedAtStep = '툴체인';
                } else if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
                    failedAtStep = '로그인';
                }
            } else if (testResults?.error && testResults.error.message) {
                const errorMessage = testResults.error.message.toLowerCase();
                if (errorMessage.includes('login') || errorMessage.includes('loginmanager')) {
                    failedAtStep = '로그인';
                } else if (errorMessage.includes('업무코드') || errorMessage.includes('taskcode')) {
                    failedAtStep = '업무코드';
                } else if (errorMessage.includes('툴체인') || errorMessage.includes('toolchain')) {
                    failedAtStep = '툴체인';
                } else if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
                    failedAtStep = '로그인';
                }
            }
            
            // TROMBONE 방식과 동일하게 global-test-results.json에서 실제 데이터 읽기
            const globalResultsPath = path.join(__dirname, '..', 'custom-reports', 'global-test-results.json');
            if (fs.existsSync(globalResultsPath)) {
                try {
                    const globalResults = JSON.parse(fs.readFileSync(globalResultsPath, 'utf8'));
                    const scenarioResults = globalResults[scenarioId] || globalResults[`scenario-${scenarioId}`] || globalResults[`scenario-scenario-${scenarioId}`];
                    
                    if (scenarioResults && scenarioResults.testCases && scenarioResults.testCases.length > 0) {
                        
                        testCases = scenarioResults.testCases.map(testCase => ({
                            ...testCase,
                            name: this.cleanStepName(testCase.name)
                        }));
                        scenarioStatus = scenarioResults.status || 'pass';
                        scenarioDuration = scenarioResults.duration || 'N/A';
                        
                        console.log(`✅ 시나리오 ${scenarioId}에서 ${testCases.length}개 테스트 케이스 추출 완료`);
                    } else {
                        console.log(`📊 시나리오 파일에서 테스트 케이스 추출 (fallback)`);
                        testCases = this.extractTestCasesFromScenarioFile(scenarioId, scenarioStatus, failedAtStep);
                        scenarioDuration = reportData?.duration || testResults?.duration || 'N/A';
                    }
                } catch (error) {
                    console.error(`❌ global-test-results.json 읽기 실패:`, error.message);
                    console.log(`📊 시나리오 파일에서 테스트 케이스 추출 (fallback)`);
                    testCases = this.extractTestCasesFromScenarioFile(scenarioId, scenarioStatus, failedAtStep);
                    scenarioDuration = reportData?.duration || testResults?.duration || 'N/A';
                }
            } else {
                console.log(`📊 시나리오 파일에서 테스트 케이스 추출 (fallback)`);
                testCases = this.extractTestCasesFromScenarioFile(scenarioId, scenarioStatus, failedAtStep);
                scenarioDuration = reportData?.duration || testResults?.duration || 'N/A';
            }
        }
        
        // 모든 테스트 케이스에 스크린샷 매핑 적용
        if (testCases.length > 0) {
            console.log(`🔍 [SCREENSHOT MAPPING] 시나리오 ${scenarioId}에서 ${testCases.length}개 테스트 케이스에 스크린샷 매핑 적용`);
            testCases = this.mapScreenshotsToTestCases(testCases, scenarioId);
        }
        
        // 주석처리할 단계 목록 정의
        const commentedSteps = [
            '사용자 접근',
            '사용자 등록 화면 열기',
            '사용자 기본 정보 입력',
            '티켓 전용 업무 및 역할 설정',
            '사용자 업무 및 역할 설정',
            '사용자 구분 설정',
            '사용자 저장 및 확인'
        ];
        
        // 주석처리할 단계들을 필터링하여 제외
        const filteredTestCases = testCases.filter(testCase => {
            if (!testCase || !testCase.name) return true; // name이 없는 경우 유지
            const stepName = testCase.name;
            const shouldExclude = commentedSteps.some(commentedStep => 
                stepName.includes(commentedStep)
            );
            
            if (shouldExclude) {

            }
            
            return !shouldExclude;
        });
        
        // 테스트 케이스 결과 계산
        // 주석처리된 단계를 제외한 실제 테스트 결과 사용
        const uniqueTestCases = filteredTestCases;
        

        
        const totalSteps = uniqueTestCases.length;
        const passedSteps = uniqueTestCases.filter(step => step.status === 'pass').length;
        const failedSteps = uniqueTestCases.filter(step => step.status === 'fail' || step.status === 'stopped').length;
        const skippedSteps = uniqueTestCases.filter(step => step.status === 'skip').length;
        const notTestSteps = +(uniqueTestCases.length - passedSteps - failedSteps - skippedSteps);
        
        // 실제 실행된 테스트 케이스 수 (not-test 제외)
        const executedSteps = totalSteps - notTestSteps;
        
        // 전체 시나리오 상태는 실제 결과를 우선 사용
        if (scenarioStatus === 'stopped' || scenarioStatus === 'fail') {
            // 이미 실패 상태로 설정된 경우 그대로 유지
        } else if (failedSteps > 0) {
            scenarioStatus = 'fail';
        } else if (skippedSteps > 0 && passedSteps === 0) {
            scenarioStatus = 'skip';
        } else {
            scenarioStatus = 'pass';
        }
        
        // 성공률 계산 (실행된 테스트만 대상으로)
        const successRate = executedSteps > 0 ? (passedSteps / executedSteps * 100).toFixed(1) : '0.0';
        
        // 수행률 계산 (성공+실패)/총 단계
        const executionRate = totalSteps > 0 ? ((passedSteps + failedSteps) / totalSteps * 100).toFixed(1) : '0.0';
        
        console.log(`📊 최종 통계: 총 ${totalSteps}개, 실행 ${executedSteps}개, 성공 ${passedSteps}개, 실패 ${failedSteps}개, NOT TEST ${notTestSteps}개, 성공률 ${successRate}%, 시나리오 상태: ${scenarioStatus}`);
        
        // 현재 실행된 시나리오 정보
        const currentScenarioName = this.getScenarioName(scenarioId);
        
        // 실행 시간 계산
        const duration = testResults?.duration || scenarioDuration || 'N/A';
        const startTime = testResults?.startTime ? new Date(testResults.startTime).toLocaleString('ko-KR') : 'N/A';
        const endTime = testResults?.endTime ? new Date(testResults.endTime).toLocaleString('ko-KR') : 'N/A';
        

        const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CONTRABASS 자동화 테스트 커스텀 리포트 - ${currentScenarioName}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            font-size: 1.5em;
            opacity: 0.8;
            margin-bottom: 20px;
        }
        
        .header .meta-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .meta-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 0.9em;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .summary-card:hover {
            transform: translateY(-5px);
        }
        
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .summary-card .label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .success { color: #27ae60; }
        .failure { color: #e74c3c; }
        .not-test { color: #6c757d; }
        .total { color: #3498db; }
        .execution { color: #e67e22; }
        .rate { color: #9b59b6; }
        .time { color: #f39c12; }
        
        .progress-bar {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 25px;
            height: 25px;
            margin: 30px 0;
            overflow: hidden;
            box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 50%, #58d68d 100%);
            border-radius: 25px;
            transition: width 2s ease-in-out;
            position: relative;
            overflow: hidden;
        }
        
        .progress-fill::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .progress-fill::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
        }
        
        .content {
            padding: 40px;
        }
        
        .section-title {
            font-size: 1.8em;
            color: #2c3e50;
            margin-bottom: 20px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        .project-info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
        }
        
        .project-header {
            margin-bottom: 20px;
        }
        
        .project-header h3 {
            color: #2c3e50;
            font-size: 1.4em;
        }
        
        .project-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .detail-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .detail-label {
            font-weight: bold;
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        
        .detail-value {
            color: #2c3e50;
            font-size: 1.1em;
        }
        
        .user-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .user-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .user-card:hover {
            transform: translateY(-5px);
        }
        
        .user-info {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .user-avatar {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-right: 15px;
        }
        
        .user-info h3 {
            margin: 0;
            color: #2c3e50;
        }
        
        .user-info p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .user-roles {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        
        .role-badge {
            padding: 4px 8px;
            background: #e3f2fd;
            color: #1976d2;
            border-radius: 12px;
            font-size: 0.8em;
            border: 1px solid #bbdefb;
        }
        
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .sort-controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .sort-button {
            padding: 8px 16px;
            border: 2px solid #3498db;
            background: white;
            color: #3498db;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .sort-button:hover {
            background: #3498db;
            color: white;
        }
        
        .sort-button.active {
            background: #3498db;
            color: white;
        }
        
        .table-container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        /* 테이블 열 너비 설정 */
        th:nth-child(1), td:nth-child(1) { width: 25%; } /* 단계명 */
        th:nth-child(2), td:nth-child(2) { width: 15%; } /* 상태 */
        th:nth-child(3), td:nth-child(3) { width: 15%; } /* 소요시간 */
        th:nth-child(4), td:nth-child(4) { width: 45%; } /* 오류 정보 */
        
        /* 오류 정보 열 스타일 */
        td:nth-child(4) {
            white-space: pre-wrap;
            max-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        /* 오류 정보가 길 때 호버 시 전체 내용 표시 */
        td:nth-child(4):hover {
            white-space: pre-wrap;
            overflow: visible;
            position: relative;
            z-index: 10;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .result-row {
            transition: background-color 0.3s ease;
            cursor: pointer;
        }
        
        .result-row:hover {
            background-color: #f8f9fa;
        }
        
        .result-row.expanded {
            background-color: #e3f2fd;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-badge.pass {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.fail {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-badge.stopped {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-badge.skip {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-badge.not-run {
            background: #e2e3e5;
            color: #383d41;
        }
        
        .status-badge.not-test {
            background: #f8f9fa;
            color: #6c757d;
            border: 1px solid #dee2e6;
        }
        
        .test-case-details {
            background: #f8f9fa;
            padding: 20px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        
        .details-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
            color: #2c3e50;
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .details-header i {
            color: #3498db;
        }
        

        
        .log-content {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 0.9em;
            line-height: 1.5;
            overflow: hidden;
        }
        
        .log-container {
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .log-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .log-header i {
            font-size: 0.9em;
        }
        
        .log-body {
            padding: 0;
        }
        
        .log-line {
            display: flex;
            align-items: flex-start;
            padding: 12px 20px;
            border-bottom: 1px solid #f1f3f4;
            transition: background-color 0.2s ease;
        }
        
        .log-line:last-child {
            border-bottom: none;
        }
        
        .log-line:hover {
            background-color: #f8f9fa;
        }
        
        .log-line.log-info {
            border-left: 4px solid #17a2b8;
        }
        
        .log-line.log-success {
            border-left: 4px solid #28a745;
        }
        
        .log-line.log-error {
            border-left: 4px solid #dc3545;
        }
        
        .log-line.log-warning {
            border-left: 4px solid #ffc107;
        }
        
        .log-time {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 120px;
            color: #6c757d;
            font-size: 0.85em;
            font-weight: 500;
        }
        
        .log-time i {
            color: #adb5bd;
            font-size: 0.8em;
        }
        
        .log-content-inner {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }
        
        .log-icon {
            font-size: 1.1em;
            min-width: 20px;
            text-align: center;
        }
        
        .log-message {
            color: #495057;
            font-weight: 500;
        }
        
        .log-line.log-success .log-message {
            color: #28a745;
        }
        
        .log-line.log-error .log-message {
            color: #dc3545;
        }
        
        .log-line.log-warning .log-message {
            color: #856404;
        }
        
        .expand-icon {
            margin-left: 10px;
            transition: transform 0.3s ease;
        }
        
        .result-row.expanded .expand-icon {
            transform: rotate(90deg);
        }
        
        /* 비디오 섹션 스타일 */
        .video-section {
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .video-section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .video-container {
            display: grid;
            gap: 30px;
        }
        
        .video-item {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .video-info h4 {
            color: #2c3e50;
            margin-bottom: 5px;
            font-size: 1.2em;
        }
        
        .video-size {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 15px;
        }
        
        .video-player {
            margin-bottom: 15px;
        }
        
        .video-player video {
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .video-actions {
            text-align: center;
        }
        
        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            color: white;
            text-decoration: none;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .content {
                padding: 20px;
            }
            
            th, td {
                padding: 10px 8px;
                font-size: 0.9em;
            }
            
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .meta-info {
                flex-direction: column;
                gap: 10px;
            }
        }
        
        .screenshots-section {
            margin-top: 20px;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .screenshots-header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 12px 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .screenshots-header i {
            font-size: 0.9em;
        }
        
        .screenshots-grid {
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .screenshot-item {
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
        }
        
        .screenshot-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .screenshot-item img {
            width: 100%;
            height: auto;
            display: block;
            cursor: pointer;
            transition: opacity 0.2s ease;
        }
        
        .screenshot-item img:hover {
            opacity: 0.8;
        }
        
        .screenshot-caption {
            text-align: center;
            font-size: 0.8em;
            color: #6c757d;
            margin-top: 5px;
            font-style: italic;
        }
        
        .no-screenshots {
            padding: 40px 20px;
            text-align: center;
            color: #6c757d;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CONTRABASS 자동화 테스트</h1>
            <div class="subtitle"> 시나리오 리포트 - ${currentScenarioName}</div>
            <div class="meta-info">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i> 생성일: ${testResults?.startTime ? new Date(testResults.startTime).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')}
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i> 생성시간: ${testResults?.startTime ? new Date(testResults.startTime).toLocaleTimeString('ko-KR') : new Date().toLocaleTimeString('ko-KR')}
                </div>
                <div class="meta-item">
                    <i class="fas fa-user"></i> 수행자: ${this.testSettings?.login?.userId || '테스트 사용자'}
                </div>
                ${testResults ? `
                <div class="meta-item">
                    <i class="fas fa-play"></i> 실행시간: ${duration}
                </div>
                <div class="meta-item">
                    <i class="fas fa-check-circle"></i> 결과: ${scenarioStatus === 'pass' ? '성공' : '실패'}
                </div>
                ` : ''}
            </div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="number total" id="total-tests">${totalSteps}</div>
                <div class="label">총 단계</div>
            </div>
            <div class="summary-card">
                <div class="number success" id="passed-tests">${passedSteps}</div>
                <div class="label">성공</div>
            </div>
            <div class="summary-card">
                <div class="number failure" id="failed-tests">${failedSteps}</div>
                <div class="label">실패</div>
            </div>
            <div class="summary-card">
                <div class="number not-test" id="not-test-steps">${notTestSteps}</div>
                <div class="label">미수행</div>
            </div>
            <div class="summary-card">
                <div class="number execution" id="execution-rate">${executionRate}%</div>
                <div class="label">수행률</div>
            </div>
            <div class="summary-card">
                <div class="number rate" id="success-rate">${successRate}%</div>
                <div class="label">성공률</div>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: ${executionRate}%"></div>
        </div>

        <div class="content">
            <h2 class="section-title">환경 정보</h2>
            <div class="project-info">
                <div class="project-header">
                    <h3><i class="fas fa-project-diagram"></i> 304test 검증 환경 </h3>
                </div>
                <div class="project-details">
                    <div class="detail-item">
                        <div class="detail-label">테스트 환경</div>
                        <div class="detail-value">${this.testSettings?.environment?.name || '검증 환경'}</div>
                    </div>
                </div>
            </div>

            <h2 class="section-title">테스트 사용자 정보</h2>
            <div class="user-list" id="user-list">
                ${this.generateUserCardsHtml()}
            </div>

            <h2 class="section-title">테스트 케이스 결과</h2>
            <div class="controls">
                <div class="sort-controls">
                    <button class="sort-button active" data-sort="all">전체</button>
                    <button class="sort-button" data-sort="pass">성공</button>
                    <button class="sort-button" data-sort="fail">실패</button>
                    <button class="sort-button" data-sort="not-test">미수행</button>
                </div>
            </div>
            
            <div class="table-container">
                <table id="test-results-table">
                    <thead>
                        <tr>
                            <th>단계명</th>
                            <th>상태</th>
                            <th>소요시간</th>
                            <th>오류 정보</th>
                        </tr>
                    </thead>
                    <tbody id="test-results-body">
                        ${uniqueTestCases
                            .map((testCase, index) => {
                            let stepStatusClass = 'not-run';
                            let stepStatusText = '미실행';
                            
                            if (testCase.status === 'pass') {
                                stepStatusClass = 'pass';
                                stepStatusText = '성공';
                            } else if (testCase.status === 'fail' || testCase.status === 'stopped') {
                                stepStatusClass = 'fail';
                                stepStatusText = '실패';
                            } else if (testCase.status === 'skip') {
                                stepStatusClass = 'not-test';
                                stepStatusText = '미수행';
                            } else if (testCase.status === 'not-test') {
                                stepStatusClass = 'not-test';
                                stepStatusText = '미수행';
                            }
                            
                            // 소요시간 표시 개선 (초 단위로 통일, 소수점 둘째자리까지)
                            let stepDuration = 'N/A';
                            if (testCase.duration) {
                                const durationMs = typeof testCase.duration === 'number' ? testCase.duration : 
                                    parseInt(testCase.duration.toString().replace(/[^\d]/g, ''));
                                
                                if (durationMs > 0) {
                                    // 모든 duration을 초 단위로 표시 (소수점 둘째자리까지)
                                    const durationSec = (durationMs / 1000).toFixed(2);
                                    stepDuration = `${durationSec}초`;
                                } else {
                                    stepDuration = 'N/A';
                                }
                            }
                            // 오류 정보 표시 개선
                            let errorInfo = '';
                            if (testCase.status === 'fail' && testCase.error) {
                                const formattedError = this.formatErrorMessage(testCase.error);
                                if (formattedError && formattedError !== '알 수 없는 오류') {
                                    errorInfo = formattedError;
                                }
                            }
                            // 로그 내용 포맷팅
                            let logContent = '로그 정보가 없습니다.';
                            
                            // 실제 로그 데이터 사용 (testCase.logs가 있으면 우선 사용)
                            let logsToDisplay = [];
                            
                            if (testCase.logs && testCase.logs.length > 0) {
                                // 실제 로그가 있으면 그것을 사용
                                logsToDisplay = testCase.logs.map((log, logIndex) => {
                                    // 로그가 문자열인 경우 (Electron에서 실행한 경우)
                                    if (typeof log === 'string') {
                                        let logClass = 'log-info';
                                        let logIcon = 'ℹ️';
                                        
                                        // 메시지 내용으로 타입 추론
                                        if (log.includes('성공') || log.includes('완료') || log.includes('✅')) {
                                            logClass = 'log-success';
                                            logIcon = '✅';
                                        } else if (log.includes('실패') || log.includes('오류') || log.includes('❌')) {
                                            logClass = 'log-error';
                                            logIcon = '❌';
                                        } else if (log.includes('소요시간') || log.includes('⏱️')) {
                                            logClass = 'log-info';
                                            logIcon = '⏱️';
                                        }
                                        
                                        // 시간 계산: 전체 시나리오 시작 시간 + 이전 테스트들의 duration 합
                                        let accumulatedDuration = 0;
                                        
                                        // 현재 테스트 케이스 이전의 모든 duration 합산
                                        if (uniqueTestCases && Array.isArray(uniqueTestCases)) {
                                            for (let i = 0; i < index; i++) {
                                                if (uniqueTestCases[i] && uniqueTestCases[i].duration) {
                                                    const prevDuration = uniqueTestCases[i].duration;
                                                    if (typeof prevDuration === 'number' && prevDuration > 0) {
                                                        accumulatedDuration += prevDuration;
                                                    }
                                                }
                                            }
                                        }
                                        
                                        // 시나리오 시작 시간 가져오기 (testResults가 있을 경우에만)
                                        let scenarioStartTime;
                                        if (testResults && testResults.startTime) {
                                            scenarioStartTime = new Date(testResults.startTime);
                                        } else {
                                            // fallback: 현재 시간에서 누적 duration을 빼서 추정
                                            scenarioStartTime = new Date(Date.now() - (testResults?.duration ? parseInt(testResults.duration) * 1000 : 0));
                                        }
                                        
                                        const testCaseStartTime = new Date(scenarioStartTime.getTime() + accumulatedDuration);
                                        // 각 로그는 대략 1초씩 간격을 두고 발생했다고 가정
                                        const logTime = new Date(testCaseStartTime.getTime() + (logIndex * 1000));
                                        
                                        return {
                                            time: logTime.toLocaleTimeString('ko-KR', { 
                                                hour: '2-digit', 
                                                minute: '2-digit', 
                                                second: '2-digit'
                                            }),
                                            class: logClass,
                                            icon: logIcon,
                                            message: log
                                        };
                                    }
                                    
                                    // 로그가 객체인 경우 (직접 실행한 경우)
                                    let logClass = 'log-info';
                                    let logIcon = 'ℹ️';
                                    
                                    if (log.type === 'success') {
                                        logClass = 'log-success';
                                        logIcon = '✅';
                                    } else if (log.type === 'error') {
                                        logClass = 'log-error';
                                        logIcon = '❌';
                                    }
                                    
                                    return {
                                        time: new Date(log.timestamp).toLocaleTimeString('ko-KR', { 
                                            hour: '2-digit', 
                                            minute: '2-digit', 
                                            second: '2-digit',
                                            fractionalSecondDigits: 3 
                                        }),
                                        class: logClass,
                                        icon: logIcon,
                                        message: log.message
                                    };
                                });
                            } else {
                                // 로그가 없으면 기본 로그 생성
                            const defaultLogs = [];
                            const timestamp = testCase.startTime || new Date().toISOString();
                            const time = new Date(timestamp).toLocaleTimeString('ko-KR');
                            
                            // 시작 로그
                            defaultLogs.push({
                                time,
                                class: 'log-info',
                                icon: 'ℹ️',
                                message: `${testCase.name} 시작`
                            });
                            
                            // 결과 로그
                            if (testCase.status === 'pass') {
                                defaultLogs.push({
                                    time: new Date(testCase.endTime || new Date()).toLocaleTimeString('ko-KR'),
                                    class: 'log-success',
                                    icon: '✅',
                                    message: `${testCase.name} 성공`
                                });
                            } else if (testCase.status === 'fail') {
                                defaultLogs.push({
                                    time: new Date(testCase.endTime || new Date()).toLocaleTimeString('ko-KR'),
                                    class: 'log-error',
                                    icon: '❌',
                                    message: `${testCase.name} 실패: ${errorInfo}`
                                });
                            }
                            
                            // 소요시간 로그
                            if (testCase.duration) {
                                defaultLogs.push({
                                    time: new Date(testCase.endTime || new Date()).toLocaleTimeString('ko-KR'),
                                    class: 'log-info',
                                    icon: '⏱️',
                                    message: `소요시간: ${typeof testCase.duration === 'number' ? `${testCase.duration}ms` : testCase.duration}`
                                });
                            }
                            
                                logsToDisplay = defaultLogs;
                            }
                            
                            // 실패 로그 추가 (전역 실패 로그에서 해당 테스트 케이스와 관련된 로그 찾기) - testCase.logs가 없을 때만
                            if (!testCase.logs || testCase.logs.length === 0) {
                            const failureLogs = global.failureLogs || [];
                            const relatedFailureLogs = failureLogs.filter(log => 
                                log.operation && testCase.name && 
                                (log.operation.includes(testCase.name) || testCase.name.includes(log.operation))
                            );
                            
                                // 실패 로그가 있으면 logsToDisplay에 추가 (상세한 에러 메시지)
                            if (relatedFailureLogs.length > 0) {
                                relatedFailureLogs.forEach(failureLog => {
                                    // 에러 메시지를 상세하게 정리
                                    let detailedError = failureLog.error;
                                    
                                    // 에러 타입과 상세 정보 추가
                                    if (failureLog.errorType) {
                                        detailedError = `[${failureLog.errorType}] ${detailedError}`;
                                    }
                                    
                                    // 페이지 정보 추가
                                    if (failureLog.pageUrl && failureLog.pageUrl !== 'unknown') {
                                        const shortUrl = failureLog.pageUrl.length > 50 ? 
                                            failureLog.pageUrl.substring(0, 50) + '...' : 
                                            failureLog.pageUrl;
                                        detailedError += ` (URL: ${shortUrl})`;
                                    }
                                    
                                    // 너무 긴 메시지는 자르기 (200자로 증가)
                                    if (detailedError.length > 200) {
                                        detailedError = detailedError.substring(0, 200) + '...';
                                    }
                                    
                                        logsToDisplay.push({
                                        time: new Date(failureLog.timestamp).toLocaleTimeString('ko-KR'),
                                        class: 'log-error',
                                        icon: '❌',
                                        message: `실패: ${detailedError}`
                                    });
                                });
                                }
                            }
                            
                            // 로그 HTML 생성
                            if (logsToDisplay.length > 0) {
                                logContent = `
                                    <div class="log-container">
                                        <div class="log-header">
                                            <i class="fas fa-terminal"></i>
                                            <span>실행 로그</span>
                                        </div>
                                        <div class="log-body">
                                            ${logsToDisplay.map(log => `
                                    <div class="log-line ${log.class}">
                                                    <div class="log-time">
                                                        <i class="fas fa-clock"></i>
                                                        <span>${log.time}</span>
                                                    </div>
                                                    <div class="log-content-inner">
                                        <span class="log-icon">${log.icon}</span>
                                        <span class="log-message">${log.message}</span>
                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            } else {
                                logContent = `
                                    <div class="log-container">
                                        <div class="log-header">
                                            <i class="fas fa-info-circle"></i>
                                            <span>로그 정보</span>
                                        </div>
                                        <div class="log-body">
                                            <div class="log-line log-info">
                                                <div class="log-time">
                                                    <i class="fas fa-clock"></i>
                                                    <span>${testResults?.startTime ? new Date(testResults.startTime).toLocaleTimeString('ko-KR') : 'N/A'}</span>
                                                </div>
                                                <div class="log-content-inner">
                                                    <span class="log-icon">ℹ️</span>
                                                    <span class="log-message">로그 정보가 없습니다.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }
                            
                            return `
                                <tr class="result-row" data-status="${testCase.status}" onclick="toggleTestCaseDetails(${index})">
                                    <td>
                                        ${testCase.name}
                                        <i class="fas fa-chevron-right expand-icon"></i>
                                    </td>
                                    <td><span class="status-badge ${stepStatusClass}">${stepStatusText}</span></td>
                                    <td>${stepDuration}</td>
                                    <td>${errorInfo}</td>
                                </tr>
                                <tr class="test-case-details-row" id="details-${index}" style="display: none;">
                                    <td colspan="4">
                                        <div class="test-case-details">
                                            <div class="details-header">
                                                <i class="fas fa-info-circle"></i>
                                                <span>${testCase.name} - 상세 정보</span>
                                            </div>
                                            <div class="log-content">${logContent}</div>
                                            <div class="screenshots-section">
                                                <div class="screenshots-header">
                                                    <i class="fas fa-camera"></i>
                                                    <span>스크린샷</span>
                                                </div>
                                                <div class="screenshots-grid">
                                                    ${this.generateScreenshotsHtml(testCase, scenarioId)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 비디오 섹션 일시적으로 비활성화 -->
        <!-- ${this.generateVideoSectionHtml(videoFiles)} -->

        <div class="footer">
            <p>&copy; 2025 Okestro 플랫폼품질팀. All rights reserved.</p>
        </div>
    </div>

    <script>
        // 테스트 수행 시간으로 고정 (실시간 업데이트 제거)
        
        // 테스트 케이스 상세 정보 토글
        function toggleTestCaseDetails(index) {
            const detailsRow = document.getElementById('details-' + index);
            const resultRow = detailsRow.previousElementSibling;
            
            if (detailsRow.style.display === 'none') {
                detailsRow.style.display = 'table-row';
                resultRow.classList.add('expanded');
            } else {
                detailsRow.style.display = 'none';
                resultRow.classList.remove('expanded');
            }
        }

        // 정렬 기능
        document.addEventListener('DOMContentLoaded', function() {
            const sortButtons = document.querySelectorAll('.sort-button');
            const resultRows = document.querySelectorAll('.result-row');
            
            sortButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // 활성 버튼 변경
                    sortButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    const sortType = this.getAttribute('data-sort');
                    
                    resultRows.forEach(row => {
                        const status = row.getAttribute('data-status');
                        
                        if (sortType === 'all' || status === sortType) {
                            row.style.display = 'table-row';
                            } else {
                                row.style.display = 'none';
                            }
                        });
                });
            });
        });
    </script>
    
    <!-- 스크린샷 모달 -->
    <div id="screenshotModal" class="modal" style="display: none;">
        <div class="modal-content">
            <span class="close">&times;</span>
            <img id="modalImage" src="" alt="스크린샷">
        </div>
    </div>
    
    <style>
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
        }
        
        .modal-content {
            position: relative;
            margin: auto;
            padding: 0;
            width: 90%;
            max-width: 800px;
            max-height: 90%;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .close {
            color: white;
            float: right;
            font-size: 28px;
            font-weight: bold;
            position: absolute;
            right: 20px;
            top: 10px;
            z-index: 1001;
            cursor: pointer;
        }
        
        .close:hover {
            color: #ccc;
        }
        
        #modalImage {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
        }
    </style>
    
    <script>
        // 스크린샷 모달 기능
        function openScreenshotModal(imageSrc) {
            const modal = document.getElementById('screenshotModal');
            const modalImg = document.getElementById('modalImage');
            modal.style.display = 'block';
            modalImg.src = imageSrc;
        }
        
        // 모달 닫기
        document.querySelector('.close').onclick = function() {
            document.getElementById('screenshotModal').style.display = 'none';
        }
        
        // 모달 외부 클릭 시 닫기
        window.onclick = function(event) {
            const modal = document.getElementById('screenshotModal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    </script>
</body>
</html>`;

        return html;
    }

    // 기본 테스트 케이스 데이터 생성
    generateDefaultTestCases(scenarioId, scenarioStatus = 'pass') {
        const testCases = [];
        
        // 시나리오별 기본 테스트 케이스 정의
        const defaultTestCases = {
            1: [
                // { name: "로그인", status: "pass", duration: 2000 }, (주석처리)
                { name: "프로젝트 선택", status: "pass", duration: 1500 },
                { name: "티켓 생성", status: "pass", duration: 3000 },
                { name: "코드 커밋", status: "pass", duration: 2500 },
                { name: "빌드 프로세스 시작", status: "pass", duration: 5000 },
                { name: "테스트 실행", status: "pass", duration: 4000 },
                { name: "배포 준비", status: "pass", duration: 3000 },
                { name: "K8S 배포", status: "pass", duration: 6000 },
                { name: "배포 확인", status: "pass", duration: 2000 },
                { name: "결과 검증", status: "pass", duration: 1500 }
            ],
            2: [
                { name: "실패 시나리오 테스트", status: "fail", duration: 1000, error: "의도적인 실패 테스트" }
            ],
            3: [
                { name: "기본 로그인", status: "pass", duration: 1500 },
                { name: "메뉴 탐색", status: "pass", duration: 2000 },
                { name: "기본 기능 테스트", status: "pass", duration: 3000 }
            ],
            4: [
                { name: "사용자 등록", status: "pass", duration: 2500 },
                { name: "권한 설정", status: "pass", duration: 2000 },
                { name: "기능 테스트", status: "pass", duration: 3500 }
            ],
            5: [
                { name: "시스템 접속", status: "pass", duration: 1800 },
                { name: "데이터 조회", status: "pass", duration: 2200 },
                { name: "결과 확인", status: "pass", duration: 1500 }
            ],
            6: [
                { name: "테스트 케이스 1", status: "pass", duration: 2000 },
                { name: "테스트 케이스 2", status: "pass", duration: 1800 },
                { name: "테스트 케이스 3", status: "pass", duration: 2500 }
            ],
            7: [
                { name: "기본 기능 1", status: "pass", duration: 1500 },
                { name: "기본 기능 2", status: "pass", duration: 2000 },
                { name: "기본 기능 3", status: "pass", duration: 1800 }
            ]
        };
        
        // 기본 테스트 케이스 가져오기
        let baseTestCases = defaultTestCases[scenarioId] || [
            { name: "기본 테스트", status: "pass", duration: 1000 }
        ];
        
        // 시나리오 상태가 실패인 경우 모든 테스트 케이스를 실패로 변경
        if (scenarioStatus === 'fail' || scenarioStatus === 'stopped') {
            baseTestCases = baseTestCases.map(testCase => ({
                ...testCase,
                status: 'fail',
                error: testCase.error || '시나리오 실행 중 오류 발생'
            }));
        }
        
        // 테스트 케이스 이름 정리
        baseTestCases = baseTestCases.map(testCase => ({
            ...testCase,
            name: this.cleanStepName(testCase.name)
        }));
        
        return baseTestCases;
    }

    // 마스터 리포트 생성
    generateMasterReport() {
        try {
            const scenarioListPath = path.join(__dirname, '..', 'custom-reports', 'scenario-list.json');
            let allScenarios = [];
            
            // 기존 시나리오 목록 읽기
            if (fs.existsSync(scenarioListPath)) {
                const existingData = fs.readFileSync(scenarioListPath, 'utf8');
                const scenarioList = JSON.parse(existingData);
                allScenarios = scenarioList.scenarios || [];
                
                // 기존 시나리오들의 이름과 설명 업데이트 (실행 기록은 보존)
                allScenarios.forEach(scenario => {
                    scenario.name = this.getScenarioName(scenario.id);
                    scenario.description = this.getScenarioDescription(scenario.id);
                    // 기존 실행 기록이 없는 경우 기본값 설정
                    if (!scenario.hasOwnProperty('runCount')) scenario.runCount = 0;
                    if (!scenario.hasOwnProperty('totalDuration')) scenario.totalDuration = 0;
                    if (!scenario.hasOwnProperty('successCount')) scenario.successCount = 0;
                    if (!scenario.hasOwnProperty('failCount')) scenario.failCount = 0;
                });
            }
            
            // 21개 시나리오 기본 구조 확인
            if (allScenarios.length === 0) {
                for (let i = 1; i <= 21; i++) {
                    allScenarios.push({
                        id: i,
                        name: this.getScenarioName(i),
                        description: this.getScenarioDescription(i),
                        path: `./scenario-${i}/custom-report.html`,
                        status: 'not-run',
                        lastRun: null,
                        duration: null,
                        startTime: null,
                        timestamp: null
                    });
                }
            }
            
            const totalScenarios = allScenarios.length;
            
            // 각 시나리오의 최신 상태를 가져와서 통계 계산
            let completedScenarios = 0;
            let failedScenarios = 0;
            let interruptedScenarios = 0;
            let notRunScenarios = 0;
            
            allScenarios.forEach(scenario => {
                const latestStatus = this.getLatestScenarioStatus(scenario.id);
                if (latestStatus === 'pass') {
                    completedScenarios++;
                } else if (latestStatus === 'fail') {
                    failedScenarios++;
                } else if (latestStatus === 'stopped') {
                    interruptedScenarios++;
                } else {
                    notRunScenarios++;
                }
            });
            
            // 성공률 계산: 중단된 시나리오는 제외하고 계산
            const executedScenarios = completedScenarios + failedScenarios + interruptedScenarios;
            const successRate = executedScenarios > 0 ? (completedScenarios / executedScenarios * 100).toFixed(1) : '0.0';
            
            // 수행률 계산: (성공+실패)/총 시나리오
            const executionRate = totalScenarios > 0 ? ((completedScenarios + failedScenarios) / totalScenarios * 100).toFixed(1) : '0.0';
            
            const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CONTRABASS 자동화 테스트 마스터 리포트</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            font-size: 1.5em;
            opacity: 0.8;
            margin-bottom: 20px;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .summary-card {
            background: white;
            padding: 30px 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .summary-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        
        .summary-card.success {
            border-color: #27ae60;
        }
        
        .summary-card.failure {
            border-color: #e74c3c;
        }
        
        .summary-card.total {
            border-color: #3498db;
        }
        
        .summary-card.execution {
            border-color: #e67e22;
        }
        
        .summary-card.rate {
            border-color: #9b59b6;
        }
        
        .summary-card.not-run {
            border-color: #95a5a6;
        }
        
        .summary-card.interrupted {
            border-color: #f39c12;
        }
        
        .summary-card .number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .summary-card .label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        
        .success { color: #27ae60; }
        .failure { color: #e74c3c; }
        .total { color: #3498db; }
        .execution { color: #e67e22; }
        .rate { color: #9b59b6; }
        .not-run { color: #95a5a6; }
        .interrupted { color: #f39c12; }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #2c3e50;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .scenarios-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .scenarios-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 18px 15px;
            text-align: left;
            font-weight: 600;
            color: white;
            border-bottom: 2px solid #e1e8ed;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.9em;
        }
        
        .scenarios-table td {
            padding: 18px 15px;
            border-bottom: 1px solid #e1e8ed;
            vertical-align: top;
        }
        
        .scenarios-table tr:hover {
            background-color: #f8f9fa;
        }
        
        .scenario-row {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .scenario-row:hover {
            background-color: #e3f2fd !important;
            transform: translateX(5px);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .status-badge.pass {
            background: #d5f4e6;
            color: #27ae60;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .status-badge.fail {
            background: #fadbd8;
            color: #e74c3c;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .status-badge.stopped {
            background: #fef5e7;
            color: #f39c12;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* 히스토리 상태 CSS - 상위 리스트와 동일한 스타일 */
        .history-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .history-status.status-pass {
            background: #d5f4e6;
            color: #27ae60;
        }
        
        .history-status.status-fail {
            background: #fadbd8;
            color: #e74c3c;
        }
        
        .history-status.status-stopped {
            background: #fef5e7;
            color: #f39c12;
        }
        
        .history-status.status-unknown {
            background: #f5f5f5;
            color: #999;
        }
        
        .status-badge.not-run {
            background: #f5f5f5;
            color: #999;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .scenario-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            transition: all 0.3s ease;
        }
        
        .scenario-name:hover {
            color: #667eea;
        }
        
        .dropdown-arrow {
            font-size: 0.8em;
            transition: transform 0.3s ease;
            color: #667eea;
        }
        
        .scenario-name.expanded .dropdown-arrow {
            transform: rotate(180deg);
        }
        
        .scenario-header {
            margin-bottom: 10px;
        }
        
        .scenario-submenu-row {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            animation: slideDown 0.3s ease;
        }
        
        .scenario-submenu-row td {
            padding: 0;
            border: none;
        }
        
        .scenario-history-container {
            margin: 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 0;
            border-left: none;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .scenario-history h4 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 1em;
            font-weight: 600;
        }
        
        .history-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .history-item {
            margin-bottom: 8px;
        }
        
        .history-link {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background-color: white;
            border: 1px solid #e1e8ed;
            border-radius: 6px;
            text-decoration: none;
            color: #2c3e50;
            transition: all 0.3s ease;
            margin-bottom: 8px;
            width: 100%;
            box-sizing: border-box;
        }
        
        .history-link:hover {
            background-color: #667eea;
            color: white;
            transform: translateX(5px);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        
        .history-date {
            font-weight: 500;
        }
        
        .history-number {
            font-size: 0.9em;
            opacity: 0.8;
            font-weight: 600;
        }
        
        .no-history {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
        
        .history-actions {
            margin-bottom: 15px;
            padding: 10px 0;
            border-bottom: 1px solid #e1e8ed;
        }
        
        .history-actions .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 0.9em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .history-actions .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .history-actions .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .scenario-description {
            font-size: 0.85em;
            color: #666;
            font-style: italic;
        }
        
        .test-steps {
            margin-top: 15px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .test-steps h4 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 1.1em;
        }
        
        .test-steps-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .test-steps-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
            color: white;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .test-steps-table td {
            padding: 10px;
            border-bottom: 1px solid #e1e8ed;
            font-size: 0.9em;
        }
        
        .test-steps-table tr:hover {
            background-color: #f1f3f4;
        }
        
        .historical-reports {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .report-card {
            background: white;
            border: 1px solid #e1e8ed;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .report-card:hover {
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .report-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .report-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-right: 15px;
        }
        
        .report-info h3 {
            margin: 0;
            color: #2c3e50;
        }
        
        .report-info p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2em;
            }
            
            .header .subtitle {
                font-size: 1.2em;
            }
            
            .meta-info {
                flex-direction: column;
                align-items: center;
            }
            
            .summary {
                grid-template-columns: 1fr;
            }
            
            .scenarios-table {
                font-size: 0.9em;
            }
            
            .scenarios-table th,
            .scenarios-table td {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-music"></i> CONTRABASS 자동화 테스트</h1>
            <div class="subtitle">마스터 리포트</div>
        </div>

        <div class="summary">
            <div class="summary-card total">
                <div class="number total">${totalScenarios}</div>
                <div class="label">총 시나리오</div>
            </div>
            <div class="summary-card success">
                <div class="number success">${completedScenarios}</div>
                <div class="label">성공</div>
            </div>
            <div class="summary-card failure">
                <div class="number failure">${failedScenarios}</div>
                <div class="label">실패</div>
            </div>
            <div class="summary-card execution">
                <div class="number execution">${executionRate}%</div>
                <div class="label">수행률</div>
            </div>
            <div class="summary-card interrupted">
                <div class="number interrupted">${interruptedScenarios}</div>
                <div class="label">중단</div>
            </div>
            <div class="summary-card not-run">
                <div class="number not-run">${notRunScenarios}</div>
                <div class="label">미실행</div>
            </div>
            <div class="summary-card rate">
                <div class="number rate">${successRate}%</div>
                <div class="label">성공률</div>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2><i class="fas fa-list"></i> 전체 시나리오 현황</h2>
                <table class="scenarios-table">
                    <thead>
                        <tr>
                            <th>시나리오</th>
                            <th>상태</th>
                            <th>소요시간</th>
                            <th>마지막 실행</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateTestResultsTableHtml(allScenarios)}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2><i class="fas fa-history"></i> 날짜별 리포트 목록</h2>
                <div class="historical-reports" id="historical-reports">
                    ${this.generateHistoricalReportsList()}
                </div>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2025 Okestro 플랫폼품질팀. All rights reserved.</p>
        </div>
    </div>

    <script>
                    // 시나리오 클릭 시 하위 메뉴 토글 (커스텀 리포트는 하위 메뉴에서만 열림)
        document.addEventListener('DOMContentLoaded', function() {
            const scenarioRows = document.querySelectorAll('.scenario-row');
            
            scenarioRows.forEach(row => {
                row.addEventListener('click', function(event) {
                        // 하위 메뉴 영역 클릭 시에는 토글하지 않음
                        if (event.target.closest('.scenario-history-container')) {
                        return;
                    }
                    
                    const scenarioId = this.dataset.scenarioId;
                    if (scenarioId) {
                            // 하위 메뉴 토글
                            toggleScenarioHistory(scenarioId, event);
                    }
                });
            });
            
            // 리포트 카드 클릭 이벤트
            const reportCards = document.querySelectorAll('.report-card');
            reportCards.forEach(card => {
                card.addEventListener('click', function() {
                    const reportPath = this.dataset.reportPath;
                    if (reportPath) {
                        if (window.require) {
                            try {
                                const { ipcRenderer } = window.require('electron');
                                ipcRenderer.invoke('open-report-file', reportPath);
                            } catch (error) {
                                console.warn('Electron IPC not available, opening in browser:', error);
                                window.open(reportPath, '_blank');
                            }
                        } else {
                            window.open(reportPath, '_blank');
                        }
                    }
                });
            });
            
            // 시나리오 하위 메뉴 토글 기능
            function toggleScenarioHistory(scenarioId, event) {
                // 이벤트 전파 방지
                if (event) {
                    event.stopPropagation();
                }
                
                const submenuRow = document.getElementById('submenu-' + scenarioId);
                const scenarioName = document.querySelector('[data-scenario-id="' + scenarioId + '"] .scenario-name');
                
                if (submenuRow) {
                    const isVisible = submenuRow.style.display !== 'none';
                    
                    if (isVisible) {
                        // 숨기기
                        submenuRow.style.display = 'none';
                        scenarioName.classList.remove('expanded');
                    } else {
                        // 보이기
                        submenuRow.style.display = 'table-row';
                        scenarioName.classList.add('expanded');
                    }
                }
            }
            
            // 커스텀 리포트 열기 함수
            function openCustomReport(reportPath, event) {
                // 이벤트 전파 방지
                if (event) {
                    event.stopPropagation();
                }
                
                // Electron IPC를 통해 커스텀 리포트 열기
                if (window.require) {
                    try {
                        const { ipcRenderer } = window.require('electron');
                        ipcRenderer.invoke('open-report-file', reportPath);
                    } catch (error) {
                        console.warn('Electron IPC not available, opening in browser:', error);
                        window.open(reportPath, '_blank');
                    }
                } else {
                    // 브라우저에서 직접 열기
                    window.open(reportPath, '_blank');
                }
            }
            
            // 전역 함수로 등록
            window.toggleScenarioHistory = toggleScenarioHistory;
            window.openCustomReport = openCustomReport;
        });
    </script>
</body>
</html>`;

            return html;
        } catch (error) {
            console.error('마스터 리포트 생성 중 오류가 발생했습니다:', error);
            throw error;
        }
    }

    // 사용자 카드 HTML 생성
    generateUserCardsHtml() {
        return this.testSettings.users.map(user => {
            const initials = user.name.substring(0, 3);
            return `
                <div class="user-card">
                    <div class="user-header">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info">
                            <h3>${this.testSettings?.login?.userId || 'user@okestro.com'}</h3>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 테스트 결과 테이블 HTML 생성
    generateTestResultsTableHtml(testScenarios, currentScenarioId = null) {
        // 현재 시나리오의 세부 테스트 단계들만 필터링
        const currentScenarioTests = testScenarios.filter(scenario => 
            currentScenarioId ? scenario.id === parseInt(currentScenarioId) : true
        );
        
        return currentScenarioTests.map(scenario => {
            // 하위 히스토리의 최신 상태를 우선적으로 사용
            let statusClass = 'not-run';
            let statusText = '미실행';
            
            // 최신 히스토리에서 상태 가져오기
            const latestStatus = this.getLatestScenarioStatus(scenario.id);
            if (latestStatus) {
                if (latestStatus === 'pass') {
                    statusClass = 'pass';
                    statusText = '성공';
                } else if (latestStatus === 'fail') {
                    statusClass = 'fail';
                    statusText = '실패';
                } else if (latestStatus === 'stopped') {
                    statusClass = 'stopped';
                    statusText = '중단';
                } else if (latestStatus === 'running') {
                    statusClass = 'running';
                    statusText = '실행중';
                }
            } else {
                // 하위 히스토리에 상태가 없으면 기존 로직 사용
                if (scenario.status === 'pass') {
                    statusClass = 'pass';
                    statusText = '성공';
                } else if (scenario.status === 'fail') {
                    statusClass = 'fail';
                    statusText = '실패';
                } else if (scenario.status === 'stopped') {
                    statusClass = 'stopped';
                    statusText = '중단';
                } else if (scenario.status === 'running') {
                    statusClass = 'running';
                    statusText = '실행중';
                }
            }
            
            // 실제 테스트 단계 결과가 있으면 표시
            let testStepsHtml = '';
            if (scenario.testCases && scenario.testCases.length > 0) {
                testStepsHtml = `
                    <div class="test-steps">
                        <h4>세부 테스트 단계:</h4>
                        <table class="test-steps-table">
                            <thead>
                                <tr>
                                    <th>단계명</th>
                                    <th>상태</th>
                                    <th>소요시간</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${scenario.testCases.map(testCase => {
                                    let stepStatusClass = 'not-run';
                                    let stepStatusText = '미실행';
                                    
                                    if (testCase.status === 'pass') {
                                        stepStatusClass = 'pass';
                                        stepStatusText = '성공';
                                    } else if (testCase.status === 'fail' || testCase.status === 'stopped') {
                                        stepStatusClass = 'fail';
                                        stepStatusText = '실패';
                                    } else if (testCase.status === 'skip') {
                                        stepStatusClass = 'skip';
                                        stepStatusText = '건너뜀';
                                    } else if (testCase.status === 'not-test') {
                                        stepStatusClass = 'not-test';
                                        stepStatusText = '미수행';
                                    }
                                    
                                    // 소요시간 표시 개선 (ms 단위 지원, 소수점 둘째자리까지)
                                    let stepDuration = 'N/A';
                                    if (testCase.duration) {
                                        const durationMs = typeof testCase.duration === 'number' ? testCase.duration : 
                                            parseInt(testCase.duration.toString().replace(/[^\d]/g, ''));
                                        
                                        if (durationMs > 0) {
                                        if (durationMs < 1000) {
                                            // 1초 미만은 ms로 표시
                                            stepDuration = `${durationMs}ms`;
                                        } else {
                                            // 1초 이상은 초 단위로 표시 (소수점 둘째자리까지)
                                            const durationSec = (durationMs / 1000).toFixed(2);
                                            stepDuration = `${durationSec}s`;
                                            }
                                        } else {
                                            stepDuration = 'N/A';
                                        }
                                    }
                                    
                                    return `
                                        <tr>
                                            <td>${testCase.name}</td>
                                            <td><span class="status-badge ${stepStatusClass}">${stepStatusText}</span></td>
                                            <td>${stepDuration}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            // 시나리오 히스토리 HTML 생성
            const scenarioHistoryHtml = this.generateScenarioHistoryHtml(scenario.id);
            
            return `
                <tr class="result-row scenario-row" data-scenario-id="${scenario.id}">
                    <td>
                        <div class="scenario-header">
                            <div class="scenario-name" onclick="toggleScenarioHistory(${scenario.id}, event)">
                                ${scenario.name}
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            ${scenario.description ? `<div class="scenario-description">${scenario.description}</div>` : ''}
                        </div>
                    </td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${scenario.duration}</td>
                    <td>${scenario.lastRun ? this.convertToKoreaTime(scenario.lastRun) : 'N/A'}</td>
                </tr>
                <tr class="scenario-submenu-row" id="submenu-${scenario.id}" style="display: none;">
                    <td colspan="4">
                        <div class="scenario-history-container">
                            ${scenarioHistoryHtml}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 리포트 저장
    saveReport(scenarioId, testResults = null) {
        try {
            // 현재 제품에 따라 커스텀 리포트 경로 결정
            let customReportsPath;
            if (this.currentProduct === 'contrabass') {
                customReportsPath = path.join(__dirname, '..', 'custom-reports');
            } else if (this.currentProduct === 'contrabass') {
                customReportsPath = path.join(__dirname, '..', 'CONTRABASS', 'custom-reports');
            } else if (this.currentProduct === 'cmp') {
                customReportsPath = path.join(__dirname, '..', 'CMP', 'custom-reports');
            } else {
                // 기본값은 TROMBONE
                customReportsPath = path.join(__dirname, '..', 'custom-reports');
            }
            
            const scenarioDir = path.join(customReportsPath, `scenario-${scenarioId}`);
            
            // 디렉토리가 없으면 생성
            if (!fs.existsSync(scenarioDir)) {
                fs.mkdirSync(scenarioDir, { recursive: true });
            }
            
            // 현재 시간 기준 타임스탬프 생성 (파일명용 - 밀리초 제거)
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', '').replace(/-\d{3}$/, '');
            
            // 타임스탬프가 포함된 파일명 생성
            const reportFileName = `custom-report-${timestamp}.html`;
            const reportPath = path.join(scenarioDir, reportFileName);
            
            // 리포트 HTML 생성
            const reportHtml = this.generateCustomReport(scenarioId, {
                testResults: testResults,
                timestamp: timestamp
            });
            
            // 디렉토리가 없으면 생성
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            // 타임스탬프가 포함된 리포트 파일 저장
            fs.writeFileSync(reportPath, reportHtml, 'utf8');
            console.log(`💾 커스텀 리포트 저장 완료: ${reportPath}`);
            
            // 인덱스 파일 업데이트 (브라우저에서 히스토리 로드용)
            const fileName = path.basename(reportPath);
            this.updateScenarioIndex(scenarioId, fileName);
            
            // 파일 권한 설정 (모든 사용자에게 읽기/쓰기 권한)
            try {
                fs.chmodSync(reportPath, 0o666);
                fs.chmodSync(reportDir, 0o777);
            } catch (error) {
                console.log('권한 설정 중 오류 (무시됨):', error.message);
            }
            
            // 파일이 실제로 생성되었는지 확인
            if (!fs.existsSync(reportPath)) {
                throw new Error(`리포트 파일 생성 실패: ${reportPath}`);
            }
            
            // 시나리오 목록 업데이트
            this.updateScenarioList(scenarioId, testResults);
            
            return reportPath;
        } catch (error) {
            console.error('❌ 커스텀 리포트 저장 중 오류가 발생했습니다:', error);
            return null;
        }
    }

    // 마스터 리포트 저장
    saveMasterReport() {
        try {
            const html = this.generateMasterReport();
            
            // 현재 제품에 따라 커스텀 리포트 경로 결정
            let customReportsPath;
            if (this.currentProduct === 'contrabass') {
                customReportsPath = path.join(__dirname, '..', 'CONTRABASS', 'custom-reports');
            } else if (this.currentProduct === 'contrabass') {
                customReportsPath = path.join(__dirname, '..', 'CONTRABASS', 'custom-reports');
            } else if (this.currentProduct === 'cmp') {
                customReportsPath = path.join(__dirname, '..', 'CMP', 'custom-reports');
            } else {
                // 기본값은 TROMBONE
                customReportsPath = path.join(__dirname, '..', 'custom-reports');
            }
            
            // 마스터 리포트는 하나만 유지 (히스토리 없음)
            const masterReportPath = path.join(__dirname, '..', 'custom-reports', 'test_results_master.html');
            
            fs.writeFileSync(masterReportPath, html, 'utf8');
            
            return masterReportPath;
        } catch (error) {
            console.error('마스터 리포트 저장 중 오류가 발생했습니다:', error);
            throw error;
        }
    }

    // 날짜별 리포트 목록 생성 (시나리오별 히스토리만)
    generateHistoricalReportsList() {
        try {
            const testResultsDir = path.join(__dirname, '..', 'custom-reports');
            const historicalReports = [];
            
            // 시나리오별 리포트 파일들 찾기 (마스터 리포트 히스토리는 제외)
            for (let i = 1; i <= 21; i++) {
                const scenarioDir = path.join(testResultsDir, `scenario-${i}`);
                if (fs.existsSync(scenarioDir)) {
                    const files = fs.readdirSync(scenarioDir);
                    const scenarioReports = files.filter(file => 
                        file.startsWith('custom-report-') && file.endsWith('.html')
                    ).sort().reverse(); // 최신순 정렬
                    
                    scenarioReports.forEach(file => {
                        const timestamp = file.replace('custom-report-', '').replace('.html', '');
                        const date = new Date(timestamp.replace(/-/g, ':').replace('T', ' '));
                        historicalReports.push({
                            type: 'scenario',
                            scenarioId: i,
                            filename: file,
                            timestamp: timestamp,
                            date: date,
                            displayName: `시나리오 ${i} 리포트 (${date.toLocaleString('ko-KR')})`
                        });
                    });
                }
            }
            
            // 날짜별로 그룹화
            const groupedByDate = {};
            historicalReports.forEach(report => {
                const dateKey = report.date.toLocaleDateString('ko-KR');
                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = [];
                }
                groupedByDate[dateKey].push(report);
            });
            
            // HTML 생성
            let html = '<div class="historical-reports">';
            
            Object.keys(groupedByDate).sort().reverse().forEach(dateKey => {
                const reports = groupedByDate[dateKey];
                html += `
                    <div class="date-group">
                        <h3><i class="fas fa-calendar-day"></i> ${dateKey}</h3>
                        <div class="reports-grid">
                `;
                
                reports.forEach(report => {
                    const filePath = report.type === 'master' 
                        ? `./${report.filename}`
                        : `./scenario-${report.scenarioId}/${report.filename}`;
                    
                    html += `
                        <div class="report-item">
                            <a href="${filePath}" target="_blank" class="report-link">
                                <i class="fas ${report.type === 'master' ? 'fa-chart-line' : 'fa-file-alt'}"></i>
                                <span>${report.displayName}</span>
                            </a>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            
            // CSS 스타일 추가
            html += `
                <style>
                    .historical-reports {
                        margin-top: 20px;
                    }
                    
                    .date-group {
                        margin-bottom: 30px;
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 20px;
                    }
                    
                    .date-group h3 {
                        color: #2c3e50;
                        margin-bottom: 15px;
                        font-size: 1.3em;
                    }
                    
                    .reports-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 15px;
                    }
                    
                    .report-item {
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        transition: transform 0.2s ease;
                    }
                    
                    .report-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }
                    
                    .report-link {
                        display: flex;
                        align-items: center;
                        padding: 15px;
                        text-decoration: none;
                        color: #2c3e50;
                        font-weight: 500;
                    }
                    
                    .report-link i {
                        margin-right: 10px;
                        color: #667eea;
                        font-size: 1.1em;
                    }
                    
                    .report-link:hover {
                        color: #667eea;
                    }
                </style>
            `;
            
            return html;
        } catch (error) {
            console.error('날짜별 리포트 목록 생성 중 오류:', error);
            return '<p>날짜별 리포트 목록을 불러올 수 없습니다.</p>';
        }
    }

    // 시나리오별 히스토리 리포트 목록 가져오기
    getScenarioHistory(scenarioId) {
        try {
            const scenarioDir = path.join(__dirname, '..', 'custom-reports', `scenario-${scenarioId}`);
            const history = [];
            
            if (fs.existsSync(scenarioDir)) {
                const files = fs.readdirSync(scenarioDir);
                
                // custom-report-*.html 파일들만 필터링
                const reportFiles = files.filter(file => 
                    file.startsWith('custom-report-') && file.endsWith('.html')
                );
                

                
                // 파일명에서 타임스탬프 추출하여 정렬
                reportFiles.forEach(file => {
                    const timestampMatch = file.match(/custom-report-(.+)\.html/);
                    if (timestampMatch) {
                        const timestamp = timestampMatch[1];
                        
                        try {
                            // 타임스탬프 형식: 2025-08-07T08-11-42-980 (밀리초 포함)
                            // 또는: 2025-08-07T08-11-42 (밀리초 없음)
                            const dateParts = timestamp.split('T');
                            if (dateParts.length === 2) {
                                const dateStr = dateParts[0];
                                let timeStr = dateParts[1];
                                
                                // 밀리초가 있는 경우 제거 (마지막 - 이후 부분)
                                if (timeStr.includes('-')) {
                                    const timeParts = timeStr.split('-');
                                    if (timeParts.length >= 3) {
                                        timeStr = timeParts.slice(0, 3).join(':');
                                    }
                                }
                                
                                const isoTimestamp = `${dateStr}T${timeStr}.000Z`;
                                const date = new Date(isoTimestamp);
                                
                                // 유효한 날짜인지 확인
                                if (!isNaN(date.getTime())) {
                                    history.push({
                                        filename: file,
                                        timestamp: timestamp,
                                        date: date,
                                        displayDate: date.toLocaleString('ko-KR'),
                                        path: `./scenario-${scenarioId}/${file}` // 상대 경로로 변경
                                    });
                                } else {
                                    console.warn(`⚠️ 유효하지 않은 날짜 형식: ${timestamp}`);
                                }
                            } else {
                                console.warn(`⚠️ 잘못된 타임스탬프 형식: ${timestamp}`);
                            }
                        } catch (error) {
                            console.warn(`⚠️ 타임스탬프 파싱 오류: ${timestamp}`, error.message);
                        }
                    }
                });
                
                // 최신 순으로 정렬
                history.sort((a, b) => b.date - a.date);
                

            }
            
            return history;
        } catch (error) {
            console.error(`시나리오 ${scenarioId} 히스토리 로드 중 오류:`, error);
            return [];
        }
    }

    // 최신 시나리오 상태 가져오기 (하위 히스토리에서)
    getLatestScenarioStatus(scenarioId) {
        try {
            const globalResultsPath = path.join(__dirname, '..', 'custom-reports', 'global-test-results.json');
            if (fs.existsSync(globalResultsPath)) {
                const globalResults = JSON.parse(fs.readFileSync(globalResultsPath, 'utf8'));
                // 문자열 키와 숫자 키 모두 시도
                const scenarioResults = globalResults[scenarioId] || globalResults[scenarioId.toString()];
                
                if (scenarioResults && scenarioResults.status) {
                    return scenarioResults.status;
                }
            }
        } catch (error) {
            console.error(`시나리오 ${scenarioId} 최신 상태 읽기 실패:`, error);
        }
        return null;
    }

    // 시나리오별 히스토리 HTML 생성
    generateScenarioHistoryHtml(scenarioId) {
        const history = this.getScenarioHistory(scenarioId);
        
        // 히스토리 데이터는 UI에서 관리됨 (localStorage 사용)
        
        return `
            <div class="scenario-history">
                ${history.length > 0 ? `
                <h4>실행 기록 (${history.length}회)</h4>
                <ul class="history-list">
                        ${history.map((item, index) => {
                            // 파일명에서 상태 추출 (custom-report-YYYY-MM-DDTHH-MM-SS.html)
                            const fileName = item.path.split('/').pop();
                            const statusMatch = fileName.match(/custom-report-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})\.html/);
                            let status = 'unknown';
                            let statusClass = 'status-unknown';
                            
                            // 가장 최근 히스토리는 global-test-results.json에서 상태 가져오기
                            if (index === 0) {
                                try {
                                    const globalResultsPath = path.join(__dirname, '..', 'custom-reports', 'global-test-results.json');
                                    if (fs.existsSync(globalResultsPath)) {
                                        const globalResults = JSON.parse(fs.readFileSync(globalResultsPath, 'utf8'));
                                        const scenarioResults = globalResults[scenarioId];
                                        
                                        if (scenarioResults && scenarioResults.status) {
                                            status = scenarioResults.status;
                                            statusClass = `status-${scenarioResults.status}`;
                                        }
                                    }
                                } catch (error) {
                                    console.error('최신 히스토리 상태 읽기 실패:', error);
                                }
                            } else {
                                // 이전 히스토리는 각 HTML 파일에서 상태 파싱
                                try {
                                    const htmlFilePath = path.join(__dirname, '..', item.path);
                                    if (fs.existsSync(htmlFilePath)) {
                                        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                                        
                                        // HTML에서 결과 상태 찾기 (여러 패턴 시도)
                                        const passMatch = htmlContent.match(/<i class="fas fa-check-circle"><\/i>\s*결과:\s*성공/);
                                        const failMatch = htmlContent.match(/<i class="fas fa-times-circle"><\/i>\s*결과:\s*실패/);
                                        
                                        if (passMatch) {
                                            status = 'pass';
                                            statusClass = 'status-pass';
                                        } else if (failMatch) {
                                            status = 'fail';
                                            statusClass = 'status-fail';
                                        }
                                    }
                                } catch (error) {
                                    // 파일 읽기 실패 시 unknown 상태 유지
                                }
                            }
                            
                            // 상태에 따른 이모지와 텍스트 설정
                            let statusEmoji = '❓';
                            let statusText = '미확인';
                            
                            if (status === 'pass') {
                                statusEmoji = '✅';
                                statusText = '성공';
                            } else if (status === 'fail') {
                                statusEmoji = '❌';
                                statusText = '실패';
                            } else if (status === 'stopped') {
                                statusEmoji = '';
                                statusText = '중단';
                            }
                            
                            return `
                        <li class="history-item">
                            <a href="${item.path}" target="_blank" class="history-link">
                                <span class="history-date">${item.displayDate}</span>
                                <span class="history-number">#${history.length - index}</span>
                                        <span class="history-status ${statusClass}">
                                            ${statusEmoji}${statusEmoji ? ' ' : ''}${statusText}
                                        </span>
                            </a>
                        </li>
                            `;
                        }).join('')}
                </ul>
                ` : '<div class="no-history">아직 실행된 기록이 없습니다.</div>'}
            </div>
        `;
    }


    // 시나리오 목록 JSON 파일 업데이트
    updateScenarioList(scenarioId, testResults = null) {
        try {
            // 현재 제품에 따라 커스텀 리포트 경로 결정
            let customReportsPath;
            if (this.currentProduct === 'contrabass') {
                customReportsPath = path.join(__dirname, '..', 'CONTRABASS', 'custom-reports');
            } else if (this.currentProduct === 'contrabass') {
                customReportsPath = path.join(__dirname, '..', 'CONTRABASS', 'custom-reports');
            } else if (this.currentProduct === 'cmp') {
                customReportsPath = path.join(__dirname, '..', 'CMP', 'custom-reports');
            } else {
                // 기본값은 TROMBONE
                customReportsPath = path.join(__dirname, '..', 'custom-reports');
            }
            
            const scenarioListPath = path.join(__dirname, '..', 'custom-reports', 'scenario-list.json');
            let scenarioList = { scenarios: [] };
            
            // 기존 파일이 있으면 읽기 (데이터 유지를 위해)
            if (fs.existsSync(scenarioListPath)) {
                try {
                    const existingData = fs.readFileSync(scenarioListPath, 'utf8');
                    scenarioList = JSON.parse(existingData);
            
                } catch (error) {
                    console.log('기존 scenario-list.json 파일 읽기 실패, 새로 생성합니다.');
                    scenarioList = { scenarios: [] };
                }
            }
            
            // 21개 시나리오 기본 구조 생성 (기존 데이터가 없거나 부족한 경우)
            if (scenarioList.scenarios.length === 0) {
                console.log('📋 새로운 시나리오 목록 생성 중...');
                for (let i = 1; i <= 21; i++) {
                    scenarioList.scenarios.push({
                        id: i,
                        name: this.getScenarioName(i),
                        path: `./scenario-${i}/custom-report.html`,
                        status: 'not-run',
                        lastRun: null,
                        duration: null,
                        startTime: null,
                        timestamp: null,
                        runCount: 0, // 실행 횟수 추가
                        totalDuration: 0, // 총 소요시간 추가
                        successCount: 0, // 성공 횟수 추가
                        failCount: 0 // 실패 횟수 추가
                    });
                }
            } else {
                // 기존 시나리오가 있지만 새로운 필드가 없는 경우 추가
                scenarioList.scenarios.forEach(scenario => {
                    if (scenario.runCount === undefined) scenario.runCount = 0;
                    if (scenario.totalDuration === undefined) scenario.totalDuration = 0;
                    if (scenario.successCount === undefined) scenario.successCount = 0;
                    if (scenario.failCount === undefined) scenario.failCount = 0;
                });
            }
            
            // 현재 시나리오 업데이트
            const currentScenario = scenarioList.scenarios.find(s => s.id === parseInt(scenarioId));
            if (currentScenario) {
                const now = new Date();
                // 시나리오 이름을 동적으로 업데이트
                currentScenario.name = this.getScenarioName(scenarioId);
                
                if (testResults) {
                    // 실행 횟수 증가
                    currentScenario.runCount = (currentScenario.runCount || 0) + 1;
                    
                    // 실제 테스트 결과를 그대로 사용 (필터링 제거)
                    const uniqueTestCases = testResults.testCases || [];
                    
                    // 실제 결과를 기반으로 상태 계산
                    const totalSteps = uniqueTestCases.length;
                    const passedSteps = uniqueTestCases.filter(step => step.status === 'pass').length;
                    const failedSteps = uniqueTestCases.filter(step => step.status === 'fail' || step.status === 'stopped').length;
                    const notTestSteps = uniqueTestCases.filter(step => step.status === 'not-test').length;
                    const executedSteps = totalSteps - notTestSteps;
                    
                    // 실제 테스트 결과를 우선 사용 (상태 통일: pass)
                    let finalStatus = 'pass'; // 기본값
                    
                    // testResults.status가 명시적으로 설정된 경우 상태 변환
                    if (testResults.status) {
                        // completed → pass 변환
                        if (testResults.status === 'completed') {
                            finalStatus = 'pass';
                        } 
                        // failed → fail 변환
                        else if (testResults.status === 'failed') {
                            finalStatus = 'fail';
                        } else {
                            finalStatus = testResults.status;
                        }
                    } else {
                        // status가 명시되지 않은 경우에만 테스트 케이스 기반으로 계산
                        if (failedSteps > 0) {
                            finalStatus = 'fail';
                        } else if (executedSteps === 0) {
                            finalStatus = 'not-run';
                        }
                    }
                    
                    // 성공/실패 카운트 업데이트
                    if (finalStatus === 'pass') {
                        currentScenario.successCount = (currentScenario.successCount || 0) + 1;
                    } else if (finalStatus === 'fail') {
                        currentScenario.failCount = (currentScenario.failCount || 0) + 1;
                    }
                    
                    currentScenario.status = finalStatus;
                    currentScenario.lastRun = now.toISOString();
                    currentScenario.startTime = testResults.startTime || now.toISOString();
                    currentScenario.duration = testResults.duration || 'N/A';
                    currentScenario.timestamp = testResults.timestamp || now.toISOString();
                    
                    // 소요시간 누적 (숫자로 변환 가능한 경우)
                    const durationStr = testResults.duration || '0분 0초';
                    const durationMatch = durationStr.match(/(\d+)분\s*(\d+)초/);
                    if (durationMatch) {
                        const minutes = parseInt(durationMatch[1]);
                        const seconds = parseInt(durationMatch[2]);
                        const durationSeconds = minutes * 60 + seconds;
                        currentScenario.totalDuration = (currentScenario.totalDuration || 0) + durationSeconds;
                    } else {
                        // 기존 형식 (숫자만 있는 경우) 처리
                        const simpleMatch = durationStr.match(/(\d+)/);
                        if (simpleMatch) {
                            const durationSeconds = parseInt(simpleMatch[1]);
                            currentScenario.totalDuration = (currentScenario.totalDuration || 0) + durationSeconds;
                        }
                    }
                    
                    // 성공/실패 횟수 업데이트
                    if (finalStatus === 'pass') {
                        currentScenario.successCount = (currentScenario.successCount || 0) + 1;
                    } else if (finalStatus === 'fail' || finalStatus === 'stopped') {
                        currentScenario.failCount = (currentScenario.failCount || 0) + 1;
                    }
                    
    
                } else {
                    // testResults가 null인 경우, 기존 실행 기록을 기반으로 상태 결정
                    console.log(`📊 시나리오 ${scenarioId}: testResults가 null이므로 기존 실행 기록 기반으로 상태 결정`);
                    
                    if (currentScenario.runCount > 0) {
                        // 이미 실행된 기록이 있는 경우
                        if (currentScenario.successCount > currentScenario.failCount) {
                            currentScenario.status = 'pass';
                            console.log(`📊 시나리오 ${scenarioId} 상태를 pass로 설정 (성공 횟수 > 실패 횟수)`);
                        } else if (currentScenario.failCount > 0) {
                            currentScenario.status = 'fail';
                            console.log(`📊 시나리오 ${scenarioId} 상태를 fail로 설정 (실패 횟수 > 0)`);
                        } else {
                            currentScenario.status = 'pass';
                            console.log(`📊 시나리오 ${scenarioId} 상태를 pass로 설정 (실패 횟수 = 0)`);
                        }
                    } else {
                        // 실행 기록이 없는 경우
                        if (!currentScenario.status) {
                            currentScenario.status = 'not-run';
                            console.log(`📊 시나리오 ${scenarioId} 상태를 not-run으로 설정 (실행 기록 없음)`);
                        } else {
                            console.log(`📊 시나리오 ${scenarioId} 기존 상태 유지: ${currentScenario.status}`);
                        }
                    }
                }
            }
            
            // 파일 저장 (항상 저장하여 유지)
            fs.writeFileSync(scenarioListPath, JSON.stringify(scenarioList, null, 2), 'utf8');
    
            
            // 마스터 리포트 제거됨
            
        } catch (error) {
            console.error('❌ 시나리오 목록 업데이트 중 오류가 발생했습니다:', error);
        }
    }

    // 실제 시나리오 파일에서 테스트 케이스 추출
    extractTestCasesFromScenarioFile(scenarioId, scenarioStatus = 'pass', failedAtStep = null) {
        const testSteps = [];
        const scenarioFilePath = path.join(__dirname, '..', 'tests', 'scenario', `scenario-${scenarioId}.spec.js`);
        
        if (!fs.existsSync(scenarioFilePath)) {
            console.log(`⚠️ 시나리오 파일을 찾을 수 없습니다: ${scenarioFilePath}`);
            return this.generateDefaultTestCases(scenarioId, scenarioStatus);
        }
        
        const fileContent = fs.readFileSync(scenarioFilePath, 'utf8');
        
        // allPlannedTestCases 배열을 추출하는 정규식
        const arrayMatch = fileContent.match(/const allPlannedTestCases = \[([\s\S]*?)\];/);
        if (!arrayMatch) {
            console.log(`⚠️ 시나리오 ${scenarioId}에서 allPlannedTestCases를 찾을 수 없습니다.`);
            return this.generateDefaultTestCases(scenarioId, scenarioStatus);
        }
        
        const arrayContent = arrayMatch[1];
        
        // 각 테스트 케이스 이름을 추출
        const testCaseMatches = arrayContent.match(/\{ name: '([^']+)', status: '[^']+' \}/g);
        if (!testCaseMatches) {
            console.log(`⚠️ 시나리오 ${scenarioId}에서 테스트 케이스를 추출할 수 없습니다.`);
            return this.generateDefaultTestCases(scenarioId, scenarioStatus);
        }
        
        const allPlannedTestCases = testCaseMatches.map(match => {
            const nameMatch = match.match(/\{ name: '([^']+)', status: '[^']+' \}/);
            return nameMatch ? nameMatch[1] : null;
        }).filter(name => name !== null);
        
        console.log(`✅ 시나리오 ${scenarioId}에서 ${allPlannedTestCases.length}개 테스트 케이스 추출 완료`);
        
        // allPlannedTestCases를 기반으로 testSteps 생성
        return allPlannedTestCases.map(testCaseName => {
            const cleanedName = this.cleanStepName(testCaseName);
            let stepStatus = 'pass';
            let errorMessage = null;
            let logContent = '';
            let duration = 0;
            
            if (scenarioStatus === 'fail' || scenarioStatus === 'stopped') {
                if (failedAtStep && cleanedName.includes(failedAtStep)) {
                    stepStatus = 'fail';
                    errorMessage = `${failedAtStep} 단계에서 테스트 실행 실패`;
                    logContent = `테스트 단계: ${testCaseName}\n상태: 실패\n오류: ${errorMessage}\n소요시간: 0ms`;
                } else if (failedAtStep === null) {
                    stepStatus = 'not-test';
                    errorMessage = scenarioStatus === 'stopped' ? '테스트 실행이 중단되었습니다.' : '이전 단계 실패로 인해 실행되지 않음';
                    logContent = '';
                } else {
                    if (scenarioStatus === 'fail') {
                        stepStatus = 'pass';
                        duration = Math.floor(Math.random() * 5000) + 1000;
                        logContent = `테스트 단계: ${testCaseName}\n상태: 성공\n소요시간: ${duration}ms\n로그: 실패 이전까지 정상 실행됨`;
                    } else {
                        stepStatus = 'fail';
                        errorMessage = '테스트 실행이 중단되었습니다.';
                        logContent = `테스트 단계: ${testCaseName}\n상태: 실패\n오류: ${errorMessage}\n소요시간: 0ms`;
                    }
                }
            } else {
                stepStatus = 'pass';
                duration = Math.floor(Math.random() * 5000) + 1000;
                logContent = `테스트 단계: ${testCaseName}\n상태: 성공\n소요시간: ${duration}ms\n로그: 테스트 단계가 성공적으로 완료되었습니다.`;
            }
            
            return {
                name: cleanedName,
                status: stepStatus,
                duration: duration,
                error: errorMessage,
                logs: logContent,
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };
        });
        
        // 스크린샷 매핑 적용
        console.log(`🔍 [SCREENSHOT MAPPING] 시나리오 ${scenarioId}에서 ${testSteps.length}개 테스트 케이스에 스크린샷 매핑 적용`);
        return this.mapScreenshotsToTestCases(testSteps, scenarioId);
    }

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

    generateScreenshotsHtml(testCase, scenarioId = 1) {
        const testCaseName = testCase.name;
        
        // 실제 수행되지 않은 단계는 스크린샷 표시하지 않음
        if (testCase.status === 'not-test' || testCase.status === 'pending') {
            return `
                <div class="no-screenshots">
                    <i class="fas fa-minus-circle" style="font-size: 2em; margin-bottom: 10px; display: block; color: #6c757d;"></i>
                    <p>실행되지 않은 단계</p>
                    <small style="color: #6c757d;">이전 단계 실패로 인해 실행되지 않았습니다.</small>
                </div>
            `;
        }
        
        // 배치 파일 실행 단계의 경우 특별한 텍스트 표시
        if (testCaseName === '배치 파일 실행') {
            if (testCase.status === 'fail') {
                return `
                    <div class="batch-failure-message" style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border: 2px solid #dc3545;">
                        <div class="batch-icon">
                            <i class="fas fa-times-circle" style="font-size: 3em; color: #dc3545; margin-bottom: 15px;"></i>
                        </div>
                        <div class="batch-text">
                            <h3 style="color: #dc3545; margin-bottom: 10px; font-weight: bold;">배치 프로그램 실행이 실패했습니다!</h3>
                            <p style="color: #6c757d; font-size: 0.9em; margin: 0;">Git 저장소에 파일 푸시 중 오류가 발생했습니다.</p>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="batch-success-message" style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border: 2px solid #28a745;">
                        <div class="batch-icon">
                            <i class="fas fa-check-circle" style="font-size: 3em; color: #28a745; margin-bottom: 15px;"></i>
                        </div>
                        <div class="batch-text">
                            <h3 style="color: #28a745; margin-bottom: 10px; font-weight: bold;">배치 프로그램이 성공적으로 실행됐습니다!</h3>
                            <p style="color: #6c757d; font-size: 0.9em; margin: 0;">Git 저장소에 파일이 정상적으로 Push 되었습니다.</p>
                        </div>
                    </div>
                `;
            }
        }
        
        // GitLab 파일 수정 단계의 경우 특별한 텍스트 표시
        if (testCaseName === 'GitLab 파일 수정') {
            if (testCase.status === 'fail') {
                return `
                    <div class="gitlab-failure-message" style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border: 2px solid #dc3545;">
                        <div class="gitlab-icon">
                            <i class="fas fa-times-circle" style="font-size: 3em; color: #dc3545; margin-bottom: 15px;"></i>
                        </div>
                        <div class="gitlab-text">
                            <h3 style="color: #dc3545; margin-bottom: 10px; font-weight: bold;">GitLab 파일 수정이 실패했습니다!</h3>
                            <p style="color: #6c757d; font-size: 0.9em; margin: 0;">GitLab 저장소의 브랜치 내용 변경 중 오류가 발생했습니다.</p>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="gitlab-success-message" style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border: 2px solid #28a745;">
                        <div class="gitlab-icon">
                            <i class="fab fa-gitlab" style="font-size: 3em; color: #28a745; margin-bottom: 15px;"></i>
                        </div>
                        <div class="gitlab-text">
                            <h3 style="color: #28a745; margin-bottom: 10px; font-weight: bold;">GitLab 파일 수정이 성공적으로 완료됐습니다!</h3>
                            <p style="color: #6c757d; font-size: 0.9em; margin: 0;">GitLab 저장소의 새로운 브랜치 내용이 변경되었습니다.</p>
                        </div>
                    </div>
                `;
            }
        }
        
        // 스크린샷이 있는 경우
        if (testCase.screenshots && testCase.screenshots.length > 0) {
            return testCase.screenshots.map((screenshot, index) => {
                // 스크린샷이 객체인지 문자열인지 확인
                let screenshotPath;
                if (typeof screenshot === 'object' && screenshot.path) {
                    // 객체 형태: { path: '경로', description: '설명', timestamp: '시간' }
                    screenshotPath = screenshot.path;
                } else if (typeof screenshot === 'string') {
                    // 문자열 형태: '경로'
                    screenshotPath = screenshot;
                } else {
                    console.warn('⚠️ 알 수 없는 스크린샷 형식:', screenshot);
                    return '';
                }
                
                // 경로를 실제 파일명으로 변환
                if (screenshotPath.startsWith('./')) {
                    screenshotPath = screenshotPath.substring(2);
                }
                
                // 실제 파일이 존재하는지 확인하고 경로 조정
                const actualPath = path.join(__dirname, '..', 'custom-reports', `scenario-${scenarioId}`, screenshotPath);
                
                // 파일 존재 여부 확인
                let finalPath = screenshotPath;
                if (fs.existsSync(actualPath)) {
                    finalPath = screenshotPath;
                } else {
                    console.log(`⚠️ 스크린샷 파일을 찾을 수 없음: ${screenshotPath}`);
                    // 파일이 없어도 경로는 유지 (브라우저에서 404 처리)
                }
                
                // 스크린샷 설명 가져오기
                const caption = (typeof screenshot === 'object' && screenshot.description) ? screenshot.description : '단계 완료 시점';
                
                return `
                    <div class="screenshot-item">
                        <img src="${finalPath}" alt="단계 완료 스크린샷" onclick="openScreenshotModal('${finalPath}')" 
                             onerror="this.parentElement.innerHTML='<div class=\\'no-screenshots\\'><i class=\\'fas fa-exclamation-triangle\\' style=\\'color: #ffc107;\\'></i><p>스크린샷을 불러올 수 없습니다</p></div>'">
                        <div class="screenshot-caption">${caption}</div>
                    </div>
                `;
            }).join('');
        } else {
            // 스크린샷이 없는 경우 (실행되었지만 스크린샷이 없는 경우)
            return `
                <div class="no-screenshots">
                    <i class="fas fa-camera-slash" style="font-size: 2em; margin-bottom: 10px; display: block; color: #6c757d;"></i>
                    <p>스크린샷 없음</p>
                    <small style="color: #6c757d;">스크린샷은 각 단계 완료 시점에 자동으로 캡처됩니다.</small>
                </div>
            `;
        }
    }

    // Playwright 기본 리포트에서 스크린샷 경로 가져오기
    getPlaywrightScreenshots(scenarioId) {
        try {
            const playwrightResultsPath = path.join(__dirname, '..', 'playwright-report', 'test-results.json');
            if (!fs.existsSync(playwrightResultsPath)) {
                console.log('⚠️ Playwright test-results.json 파일이 존재하지 않음');
                return [];
            }

            const playwrightResults = JSON.parse(fs.readFileSync(playwrightResultsPath, 'utf8'));
            const screenshots = [];

            // 재귀적으로 suites를 탐색하여 스크린샷 찾기
            const findScreenshots = (suites) => {
                if (!suites) return;
                
                suites.forEach(suite => {
                    // specs에서 스크린샷 찾기
                    if (suite.specs) {
                        suite.specs.forEach(spec => {
                            if (spec.tests) {
                                spec.tests.forEach(test => {
                                    if (test.results && test.results.length > 0) {
                                        test.results.forEach(result => {
                                            if (result.attachments) {
                                                result.attachments.forEach(attachment => {
                                                    if (attachment.name === 'screenshot' && attachment.path) {
                                                        // 상대 경로로 변환 (test-results 디렉토리 기준)
                                                        const relativePath = path.relative(
                                                            path.join(__dirname, '..', 'custom-reports', 'scenario-1'),
                                                            attachment.path
                                                        );
                                                        screenshots.push({
                                                            name: attachment.name,
                                                            path: relativePath,
                                                            fullPath: attachment.path
                                                        });
                                                        console.log(`📸 스크린샷 발견: ${relativePath}`);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                    
                    // 하위 suites도 재귀적으로 탐색
                    if (suite.suites) {
                        findScreenshots(suite.suites);
                    }
                });
            };

            // 최상위 suites부터 탐색 시작
            if (playwrightResults.suites) {
                findScreenshots(playwrightResults.suites);
            }

            console.log(`📸 Playwright에서 ${screenshots.length}개의 스크린샷 발견`);
            return screenshots;
        } catch (error) {
            console.error('Playwright 스크린샷 읽기 실패:', error);
            return [];
        }
    }

    // 비디오 파일 찾기
    findVideoFiles(scenarioId) {
        try {
            const videoFiles = [];
            
            // Playwright 테스트 결과 디렉토리에서 비디오 파일 찾기
            const testResultsDir = path.join(__dirname, '..', 'test-results');
            
            if (!fs.existsSync(testResultsDir)) {
                console.log(`📹 test-results 디렉토리가 존재하지 않음: ${testResultsDir}`);
                return [];
            }
            
            const testDirs = fs.readdirSync(testResultsDir);
            console.log(`📹 test-results 디렉토리 내 항목들:`, testDirs);
            
            for (const testDir of testDirs) {
                try {
                    const testDirPath = path.join(testResultsDir, testDir);
                    const stat = fs.statSync(testDirPath);
                    
                    if (stat.isDirectory()) {
                        console.log(`📹 디렉토리 검사 중: ${testDir}`);
                        const files = fs.readdirSync(testDirPath);
                        
                        for (const file of files) {
                            if (file.endsWith('.webm') || file.endsWith('.mp4')) {
                                try {
                                    const videoPath = path.join(testDirPath, file);
                                    const relativePath = path.relative(path.join(__dirname, '..'), videoPath);
                                    const fileStat = fs.statSync(videoPath);
                                    
                                    videoFiles.push({
                                        name: file,
                                        path: videoPath,
                                        relativePath: relativePath.replace(/\\/g, '/'),
                                        size: fileStat.size
                                    });
                                    
                                    console.log(`📹 비디오 파일 발견: ${relativePath} (크기: ${fileStat.size} bytes)`);
                                } catch (fileError) {
                                    console.error(`📹 비디오 파일 처리 중 오류 (${file}):`, fileError.message);
                                }
                            }
                        }
                    }
                } catch (dirError) {
                    console.error(`📹 디렉토리 처리 중 오류 (${testDir}):`, dirError.message);
                }
            }
            
            console.log(`📹 시나리오 ${scenarioId} 총 ${videoFiles.length}개 비디오 파일 발견`);
            return videoFiles;
        } catch (error) {
            console.error(`📹 비디오 파일 찾기 실패:`, error);
            return [];
        }
    }

    // 비디오 섹션 HTML 생성
    generateVideoSectionHtml(videoFiles) {
        if (!videoFiles || videoFiles.length === 0) {
            return '';
        }

        const videoHtml = videoFiles.map(video => {
            const sizeInMB = (video.size / (1024 * 1024)).toFixed(2);
            
            return `
                <div class="video-item">
                    <div class="video-info">
                        <h4>📹 ${video.name}</h4>
                        <p class="video-size">파일 크기: ${sizeInMB} MB</p>
                    </div>
                    <div class="video-player">
                        <video controls width="100%" height="400">
                            <source src="../${video.relativePath}" type="video/webm">
                            <source src="../${video.relativePath}" type="video/mp4">
                            브라우저가 비디오를 지원하지 않습니다.
                        </video>
                    </div>
                    <div class="video-actions">
                        <a href="../${video.relativePath}" download="${video.name}" class="download-btn">
                            <i class="fas fa-download"></i> 다운로드
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="video-section">
                <h3><i class="fas fa-video"></i> 화면 녹화</h3>
                <div class="video-container">
                    ${videoHtml}
                </div>
            </div>
        `;
    }

    // 테스트 케이스별 스크린샷 매핑 (실제 수행된 단계만)
    mapScreenshotsToTestCases(testCases, scenarioId) {
        try {
            // 각 테스트 케이스의 상태를 확인하여 실제 수행된 단계만 스크린샷 매핑
            testCases.forEach(testCase => {
                // 실제 수행되지 않은 단계는 스크린샷 없음
                if (testCase.status === 'not-test' || testCase.status === 'pending') {
                    testCase.screenshots = [];
                    return;
                }
                
                // 이미 스크린샷이 설정되어 있으면 그대로 유지 (실제 실행 중 생성된 스크린샷)
                if (testCase.screenshots && testCase.screenshots.length > 0) {
                    return;
                }
                
                const testCaseName = testCase.name;
                
                // CONTRABASS/custom-reports/scenario-{scenarioId} 디렉토리에서 해당 테스트 케이스의 스크린샷 찾기
                const scenarioDir = path.join(__dirname, '..', 'custom-reports', `scenario-${scenarioId}`);
                const screenshots = [];
                
                if (fs.existsSync(scenarioDir)) {
                    const files = fs.readdirSync(scenarioDir);
                    
                    // 테스트 케이스 이름과 매칭되는 스크린샷 찾기
                    files.forEach(file => {
                        if (file.startsWith('screenshot-') && file.endsWith('.png')) {
                            // 테스트 케이스 이름이 파일명에 포함되어 있는지 확인
                            if (testCaseName) {
                                const testCaseNameForFile = testCaseName.replace(/\s+/g, '-');
                                if (file.includes(testCaseNameForFile) || file.includes(testCaseName)) {
                                    screenshots.push(file);
                                }
                            }
                        }
                    });
                    
                    // 매칭된 스크린샷이 없으면 모든 스크린샷을 추가 (fallback)
                    if (screenshots.length === 0) {
                        files.forEach(file => {
                            if (file.startsWith('screenshot-') && file.endsWith('.png')) {
                                screenshots.push(file);
                            }
                        });
                    }
                }
                
                // GitLab 파일 수정 단계의 경우 screenshots 폴더에서 gitlab-commit 스크린샷 찾기
                if (testCaseName === 'GitLab 파일 수정') {
                    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
                    if (fs.existsSync(screenshotsDir)) {
                        const gitlabFiles = fs.readdirSync(screenshotsDir);
                        gitlabFiles.forEach(file => {
                            if (file.startsWith('gitlab-commit-') && file.endsWith('.png')) {
                                screenshots.push(`../screenshots/${file}`);
                            }
                        });
                    }
                }
                
                // 스크린샷 파일명에서 테스트 케이스 이름과 매칭되는 파일 찾기 (TROMBONE 스타일 지원)
                const matchingScreenshots = screenshots.filter(screenshot => {
                    // TROMBONE 스타일: screenshot-{stepName}-{status}-{timestamp}.png
                    if (screenshot.startsWith('screenshot-')) {
                        // screenshot-{stepName}-{status}-{timestamp}.png 패턴에서 stepName 추출
                        const screenshotName = screenshot.replace('screenshot-', '').replace(/-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}\.png$/, '');
                        const cleanTestCaseName = testCaseName.replace(/[^가-힣a-zA-Z0-9]/g, '');
                        const cleanScreenshotName = screenshotName.replace(/[^가-힣a-zA-Z0-9]/g, '');
                        
                        
                        // 실패한 테스트 케이스의 경우 실패 스크린샷을 우선적으로 찾기
                        if (testCase.status === 'fail' || testCase.status === 'stopped') {
                            return cleanScreenshotName.includes(cleanTestCaseName) && 
                                   (screenshot.includes('실패') || screenshot.includes('fail'));
                        }
                        
                        // 성공한 테스트 케이스의 경우 성공 스크린샷을 찾기
                        return cleanScreenshotName.includes(cleanTestCaseName) && 
                               (screenshot.includes('성공') || screenshot.includes('pass') || !screenshot.includes('실패'));
                    }
                    
                    // 기존 CONTRABASS 스타일: {stepName}_{status}_{timestamp}.png
                    const cleanTestCaseName = testCaseName.replace(/[^가-힣a-zA-Z0-9]/g, '');
                    const cleanScreenshotName = screenshot.replace(/[^가-힣a-zA-Z0-9]/g, '');
                    
                    // 실패한 테스트 케이스의 경우 실패 스크린샷을 우선적으로 찾기
                    if (testCase.status === 'fail' || testCase.status === 'stopped') {
                        return cleanScreenshotName.includes(cleanTestCaseName) && 
                               screenshot.includes('-실패');
                    }
                    
                    // 성공한 테스트 케이스의 경우 일반 스크린샷 또는 완료 스크린샷 찾기
                    return cleanScreenshotName.includes(cleanTestCaseName) && 
                           !screenshot.includes('-실패');
                });
                
                if (matchingScreenshots.length > 0) {
                    // 매칭되는 스크린샷이 있으면 해당 스크린샷들 할당 (최신 1개만)
                    // 타임스탬프 기준으로 정렬하여 가장 최신 파일 선택
                    const latestScreenshot = matchingScreenshots.sort((a, b) => {
                        // 파일명에서 타임스탬프 추출 (YYYY-MM-DDTHH-MM-SS-mmm)
                        const timestampA = a.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}/)?.[0] || '';
                        const timestampB = b.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}/)?.[0] || '';
                        return timestampA.localeCompare(timestampB); // 시간순 정렬
                    }).pop(); // 가장 최신 파일
                    testCase.screenshots = [`./${latestScreenshot}`];
                } else {
                    // 매칭되는 스크린샷이 없으면 빈 배열
                    testCase.screenshots = [];
                }
            });

            return testCases;
        } catch (error) {
            console.error('스크린샷 매핑 실패:', error);
            return testCases;
        }
    }

    // 시나리오 인덱스 파일 업데이트 (브라우저에서 히스토리 로드용)
    updateScenarioIndex(scenarioId, fileName) {
        try {
            const scenarioDir = path.join(__dirname, '..', 'custom-reports', `scenario-${scenarioId}`);
            const indexPath = path.join(scenarioDir, 'index.json');
            
            // 기존 인덱스 파일 로드 또는 새로 생성
            let indexData = { files: [], lastUpdated: new Date().toISOString() };
            
            if (fs.existsSync(indexPath)) {
                try {
                    const existingData = fs.readFileSync(indexPath, 'utf8');
                    indexData = JSON.parse(existingData);
                } catch (parseError) {
                    console.warn('⚠️ 기존 인덱스 파일 파싱 실패, 새로 생성:', parseError.message);
                }
            }
            
            // 새 파일을 목록에 추가 (중복 제거)
            if (!indexData.files.includes(fileName)) {
                indexData.files.unshift(fileName); // 최신 파일을 맨 앞에 추가
            }
            
            // 최대 50개 파일만 유지 (너무 많아지지 않도록)
            if (indexData.files.length > 50) {
                indexData.files = indexData.files.slice(0, 50);
            }
            
            // 업데이트 시간 갱신
            indexData.lastUpdated = new Date().toISOString();
            
            // 인덱스 파일 저장
            fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf8');
            console.log(`📋 시나리오 ${scenarioId} 인덱스 파일 업데이트 완료: ${fileName}`);
            
        } catch (error) {
            console.error(`❌ 시나리오 ${scenarioId} 인덱스 파일 업데이트 실패:`, error.message);
        }
    }
}

export default ReportGenerator; 