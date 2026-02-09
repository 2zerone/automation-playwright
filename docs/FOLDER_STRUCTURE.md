# Trombone UI Test Automation - 폴더 구조

## 📁 프로젝트 구조

```
uitest-trombone/
├── 📁 src/                           # 소스 코드
│   ├── main.js                       # 메인 Electron 애플리케이션
│   ├── electron-scenario-runner.js   # 시나리오 실행기
│   └── convert-to-word.js            # Word 변환 도구
│
├── 📁 reports/                       # 보고서 관련
│   ├── 📁 html/                      # HTML 보고서
│   │   ├── index.html                # 메인 UI
│   │   ├── ui-new.html               # 새로운 UI
│   │   └── TROMBONE_UI_Test_Automation_Report.html
│   ├── 📁 markdown/                  # 마크다운 문서
│   │   ├── README.md                 # 프로젝트 설명
│   │   ├── PROJECT_REPORT.md         # 프로젝트 보고서
│   │   ├── TROMBONE_*.md             # Trombone 관련 문서들
│   │   └── DELIVERABLES.md           # 산출물 목록
│   └── 📁 custom/                    # 커스텀 보고서
│       └── custom-report.html        # 커스텀 리포트
│
├── 📁 test-files/                    # 테스트 관련 파일들
│   ├── 📁 scripts/                   # 테스트 스크립트
│   │   └── run-tests.js              # 테스트 실행 스크립트
│   ├── 📁 status/                    # 테스트 상태 관리
│   │   ├── test-status-*.js          # 다양한 테스트 상태 파일들
│   │   ├── test-verification.js      # 테스트 검증
│   │   └── test-debug.js             # 디버깅 도구
│   └── 📁 verification/              # 검증 관련 파일들
│
├── 📁 config/                        # 설정 파일들
│   ├── test-settings.json            # 기본 테스트 설정
│   ├── recording-settings.json       # 녹화 설정
│   ├── user-recording-folders.json   # 사용자 녹화 폴더 설정
│   └── 📁 scenario/                  # 시나리오별 설정
│       ├── test-settings-1.json
│       ├── test-settings-2.json
│       └── ...
│
├── 📁 tests/                         # Playwright 테스트
│   ├── 📁 scenario/                  # 시나리오 테스트
│   │   ├── scenario-1.spec.js
│   │   ├── scenario-2.spec.js
│   │   └── ...
│   └── 📁 steps/                     # 테스트 단계
│       ├── gitlab.spec.js
│       ├── pipeline.spec.js
│       └── ...
│
├── 📁 lib/                           # 라이브러리
│   ├── 📁 classes/                   # 클래스 정의
│   │   ├── BaseManager.js
│   │   ├── GitLabManager.js
│   │   ├── PipelineManager.js
│   │   └── ...
│   ├── report-generator.js           # 리포트 생성기
│   └── 📁 utils/                     # 유틸리티
│       └── config-updater.js
│
├── 📁 templates/                     # HTML 템플릿
│   └── memberList-template.html
│
├── 📁 images/                        # 이미지 파일들
│   └── emoji_final_24x24.png
│
├── 📁 screenshots/                   # 스크린샷 저장소
├── 📁 test-results/                  # 테스트 결과
├── 📁 playwright-report/             # Playwright 리포트
├── 📁 custom-reports/                # 커스텀 리포트
├── 📁 scripts/                       # 배치 스크립트
├── 📁 docs/                          # 문서 (이 파일 포함)
├── 📁 .playwright-mcp/               # Playwright MCP 관련
├── 📁 node_modules/                  # Node.js 의존성
├── 📁 .vscode/                       # VS Code 설정
│
├── package.json                       # 프로젝트 설정
├── package-lock.json                  # 의존성 잠금
├── playwright.config.js               # Playwright 설정
├── .gitignore                         # Git 무시 파일
└── README.md                          # 프로젝트 개요
```

## 🔄 주요 변경사항

### 1. 소스 코드 정리
- **`src/`** 폴더로 모든 소스 코드 파일 이동
- `main.js`, `electron-scenario-runner.js`, `convert-to-word.js`

### 2. 보고서 체계화
- **`reports/html/`** - HTML 보고서들
- **`reports/markdown/`** - 마크다운 문서들
- **`reports/custom/`** - 커스텀 보고서

### 3. 테스트 파일 정리
- **`test-files/scripts/`** - 테스트 실행 스크립트
- **`test-files/status/`** - 테스트 상태 관리 파일들
- **`test-files/verification/`** - 검증 관련 파일들

### 4. 경로 참조 수정
모든 파일의 경로 참조를 새로운 폴더 구조에 맞게 수정:
- `./lib/` → `../lib/`
- `./config/` → `../config/`
- `./tests/` → `../tests/`
- `./custom-reports/` → `../custom-reports/`
- `./playwright-report/` → `../playwright-report/`
- `./test-results/` → `../test-results/`

## 📋 사용법

### 1. 애플리케이션 실행
```bash
npm start
# 또는
electron src/main.js
```

### 2. 테스트 실행
```bash
npm test
# 또는
node test-files/scripts/run-tests.js
```

### 3. 시나리오 실행
```bash
node src/electron-scenario-runner.js run 1
```

## ⚠️ 주의사항

1. **경로 참조**: 모든 파일의 경로 참조가 새로운 구조에 맞게 수정되었습니다.
2. **의존성**: `package.json`의 `main` 필드가 `src/main.js`로 업데이트되었습니다.
3. **빌드 설정**: Electron 빌드 설정의 파일 경로도 업데이트되었습니다.

## 🔧 문제 해결

경로 관련 오류가 발생하는 경우:
1. `src/` 폴더 내 파일들의 상대 경로 확인
2. `test-files/` 폴더 내 파일들의 상대 경로 확인
3. 모든 `__dirname` 기반 경로가 `../`로 올바르게 수정되었는지 확인
