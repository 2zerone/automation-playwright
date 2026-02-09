# TROMBONE UI 테스트 자동화 플랫폼

TROMBONE 시스템의 UI 테스트를 자동화하는 Electron 기반 데스크톱 애플리케이션입니다. Playwright를 활용하여 21개 시나리오의 체계적인 테스트를 제공합니다.

## 🎯 주요 기능

### Electron GUI 환경
- **데스크톱 애플리케이션**: 직관적인 GUI 인터페이스로 테스트 실행 및 모니터링
- **실시간 실행 모니터링**: 테스트 진행 상황을 실시간으로 추적하고 표시
- **시나리오별 독립 관리**: 21개 시나리오 각각의 독립적인 설정과 결과 관리

### 8단계 테스트 프로세스
1. **업무코드 등록 및 관리**
2. **툴체인 설정 및 연동**
3. **저장소 등록 및 구성**
4. **사용자별 업무코드 할당**
5. **SonarQube 품질 분석 연동**
6. **JUnit 테스트 결과 연동**
7. **CI/CD 파이프라인 구성**
8. **워크플로우 컴포넌트 설정**

### 자동화 엔진
- **동적 데이터 생성**: 테스트 실행 시 필요한 업무코드, 사용자 정보 자동 생성
- **단계별 데이터 연계**: 이전 단계에서 생성된 데이터를 다음 단계에서 자동 활용
- **순차적 실행 보장**: 8단계 테스트 프로세스를 정의된 순서대로 정확히 실행
- **웹 UI 자동 제어**: Playwright를 통한 정밀한 웹 요소 제어 및 상호작용

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. Electron 애플리케이션 실행
```bash
npm start
```

### 3. 테스트 실행 방법

#### GUI를 통한 실행
1. Electron 애플리케이션 실행
2. 원하는 시나리오 선택 (1-21)
3. "테스트 실행" 버튼 클릭
4. 실시간 진행 상황 모니터링

#### 명령행을 통한 실행
```bash
# 전체 테스트 실행
npx playwright test tests/trombone-main.spec.js

# 특정 시나리오 실행
npx playwright test tests/scenario/scenario-1.spec.js

# 단계별 테스트 실행
npx playwright test tests/steps/taskcode.spec.js
```

## 📊 테스트 결과 확인

### 실시간 모니터링
- Electron GUI에서 실시간 진행 상황 확인
- 각 단계별 성공/실패 상태 표시
- 자동 스크린샷 및 비디오 캡처

### 리포트 시스템
- **Playwright HTML 리포트**: 기본 HTML 리포트 (`playwright-report/index.html`)
- **커스텀 리포트**: 시나리오별 상세 분석 리포트
- **마스터 리포트**: 전체 21개 시나리오 통합 현황
- **JSON 결과**: 구조화된 테스트 결과 데이터

### 리포트 열기
```bash
# Playwright 리포트 열기
npx playwright show-report

# 또는 직접 브라우저에서 열기
# playwright-report/index.html
```

## 🔧 설정

### 테스트 설정 파일
- `config/test-settings.json` - 기본 테스트 설정
- `config/scenario/` - 시나리오별 설정 파일들 (test-settings-1.json ~ test-settings-21.json)

### 주요 설정 항목
```json
{
  "project": {
    "code": "TEST001",
    "name": "테스트 프로젝트"
  },
  "repository": {
    "url": "https://github.com/test/repo.git",
    "branch": "main"
  },
  "user": {
    "id": "testuser",
    "name": "테스트 사용자"
  }
}
```

## 📁 프로젝트 구조

```
uitest-trombone/
├── config/                 # 설정 파일들
│   ├── test-settings.json
│   └── scenario/           # 시나리오별 설정
│       ├── test-settings-1.json
│       ├── test-settings-2.json
│       └── ...
├── lib/                    # 핵심 라이브러리
│   ├── classes/           # 매니저 클래스들
│   │   ├── TaskCodeManager.js
│   │   ├── ToolchainManager.js
│   │   └── ...
│   └── report-generator.js
├── tests/                 # 테스트 파일들
│   ├── trombone-main.spec.js
│   ├── scenario/          # 시나리오별 테스트
│   │   ├── scenario-1.spec.js
│   │   ├── scenario-2.spec.js
│   │   └── ...
│   └── steps/             # 단계별 테스트
│       ├── taskcode.spec.js
│       ├── toolchain.spec.js
│       └── ...
├── custom-reports/        # 커스텀 리포트 결과
├── playwright-report/     # Playwright HTML 리포트
├── main.js               # Electron 메인 프로세스
├── index.html            # Electron GUI
└── package.json
```

## 🎯 성능 및 안정성

### 성능 최적화
- **실행 시간 단축**: 수동 테스트 15분 → 자동화 2분 이내 (87% 단축)
- **메모리 효율성**: 최적화된 메모리 사용으로 안정적인 장시간 운영
- **24/7 무인 운영**: 사람의 개입 없이 연속적인 테스트 실행 가능

### 안정성 보장
- **다중 재시도 시스템**: 네트워크 오류 시 최대 3회까지 자동 재시도
- **대체 선택자 전략**: UI 요소 찾기 실패 시 다양한 CSS 선택자 시도
- **적응형 타임아웃**: 각 작업의 특성에 맞는 동적 타임아웃 설정
- **상세 오류 분석**: 실패 원인을 구체적으로 분석하여 디버깅 지원

## 🐛 문제 해결

### 일반적인 문제들

1. **Electron 앱이 실행되지 않는 경우**
   - Node.js 버전 확인 (v16 이상 권장)
   - 의존성 재설치: `npm install`

2. **테스트가 실패하는 경우**
   - `playwright-report/`에서 상세 오류 확인
   - 스크린샷과 비디오 확인
   - 네트워크 연결 상태 확인

3. **브라우저가 열리지 않는 경우**
   - `playwright.config.js`에서 `headless: false` 확인
   - 브라우저 드라이버 설치: `npx playwright install`

## 📞 지원

문제가 발생하거나 개선사항이 있으시면 이슈를 등록해주세요.

---

**TROMBONE UI 테스트 자동화 플랫폼** - Electron 기반의 직관적이고 효율적인 UI 테스트 자동화