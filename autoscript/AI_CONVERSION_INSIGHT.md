# Autoscript AI 변환 기능 도입 과정

## 배경

### Autoscript의 한계
Autoscript는 **파싱 처리가 되어 있는 것만** 자동 변환이 가능합니다.

**문제 상황 1: 복잡한 셀렉터**
```
Playwright Codegen으로 녹화 시 복잡한 CSS 셀렉터나 XPath가 생성되면
→ 파싱 실패 → 수동 변환 필요
```

**문제 상황 2: 사용자 임의 추가**
```
Google Sheets에 테스트 케이스를 직접 작성하거나
자연어로 Action Description을 추가하면
→ 파싱 실패 → 수동 수정 필요
```

### 해결 목표
**AI를 보조 수단으로 활용하여 파싱 실패 케이스를 자동으로 처리**

---

## 시도한 방법들

### ❌ 방법 1: Cursor Extension을 통한 Cursor AI 활용

**아이디어**
- Cursor IDE 내부에 Extension을 만들어서
- Node.js 스크립트가 Extension과 IPC 통신으로 연결
- Extension이 Cursor Pro의 AI를 호출

**시도한 것**
- IPC 서버 구현
- VSCode Extension API 사용
- `vscode.lm.selectChatModels()` API 호출

**실패 이유**
- Cursor Pro는 UI(Cmd+L 채팅)에서만 AI 사용 가능
- Extension에는 **AI 모델이 노출되지 않음** (models.length = 0)
- Cursor가 의도적으로 Extension에 AI API를 제공하지 않음

**결론**: Cursor Pro 구독 ≠ Extension API 접근 권한

---

### ❌ 방법 2: GitHub Copilot Free

**아이디어**
- GitHub Copilot Free 플랜 사용 (무료, 월 50회 채팅)
- Cursor에 Copilot Extension 설치
- Extension에서 Copilot API 호출

**시도한 것**
- GitHub Copilot Free 활성화
- `github.copilot.generate` 명령어 호출
- 2916개 명령어 중 383개가 AI 관련 명령어 확인

**실패 이유**
- 명령어는 존재하지만 **undefined 반환**
- Copilot도 UI 전용, Extension API는 지원 안 함
- GitHub Copilot Free도 웹/IDE UI에서만 사용 가능

**결론**: Copilot도 Extension을 통한 프로그래밍 방식 접근 불가

---

### ❌ 방법 3: MCP (Model Context Protocol)

**아이디어**
- Cursor가 지원하는 Playwright MCP 프로토콜 활용한 AI 호출

**검토 결과**
- MCP는 **Tool(도구) 제공**을 위한 프로토콜
- 예: Playwright MCP는 브라우저 제어 Tool 제공
- AI 호출용이 아님

**실패 이유**
- MCP Server도 Cursor 내부에서 실행되므로
- Extension과 동일하게 AI API 접근 불가능 예상
- Tool 제공과 AI 호출은 별개의 문제

**결론**: MCP는 AI API 접근 수단이 아님

---

### ❌ 방법 4: Anthropic API (Claude) 직접 호출

**아이디어**
- Anthropic의 Claude API 직접 사용
- Extension 없이 HTTPS로 직접 호출

**장점**
- 기술적으로 완벽하게 가능
- 최고 품질의 AI (Claude 3.5 Sonnet)
- 안정적이고 빠름

**실패 이유**
- **비용 문제**
- Claude 3.5 Sonnet: 입력 $3/1M tokens, 출력 $15/1M tokens
- 예상 비용: 월 $15~60

**결론**: 기술적으로는 완벽하지만 비용 때문에 제외

---

## ✅ 최종 선택: Groq API

### 선택 이유

**1. 완전 무료**
- 일일 14,400 requests 무료 제공
- 실제 사용량: 하루 100~300 requests 예상
- 제한의 2% 수준으로 충분함

**2. 빠른 속도**
- 평균 응답 시간: ~100ms
- Anthropic/OpenAI보다 훨씬 빠름
- "빠른 추론"을 목표로 하는 Groq의 특화 기술

**3. 충분한 품질**
- Llama 3.1 8B 모델 사용
- GPT-3.5 수준의 품질
- 간단한 변환 작업에는 충분

**4. 간단한 구현**
- Extension 불필요
- HTTPS 직접 호출
- API 키만 있으면 됨

**5. 실제 테스트 성공**
- 복잡한 셀렉터 5개 테스트
- 5/5 성공적으로 변환
- 정확하고 자연스러운 자연어 생성

### 비교표

| 항목 | Cursor AI | Copilot | Anthropic | **Groq** |
|------|-----------|---------|-----------|----------|
| 비용 | Pro 필요 | Free 제한 | $15~60/월 | **무료** ✅ |
| 접근성 | Extension 불가 | Extension 불가 | API 가능 | **API 가능** ✅ |
| 속도 | - | - | 보통 | **매우 빠름** ✅ |
| 품질 | 최상 | 우수 | 최상 | 우수 ✅ |
| 제한 | - | 50회/월 | 없음 | 14,400/일 ✅ |

---

## 핵심 인사이트

### 1. IDE AI는 UI 전용
- Cursor Pro, GitHub Copilot 모두 **Extension API를 제공하지 않음**
- UI(채팅, 코드 완성)에서만 사용 가능
- 이는 **의도적인 정책**: 비용 관리, 보안, 남용 방지

### 2. Extension의 한계
- Extension에서 AI 접근은 **구조적으로 불가능**
- API가 존재해도 권한이 없으면 소용없음
- 우회 방법 없음

### 3. 외부 API가 유일한 해답
- IDE에 의존하지 않고 **직접 AI API 호출**
- Groq: 무료 + 빠름 + 실용적
- 완전한 통제 가능

---

## 구현 결과

### 동작 방식

**1. Codegen → 시트 (복잡한 코드 변환)**
```
복잡한 Playwright 코드
→ 파싱 실패
→ Groq API 호출
→ 자연어로 변환 (예: "3번째 카드 클릭")
→ 시트에 저장
```

**2. 시트 → Playwright (사용자 입력 변환)**
```
자연어 Action Description
→ 파싱 실패
→ Groq API 호출
→ Playwright 코드 생성
→ 테스트 파일 생성
```

### 실제 사용

**자동 활성화**
- API 키만 설정하면 자동으로 작동
- 환경 변수 설정 불필요
- 파싱 실패 시 자동으로 AI 호출

**투명한 동작**
- 변환된 항목에 "🤖 AI" 표시
- 로그로 변환 과정 확인 가능
- 실패 시 수동 모드로 자동 전환

---

## 결론

### 배운 점
1. **IDE의 AI는 UI 전용** - Extension 통한 접근 불가
2. **정책적 제약은 절대적** - 기술적 우회 불가능
3. **외부 API가 답** - 직접 호출이 유일한 방법

### 최종 선택의 이유
- **무료**: Groq API 일일 14,400 requests
- **빠름**: 평균 100ms 응답
- **충분**: 실제 사용량의 2%만 사용
- **간단**: API 키만 있으면 작동

### 권장사항
- **개인/소규모**: Groq API ✅
- **상용/대규모**: Anthropic API (유료지만 최고 품질)
- **완전 무료**: Ollama (로컬, GPU 필요)

---

**작성일**: 2025-10-29  
**결과**: ✅ Groq API로 완전 자동화 달성
