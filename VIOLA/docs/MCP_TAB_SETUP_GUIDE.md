# VIOLA Playwright MCP 탭 설정 가이드

이 가이드는 VIOLA Electron 앱에 Playwright MCP 탭을 추가하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [설치 단계](#설치-단계)
3. [IPC 핸들러 추가](#ipc-핸들러-추가)
4. [테스트](#테스트)
5. [다른 제품에 적용](#다른-제품에-적용)

## 개요

Playwright MCP 탭은 다음 기능을 제공합니다:

- ✅ 자연어로 테스트 요청 입력
- ✅ 자주 사용하는 프롬프트 저장/관리 (CRUD)
- ✅ 제품별 MD 문서 기반 컨텍스트 제공
- ✅ MCP를 활용한 자동화 테스트 실행
- ✅ 실시간 실행 로그 표시

## 설치 단계

### 1. 네비게이션 아이템 추가

`viola-main.html`에서 **코드 생성** 네비게이션 아이템 다음에 추가:

```html
<div class="nav-item" onclick="openCodegenGui(event)">
    <i>🎬</i>
    <span>코드 생성</span>
</div>
<!-- 아래 코드 추가 -->
<div class="nav-item" onclick="switchTab('playwright-mcp', event)">
    <i>🤖</i>
    <span>Playwright MCP</span>
</div>
```

**위치**: 약 3021번째 줄 (LNB 네비게이션 섹션)

### 2. CSS 스타일 추가

`mcp-tab-addon.html` 파일에서 **"MCP 탭 CSS"** 섹션 전체를 복사하여 `viola-main.html`의 `</style>` 태그 **직전**에 붙여넣습니다.

**위치**: 약 2983번째 줄 (`</style>` 태그 직전)

### 3. HTML 콘텐츠 추가

`mcp-tab-addon.html` 파일에서 **"MCP 탭 HTML 추가"** 섹션 전체를 복사하여 **이력 관리 탭** (`</div>` 닫는 태그) 다음에 붙여넣습니다.

**위치**: 약 3076번째 줄 (이력 관리 탭이 끝나는 부분)

찾는 방법:
```html
        <!-- 이력 관리 탭 -->
        <div id="history" class="tab-content">
            ...
        </div>  <!-- 여기 다음에 추가 -->
        
        <!-- Playwright MCP 탭 추가 위치 -->
```

### 4. JavaScript 함수 추가

`mcp-tab-addon.html` 파일에서 **"MCP 탭 JavaScript"** 섹션 전체를 복사하여 `</script>` 태그 **직전**에 붙여넣습니다.

**위치**: 파일 끝 부분 (약 8300번째 줄)

### 5. switchTab 함수 수정

기존 `switchTab` 함수를 찾아서 MCP 탭 초기화 코드를 추가합니다:

```javascript
function switchTab(tabName, event) {
    // 모든 탭 비활성화
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // 선택된 탭 활성화
    document.getElementById(tabName).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // 이력 관리 탭인 경우 초기화
    if (tabName === 'history') {
        console.log('이력 관리 탭으로 전환, initializeHistoryTab 호출');
        initializeHistoryTab();
    }
    
    // ✅ 아래 코드 추가
    if (tabName === 'playwright-mcp') {
        console.log('Playwright MCP 탭으로 전환');
        initializeMCPTab();
    }
}
```

## IPC 핸들러 추가

### 1. Electron Main Process 수정

`electron-scenario-runner.js` 또는 메인 Electron 파일에 IPC 핸들러를 추가합니다:

```javascript
// MCP 테스트 실행 핸들러
ipcMain.handle('execute-mcp-test', async (event, { product, prompt }) => {
    console.log(`🤖 MCP 테스트 실행 요청:`);
    console.log(`   제품: ${product}`);
    console.log(`   프롬프트: ${prompt}`);
    
    try {
        // MD 문서 읽기
        const mdPath = path.join(__dirname, 'docs', 'mcp-knowledge-base.md');
        let contextDoc = '';
        
        if (fs.existsSync(mdPath)) {
            contextDoc = fs.readFileSync(mdPath, 'utf8');
            console.log(`✅ MD 문서 로드 완료: ${mdPath}`);
        } else {
            console.warn(`⚠️ MD 문서를 찾을 수 없습니다: ${mdPath}`);
        }
        
        // TODO: MCP 서버와 통신하여 테스트 코드 생성 및 실행
        // 현재는 플레이스홀더로 성공 응답 반환
        
        const logs = [
            { type: 'info', message: '📄 컨텍스트 문서 로드 완료' },
            { type: 'info', message: `📝 프롬프트 분석: "${prompt}"` },
            { type: 'info', message: '🔍 Manager 클래스 매칭 중...' },
            { type: 'success', message: '✅ LoginManager, PodManager 선택' },
            { type: 'info', message: '🎯 테스트 코드 생성 중...' },
            { type: 'success', message: '✅ 테스트 코드 생성 완료' },
            { type: 'info', message: '🚀 Playwright 테스트 실행 중...' },
        ];
        
        return {
            success: true,
            message: 'MCP 테스트가 성공적으로 실행되었습니다.',
            logs: logs
        };
        
    } catch (error) {
        console.error('❌ MCP 테스트 실행 오류:', error);
        return {
            success: false,
            error: error.message,
            logs: [
                { type: 'error', message: `❌ 오류 발생: ${error.message}` }
            ]
        };
    }
});
```

### 2. Preload Script 확인

`preload.js`에 `execute-mcp-test` IPC 채널이 노출되어 있는지 확인합니다:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    invoke: (channel, data) => {
        const validChannels = [
            'run-scenario',
            'stop-scenario',
            'get-scenario-log',
            'execute-mcp-test',  // ✅ 추가
            // ... 기타 채널들
        ];
        
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    },
    // ... 기타 메서드들
});
```

## 테스트

### 1. Electron 앱 재시작

```bash
cd VIOLA
# Electron 앱 재시작
```

### 2. MCP 탭 접근

1. VIOLA 앱을 엽니다
2. 좌측 네비게이션에서 **"Playwright MCP"** 탭을 클릭합니다
3. 탭이 정상적으로 표시되는지 확인합니다

### 3. 프롬프트 저장 테스트

1. **"새 프롬프트 추가"** 버튼을 클릭합니다
2. 제목과 내용을 입력합니다
3. 저장된 프롬프트가 카드로 표시되는지 확인합니다

### 4. 프롬프트 사용 테스트

1. 저장된 프롬프트 카드에서 **"사용"** 버튼을 클릭합니다
2. 입력란에 프롬프트가 자동으로 입력되는지 확인합니다

### 5. 테스트 실행 (플레이스홀더)

1. 입력란에 "로그인해서 Pod 생성 테스트 해줘"를 입력합니다
2. **"테스트 실행"** 버튼을 클릭합니다
3. 실행 로그가 표시되는지 확인합니다

## 다른 제품에 적용

### TROMBONE, CMP, CONTRABASS

동일한 방법으로 다른 제품에도 MCP 탭을 추가할 수 있습니다:

1. 각 제품의 `*-main.html` 파일 수정
2. 각 제품의 `docs/mcp-knowledge-base.md` 작성 (제품별 Manager 및 시나리오 정보)
3. IPC 핸들러에서 제품명에 따라 올바른 MD 문서 로드

**제품별 MD 문서 예시**:
- `VIOLA/docs/mcp-knowledge-base.md`
- `TROMBONE/docs/mcp-knowledge-base.md`
- `CMP/docs/mcp-knowledge-base.md`
- `CONTRABASS/docs/mcp-knowledge-base.md`

## 파일 구조

```
VIOLA/
├── viola-main.html              # Electron 앱 메인 HTML (수정 필요)
├── electron-scenario-runner.js  # Electron 메인 프로세스 (IPC 핸들러 추가)
├── mcp-tab-addon.html          # MCP 탭 추가 코드 (참조용)
└── docs/
    ├── mcp-knowledge-base.md   # MCP Knowledge Base
    └── MCP_TAB_SETUP_GUIDE.md  # 이 가이드
```

## 문제 해결

### MCP 탭이 표시되지 않음
- CSS가 올바르게 추가되었는지 확인
- 브라우저 개발자 도구에서 CSS 오류 확인
- 탭 HTML이 올바른 위치에 추가되었는지 확인

### 프롬프트 저장이 안 됨
- LocalStorage가 활성화되어 있는지 확인
- 브라우저 콘솔에서 JavaScript 오류 확인

### 테스트 실행 버튼이 작동하지 않음
- IPC 핸들러가 추가되었는지 확인
- Preload script에 채널이 노출되었는지 확인
- Electron 앱을 재시작했는지 확인

## 다음 단계

1. ✅ MCP 서버와의 실제 통신 구현
2. ✅ 테스트 코드 자동 생성 기능 추가
3. ✅ 생성된 테스트의 자동 실행 및 결과 표시
4. ✅ 다른 제품(TROMBONE, CMP, CONTRABASS)에 적용

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)
- [Electron IPC 통신](https://www.electronjs.org/docs/latest/api/ipc-main)

## 버전 정보

- **가이드 버전**: 1.0
- **마지막 업데이트**: 2025-11-07
- **작성자**: AI Assistant

