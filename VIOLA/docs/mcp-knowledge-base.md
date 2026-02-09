# VIOLA Playwright MCP Knowledge Base

이 문서는 Playwright MCP가 VIOLA 테스트를 자동으로 생성하고 실행하기 위한 지식 베이스입니다.

## 제품 개요

**제품명**: VIOLA  
**목적**: Kubernetes 관리 및 모니터링  
**주요 기능**:
- 클러스터 관리
- Pod/컨테이너 관리
- 백업 및 복원
- 모니터링 및 알림
- 파이프라인 관리

## 프로젝트 구조

```
VIOLA/
├── lib/
│   ├── classes/              # Manager 클래스들
│   │   ├── LoginManager.js   # 로그인 관리
│   │   ├── PodManager.js     # Pod 생성/관리
│   │   ├── BackupManager.js  # 백업 생성/관리
│   │   ├── PodRecoveryManager.js  # Pod 복원
│   │   └── BaseManager.js    # 공통 기능
│   └── report-generator.js   # 커스텀 리포트 생성
├── tests/
│   └── scenario/             # 시나리오 테스트
│       ├── scenario-1.spec.js  # Pod 생성 및 백업
│       └── scenario-2.spec.js  # Pod 삭제 및 복원
├── config/
│   ├── test-settings.json    # 테스트 설정
│   ├── latest-pod.json       # 최근 생성 Pod 정보
│   └── pod-counter.json      # Pod 카운터
└── custom-reports/           # 커스텀 리포트 저장소
    └── global-test-results.json

```

## Manager 패턴

VIOLA는 Manager 패턴을 사용하여 각 기능을 모듈화합니다:

### LoginManager
- **파일**: `lib/classes/LoginManager.js`
- **역할**: 로그인 처리
- **주요 메서드**:
  - `navigateToLoginPage()`: 로그인 페이지 접근
  - `fillLoginCredentials(config)`: 로그인 정보 입력
  - `submitLoginAndVerify()`: 로그인 실행 및 확인

### PodManager
- **파일**: `lib/classes/PodManager.js`
- **역할**: Pod 생성 및 관리
- **주요 메서드**:
  - `navigateToApps()`: Apps 메뉴 접근
  - `selectKubernetesEngine()`: Kubernetes Engine 선택
  - `selectCluster()`: 클러스터 선택
  - `navigateToContainerManagement()`: 컨테이너 관리 접근
  - `startPodCreation()`: Pod 생성 시작
  - `fillYamlContent()`: YAML 내용 입력 (동적 Pod 이름 생성)
  - `createPod()`: Pod 생성 실행
  - `confirmCreation()`: 생성 확인
  - `verifyPodRunning()`: Pod 실행 상태 확인

**Pod 이름 형식**: `yh-pod-{카운터}` (예: `yh-pod-64`)

### BackupManager
- **파일**: `lib/classes/BackupManager.js`
- **역할**: 백업 생성 및 관리
- **주요 메서드**:
  - `navigateToBackup()`: 백업 메뉴 접근
  - `clickCreate()`: 생성 버튼 클릭
  - `selectNamespaceBackup()`: 네임스페이스 백업 선택
  - `selectNamespace()`: 네임스페이스 선택 (yh-ns)
  - `createBackup()`: 백업 생성 실행
  - `verifyBackupCreation()`: 백업 생성 확인 및 이름 추출

**백업 이름 형식**: `yh-ns-{YYMMDD}-{임의값}` (예: `yh-ns-251107-abc123`)

### PodRecoveryManager
- **파일**: `lib/classes/PodRecoveryManager.js`
- **역할**: Pod 삭제 및 백업 복원
- **주요 메서드**:
  - `getLatestPodInfo()`: 최근 생성된 Pod 정보 로드
  - `navigateToKubernetes()`: Kubernetes Engine 접근
  - `selectCluster()`: 클러스터 선택
  - `navigateToContainerManagement()`: 컨테이너 관리 이동
  - `selectPod()`: Pod 선택
  - `deletePod()`: Pod 삭제
  - `navigateToBackup()`: 백업 메뉴 이동
  - `restoreBackup()`: 백업 복원
  - `verifyRestoration()`: 복원 확인

## 시나리오 구조

