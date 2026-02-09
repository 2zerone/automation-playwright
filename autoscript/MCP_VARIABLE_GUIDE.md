# Autoscript MCP & Variable 통합 가이드

## 🎉 새로운 기능

### 1. 🤖 Playwright MCP 통합

Playwright의 공식 MCP (`@playwright/mcp`)를 통합하여 **파싱 실패 시 자동으로 AI가 변환**합니다.

#### 작동 방식

**A. Codegen → Sheets 변환 시 (`codegen-to-sheets.js`)**
- 녹화된 Playwright 코드 중 파싱되지 않은 복잡한 라인을 MCP로 자연어 변환
- 자동으로 Google Sheets의 `ACTION_DESC`로 저장

**B. Sheets → Playwright 변환 시 (`sheets-to-playwright-direct.js`)**
- 시트의 `ACTION_DESC`가 파싱되지 않을 경우 MCP로 Playwright 코드 생성
- 직접 자연어로 작성한 시나리오도 자동 변환

#### 설정 방법

1. **ANTHROPIC_API_KEY 환경 변수 설정**
```bash
# Windows
setx ANTHROPIC_API_KEY "your-api-key"

# Linux/Mac
export ANTHROPIC_API_KEY="your-api-key"
```

2. **MCP 패키지 설치 확인**
```bash
npm install @anthropic-ai/sdk
```

3. **자동 활성화**
- API 키가 설정되면 자동으로 활성화
- 로그에서 `🤖 Playwright MCP 활성화됨` 메시지 확인

#### 사용 예시

**시나리오 1: 복잡한 셀렉터 녹화**
```javascript
// 녹화된 복잡한 코드
await page.locator('.card').nth(2).locator('.settings-icon').click();
```
↓ MCP 자동 변환 ↓
```
ACTION_DESC: 3번째 카드의 설정 아이콘 클릭 (🤖 MCP)
```

**시나리오 2: 자연어로 시트 작성**
```
ACTION_DESC: 모달이 완전히 사라질 때까지 대기
```
↓ MCP 자동 변환 ↓
```javascript
await page.locator('.modal').waitFor({ state: 'hidden' });
```

---

### 2. 🎯 VARIABLE 컬럼 추가

DATA 값의 동적/정적 여부를 제어하는 `VARIABLE` 컬럼이 추가되었습니다.

#### 새로운 시트 구조

| ENABLED | CASE_ID | TITLE | STEP_NO | ACTION_DESC | DATA | **VARIABLE** | ASSERT | TIMEOUT_MS |
|---------|---------|-------|---------|-------------|------|--------------|--------|------------|
| TRUE | TC001 | 사용자 생성 | 1 | 페이지로 이동 | https://... | | | 1000 |
| TRUE | TC001 | 사용자 생성 | 2 | '사용자명' 텍스트박스에 입력 | test_user | **TRUE** | | 1000 |
| TRUE | TC001 | 사용자 생성 | 3 | '비밀번호' 텍스트박스에 입력 | password123 | **FALSE** | | 1000 |

#### VARIABLE 옵션

| 값 | 동작 | 예시 |
|----|------|------|
| **빈칸** 또는 **FALSE** | 고정값 사용 | `admin` → `admin` |
| **TRUE** | 타임스탬프 추가 | `admin` → `admin_1730123456789` |
| **RANDOM** | 랜덤 6자리 추가 | `admin` → `admin_A3F9D2` |
| **INCREMENT** | 카운터 증가 | `admin` → `admin_1`, `admin_2`, ... |
| **UUID** | UUID 첫 8자리 추가 | `admin` → `admin_a1b2c3d4` |

#### 생성되는 코드 예시

**VARIABLE = TRUE**
```javascript
const dynamicData_2 = `test_user_${Date.now()}`;
await page.getByRole('textbox', { name: '사용자명' }).fill(dynamicData_2);
console.log('Step 2: 입력 완료 (동적 값):', dynamicData_2);
```

