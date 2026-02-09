# CMP & CONTRABASS 최종 구조 완료

## ✅ VIOLA와 100% 동일한 구조 달성!

### ��� 전체 디렉토리 구조

```
CMP/
├── config/
│   ├── recording-settings.json          ✅ 시나리오별 녹화 ON/OFF
│   ├── test-settings.json               ✅ 테스트 환경 설정
│   └── user-recording-folders.json      ✅ 사용자 지정 녹화 폴더
├── custom-reports/
│   ├── scenario-1/
│   │   └── index.json                   ✅ 리포트 파일 인덱스
│   ├── scenario-list.json               ✅ 시나리오 메타데이터
│   └── global-test-results.json         ✅ (실행 시 자동 생성)
├── tests/
│   └── scenario/
│       └── scenario-1.spec.js           ✅ 예시 시나리오
├── electron-scenario-runner.js          ✅ CMP 전용 실행기
└── cmp-main.html                        ✅ CMP UI

CONTRABASS/
├── config/
│   ├── recording-settings.json          ✅ 시나리오별 녹화 ON/OFF
│   ├── test-settings.json               ✅ 테스트 환경 설정
│   └── user-recording-folders.json      ✅ 사용자 지정 녹화 폴더
├── custom-reports/
│   ├── scenario-1/
│   │   └── index.json                   ✅ 리포트 파일 인덱스
│   ├── scenario-list.json               ✅ 시나리오 메타데이터
│   └── global-test-results.json         ✅ (실행 시 자동 생성)
├── tests/
│   └── scenario/
│       └── scenario-1.spec.js           ✅ 예시 시나리오
├── electron-scenario-runner.js          ✅ CONTRABASS 전용 실행기
└── contrabass-main.html                 ✅ CONTRABASS UI
```

---

## ��� 파일별 상세 내용

### 1. `config/recording-settings.json`
**용도**: 시나리오별 녹화 ON/OFF 설정

```json
{
  "1": false
}
```

- `false`: 녹화 OFF (기본값)
- `true`: 녹화 ON (UI에서 변경 가능)

---

### 2. `config/test-settings.json` ���
**용도**: 테스트 환경 설정 (URL, timeout 등)

**CMP**:
```json
{
  "baseUrl": "https://cmp.example.com",
  "timeout": 30000,
  "headless": false,
  "slowMo": 100,
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

**CONTRABASS**:
```json
{
  "baseUrl": "https://contrabass.example.com",
  "timeout": 30000,
  "headless": false,
  "slowMo": 100,
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

**활용 방법**:
- `baseUrl`: 실제 제품 URL로 변경
- `timeout`: 테스트 타임아웃 시간 (ms)
- `headless`: 브라우저 헤드리스 모드 여부
- `slowMo`: 테스트 속도 조절 (ms)

---

### 3. `config/user-recording-folders.json` ���
**용도**: 녹화 파일을 복사할 사용자 지정 폴더 경로

```json
{
  "1": ""
}
```

**사용 예시** (VIOLA):
```json
{
  "1": "C:\\Users\\okestro\\Desktop\\VIOLA_녹화",
  "2": "C:\\Users\\okestro\\Desktop\\시연용"
}
```

**기능**:
- 녹화된 테스트 영상을 지정된 폴더에 자동 복사
- 빈 문자열("")이면 기본 경로 사용
- 시연용/발표용 녹화 파일 관리에 유용

---

### 4. `custom-reports/scenario-list.json` ���
**용도**: 시나리오 메타데이터 중앙 관리

**CMP**:
```json
{
  "scenarios": [
    {
      "id": 1,
      "name": "CMP 시나리오 1: 기본 로그인 및 대시보드 확인",
      "path": "./scenario-1/custom-report.html",
      "status": "not-run",
      "lastRun": null,
      "duration": null,
      "startTime": null,
      "timestamp": null,
      "runCount": 0,
      "totalDuration": 0,
      "successCount": 0,
      "failCount": 0
    }
  ]
}
```

**CONTRABASS**:
```json
{
  "scenarios": [
    {
      "id": 1,
      "name": "CONTRABASS 시나리오 1: 기본 로그인 및 대시보드 확인",
      "path": "./scenario-1/custom-report.html",
      "status": "not-run",
      "lastRun": null,
      "duration": null,
      "startTime": null,
      "timestamp": null,
      "runCount": 0,
      "totalDuration": 0,
      "successCount": 0,
      "failCount": 0
    }
  ]
}
```

**활용**:
- 시나리오 실행 통계 추적
- UI에서 시나리오 목록 동적 로딩
- 실행 이력 관리

---

## ��� VIOLA와의 구조 일치도

### 최종 결과: **100% 일치** ✅

| 구성 요소 | VIOLA | CMP | CONTRABASS |
|----------|-------|-----|------------|
| 디렉토리 구조 | ✅ | ✅ | ✅ |
| `recording-settings.json` | ✅ | ✅ | ✅ |
| `test-settings.json` | ✅ | ✅ | ✅ |
| `user-recording-folders.json` | ✅ | ✅ | ✅ |
| `scenario-list.json` | ✅ | ✅ | ✅ |
| `scenario-X/index.json` | ✅ | ✅ | ✅ |
| `global-test-results.json` | ✅ | ✅ | ✅ |
| 전용 실행기 | ✅ | ✅ | ✅ |
| 제품 UI | ✅ | ✅ | ✅ |

**제외**: `pod-counter.json` (VIOLA 전용 기능)

---

## ��� 다음 단계

### 1. 실제 환경 설정

#### `test-settings.json` 수정:
```json
{
  "baseUrl": "https://실제URL.com",  // 실제 CMP/CONTRABASS URL로 변경
  "timeout": 30000,
  "headless": false,
  "slowMo": 100,
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

#### `user-recording-folders.json` 수정 (선택):
```json
{
  "1": "C:\\Users\\사용자명\\Desktop\\CMP_시연용"
}
```

### 2. 시나리오 추가
- `tests/scenario/scenario-2.spec.js`, `scenario-3.spec.js` 등 추가
- `scenario-list.json`에 메타데이터 추가
- UI HTML 파일의 `scenarios` 배열에 추가

### 3. 테스트 실행
```bash
cd ~/Desktop/test
npm start
# CMP 또는 CONTRABASS 선택 → 시나리오 1 실행
```

---

## ��� 요약

✅ **완료된 작업**:
1. VIOLA의 전체 구조를 CMP/CONTRABASS에 100% 복제
2. 필수 파일 + 선택적 파일 모두 생성
3. 제품별 독립적인 구조 확립
4. 확장 가능한 설정 파일 구조 마련

✅ **달성한 목표**:
- 제품별 시나리오 실행 완전 분리
- 제품별 레포트 생성 완전 분리
- 제품별 이력 관리 완전 분리
- VIOLA와 100% 동일한 구조

��� **CMP와 CONTRABASS도 이제 VIOLA처럼 독립적으로 운영 가능합니다!**

---

**작성일**: 2025년 10월 17일  
**최종 업데이트**: 2025년 10월 17일 15:10  
**버전**: 2.0.0 (VIOLA 100% 구조 일치)
