# TROMBONE UI 테스트 자동화 프로젝트 보고서

## 📋 프로젝트 개요

**프로젝트명**: TROMBONE UI 테스트 자동화  
**목적**: TROMBONE 시스템의 UI 테스트를 자동화하여 QA 프로세스 효율성 향상  
**기술 스택**: Playwright, Node.js, Electron  
**개발 환경**: Windows 10, Git Bash  

### 🎯 주요 특징
- **세부 단계별 테스트**: 각 테스트를 4-5개의 세부 단계로 분리하여 정확한 실패 지점 파악
- **실시간 모니터링**: HTML 대시보드를 통한 실시간 테스트 진행 상황 확인
- **다양한 보고서 형식**: Markdown, JSON, JUnit XML 형식의 보고서 생성
- **Electron 기반 GUI**: 사용자 친화적인 데스크톱 애플리케이션 제공

---

## 📁 프로젝트 폴더 구조

```
uitest-trombone/
├── 📂 config/                    # 설정 파일들
│   ├── test-settings.json       # 기본 테스트 설정
│   └── scenario/                # 시나리오별 설정 파일들 (21개)
│       ├── test-settings-1.json
│       ├── test-settings-2.json
│       └── ...
├── 📂 lib/                      # 핵심 라이브러리
│   ├── classes/                 # 매니저 클래스들
│   │   ├── TaskCodeManager.js   # 업무코드 관리
│   │   ├── ToolchainManager.js  # 툴체인 관리
│   │   ├── RepositoryManager.js # 저장소 관리
│   │   ├── UserManager.js       # 사용자 관리
│   │   ├── SonarQubeManager.js  # SonarQube 관리
│   │   ├── JUnitManager.js      # JUnit 관리
│   │   ├── PipelineManager.js   # 파이프라인 관리c
│   │   ├── WorkflowComponentManager.js # 워크플로우 컴포넌트 관리
│   │   ├── UserTaskCodeManager.js # 사용자 업무코드 관리
│   │   ├── LoginManager.js      # 로그인 관리
│   │   └── TromboneUtils.js     # 공통 유틸리티
│   ├── report-generator.js      # 리포트 생성기
│   └── utils/
│       └── config-updater.js    # 설정 업데이트 유틸
├── 📂 tests/                    # 테스트 파일들
│   ├── trombone-main.spec.js    # 메인 테스트 파일
│   ├── trombone-main-slow.spec.js # 느린 테스트 버전
│   ├── steps/                   # 단계별 테스트 파일들
│   │   ├── taskcode.spec.js     # 업무코드 테스트
│   │   ├── toolchain.spec.js    # 툴체인 테스트
│   │   ├── repository.spec.js   # 저장소 테스트
│   │   ├── user.spec.js         # 사용자 테스트
│   │   ├── usertaskcode.spec.js # 사용자 업무코드 테스트
│   │   ├── sonarqube.spec.js    # SonarQube 테스트
│   │   ├── junit.spec.js        # JUnit 테스트
│   │   ├── pipeline.spec.js     # 파이프라인 테스트
│   │   └── workflow.spec.js     # 워크플로우 컴포넌트 테스트
│   └── scenario/                # 시나리오별 테스트 파일들
├── 📂 custom-reports/           # 커스텀 리포트 저장소
│   ├── global-test-results.json # 전역 테스트 결과
│   ├── test_results_master.html # 마스터 리포트
│   └── scenario-1/              # 시나리오별 리포트들
├── 📂 test-results/             # 테스트 결과 저장소
├── 📂 playwright-report/        # Playwright 기본 리포트
├── 📂 images/                   # 이미지 리소스
├── main.js                      # Electron 메인 프로세스
├── index.html                   # Electron 렌더러 페이지
├── run-tests.js                 # 테스트 실행 스크립트
├── playwright.config.js         # Playwright 설정
├── package.json                 # 프로젝트 의존성
└── README.md                    # 프로젝트 문서
```

---

## 🔄 데이터 플로우

### 1. 설정 데이터 플로우
```
config/test-settings.json → lib/classes/ → 테스트 실행 → 결과 수집
```

### 2. 테스트 실행 플로우
```
사용자 입력 → run-tests.js → Playwright → 매니저 클래스 → TromboneUtils → 결과 반환
```

### 3. 결과 처리 플로우
```
테스트 결과 → report-generator.js → HTML/JSON/Markdown → custom-reports/
```

### 4. Electron GUI 플로우
```
main.js → index.html → 사용자 인터페이스 → 테스트 실행 → 결과 표시
```

---

## ⚙️ 초기 설정 단계

### 1. 환경 설정
```bash
# Node.js 및 npm 설치 확인
node --version
npm --version

# 프로젝트 의존성 설치
npm install

# Playwright 브라우저 설치
npx playwright install
```

### 2. 설정 파일 구성
**config/test-settings.json** 주요 설정 항목:
```json
{
  "login": {
    "userId": "yh.lee5",
    "password": "Okestro2018!"
  },
  "project": {
    "code": "TEST007",
    "name": "TEST 업무코드"
  },
  "repository": {
    "name": "TEST-REPO"
  },
  "user": {
    "id": "yh.lee5",
    "name": "유저007",
    "email": "user007@okestro.com"
  }
}
```

