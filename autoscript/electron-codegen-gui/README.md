# Codegen Autoscript GUI

Playwright Codegen과 Google Sheets를 연동한 GUI 데스크톱 애플리케이션

## 🚀 실행 방법

### 1. 의존성 설치
```bash
cd autoscript/electron-codegen-gui
npm install
```

### 2. 애플리케이션 실행
```bash
npm start
```

### 3. 개발 모드 (DevTools 포함)
```bash
npm run dev
```

## 📋 주요 기능

### 1. Codegen 녹화
- URL, 케이스 ID, 제목 입력
- Playwright Codegen 자동 실행
- Google Sheets에 자동 저장

### 2. 코드 생성
- Google Sheets 데이터 → Playwright 테스트 코드 자동 생성
- 생성된 파일 위치 표시
- 파일 탐색기에서 바로 열기

### 3. 케이스 관리
- Google Sheets의 케이스 목록 조회
- 케이스 선택하여 바로 사용

### 4. 설정
- Google Sheets ID 변경
- 인증 파일 경로 변경
- 제품별 선택 (TROMBONE, VIOLA, CMP, CONTRABASS)

### 5. 기타
- Sheet를 브라우저에서 열기
- 최근 사용한 케이스 히스토리
- 실시간 로그 출력

## 🎯 사용 시나리오

### 새 테스트 케이스 작성
1. 제품 선택 (사이드바)
2. "Codegen 녹화" 탭 선택
3. URL, 케이스 ID, 제목 입력
4. "Codegen 녹화 시작" 클릭
5. 브라우저에서 테스트 시나리오 수행
6. 자동으로 Google Sheets에 저장됨

### 테스트 코드 생성
1. "코드 생성" 탭 선택
2. 케이스 ID 입력
3. "테스트 코드 생성" 클릭
4. "생성된 파일 열기"로 결과 확인

### 케이스 목록 보기
1. "케이스 목록" 탭 선택
2. "목록 새로고침" 클릭
3. 원하는 케이스의 "사용" 버튼 클릭

## ⚙️ 설정

우측 상단의 ⚙️ 버튼을 클릭하여:
- Google Sheets ID 변경
- Service Account JSON 파일 경로 변경

설정은 `config.json` 파일에 자동 저장됩니다.

## 📁 파일 구조

```
electron-codegen-gui/
├── main.js              # Electron 메인 프로세스
├── preload.js           # 보안 브릿지
├── package.json         # 패키지 설정
├── config.json          # 사용자 설정 (자동 생성)
└── renderer/            # UI
    ├── index.html       # HTML
    ├── styles.css       # 스타일
    └── app.js           # UI 로직
```

## 🔧 확장성

### 새로운 기능 추가
1. `main.js`: IPC 핸들러 추가
2. `preload.js`: API 노출
3. `app.js`: UI 로직 구현
4. `index.html`: UI 컴포넌트 추가

### 새로운 제품 추가
`config.json`의 `products` 배열에 제품명 추가

## 🐛 문제 해결

### Electron이 실행되지 않을 때
```bash
npm install --save-dev electron
```

### Google Sheets 연동 오류
1. 설정에서 Sheets ID 확인
2. 인증 파일 경로 확인
3. Service Account 권한 확인

## 📝 라이선스

ISC

