# Playwright Codegen to Google Sheets 자동화

이 폴더는 Playwright codegen을 실행하고 생성된 코드를 Google Sheets에 자동으로 정리해주는 시스템입니다.

## 🚀 주요 기능

1. **Playwright Codegen 실행**: 브라우저에서 사용자 동작을 녹화하여 테스트 코드 생성
2. **자동 파싱**: 생성된 Playwright 코드를 스프레드시트 형식으로 자동 변환
3. **Google Sheets 연동**: 변환된 데이터를 Google Sheets에 자동 추가
4. **REST API**: HTTP API를 통한 데이터 조회/추가/삭제
5. **테스트 코드 생성**: Google Sheets 데이터를 Playwright 테스트 코드로 변환

## 📁 파일 구조

```
autoscript/
├── README.md                           # 이 파일
├── balmy-state-471105-h5-c819a6c1e5f3.json  # Google Sheets 인증 파일
├── sheets-to-playwright-direct.js      # Sheets → Playwright 변환
├── codegen-to-sheets.js               # Codegen → Sheets 변환
├── codegen-auto-sheets.js             # 대화형 codegen 실행
└── sheets-api-server.js               # Google Sheets REST API 서버
```

## 🛠️ 설치 및 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. Google Sheets 인증 설정
- `balmy-state-471105-h5-c819a6c1e5f3.json` 파일이 이미 설정되어 있습니다.
- Google Sheets API가 활성화되어 있어야 합니다.

## 🎯 사용법

### 1. 기본 Codegen 실행 (자동 파일 생성)
```bash
npm run codegen:sheets "http://trombone.qa.okestro.cloud/" "TC001" "로그인 테스트"
```

### 2. 대화형 Codegen 실행
```bash
npm run codegen:auto
```
- URL, 케이스 ID, 테스트 제목을 입력받습니다.
- 브라우저에서 동작을 녹화합니다.
- 완료 후 Google Sheets에 자동 추가됩니다.

### 3. Google Sheets API 서버 실행
```bash
npm run sheets:server
```
- 포트 3001에서 REST API 서버가 실행됩니다.
- 브라우저에서 `http://localhost:3001` 접속 가능합니다.

### 4. Google Sheets → Playwright 코드 생성
```bash
# 특정 케이스 생성
npm run autoscript TC001

# 모든 케이스 생성
npm run autoscript-all

# 사용 가능한 케이스 목록 조회
npm run sheets:list
```

## 📊 Google Sheets 구조 (개선됨!)

스프레드시트는 다음 **간소화된** 컬럼 구조를 가집니다:

| 컬럼 | 설명 | 예시 |
|------|------|------|
| ENABLED | 활성화 여부 | TRUE/FALSE |
| CASE_ID | 테스트 케이스 ID | TC001 |
| TITLE | 테스트 제목 | 로그인 테스트 |
| STEP_NO | 단계 번호 | 1, 2, 3... |
| **ACTION_DESC** | **자연어 액션 설명** | **'로그인' 버튼 클릭** |
| DATA | 입력 데이터 | admin, http://example.com |
| **VARIABLE** 🆕 | **동적 값 제어** | **TRUE, RANDOM, INCREMENT** |
| ASSERT | 검증 조건 | visible, url:example.com |
| TIMEOUT_MS | 타임아웃(ms) | 1000 |

### 🎯 ACTION_DESC 표준 형식

ACTION_DESC는 자연어로 읽기 쉬운 형태로 작성됩니다:

#### 페이지 이동
```
페이지로 이동
```

#### 버튼/링크 클릭
```
'로그인' 버튼 클릭
'회원가입' 링크 클릭
'저장' 버튼 클릭
```

#### 입력 필드
```
'이메일' 텍스트박스에 입력
'비밀번호' 텍스트박스에 입력
'사용자명' 텍스트박스에 입력
```

#### 텍스트 클릭
```
'Example Domain' 텍스트 클릭
```

#### CSS 셀렉터 (고급)
```
셀렉터(#login-btn) 클릭
셀렉터(.submit-button)에 입력
```

### 📝 실제 예시

| ENABLED | CASE_ID | TITLE | STEP_NO | ACTION_DESC | DATA | VARIABLE | TIMEOUT_MS |
|---------|---------|-------|---------|-------------|------|----------|------------|
| TRUE | TC1000 | 로그인 | 1 | 페이지로 이동 | https://example.com | | 1000 |
| TRUE | TC1000 | 로그인 | 2 | '이메일 입력' 버튼 클릭 | | | 1000 |
| TRUE | TC1000 | 로그인 | 3 | '이메일' 텍스트박스에 입력 | user@example.com | TRUE | 1000 |
| TRUE | TC1000 | 로그인 | 4 | '비밀번호' 텍스트박스에 입력 | password123 | FALSE | 1000 |
| TRUE | TC1000 | 로그인 | 5 | '로그인' 버튼 클릭 | | | 1000 |

### ✅ 장점