### Scenario 1: Pod 생성 및 백업
**파일**: `tests/scenario/scenario-1.spec.js`
**단계**:
1. 로그인 페이지 접근
2. 로그인 정보 입력
3. 로그인 실행 및 성공 확인
4. Apps 메뉴 접근
5. Kubernetes Engine 선택
6. 클러스터 선택
7. 워크로드 메뉴 접근
8. 컨테이너 관리 접근
9. Pod 생성 시작
10. 고급 모드 전환
11. YAML 내용 입력
12. YAML 유효성 검사
13. Pod 생성 실행
14. Pod 생성 확인
15. Pod 실행 상태 확인
16. 백업 메뉴 접근
17. 생성 버튼 클릭
18. 네임스페이스 백업 선택
19. 체크박스 영역으로 스크롤
20. 네임스페이스 선택
21. 다음 버튼 클릭
22. Backup 생성 실행
23. Backup 생성 확인

### Scenario 2: Pod 삭제 및 백업 복원
**파일**: `tests/scenario/scenario-2.spec.js`
**단계**:
1. 로그인 페이지 접근
2. 로그인 정보 입력
3. 로그인 실행 및 성공 확인
4. Kubernetes Engine 접근
5. 클러스터 선택
6. 컨테이너 관리 이동
7. Pod 선택
8. Pod 삭제
9. 백업 메뉴 이동
10. 백업 복원
11. 복원 확인

## 데이터 공유 메커니즘

### latest-pod.json
Scenario 1에서 생성한 Pod와 Backup 정보를 Scenario 2가 사용할 수 있도록 저장합니다.

**구조**:
```json
{
  "podName": "yh-pod-64",
  "backupName": "yh-ns-251107-abc123",
  "createdAt": "2025-11-07T12:34:56.789Z",
  "backupCreatedAt": "2025-11-07T12:35:30.123Z",
  "counter": 64
}
```

**생성 시점**:
- Pod 이름: `PodManager.fillYamlContent()`에서 생성
- Backup 이름: `BackupManager.verifyBackupCreation()`에서 추출 및 업데이트

**사용 시점**:
- `PodRecoveryManager.getLatestPodInfo()`에서 읽기

## 설정 파일

### test-settings.json
**위치**: `config/test-settings.json`

**구조**:
```json
{
  "url": "https://305tst.console.bf.okestro.cloud/",
  "credentials": {
    "username": "admin",
    "password": "Oktacloud@"
  },
  "otp": {
    "enabled": false,
    "mode": "disabled",
    "secret": ""
  }
}
```

## 리포트 시스템

### global-test-results.json
**위치**: `custom-reports/global-test-results.json`

각 시나리오의 실행 결과를 저장합니다.

**키 형식**:
- Scenario 1: `"1"` 또는 `"scenario-1"`
- Scenario 2: `"2"` 또는 `"scenario-2"`

**데이터 구조**:
```json
{
  "2": {
    "status": "pass",
    "error": null,
    "testCases": [
      {
        "name": "로그인 페이지 접근",
        "status": "pass",
        "duration": 2.5,
        "startTime": "2025-11-07T12:34:56.789Z",
        "endTime": "2025-11-07T12:34:59.289Z",
        "logs": [],
        "screenshots": ["screenshot_path.png"]
      }
    ],
    "scenarioId": "2",
    "scenarioName": "VIOLA 시나리오 2: Pod 삭제 및 백업 복원 테스트",
    "timestamp": "2025-11-07T12:34:56.789Z"
  }
}
```

### ReportGenerator
**파일**: `lib/report-generator.js`

`global-test-results.json`을 읽어 커스텀 HTML 리포트를 생성합니다.

## UI 선택자 패턴

### 공통 패턴
- 버튼: `getByRole('button', { name: '버튼명' })`
- 링크: `getByRole('link', { name: '링크명' })`
- Row: `getByRole('row').filter({ hasText: '텍스트' })`
- 체크박스: `row.locator('input[type="checkbox"]')`

### 주의사항
1. **Row 선택 시**: `filter({ hasText: name })`를 먼저 사용하여 특정 row를 찾은 후, 그 안의 체크박스를 선택해야 합니다.
2. **전체 선택 방지**: `first()`를 `getByLabel()` 앞에 사용하면 "전체 선택" 체크박스를 선택할 수 있으므로 주의합니다.