### 3. Playwright 설정
**playwright.config.js** 주요 설정:
- `headless: false` - 브라우저 표시 모드
- `timeout: 600000` - 10분 타임아웃
- `video: 'on'` - 비디오 녹화 활성화
- `screenshot: 'on'` - 스크린샷 자동 저장

---

## 🚀 테스트 실행 준비 단계

### 1. 실행 모드 선택
```bash
# 전체 테스트 실행
node run-tests.js full

# 특정 단계만 실행
node run-tests.js step 1

# 특정 테스트 파일만 실행
node run-tests.js file taskcode

# Electron GUI 실행
npm start
```

### 2. 테스트 시나리오 구성
**9단계 테스트 시나리오**:
1. **업무 코드 관리** (4단계)
2. **툴체인 관리** (4단계)
3. **저장소 관리** (4단계)
4. **사용자 관리** (4단계)
5. **사용자 업무코드 관리** (4단계)
6. **SonarQube 관리** (4단계)
7. **JUnit 관리** (4단계)
8. **파이프라인 관리** (4단계)
9. **워크플로우 컴포넌트 관리** (4단계)

### 3. 매니저 클래스 초기화
```javascript
// 매니저 클래스들 초기화
const managers = {
  taskCodeManager: new TaskCodeManager(tromboneUtils),
  toolchainManager: new ToolchainManager(tromboneUtils),
  repositoryManager: new RepositoryManager(tromboneUtils),
  userManager: new UserManager(tromboneUtils),
  sonarQubeManager: new SonarQubeManager(tromboneUtils),
  jUnitManager: new JUnitManager(tromboneUtils),
  pipelineManager: new PipelineManager(tromboneUtils),
  workflowComponentManager: new WorkflowComponentManager(tromboneUtils)
};
```

---

## 🔧 API 테스트 실행 단계

### 1. 로그인 프로세스
```javascript
// LoginManager를 통한 자동 로그인
const loginManager = new LoginManager(page);
await loginManager.login(config);
```

### 2. 단계별 테스트 실행
각 단계는 다음 패턴으로 구성:
```javascript
test('1-1. 업무 코드 메뉴 접근', async () => {
  await managers.taskCodeManager.accessMenu();
});

test('1-2. 업무 코드 등록 화면 열기', async () => {
  await managers.taskCodeManager.openRegistrationForm();
});

test('1-3. 업무 코드 정보 입력', async () => {
  await managers.taskCodeManager.fillForm(config);
});

test('1-4. 업무 코드 저장 및 확인', async () => {
  await managers.taskCodeManager.saveAndConfirm();
});
```

### 3. 공통 유틸리티 활용
**TromboneUtils** 주요 메서드:
- `clickMenu(menuText)` - 메뉴 클릭
- `clickRegister()` - 등록 버튼 클릭
- `saveAndConfirm()` - 저장 및 확인
- `fillInput(selector, value)` - 입력 필드 채우기
- `fillMonacoEditor(content)` - 모나코 에디터 입력

---

## 📊 실시간 결과 처리 단계

### 1. 테스트 결과 수집
```javascript
// 테스트 결과 저장
let testResults = new Map(); // scenarioId -> testResult

// 결과 데이터 구조
const testResult = {
  status: 'pass' | 'fail',
  duration: '소요시간',
  startTime: '시작시간',
  endTime: '종료시간',
  testCases: [
    {
      name: '테스트 단계명',
      status: 'pass' | 'fail',
      duration: '소요시간',
      error: '오류 메시지'
    }
  ],
  screenshots: ['스크린샷 경로들'],
  logs: ['로그 메시지들']
};
```

### 2. 실시간 모니터링
- **HTML 대시보드**: 실시간 테스트 진행 상황 표시
- **자동 새로고침**: 최신 상태 유지
- **시각적 상태 표시**: PASS/FAIL/RUNNING 상태 표시

### 3. 오류 처리 및 재시도
```javascript
// Playwright 설정에서 재시도 설정
retries: process.env.CI ? 2 : 0,  // CI 환경에서만 재시도
```

---

## 📈 결과 표시 단계

### 1. 리포트 생성
**ReportGenerator** 클래스를 통한 다양한 형식의 리포트 생성:

#### HTML 리포트
- **위치**: `custom-reports/scenario-{id}/custom-report-{timestamp}.html`
- **특징**: 상세한 테스트 결과, 스크린샷, 오류 정보 포함

#### JSON 리포트
- **위치**: `custom-reports/global-test-results.json`
- **특징**: 구조화된 데이터, API 연동 가능

#### Markdown 리포트
- **위치**: `test-results/detailed-report.md`
- **특징**: 읽기 쉬운 형식, 버전 관리 시스템 친화적

