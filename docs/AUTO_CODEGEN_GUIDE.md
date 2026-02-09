# 자동 Codegen to Google Sheets 가이드

## 개요
Playwright codegen을 사용하여 브라우저에서 수행하는 모든 액션을 자동으로 Google Sheets에 저장하는 기능입니다.

## 사용 방법

### 1. 기본 사용법
```bash
npm run test:codegen:auto
```

### 2. 커스텀 테스트 케이스 ID와 제목 지정
```bash
node lib/utils/codegen-to-sheets.js TC001 "로그인 테스트" http://trombone.qa.okestro.cloud/
```

### 3. 매개변수 설명
- `TC001`: 테스트 케이스 ID (기본값: TC + 타임스탬프)
- `"로그인 테스트"`: 테스트 제목 (기본값: "자동 생성된 테스트")
- `http://trombone.qa.okestro.cloud/`: 대상 URL (기본값: http://trombone.qa.okestro.cloud/)

## 워크플로우

### 1단계: 자동 녹화 시작
```bash
npm run test:codegen:auto
```

### 2단계: 브라우저에서 시나리오 수행
- 브라우저가 자동으로 열림
- 수동으로 시나리오를 수행 (클릭, 입력, 네비게이션 등)
- 모든 액션이 자동으로 감지되고 콘솔에 출력됨

### 3단계: 녹화 종료 및 저장
- `Ctrl+C`를 눌러 녹화 종료
- 모든 액션이 자동으로 Google Sheets에 저장됨

## 자동 감지되는 액션

### 1. 페이지 네비게이션
- `page.goto()` → `goto` 액션
- URL 변경 감지

### 2. 클릭 액션
- 모든 클릭 이벤트 감지
- 요소 선택자 자동 생성 (ID, 클래스, 태그명)

### 3. 입력 액션
- 텍스트 입력 감지
- 입력 필드 선택자 자동 생성

### 4. 키보드 액션
- Enter, Tab 키 감지
- `press` 액션으로 변환

### 5. 기타 액션
- 호버, 대기 등 추가 액션 지원

## Google Sheets 저장 형식

| ENABLED | CASE_ID | TITLE | STEP_NO | SELECTOR | ACTION | DATA | ASSERT | TIMEOUT_MS |
|---------|---------|-------|---------|----------|--------|------|--------|------------|
| TRUE | TC001 | 로그인 테스트 | 0 | | goto | http://trombone.qa.okestro.cloud/ | url:*trombone.qa.okestro.cloud* | 5000 |
| TRUE | TC001 | 로그인 테스트 | 1 | #username | fill | testid | visible | 3000 |
| TRUE | TC001 | 로그인 테스트 | 2 | #password | fill | testpw | visible | 3000 |
| TRUE | TC001 | 로그인 테스트 | 3 | button[type=submit] | click | | visible | 3000 |

## 장점

1. **완전 자동화**: 수동으로 코드를 복사할 필요 없음
2. **실시간 감지**: 모든 액션이 즉시 감지됨
3. **자동 선택자 생성**: ID, 클래스, 태그명 기반 선택자 자동 생성
4. **Google Sheets 직접 저장**: 별도 변환 과정 불필요
5. **확장 가능**: 새로운 액션 타입 쉽게 추가 가능

## 제한사항

1. **단순한 선택자**: 복잡한 CSS 선택자는 자동 생성되지 않음
2. **이벤트 기반**: 일부 동적 액션은 감지되지 않을 수 있음
3. **브라우저 종속**: Chromium 브라우저에서만 동작

## 다음 단계

1. 녹화된 데이터를 Playwright 코드로 변환
2. 테스트 실행 및 결과 확인
3. 더 정교한 선택자 생성 로직 구현
4. 다양한 액션 타입 지원 확장