**VARIABLE = FALSE (또는 빈칸)**
```javascript
await page.getByRole('textbox', { name: '비밀번호' }).fill('password123');
console.log('Step 3: 입력 완료 (고정 값)');
```

---

## 🚀 사용 가이드

### Case 1: MCP 없이 사용 (기존 방식)
1. ANTHROPIC_API_KEY 설정 안 함
2. 파싱 가능한 표준 형식만 사용
3. VARIABLE 컬럼으로 동적 값 제어

### Case 2: MCP 활용 (권장)
1. ANTHROPIC_API_KEY 설정
2. 복잡한 시나리오도 녹화 가능
3. 자연어로 시트 작성 가능
4. VARIABLE 컬럼 병행 사용

---

## 📊 Google Sheets 수정사항

### 헤더 행 업데이트 필요

기존 시트에 **VARIABLE** 컬럼을 추가하세요:

**기존 (8개 컬럼)**
```
ENABLED | CASE_ID | TITLE | STEP_NO | ACTION_DESC | DATA | ASSERT | TIMEOUT_MS
```

**신규 (9개 컬럼)**
```
ENABLED | CASE_ID | TITLE | STEP_NO | ACTION_DESC | DATA | VARIABLE | ASSERT | TIMEOUT_MS
```

### 시트별 범위 업데이트

모든 플랫폼 시트의 범위가 **A1:J9999**로 확장되었습니다:
- TROMBONE: `A1:I9999` → `A1:J9999`
- VIOLA: `A1:I9999` → `A1:J9999`
- CONTRABASS: `A1:I9999` → `A1:J9999`
- CMP: `A1:I9999` → `A1:J9999`

---

## 🔧 변경된 파일

### 1. `playwright-mcp-helper.js` (신규)
- MCP 클라이언트 헬퍼 함수
- 자연어 ↔ Playwright 코드 변환

### 2. `codegen-to-sheets.js`
- ✅ VARIABLE 컬럼 지원 추가
- ✅ MCP 통합 (파싱 실패 시 자동 변환)
- ✅ 시트 범위 J9999로 확장

### 3. `sheets-to-playwright-direct.js`
- ✅ VARIABLE 컬럼 로직 구현
- ✅ MCP 통합 (파싱 실패 시 자동 변환)
- ✅ 동적 값 생성 (TRUE, RANDOM, INCREMENT, UUID)
- ✅ 시트 범위 J9999로 확장

---

## 🎭 실제 워크플로우 예시

### 예시 1: 복잡한 시나리오 녹화

```bash
# 1. Codegen 실행
npm run codegen:auto viola

# 2. 브라우저에서 복잡한 동작 수행
# - 3번째 카드 클릭
# - 설정 메뉴 열기
# - 복잡한 필터 적용

# 3. 자동으로 시트에 저장 (MCP가 복잡한 부분 변환)
# ✅ '3번째 카드의 설정 아이콘 클릭 (🤖 MCP)'
```

### 예시 2: 자연어로 시트 작성

**Google Sheets 직접 작성:**
| STEP_NO | ACTION_DESC | DATA | VARIABLE |
|---------|-------------|------|----------|
| 1 | 페이지로 이동 | https://... | |
| 2 | 로그인 버튼이 나타날 때까지 대기 | | |
| 3 | '사용자명' 입력 | test_user | TRUE |
| 4 | '비밀번호' 입력 | pass123 | FALSE |
| 5 | 로그인 버튼 클릭 | | |
| 6 | 대시보드가 로드될 때까지 기다림 | | |

```bash
# Playwright 코드 생성
npm run autoscript TC001 viola

# MCP가 자동으로 변환:
# "로그인 버튼이 나타날 때까지 대기" → await page.getByRole('button', { name: '로그인' }).waitFor();
# "대시보드가 로드될 때까지 기다림" → await page.waitForLoadState('networkidle');
```

### 예시 3: 중복 방지 테스트

