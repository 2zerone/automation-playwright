# Groq API 설정 가이드 🚀

## 🎯 개요

**완전 무료** AI API를 사용하여 Playwright 코드를 자동으로 자연어로 변환!

### ✅ 장점
- 🆓 **완전 무료** (일일 14,400 requests)
- ⚡ **매우 빠름** (초당 응답)
- 🔧 **Extension 불필요** (Node.js만 있으면 됨)
- 🎯 **간단한 설정** (5분 이내)

### 📊 제한
- 일일 14,400 requests (충분함!)
- 분당 30 requests

---

## 🚀 설정 단계

### 1단계: Groq 계정 생성 (2분)

1. **Groq Console 방문**
   - https://console.groq.com

2. **Sign Up 클릭**
   - Google 계정으로 간편 가입
   - 또는 이메일로 가입

3. **로그인 완료**
   - 무료 계정 생성 완료!

---

### 2단계: API 키 발급 (1분)

1. **API Keys 메뉴 클릭**
   - 좌측 메뉴에서 "API Keys" 선택

2. **Create API Key 클릭**
   - "Create API Key" 버튼 클릭
   - 키 이름 입력 (예: "autoscript")

3. **API 키 복사**
   - 생성된 API 키 복사
   - **한 번만 표시되니 안전하게 보관!**
   - 예: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 3단계: API 키 설정 (1분)

**✨ 자동 설정 (권장, 가장 간단!)**

API 키가 이미 `autoscript/.groq-api-key` 파일에 저장되어 있습니다!
- ✅ 자동으로 로드됨
- ✅ 환경 변수 설정 불필요
- ✅ Git에 올라가지 않음 (.gitignore에 추가됨)

**설정 완료! 바로 사용 가능합니다!** 🎉

---

**옵션: 환경 변수로 설정 (다른 프로젝트에서도 사용)**

#### Windows
```cmd
setx GROQ_API_KEY "your_api_key_here"
```

#### Linux/Mac
```bash
# ~/.bashrc 또는 ~/.zshrc에 추가
export GROQ_API_KEY="your_api_key_here"
source ~/.bashrc
```

---

### 4단계: 테스트 (1분)

```bash
cd autoscript
node test-groq.js
```

**예상 결과:**
```
🧪 Groq API 테스트 시작...

[1/4] 변환 중...
📝 입력: await page.locator('.card').nth(2).click();
✅ 결과: 3번째 카드 클릭

[2/4] 변환 중...
📝 입력: await page.getByRole('button', { name: '저장' }).click();
✅ 결과: 저장 버튼 클릭

...

✅ 테스트 완료!
```

### 5단계: 바로 사용하기! 🚀

**API 키가 이미 설정되어 있으므로 바로 사용 가능합니다!**

```bash
cd C:\Users\okestro\Desktop\test

# 그냥 실행하면 AI 변환이 자동으로 작동!
npm run codegen:auto:cmp
```

환경 변수 설정 필요 없음! ✅

---

## 🎯 사용 방법

### ✨ codegen에서 자동 변환 (기본 활성화!)

API 키가 설정되어 있으면 **자동으로 AI 변환이 활성화**됩니다!

```bash
# 그냥 실행하면 됩니다!
npm run codegen:auto:cmp
```

**자동으로 다음 순서로 작동:**
1. ✅ Groq API 시도 (무료, 빠름)
2. ⏭️ Groq 실패 시 수동 모드 (TODO 저장)

### 비활성화 (선택사항)

AI 변환을 끄려면:
```bash
# Windows
set ENABLE_AI_CONVERSION=false

# Linux/Mac
export ENABLE_AI_CONVERSION=false

# 실행
npm run codegen:auto:cmp
```

---

## 📊 동작 흐름

```
Playwright 코드 파싱 실패
    ↓
Groq API 호출 (무료!)
    ├─ 성공 → 자연어로 변환 ✅
    └─ 실패 → Extension 시도 → 수동 모드
```

---

## 💡 팁

### API 키 보안

`.gitignore`에 추가하여 API 키가 Git에 올라가지 않도록:
```
.env
.env.local
**/api-key.txt
```

### 사용량 확인

Groq Console에서 사용량 확인:
- https://console.groq.com
- Usage 메뉴

### 속도 조절

API 호출 속도를 조절하려면 `ai-converter/index.js`에서:
```javascript
// 100ms 딜레이 (기본값)
await new Promise(resolve => setTimeout(resolve, 100));

// 더 느리게 (안전함)
await new Promise(resolve => setTimeout(resolve, 500));
```

---

## 🐛 문제 해결

### "GROQ_API_KEY 환경 변수가 설정되지 않았습니다"

**해결:**
```cmd
# Windows
setx GROQ_API_KEY "your_key_here"

# 터미널 재시작 또는 새 터미널 열기
```

### "API 오류 (401): Unauthorized"

**원인:** API 키가 잘못됨

**해결:**
1. Groq Console에서 API 키 확인
2. 환경 변수 다시 설정
3. 따옴표 제거 (특수문자 있으면 따옴표 사용)

### "API 오류 (429): Rate limit exceeded"

**원인:** 속도 제한 초과

**해결:**
- 잠시 대기 (1분 후 재시도)
- 또는 딜레이 증가 (위의 "속도 조절" 참고)

### "요청 실패: getaddrinfo ENOTFOUND"

**원인:** 인터넷 연결 문제

**해결:**
- 인터넷 연결 확인
- 프록시 설정 확인
- 방화벽 설정 확인

---

## 📈 사용량 예시

### 일반적인 사용
```
codegen 1회 = 약 10~30개 변환
하루 10회 codegen = 300 requests
→ 14,400 제한 대비 2% 사용 ✅
```

### 많이 사용하는 경우
```
하루 100회 codegen = 3,000 requests
→ 14,400 제한 대비 21% 사용 ✅
```

**결론:** 일반적인 사용에는 충분합니다!

---

## 🎉 완료!

이제 완전 무료로 AI 자동 변환을 사용할 수 있습니다!

**다음 단계:**
1. ✅ Groq API 키 발급 완료
2. ✅ 환경 변수 설정 완료
3. ✅ 테스트 성공
4. 🚀 **codegen 실행하고 자동 변환 즐기기!**

```bash
ENABLE_AI_CONVERSION=true npm run codegen:auto:cmp
```

---

## 📞 추가 도움

- Groq 공식 문서: https://console.groq.com/docs
- Groq Playground: https://console.groq.com/playground
- 사용 가능한 모델: https://console.groq.com/docs/models

