# 📊 ReportGeneratorBase - 공통 리포트 생성 베이스 클래스

## 🎯 목적

TROMBONE, VIOLA, CMP, CONTRABASS의 중복된 리포트 생성 로직(~12,000줄)을 공통화하여:
- **코드 중복 95% 제거** (3,967줄 → 200줄)
- **유지보수성 향상** (HTML 템플릿 수정 시 1곳만)
- **확장성 향상** (새 제품 추가 시 200줄만 작성)

---

## 📐 아키텍처

```
ReportGeneratorBase (공통 베이스)
├── 공통 유틸리티 (85%)
│   ├── cleanStepName()
│   ├── convertToKoreaTime()
│   ├── formatDuration()
│   ├── formatErrorMessage()
│   └── generateTimestamp()
│
├── 공통 파일 I/O
│   ├── saveReport()
│   ├── loadTestSettings()
│   └── getScenarioHistory()
│
└── 추상 메서드 (15% - 제품별 구현)
    ├── loadTestData()              // 데이터 로드 전략
    ├── getScenarioMetadata()       // 시나리오 정보
    ├── generateCustomReport()      // HTML 생성
    └── saveMasterReport()          // 마스터 리포트
```

---

## 🚀 사용법

### 1️⃣ 제품별 리포트 클래스 생성

```javascript
// TROMBONE/lib/report-generator.js
import { ReportGeneratorBase } from '../../COMMON/lib/report/ReportGeneratorBase.js';
import productConfig from '../product-report-config.js';
import fs from 'fs';
import path from 'path';

export default class TromboneReportGenerator extends ReportGeneratorBase {
    constructor(currentProduct = 'trombone') {
        super(productConfig);
    }

    /**
     * 🔌 필수 구현: 테스트 데이터 로드
     */
    async loadTestData(scenarioId) {
        // TROMBONE: 파일 기반 로드
        const globalResultsPath = path.join(
            this.config.rootDir,
            'custom-reports',
            'global-test-results.json'
        );

        if (fs.existsSync(globalResultsPath)) {
            const data = JSON.parse(fs.readFileSync(globalResultsPath, 'utf8'));
            return data[`scenario-${scenarioId}`] || null;
        }

        return null;
    }

    /**
     * 🔌 필수 구현: 시나리오 메타데이터
     */
    getScenarioMetadata(scenarioId) {
        const scenarioFilePath = path.join(
            this.config.rootDir,
            'tests',
            'scenario',
            `scenario-${scenarioId}.spec.js`
        );

        if (fs.existsSync(scenarioFilePath)) {
            const content = fs.readFileSync(scenarioFilePath, 'utf8');
            const match = content.match(/test\.describe\.serial\('([^']+)'/);
            if (match) {
                return { name: match[1], description: '' };
            }
        }

        return { name: `시나리오 ${scenarioId}`, description: '' };
    }

    /**
     * 🔌 필수 구현: HTML 생성
     */
    async generateCustomReport(scenarioId, reportData = null) {
        // 제품별 HTML 생성 로직
        // (기존 로직을 여기에 유지)
    }

    /**
     * 🔌 필수 구현: 마스터 리포트
     */
    async saveMasterReport() {
        // 전체 시나리오 요약 리포트
    }
}
```

---

### 2️⃣ 제품별 설정 파일 생성

```javascript
// TROMBONE/product-report-config.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // 제품 식별자
    name: 'trombone',
    displayName: 'TROMBONE',

    // 아이콘 및 색상
    icon: {
        class: 'fas fa-trombone',
        emoji: '🎺'
    },
    color: {
        primary: '#667eea',
        secondary: '#764ba2'
    },

    // 시나리오 설정
    scenarios: {
        count: 21,
        defaultNames: {} // 자동 파싱
    },

    // 기본 설정값
    defaultSettings: {
        project: { code: "LYH007", name: "LYH 업무코드" },
        repository: { name: "LYH-REPO" },
        users: []
    },

    // 루트 디렉토리
    rootDir: path.dirname(__filename)
};
```