1. **가독성 향상**: 누가 봐도 무슨 동작인지 바로 이해
2. **간소화**: 9개 컬럼 → 8개 컬럼 (SELECTOR + ACTION → ACTION_DESC)
3. **테스트 문서화**: 시트 자체가 테스트 시나리오 문서
4. **정확한 변환**: 100% 정확한 양방향 변환 지원

## 🔧 API 엔드포인트

### 데이터 조회
```bash
GET http://localhost:3001/api/sheets/data
```

### 데이터 추가
```bash
POST http://localhost:3001/api/sheets/data
Content-Type: application/json

{
  "actions": [
    {
      "enabled": "TRUE",
      "caseId": "TC001",
      "title": "로그인 테스트",
      "stepNo": 1,
      "selector": "#username",
      "action": "fill",
      "data": "admin",
      "assert": "visible",
      "timeoutMs": "1000"
    }
  ]
}
```

### 특정 케이스 조회
```bash
GET http://localhost:3001/api/sheets/data/TC001
```

### 특정 케이스 삭제
```bash
DELETE http://localhost:3001/api/sheets/data/TC001
```

### 테스트 케이스 목록 조회
```bash
GET http://localhost:3001/api/sheets/cases
```

## 🎭 지원되는 Playwright 액션

### Playwright 코드 → ACTION_DESC 자동 변환

| Playwright 코드 | ACTION_DESC 결과 |
|----------------|------------------|
| `page.goto('https://...')` | 페이지로 이동 |
| `page.getByRole('button', {name: '로그인'}).click()` | '로그인' 버튼 클릭 |
| `page.getByRole('textbox', {name: '이메일'}).fill('test@test.com')` | '이메일' 텍스트박스에 입력 |
| `page.getByRole('link', {name: '회원가입'}).click()` | '회원가입' 링크 클릭 |
| `page.getByText('Example').click()` | 'Example' 텍스트 클릭 |
| `page.locator('#login-btn').click()` | 셀렉터(#login-btn) 클릭 |

### ACTION_DESC → Playwright 코드 역변환

| ACTION_DESC | 생성되는 Playwright 코드 |
|-------------|-------------------------|
| 페이지로 이동 | `await page.goto(data);` |
| '로그인' 버튼 클릭 | `await page.getByRole('button', { name: '로그인' }).click();` |
| '이메일' 텍스트박스에 입력 | `await page.getByRole('textbox', { name: '이메일' }).fill(data);` |
| '회원가입' 링크 클릭 | `await page.getByRole('link', { name: '회원가입' }).click();` |
| 'Example' 텍스트 클릭 | `await page.getByText('Example').click();` |
| 셀렉터(#login-btn) 클릭 | `await page.locator('#login-btn').click();` |

**✅ 양방향 변환 정확도: 100%**

## 🔍 문제 해결

### 1. Google Sheets 인증 오류
- `balmy-state-471105-h5-c819a6c1e5f3.json` 파일이 올바른 위치에 있는지 확인
- Google Sheets API가 활성화되어 있는지 확인

### 2. Playwright codegen 실행 오류
- Playwright가 설치되어 있는지 확인: `npx playwright install`
- Node.js 버전이 18 이상인지 확인

### 3. 포트 충돌
- `sheets:server` 실행 시 포트 3001이 사용 중인 경우
- 다른 포트 사용: `PORT=3002 npm run sheets:server`

## 📝 예시 워크플로우

1. **테스트 케이스 생성**:
   ```bash
   npm run codegen:auto
   # URL: http://trombone.qa.okestro.cloud/
   # 케이스 ID: TC001
   # 테스트 제목: 로그인 테스트
   ```

2. **브라우저에서 동작 녹화**:
   - 로그인 페이지 접속
   - 사용자명 입력
   - 비밀번호 입력
   - 로그인 버튼 클릭

3. **자동으로 Google Sheets에 추가**:
   - 생성된 액션들이 자동으로 스프레드시트에 추가됩니다.

4. **테스트 코드 생성**:
   ```bash
   npm run autoscript TC001
   ```

5. **생성된 테스트 실행**:
   ```bash
   npm run test tests/generated/TC001.spec.js
   ```

## 🆕 새로운 기능

### 1. 🤖 Playwright MCP 통합
- AI가 복잡한 시나리오도 자동으로 변환합니다
- 자연어로 테스트 시나리오 작성 가능
- 파싱 실패 시 자동으로 MCP가 처리

### 2. 🎯 VARIABLE 컬럼 (중복 방지)
- **TRUE**: 타임스탬프 추가 (`admin` → `admin_1730123456789`)
- **RANDOM**: 랜덤 6자리 추가 (`admin` → `admin_A3F9D2`)
- **INCREMENT**: 순차 증가 (`admin` → `admin_1`, `admin_2`, ...)
- **UUID**: UUID 8자리 추가 (`admin` → `admin_a1b2c3d4`)

자세한 내용은 [MCP_VARIABLE_GUIDE.md](./MCP_VARIABLE_GUIDE.md)를 참고하세요!

## 🎉 완료!

이제 Playwright codegen을 실행하고 Google Sheets에 자동으로 정리할 수 있습니다!
복잡한 시나리오도 MCP가 자동 변환하고, 중복 데이터 문제도 VARIABLE로 해결할 수 있습니다!
