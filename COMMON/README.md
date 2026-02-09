# COMMON 라이브러리

**보수적 리팩터링**: 4개 제품(TROMBONE, CMP, CONTRABASS, VIOLA)의 공통 로직 추출

## 📁 구조

```
COMMON/
├── lib/
│   ├── runner/              # 시나리오 실행기
│   │   └── ScenarioRunnerBase.js
│   ├── config/              # 공통 설정 (예정)
│   └── report/              # 리포트 생성 (예정)
└── README.md
```

## ✅ 원칙

1. **퍼블릭 API 불변**: CLI/출력/로그/에러 메시지 100% 동일 유지
2. **제품별 비즈니스 로직 보존**: lib/classes는 각 제품 폴더에 유지
3. **DI 패턴**: 파일/네트워크/시간 등 I/O는 주입 가능
4. **A/B 토글**: `REFACTOR_CORE=0/1` 환경변수로 기존/신규 코드 선택

## 🚀 사용법

### ScenarioRunnerBase 사용 예시

```javascript
// TROMBONE/electron-scenario-runner.js
import { ScenarioRunnerBase } from '../COMMON/lib/runner/ScenarioRunnerBase.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 제품별 설정
const productConfig = {
    name: 'trombone',
    displayName: 'TROMBONE',
    icon: '🎺',
    reportFunction: printThreeLevelReport,  // 제품 전용 함수
    rootDir: __dirname,
    features: {
        threeLevelReport: true,
        dashboardSupport: true
    }
};

// 실행기 생성
const runner = new ScenarioRunnerBase(productConfig);

// 시나리오 실행
await runner.runScenario(scenarioId);
```

## 🔄 A/B 토글

기존 코드와 새 코드를 비교하기 위한 환경변수:

```bash
# 기존 코드 사용 (기본값)
REFACTOR_CORE=0 node electron-scenario-runner.js run 1

# 신규 COMMON 라이브러리 사용
REFACTOR_CORE=1 node electron-scenario-runner.js run 1
```

## 📊 제품별 차이점

| 제품 | lib/classes | report-generator | 특징 |
|------|-------------|------------------|------|
| TROMBONE | 29개 (41줄) | TROMBONE 전용 | 3단계 구조 레포트 |
| CMP | 29개 (41줄) | CMP 전용 | (작성 예정) |
| CONTRABASS | 29개 (41줄) | CONTRABASS 전용 | (작성 예정) |
| VIOLA | 3개 (145줄) | VIOLA 전용 | Pod 관리 특화 |

## 🛠️ 개발 가이드

### 새로운 공통 기능 추가 시

1. **설계 단계**: 4개 제품 모두 동일한 동작인지 확인
2. **추출 단계**: 기존 코드를 그대로 복사 (변경 최소화)
3. **치환 단계**: 제품별 파일에서 COMMON 참조로 변경
4. **검증 단계**: 
   - A/B 토글로 기존/신규 출력 비교
   - 4개 제품 모두 테스트 실행
   - 출력/로그/파일 모두 동일한지 확인

### 절대 하지 말아야 할 것

- ❌ 제품별 lib/classes를 COMMON으로 이동
- ❌ 출력 포맷/로그 메시지 변경
- ❌ 파일 경로/이름 변경
- ❌ 에러 메시지 변경
- ❌ 성능 최적화 (behavior-preserving만)

## 📝 변경 이력

- 2025-10-13: 초기 생성 (ScenarioRunnerBase)