---

### 3️⃣ 기존 코드에서 사용

```javascript
// electron-scenario-runner.js
import TromboneReportGenerator from './lib/report-generator.js';

const reportGenerator = new TromboneReportGenerator();

// 기존 API 동일
await reportGenerator.saveReport(scenarioId, testResults);
```

---

## 🔌 필수 구현 메서드

### `async loadTestData(scenarioId)`

**목적:** 제품별 데이터 로드 전략 구현

**예시:**
```javascript
// TROMBONE: 파일 기반
async loadTestData(scenarioId) {
    const data = JSON.parse(fs.readFileSync('global-test-results.json'));
    return data[`scenario-${scenarioId}`];
}

// VIOLA: 실시간 Map + 파일 폴백
async loadTestData(scenarioId) {
    // 1. 실시간 Map 최우선
    if (global.testResults instanceof Map) {
        const data = global.testResults.get(`viola-scenario-${scenarioId}`);
        if (data) return data;
    }
    
    // 2. 파일 폴백
    const data = JSON.parse(fs.readFileSync('global-test-results.json'));
    return data[`viola-scenario-${scenarioId}`];
}
```

---

### `getScenarioMetadata(scenarioId)`

**목적:** 시나리오 이름 및 설명 제공

**예시:**
```javascript
// TROMBONE: 단일 패턴
getScenarioMetadata(scenarioId) {
    const content = fs.readFileSync(`scenario-${scenarioId}.spec.js`, 'utf8');
    const match = content.match(/test\.describe\.serial\('([^']+)'/);
    return { name: match[1], description: '' };
}

// VIOLA: 다중 패턴 + 하드코딩 폴백
getScenarioMetadata(scenarioId) {
    const patterns = [
        /test\.describe\.serial\('([^']+)'/,
        /test\.describe\('([^']+)'/,
        /describe\('([^']+)'/
    ];
    
    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) return { name: match[1], description: '' };
    }
    
    // 하드코딩 폴백
    const names = {
        1: 'VIOLA 클러스터 생성 및 확인',
        2: '외부접속 서비스 트래픽 모니터링',
        // ...
    };
    return { name: names[scenarioId], description: '' };
}
```

---

### `async generateCustomReport(scenarioId, reportData)`

**목적:** HTML 리포트 생성

**반환:** HTML 문자열

**파라미터:**
- `scenarioId`: 시나리오 ID
- `reportData`: { testResults, user, project, repository }

---

### `async saveMasterReport()`

**목적:** 전체 시나리오 요약 리포트 생성

---

## ✅ 공통 메서드 (상속받아 바로 사용 가능)

### 유틸리티

- `cleanStepName(stepName)` - 단계 이름 정제
- `convertToKoreaTime(utcTimeString)` - UTC → KST 변환
- `formatDuration(seconds)` - 초 → "N분 N초"
- `formatErrorMessage(error)` - 에러 메시지 포맷팅
- `generateTimestamp()` - 타임스탬프 생성

### 파일 I/O

- `saveReport(scenarioId, testResults)` - 리포트 저장 (퍼블릭 API)
- `loadTestSettings()` - 설정 파일 로드
- `getScenarioHistory(scenarioId)` - 히스토리 조회
- `scenarioFileExists(scenarioId)` - 파일 존재 확인

### 헬퍼

- `_safeReadFile(filePath)` - 안전한 파일 읽기
- `_ensureDirectory(dirPath)` - 디렉토리 생성

---

## 🎨 제품별 차이 처리 방법

### 데이터 소스 차이

```javascript
// TROMBONE: 파일 기반
async loadTestData(scenarioId) {
    return JSON.parse(fs.readFileSync('global-test-results.json'))[`scenario-${scenarioId}`];
}

// VIOLA: 실시간 Map
async loadTestData(scenarioId) {
    return global.testResults.get(`viola-scenario-${scenarioId}`);
}
```

### 시나리오 개수 차이

