# CMP & CONTRABASS 독립 구조 설정 완료

## ��� 작업 요약

CMP와 CONTRABASS 제품에 대한 독립적인 시나리오 구조를 구축하여, 각 제품별로 시나리오 실행, 레포트 생성, 실행 이력 관리가 완전히 분리되도록 설정했습니다.

---

## ✅ 완료된 작업

### 1. 디렉토리 구조 생성

#### CMP
```
CMP/
├── config/
│   └── recording-settings.json         # 시나리오별 녹화 설정
├── custom-reports/
│   ├── scenario-1/
│   │   └── index.json                  # 리포트 인덱스 파일
│   └── global-test-results.json        # (실행 시 자동 생성)
├── tests/
│   └── scenario/
│       └── scenario-1.spec.js          # 예시 시나리오
├── electron-scenario-runner.js         # CMP 전용 실행기
└── cmp-main.html                       # CMP UI
```

#### CONTRABASS
```
CONTRABASS/
├── config/
│   └── recording-settings.json         # 시나리오별 녹화 설정
├── custom-reports/
│   ├── scenario-1/
│   │   └── index.json                  # 리포트 인덱스 파일
│   └── global-test-results.json        # (실행 시 자동 생성)
├── tests/
│   └── scenario/
│       └── scenario-1.spec.js          # 예시 시나리오
├── electron-scenario-runner.js         # CONTRABASS 전용 실행기
└── contrabass-main.html                # CONTRABASS UI
```

---

### 2. 설정 파일

#### `config/recording-settings.json`
```json
{
  "1": false
}
```
- 시나리오별 녹화 ON/OFF 설정
- 기본값: OFF (false)
- 필요 시 UI에서 ON으로 변경 가능

#### `custom-reports/scenario-1/index.json`
```json
{
  "files": []
}
```
- 시나리오별 커스텀 리포트 파일 목록
- 시나리오 실행 시 자동으로 업데이트됨

---

### 3. Electron Scenario Runner 수정

#### CMP (`CMP/electron-scenario-runner.js`)
- ✅ 제품 이름: `'cmp'`
- ✅ 로그 메시지: "��� CMP Electron 시나리오 실행기"
- ✅ 시나리오 목록: CMP 관련 시나리오 (8개)
- ✅ 모든 경로가 `CMP/` 디렉토리 기준으로 설정

#### CONTRABASS (`CONTRABASS/electron-scenario-runner.js`)
- ✅ 제품 이름: `'contrabass'`
- ✅ 로그 메시지: "��� CONTRABASS Electron 시나리오 실행기"
- ✅ 시나리오 목록: CONTRABASS 관련 시나리오 (8개)
- ✅ 모든 경로가 `CONTRABASS/` 디렉토리 기준으로 설정

---

### 4. 예시 시나리오 작성

#### 시나리오 1: 기본 로그인 및 대시보드 확인

**CMP** (`CMP/tests/scenario/scenario-1.spec.js`)
```javascript
/**
 * CMP 시나리오 1: 기본 로그인 및 대시보드 확인
 * 
 * 테스트 단계:
 * 1. 로그인 페이지 접근
 * 2. 로그인 정보 입력
 * 3. 로그인 실행
 * 4. 로그인 성공 확인 (대시보드 접근)
 */
```

**CONTRABASS** (`CONTRABASS/tests/scenario/scenario-1.spec.js`)
```javascript
/**
 * CONTRABASS 시나리오 1: 기본 로그인 및 대시보드 확인
 * 
 * 테스트 단계:
 * 1. 로그인 페이지 접근
 * 2. 로그인 정보 입력
 * 3. 로그인 실행
 * 4. 로그인 성공 확인 (대시보드 접근)
 */
```

---

### 5. UI 업데이트

#### CMP Main HTML (`CMP/cmp-main.html`)
- ✅ 시나리오 목록: 1개 시나리오
- ✅ 시나리오 제목: "기본 로그인 및 대시보드 확인"
- ✅ 시나리오 설명: "CMP 플랫폼의 기본 로그인 기능과 대시보드 접근 테스트"

#### CONTRABASS Main HTML (`CONTRABASS/contrabass-main.html`)
- ✅ 시나리오 목록: 1개 시나리오
- ✅ 시나리오 제목: "기본 로그인 및 대시보드 확인"
- ✅ 시나리오 설명: "CONTRABASS 플랫폼의 기본 로그인 기능과 대시보드 접근 테스트"

---

## ��� 독립성 확보

### 각 제품별로 완전히 독립적으로:

1. **시나리오 실행**
   - CMP 시나리오는 `CMP/tests/scenario/` 에서 실행
   - CONTRABASS 시나리오는 `CONTRABASS/tests/scenario/` 에서 실행

2. **레포트 생성**
   - CMP: `CMP/custom-reports/scenario-X/`
   - CONTRABASS: `CONTRABASS/custom-reports/scenario-X/`

3. **실행 이력 관리**
   - CMP: `CMP/custom-reports/global-test-results.json`
   - CONTRABASS: `CONTRABASS/custom-reports/global-test-results.json`

4. **설정 파일**
   - CMP: `CMP/config/recording-settings.json`
   - CONTRABASS: `CONTRABASS/config/recording-settings.json`

---

## ��� 다음 단계

### 1. 실제 URL 설정
현재 예시 시나리오는 `example.com` 도메인을 사용하고 있습니다. 실제 환경에 맞게 수정이 필요합니다:

```javascript
// CMP
await page.goto('https://cmp.example.com/login'); // 실제 CMP URL로 변경

// CONTRABASS
await page.goto('https://contrabass.example.com/login'); // 실제 CONTRABASS URL로 변경
```

### 2. 추가 시나리오 작성
현재 시나리오 1번만 예시로 작성되었습니다. 추가 시나리오는:
- `CMP/tests/scenario/scenario-2.spec.js`
- `CMP/tests/scenario/scenario-3.spec.js`
- 등등...

형식으로 추가하고, 각 제품의 `*-main.html` 파일의 `scenarios` 배열에 추가하면 됩니다.

### 3. 시나리오 실행 테스트
Electron 앱을 재시작하고 각 제품에서 시나리오 1을 실행하여 정상 작동 확인:

```bash
cd ~/Desktop/test
npm start
```

---

## ��� 주요 변경 사항

### 이전 (문제)
- CMP와 CONTRABASS가 TROMBONE 코드를 그대로 복사
- "VIOLA Electron 시나리오 실행기" 등 잘못된 로그 메시지
- 제품별 독립성 없음

### 현재 (해결)
- ✅ 각 제품별로 완전히 독립적인 구조
- ✅ 제품별 전용 실행기 및 설정
- ✅ 제품별 레포트 및 이력 관리 분리
- ✅ 확장 가능한 구조 (시나리오 추가 용이)

---

## ��� 참고 자료

- VIOLA 시나리오 구조를 참고하여 설계
- TROMBONE 리팩토링 경험 적용
- 공통 모듈은 `COMMON/` 디렉토리 활용 (향후 개선 예정)

---

**작성일**: 2025년 10월 17일  
**작성자**: AI Agent  
**버전**: 1.0.0