### 2. 결과 데이터 구조
```json
{
  "scenarioId": 1,
  "name": "업무 코드 관리",
  "status": "pass",
  "duration": "2분 30초",
  "startTime": "2025-08-08T08:41:00.000Z",
  "endTime": "2025-08-08T08:43:30.000Z",
  "testCases": [
    {
      "name": "업무 코드 메뉴 접근",
      "status": "pass",
      "duration": "1.2초"
    }
  ],
  "screenshots": [
    "screenshot-업무코드 메뉴 접근-2025-08-08T08-41-01-429Z.png"
  ]
}
```

### 3. 시각화 및 분석
- **성공률 통계**: 전체 테스트 성공률 계산
- **소요시간 분석**: 단계별 소요시간 비교
- **오류 패턴 분석**: 실패한 테스트의 공통 패턴 파악

---

## 🎯 주요 기능 및 장점

### 1. 세부적인 단계 분리
- 각 테스트를 4-5개의 세부 단계로 분리
- 정확한 실패 지점 파악 가능
- 단계별 개별 성공/실패 결과 제공

### 2. 실시간 모니터링
- HTML 대시보드를 통한 실시간 진행 상황 확인
- 자동 새로고침으로 최신 상태 유지
- 시각적 상태 표시 (PASS/FAIL/RUNNING)

### 3. 다양한 보고서 형식
- Markdown 형식의 상세/요약 보고서
- JSON 형식의 구조화된 데이터
- JUnit XML 형식의 CI/CD 연동 지원

### 4. 유연한 테스트 실행
- 전체 테스트 또는 특정 단계만 실행 가능
- 특정 테스트 파일만 실행 가능
- 명령행 인터페이스로 쉬운 사용

### 5. Electron 기반 GUI
- 사용자 친화적인 데스크톱 애플리케이션
- 시나리오별 테스트 실행 및 모니터링
- 실시간 결과 확인 및 리포트 생성

---

## 🔧 기술적 구현 세부사항

### 1. Playwright 설정 최적화
```javascript
// 브라우저 최적화 설정
launchOptions: {
  args: [
    '--start-maximized',
    '--disable-web-security',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-sandbox',
    '--memory-pressure-off',
    '--max_old_space_size=4096'
  ]
}
```

### 2. 모듈화된 아키텍처
- **매니저 클래스**: 각 기능별 테스트 로직 캡슐화
- **유틸리티 클래스**: 공통 기능 재사용
- **설정 관리**: JSON 기반 설정 파일 시스템

### 3. 오류 처리 및 로깅
- **상세한 오류 메시지**: 실패 원인 명확히 파악
- **스크린샷 자동 저장**: 실패 시점의 화면 상태 보존
- **비디오 녹화**: 테스트 실행 과정 전체 기록

---

## 📊 프로젝트 성과 및 지표

### 1. 테스트 커버리지
- **총 9개 주요 기능**: 업무코드, 툴체인, 저장소, 사용자, SonarQube, JUnit, 파이프라인, 워크플로우 컴포넌트
- **36개 세부 단계**: 각 기능당 4단계씩 세분화
- **21개 시나리오**: 다양한 테스트 시나리오 지원

### 2. 실행 효율성
- **자동화율**: 100% UI 테스트 자동화
- **실행 시간**: 평균 2-3분 (전체 시나리오)
- **재사용성**: 설정 파일 변경으로 다양한 환경 테스트 가능

### 3. 품질 향상
- **정확성**: 세부 단계별 실패 지점 정확 파악
- **일관성**: 동일한 조건에서 반복 가능한 테스트
- **가시성**: 실시간 모니터링 및 상세한 리포트

---

## 🚀 향후 개선 방향

### 1. 기능 확장
- **API 테스트 통합**: UI 테스트와 API 테스트 연동
- **성능 테스트**: 로딩 시간 및 응답 시간 측정
- **크로스 브라우저 테스트**: 다양한 브라우저 지원

### 2. 사용성 개선
- **웹 기반 대시보드**: 브라우저에서 직접 접근 가능한 모니터링
- **알림 시스템**: 테스트 완료/실패 시 알림 기능
- **스케줄링**: 정기적인 테스트 실행 자동화

### 3. 통합 및 연동
- **CI/CD 파이프라인 연동**: Jenkins, GitLab CI 등과 연동
- **이슈 트래킹 연동**: Jira, GitHub Issues 등과 연동
- **메트릭 수집**: 테스트 결과 데이터 분석 및 시각화

---

## 📞 지원 및 문의

### 문제 해결
1. **브라우저가 열리지 않는 경우**: `npx playwright install` 실행
2. **테스트가 실패하는 경우**: `test-results/detailed-report.md` 확인
3. **설정 파일 오류**: `config/test-settings.json` 형식 확인

### 문서 및 리소스
- **README.md**: 기본 사용법 및 설정 가이드
- **Playwright 문서**: https://playwright.dev/docs/
- **프로젝트 이슈**: GitHub Issues를 통한 버그 리포트 및 기능 요청

---

**TROMBONE UI 테스트 자동화** - QA 프로세스의 효율성과 정확성을 크게 향상시키는 종합적인 테스트 자동화 솔루션입니다.