```javascript
// productConfig에서 처리
{
    scenarios: {
        count: 21  // TROMBONE
        count: 8   // VIOLA
    }
}
```

### 아이콘/색상 차이

```javascript
// productConfig에서 처리
{
    icon: { class: 'fas fa-trombone', emoji: '🎺' },  // TROMBONE
    icon: { class: 'fas fa-violin', emoji: '🎻' },    // VIOLA
    color: { primary: '#667eea', secondary: '#764ba2' }
}
```

---

## 📊 효과 측정

| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| **TROMBONE** | 3,967줄 | ~200줄 | **95% ↓** |
| **VIOLA** | 4,295줄 | ~300줄 | **93% ↓** |
| **CMP** | 3,868줄 | ~200줄 | **95% ↓** |
| **CONTRABASS** | 3,868줄 | ~200줄 | **95% ↓** |
| **신규 제품** | 4,000줄 | 200줄 | **95% ↓** |

---

## ⚠️ 주의사항

### 1️⃣ 퍼블릭 API 보존

```javascript
// ✅ 기존 시그니처 유지
await reportGenerator.saveReport(scenarioId, testResults);

// ❌ 시그니처 변경 금지
await reportGenerator.saveReport({ id: scenarioId, results: testResults });
```

### 2️⃣ 파일 경로/이름 동일

```javascript
// ✅ 기존 경로 유지
custom-reports/scenario-1/index.html

// ❌ 경로 변경 금지
reports/scenario-1.html
```

### 3️⃣ 로그 메시지 동일

```javascript
// ✅ 기존 메시지 유지
console.log(`✅ TROMBONE 커스텀 리포트 생성: ${reportPath}`);

// ❌ 메시지 변경 금지
console.log(`Report created: ${reportPath}`);
```

---

## 🧪 테스트 전략

### 단위 테스트

```javascript
import { ReportGeneratorBase } from './ReportGeneratorBase.js';

test('cleanStepName removes unnecessary text', () => {
    const generator = new TestReportGenerator(config);
    expect(generator.cleanStepName('중메뉴 로그인')).toBe('로그인');
});

test('convertToKoreaTime converts UTC to KST', () => {
    const generator = new TestReportGenerator(config);
    const result = generator.convertToKoreaTime('2025-01-01T00:00:00Z');
    expect(result).toBe('2025-01-01 09:00:00');
});
```

### 통합 테스트

```javascript
test('saveReport generates identical HTML output', async () => {
    const oldGenerator = new OldReportGenerator();
    const newGenerator = new TromboneReportGenerator(config);
    
    const oldHtml = await oldGenerator.saveReport('1', testResults);
    const newHtml = await newGenerator.saveReport('1', testResults);
    
    expect(oldHtml).toBe(newHtml); // 100% 동일
});
```

---

## 🚀 마이그레이션 가이드

### Phase 1: 베이스 클래스 생성 ✅
- `COMMON/lib/report/ReportGeneratorBase.js` 생성 완료

### Phase 2: 제품별 설정 파일
```bash
TROMBONE/product-report-config.js
VIOLA/product-report-config.js
CMP/product-report-config.js
CONTRABASS/product-report-config.js
```

### Phase 3: 제품별 클래스 리팩터링
```javascript
// Before (3,967줄)
class ReportGenerator { /* ... */ }

// After (200줄)
class TromboneReportGenerator extends ReportGeneratorBase {
    // 제품별 로직만
}
```

### Phase 4: A/B 테스트
```bash
REFACTOR_REPORT=0  # 기존 로직
REFACTOR_REPORT=1  # 신규 로직
```

### Phase 5: 검증 및 전환
```bash
# HTML diff 검증
diff old-report.html new-report.html  # 0 차이 확인

# 전환
REFACTOR_REPORT=1  # 기본값으로 변경
```

---

## 📚 참고 문서

- [리팩터링 전략 전체 문서](../../docs/REPORT_REFACTORING_STRATEGY.md)
- [보수적 리팩터링 가이드](../../docs/CONSERVATIVE_REFACTORING.md)

