# OTP 모드 사용 가이드

## 📋 개요

로그인 과정에 OTP(One-Time Password) 입력이 필요한 경우, 테스트를 일시정지하고 수동으로 OTP를 입력할 수 있는 기능입니다.

## 🎯 동작 방식

1. `submitLogin()` 실행 → 로그인 버튼 클릭
2. ⏸️ **테스트 일시정지** → OTP 입력 대기
3. 사용자가 이메일에서 OTP 확인 후 브라우저에 입력
4. 사용자가 Enter 키를 누르면 테스트 재개
5. `verifyLoginSuccess()` 실행 → 로그인 성공 확인

## 🚀 사용 방법

### 1. OTP 모드 활성화

테스트 실행 시 환경변수 `OTP_MODE=true`를 설정합니다:

#### Windows (PowerShell)
```powershell
$env:OTP_MODE="true"
npx playwright test tests/scenario/scenario-1.spec.js
```

#### Windows (CMD)
```cmd
set OTP_MODE=true
npx playwright test tests/scenario/scenario-1.spec.js
```

#### Linux/Mac
```bash
OTP_MODE=true npx playwright test tests/scenario/scenario-1.spec.js
```

### 2. 일반 모드 (OTP 비활성화)

환경변수를 설정하지 않거나 `false`로 설정하면 OTP 대기 없이 바로 진행됩니다:

```bash
# 환경변수 없이 실행
npx playwright test tests/scenario/scenario-1.spec.js

# 또는 명시적으로 비활성화
OTP_MODE=false npx playwright test tests/scenario/scenario-1.spec.js
```

## 📺 실행 화면 예시

### OTP 모드 활성화 시

```
🔐 VIOLA 로그인 프로세스 시작...
🌐 VIOLA 로그인 페이지 접근 중...
✅ VIOLA 로그인 페이지 접근 완료
📝 로그인 정보 입력 중...
✅ 로그인 정보 입력 완료
🚀 로그인 실행 중...
✅ 로그인 실행 완료

⏸️  ==========================================
⏸️  테스트 일시정지: OTP 입력이 필요합니다
⏸️  ==========================================
📧 1. 이메일에서 OTP 코드를 확인하세요
🔢 2. 브라우저에서 OTP 코드를 입력하세요
⏎  3. 완료 후 Enter 키를 누르세요
⏸️  ==========================================

✅ OTP 입력 완료 후 Enter를 누르세요: _
```

사용자가 OTP를 입력하고 Enter를 누르면:

```
▶️  테스트 재개...

🔍 로그인 성공 확인 중...
✅ 로그인 성공 확인 완료
✅ VIOLA 로그인 프로세스 완료
```

## 🔧 적용된 프로젝트

- ✅ VIOLA
- ✅ CONTRABASS
- ✅ CMP

모든 프로젝트의 `LoginManager.js`에 동일하게 적용되었습니다.

## 📝 코드 구조

### waitForOTPInput() 메서드

```javascript
async waitForOTPInput() {
  if (!this.otpMode) {
    return; // OTP 모드가 아니면 건너뛰기
  }

  // 사용자 안내 메시지 출력
  console.log('⏸️ OTP 입력이 필요합니다...');

  // Enter 키 입력 대기
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('✅ OTP 입력 완료 후 Enter를 누르세요: ', () => {
      rl.close();
      console.log('▶️ 테스트 재개...');
      resolve();
    });
  });
}
```

### processLogin() 메서드

```javascript
async processLogin(config) {
  try {
    await this.navigateToLoginPage();
    await this.fillLoginCredentials(config);
    await this.submitLogin();
    
    // OTP 입력 대기 (OTP_MODE=true일 때만)
    await this.waitForOTPInput();
    
    await this.verifyLoginSuccess();
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}
```

## 💡 사용 시나리오

### 시나리오 1: 개발/로컬 테스트 (OTP 필요)

```bash
# OTP 모드 활성화
OTP_MODE=true npx playwright test
```

- 로그인 버튼 클릭 후 일시정지
- 이메일에서 OTP 확인
- 브라우저에 OTP 입력
- Enter 키 눌러 테스트 재개

### 시나리오 2: CI/CD 자동화 (OTP 불필요)

```bash
# 일반 모드
npx playwright test
```

- OTP 대기 없이 전체 테스트 자동 실행
- CI/CD 파이프라인에서 사용

### 시나리오 3: 디버깅

```bash
# OTP 모드 + 헤드풀 모드
OTP_MODE=true npx playwright test --headed
```

- 브라우저를 보면서 각 단계 확인
- OTP 입력 후 다음 단계 진행

## ⚠️ 주의사항

1. **OTP 모드는 로컬 개발 전용**
   - CI/CD에서는 OTP_MODE를 설정하지 마세요
   - 자동화된 테스트에서는 사용 불가

2. **타임아웃**
   - OTP 입력 대기 중에는 타임아웃이 없습니다
   - 필요한 만큼 시간을 사용할 수 있습니다

3. **브라우저 상태**
   - OTP 입력 대기 중에도 브라우저는 열려있습니다
   - 직접 OTP를 입력할 수 있습니다

## 🎯 장점

1. ✅ **유연성**: OTP가 있든 없든 동일한 테스트 코드 사용
2. ✅ **간편성**: 환경변수 하나로 모드 전환
3. ✅ **호환성**: 기존 테스트에 영향 없음
4. ✅ **디버깅**: 로그인 과정을 단계별로 확인 가능

## 🔍 문제 해결

### Enter 키가 작동하지 않는 경우

- **원인**: 터미널 입력이 비활성화된 상태
- **해결**: 터미널 창을 클릭하고 Enter 키 다시 입력

### OTP 모드가 활성화되지 않는 경우

- **확인**: 환경변수가 제대로 설정되었는지 확인
  ```bash
  # Windows PowerShell
  echo $env:OTP_MODE
  
  # Linux/Mac
  echo $OTP_MODE
  ```

### 테스트가 멈춘 경우

- **원인**: OTP 입력 대기 중
- **해결**: 
  1. OTP를 입력하고 Enter 키를 누르거나
  2. Ctrl+C로 테스트 종료

## 📚 참고

- 파일 위치:
  - `VIOLA/lib/classes/LoginManager.js`
  - `CONTRABASS/lib/classes/LoginManager.js`
  - `CMP/lib/classes/LoginManager.js`

- 관련 메서드:
  - `waitForOTPInput()` - OTP 입력 대기
  - `processLogin()` - 로그인 프로세스
  - `submitLogin()` - 로그인 버튼 클릭
  - `verifyLoginSuccess()` - 로그인 성공 확인

---

**작성일**: 2025-10-22
**버전**: 1.0
**적용 범위**: VIOLA, CONTRABASS, CMP