## 자연어 프롬프트 예시

### 로그인 및 Pod 생성
**프롬프트**: "로그인해서 Pod 생성 테스트 해줘"

**생성될 코드 예시**:
```javascript
import LoginManager from './lib/classes/LoginManager.js';
import PodManager from './lib/classes/PodManager.js';

test('로그인 및 Pod 생성', async ({ page }) => {
  const config = JSON.parse(fs.readFileSync('config/test-settings.json', 'utf8'));
  
  const loginManager = new LoginManager(page);
  await loginManager.navigateToLoginPage();
  await loginManager.fillLoginCredentials(config);
  await loginManager.submitLoginAndVerify();
  
  const podManager = new PodManager(page);
  await podManager.processPodCreate(config);
});
```

### Pod 삭제 및 복원
**프롬프트**: "Pod 삭제하고 백업으로 복원해줘"

**생성될 코드 예시**:
```javascript
import LoginManager from './lib/classes/LoginManager.js';
import PodRecoveryManager from './lib/classes/PodRecoveryManager.js';

test('Pod 삭제 및 복원', async ({ page }) => {
  const config = JSON.parse(fs.readFileSync('config/test-settings.json', 'utf8'));
  
  const loginManager = new LoginManager(page);
  await loginManager.navigateToLoginPage();
  await loginManager.fillLoginCredentials(config);
  await loginManager.submitLoginAndVerify();
  
  const podRecoveryManager = new PodRecoveryManager(page);
  await podRecoveryManager.processPodRecovery(config);
});
```

## 실행 환경

- **Playwright 버전**: 최신
- **브라우저**: Chromium (headless mode 지원)
- **Node.js**: v16 이상
- **실행 방식**: Electron 앱을 통한 GUI 실행

## Electron IPC 통신

VIOLA는 Electron 앱으로 실행되며, 다음 IPC 채널을 사용합니다:

- `run-scenario`: 시나리오 실행
- `stop-scenario`: 시나리오 중단
- `get-scenario-log`: 시나리오 로그 조회
- `execute-mcp-test`: MCP 테스트 실행 (신규)

## 메모리 정보

- 사용자는 Pod 이름과 Backup 이름을 `test-settings.json`에서 동적으로 관리하기를 선호합니다.
- 모든 시나리오 데이터는 localStorage가 아닌 `test-settings.json`과 `latest-pod.json`에서 관리됩니다.
- 사용자는 로그와 리포트에서 PASS/FAIL 상태를 명확히 구분하기를 선호합니다.
- Electron을 통한 실행 환경에서 상세한 QA 관점의 리포트를 선호합니다.

## 코드 생성 가이드라인

1. **Manager 클래스 사용**: 직접 Playwright 코드를 작성하지 말고 기존 Manager 클래스를 활용합니다.
2. **설정 파일 로드**: `test-settings.json`에서 설정을 읽어옵니다.
3. **에러 처리**: try-catch로 예외를 처리하고 명확한 로그를 출력합니다.
4. **타임아웃**: 적절한 `waitForTimeout()`을 사용하여 UI 안정화를 보장합니다.
5. **스크린샷**: 각 단계마다 `captureScreenshot()`을 호출합니다.
6. **재시도 로직**: `BaseManager.executeWithRetry()`를 활용합니다.
7. **로그 출력**: console.log를 통해 진행 상황을 명확히 출력합니다.

## 문제 해결

### Pod 이름을 찾을 수 없는 경우
- `latest-pod.json`이 존재하는지 확인
- Scenario 1이 정상적으로 완료되었는지 확인
- `PodManager.saveLatestPodInfo()`가 호출되었는지 확인

### 백업 이름 불일치
- `BackupManager.verifyBackupCreation()`에서 실제 백업 이름을 추출하는지 확인
- 정규식 `/yh-ns-\d{6}-[a-z0-9]+/i`가 올바르게 작동하는지 확인

### 체크박스 선택 실패
- Row를 먼저 `filter({ hasText })`로 찾은 후 그 안의 체크박스를 선택
- `first()`를 조기에 사용하지 않도록 주의

## 버전 정보

- **문서 버전**: 1.0
- **마지막 업데이트**: 2025-11-07
- **작성자**: AI Assistant

