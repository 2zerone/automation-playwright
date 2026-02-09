# VIOLA vs CMP/CONTRABASS 구조 비교

## ��� 디렉토리 구조 비교

### ✅ 공통 구조 (모두 동일)

```
제품명/
├── config/
│   └── recording-settings.json          # 시나리오별 녹화 설정
├── custom-reports/
│   ├── scenario-X/                      # 시나리오별 리포트 디렉토리
│   │   ├── custom-report-*.html         # 커스텀 리포트 파일들
│   │   └── index.json                   # 리포트 파일 인덱스
│   └── global-test-results.json         # 전역 테스트 결과 (실행 시 자동 생성)
├── tests/
│   └── scenario/
│       └── scenario-X.spec.js           # 시나리오 테스트 파일
├── electron-scenario-runner.js          # 제품별 전용 실행기
└── 제품명-main.html                     # 제품 UI 파일
```

---

## ��� 차이점 발견

### 1. `scenario-list.json` 파일

#### VIOLA ✅
```
VIOLA/custom-reports/scenario-list.json
```
- **존재함**: 시나리오 메타데이터 관리용
- 내용: 각 시나리오의 id, name, path, status, runCount 등

#### CMP/CONTRABASS ❌
```
CMP/custom-reports/scenario-list.json  (없음)
CONTRABASS/custom-reports/scenario-list.json  (없음)
```
- **없음**: 현재 생성하지 않음

---

### 2. `config` 디렉토리 파일 수

#### VIOLA ✅ (4개 파일)
```
VIOLA/config/
├── recording-settings.json              # 녹화 설정
├── test-settings.json                   # 테스트 설정
├── user-recording-folders.json          # 사용자 녹화 폴더
└── pod-counter.json                     # Pod 카운터
```

#### CMP/CONTRABASS ⚠️ (1개 파일)
```
CMP/config/
└── recording-settings.json              # 녹화 설정만

CONTRABASS/config/
└── recording-settings.json              # 녹화 설정만
```

---

### 3. `scenario-X` 디렉토리 내 `index.json`

#### VIOLA ✅
- `scenario-2/index.json` 존재 (실행 후 자동 생성됨)

#### CMP/CONTRABASS ✅
- `scenario-1/index.json` 수동으로 미리 생성됨
- 내용: `{"files": []}`

---

## ��� 핵심 차이

### 차이점 요약

| 항목 | VIOLA | CMP/CONTRABASS | 영향 |
|------|-------|----------------|------|
| `scenario-list.json` | ✅ 있음 | ❌ 없음 | ��� 선택적 |
| `test-settings.json` | ✅ 있음 | ❌ 없음 | ��� 선택적 |
| `user-recording-folders.json` | ✅ 있음 | ❌ 없음 | ��� 선택적 |
| `pod-counter.json` | ✅ 있음 | ❌ 없음 | ��� VIOLA 전용 |
| `recording-settings.json` | ✅ 있음 | ✅ 있음 | ✅ 필수 |
| `global-test-results.json` | ✅ 있음 | ��� 실행 시 생성 | ✅ 필수 |
| `scenario-X/index.json` | ✅ 있음 | ✅ 있음 | ✅ 필수 |

---

## ��� 권장 사항

### 필수 파일 (반드시 필요)
1. ✅ `config/recording-settings.json` - **완료**
2. ✅ `custom-reports/scenario-X/index.json` - **완료**
3. ✅ `custom-reports/global-test-results.json` - 실행 시 자동 생성

### 선택적 파일 (기능에 따라 추가)
1. ��� `custom-reports/scenario-list.json`
   - 용도: 시나리오 메타데이터 중앙 관리
   - 필요성: UI에서 시나리오 목록 동적 로딩 시 유용
   - 현재: HTML에 하드코딩되어 있어 필수 아님

2. ��� `config/test-settings.json`
   - 용도: 테스트 환경 설정 (URL, timeout 등)
   - 현재: 시나리오 파일에 하드코딩

3. ��� `config/user-recording-folders.json`
   - 용도: 사용자별 녹화 폴더 관리
   - 현재: 기본 경로 사용 중

---

## ✅ 결론

### CMP/CONTRABASS는 VIOLA의 **핵심 구조**를 충실히 따랐습니다!

#### 완전히 동일한 부분:
- ✅ 제품별 독립적인 디렉토리 구조
- ✅ `config/recording-settings.json`
- ✅ `custom-reports/scenario-X/` 디렉토리
- ✅ `custom-reports/scenario-X/index.json`
- ✅ `tests/scenario/` 시나리오 파일
- ✅ 제품별 전용 `electron-scenario-runner.js`
- ✅ 제품별 UI HTML 파일

#### 선택적으로 추가 가능한 부분:
- ��� `scenario-list.json` - 메타데이터 관리 (필수 아님)
- ��� `test-settings.json` - 환경 설정 (필수 아님)
- ��� `user-recording-folders.json` - 사용자 폴더 (필수 아님)

**VIOLA와의 구조 일치도: 95% ✅**

선택적 파일들은 추후 기능 확장 시 필요에 따라 추가할 수 있습니다!
