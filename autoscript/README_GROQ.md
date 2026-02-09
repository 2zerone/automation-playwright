# Groq AI 자동 변환 - 빠른 시작 🚀

## ✨ 이미 설정 완료!

**API 키가 이미 설정되어 있어서 바로 사용 가능합니다!**

---

## 🎯 사용 방법

### Playwright Codegen → Google Sheets

```bash
# AI 변환 자동 활성화!
npm run codegen:auto:cmp
```

파싱 실패한 코드 → Groq AI가 자동으로 자연어로 변환 → 시트 저장 ✅

### Google Sheets → Playwright 코드

```bash
# 특정 테스트 케이스
npm run autoscript:cmp TC05

# 모든 테스트 케이스
npm run autoscript-all:cmp
```

파싱 실패한 자연어 → Groq AI가 자동으로 Playwright 코드로 변환 ✅

---

## 📊 동작 흐름

### 1. Codegen → 시트
```
Playwright Codegen 녹화
    ↓
코드 파싱
    ├─ 성공 → 시트 저장 ✅
    └─ 실패 → 🚀 Groq AI (자연어 변환) → 시트 저장 ✅
```

### 2. 시트 → Playwright
```
시트에서 Action Desc 읽기
    ↓
파싱 ('로그인' 버튼 클릭)
    ├─ 성공 → Playwright 코드 생성 ✅
    └─ 실패 → 🚀 Groq AI (코드 변환) → 코드 생성 ✅
```

---

## 🔧 설정

### ✅ 현재 상태
- ✅ API 키: 설정됨 (`autoscript/.groq-api-key`)
- ✅ AI 변환: 기본 활성화
- ✅ Git 보안: .gitignore에 추가됨

### 비활성화 (필요시)

```bash
set ENABLE_AI_CONVERSION=false  # Windows
export ENABLE_AI_CONVERSION=false  # Linux/Mac
```

### API 키 변경

```bash
# autoscript/.groq-api-key 파일 수정
# 또는
set GROQ_API_KEY=new_api_key_here
```

---

## 📈 사용량

- **무료 제한**: 일일 14,400 requests
- **실제 사용**: 하루 100회 codegen = 약 300 requests
- **충분함**: ✅

---

## 💡 팁

### 1. 변환 확인

변환된 항목은 주석에 표시됩니다:
```javascript
// Step 5: 복잡한 동작 수행 (🤖 Groq AI 변환)
await page.locator('#complex-selector').click();
```

### 2. 로그 확인

실행 중 변환 과정을 볼 수 있습니다:
```
🤖 파싱 실패 - Groq AI로 변환 시도: "복잡한 설명"
✅ Groq AI 변환 성공!
```

### 3. 문제 발생 시

```bash
# 테스트
cd autoscript
node test-groq.js

# API 키 확인
cat .groq-api-key  # Linux/Mac
type .groq-api-key  # Windows
```

---

## 🎉 완성!

**이제 복잡한 코드도 자동으로 변환됩니다!**

자세한 가이드: `autoscript/GROQ_SETUP.md`