**시나리오: 사용자 생성 테스트**

| STEP_NO | ACTION_DESC | DATA | VARIABLE |
|---------|-------------|------|----------|
| 1 | 페이지로 이동 | https://... | |
| 2 | '생성' 버튼 클릭 | | |
| 3 | '사용자명' 입력 | test_user | **TRUE** |
| 4 | '이메일' 입력 | test@example.com | **RANDOM** |
| 5 | '순번' 입력 | user | **INCREMENT** |

**생성되는 코드:**
```javascript
test('사용자 생성', async ({ page }) => {
  let globalCounter = 0;
  
  await page.goto('https://...');
  await page.getByRole('button', { name: '생성' }).click();
  
  // VARIABLE = TRUE: 타임스탬프
  const dynamicData_3 = `test_user_${Date.now()}`;
  await page.getByRole('textbox', { name: '사용자명' }).fill(dynamicData_3);
  console.log('Step 3: 입력 완료 (동적 값):', dynamicData_3);
  // 결과: test_user_1730123456789
  
  // VARIABLE = RANDOM: 랜덤 6자리
  const dynamicData_4 = `test@example.com_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  await page.getByRole('textbox', { name: '이메일' }).fill(dynamicData_4);
  console.log('Step 4: 입력 완료 (동적 값):', dynamicData_4);
  // 결과: test@example.com_A3F9D2
  
  // VARIABLE = INCREMENT: 순차 증가
  const dynamicData_5 = `user_${++globalCounter}`;
  await page.getByRole('textbox', { name: '순번' }).fill(dynamicData_5);
  console.log('Step 5: 입력 완료 (동적 값):', dynamicData_5);
  // 결과: user_1, user_2, user_3...
});
```

---

## 🔍 트러블슈팅

### MCP가 작동하지 않을 때

**증상:**
```
⚠️ Playwright MCP 비활성화 - 파싱 실패 시 수동 처리 필요
```

**해결:**
1. ANTHROPIC_API_KEY 환경 변수 확인
   ```bash
   # Windows
   echo %ANTHROPIC_API_KEY%
   
   # Linux/Mac
   echo $ANTHROPIC_API_KEY
   ```

2. API 키 재설정
   ```bash
   # Windows (관리자 권한)
   setx ANTHROPIC_API_KEY "sk-ant-..."
   
   # Linux/Mac
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

3. 터미널 재시작 후 재시도

### VARIABLE 컬럼이 적용되지 않을 때

**증상:** 동적 값이 생성되지 않고 고정값만 사용됨

**해결:**
1. Google Sheets에 VARIABLE 컬럼 추가 확인
2. 컬럼 순서 확인: `DATA` → `VARIABLE` → `ASSERT`
3. VARIABLE 값이 정확한지 확인 (TRUE, RANDOM, INCREMENT, UUID)

### 파싱 실패 경고가 계속 나올 때

**증상:**
```
⚠️ 파싱 실패한 라인: await page.locator(...).someComplexAction()
```

**해결:**
1. MCP 활성화 (위 참고)
2. 또는 표준 형식으로 수정:
   - 복잡한 체이닝 → 간단한 getByRole/getByText 사용
   - 커스텀 액션 → 시트에 자연어로 작성 후 MCP 변환

---

## 📖 참고 자료

- [Playwright MCP 공식 문서](https://github.com/microsoft/playwright)
- [Anthropic API 키 발급](https://console.anthropic.com/)
- [ACTION_DESC 표준 형식](./README.md#action_desc-표준-형식)

---

## 🎉 마무리

이제 다음이 가능합니다:

✅ 복잡한 시나리오도 자동 녹화 및 변환  
✅ 자연어로 테스트 시나리오 작성  
✅ 중복 데이터 문제 해결 (동적 값 생성)  
✅ AI 보조로 파싱 실패 최소화  
✅ 더욱 강력하고 유연한 자동화  

Happy Testing! 🚀

