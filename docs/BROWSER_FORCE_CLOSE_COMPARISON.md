# 브라우저 강제 종료 처리 로직 비교

## VIOLA vs CONTRABASS/CMP 차이점

### 1. results가 없는 테스트 처리

#### VIOLA (기존 동작)
```javascript
// 286-323 라인
allSpecs.forEach(spec => {
    if (spec.tests && spec.tests.length > 0) {
        spec.tests.forEach(test => {
            if (test.results && test.results.length > 0) {
                // results가 있는 경우만 처리
                const result = test.results[0];
                // ... 상태 설정 및 testResults에 추가
            }
            // ❌ else 블록 없음 - results가 없으면 무시됨
        });
    }
});
```
**특징**: results가 없는 테스트는 아예 무시하고 리포트에 포함하지 않음

#### CONTRABASS/CMP (수정된 동작)
```javascript
// 237-284 라인
allSpecs.forEach(spec => {
    if (spec.tests && spec.tests.length > 0) {
        spec.tests.forEach(test => {
            if (test.results && test.results.length > 0) {
                // results가 있는 경우 처리
                const result = test.results[0];
                // ... 상태 설정 및 testCases에 추가
            } else {
                // ✅ results가 없는 경우 명시적으로 처리
                console.log(`⚠️ 실행되지 않은 테스트: ${spec.title || test.title}`);
                testCases.push({
                    name: spec.title || test.title,
                    status: 'not-test',
                    duration: 'N/A',
                    error: '실행되지 않음',
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                });
            }
        });
    }
});
```
**특징**: results가 없는 테스트를 'not-test' 상태로 리포트에 포함

---

### 2. 브라우저 강제 종료 감지 방법

#### VIOLA
```javascript
// 336-345 라인
// execSync 오류가 발생한 경우 강제로 fail 처리
if (global.violaExecutionError) {
    console.log(`📊 VIOLA execSync 오류 감지 - 강제로 fail 상태로 변경`);
    overallStatus = 'fail';
    
    // 마지막 테스트 케이스를 실패로 표시 (실제 실패 지점 추정)
    if (testResults.length > 0) {
        const lastIndex = testResults.length - 1;
        testResults[lastIndex].status = 'fail';
        testResults[lastIndex].error = global.violaExecutionError.message || '테스트 실행 실패';
    }
}
```
**방법**: `global.violaExecutionError` 글로벌 변수 사용  
**실패 처리**: **마지막** 테스트를 실패로 표시

#### CONTRABASS/CMP
```javascript
// 300-313 라인
// testExitCode가 0이 아니면 무조건 fail (브라우저 강제 종료 등)
if (testExitCode !== 0) {
    console.log(`⚠️ testExitCode(${testExitCode})가 0이 아님, 강제로 fail 상태 설정`);
    parsedResults.status = 'fail';
    
    // 브라우저 강제 종료 시: 모든 테스트가 not-test이면 첫 번째를 fail로 변경
    const allNotTest = testCases.every(tc => tc.status === 'not-test');
    if (allNotTest && testCases.length > 0) {
        console.log(`⚠️ 모든 테스트가 미수행 상태, 첫 번째 테스트를 실패로 변경`);
        testCases[0].status = 'fail';
        testCases[0].error = '브라우저 강제 종료로 인한 테스트 중단';
        testCases[0].duration = '0초';
    }
}
```
**방법**: `testExitCode !== 0` 체크  
**실패 처리**: **첫 번째** 테스트를 실패로 표시 (모든 테스트가 not-test인 경우만)

---

### 3. 실행 방식

#### VIOLA
```javascript
// execSync 사용 (동기 실행)
execFileSync(npxPath, [
    'playwright', 'test', 
    relativeTestFile, 
    '--config=playwright.config.js',
    '--reporter=json'
], {
    cwd: violaDir,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
});
```
**특징**: 
- 동기식 실행으로 바로 결과 확인
- 오류 발생 시 try-catch로 잡아서 global 변수에 저장

#### CONTRABASS/CMP
```javascript
// exec 사용 (비동기 실행)
await new Promise((resolve, reject) => {
    exec(command, {
        cwd: __dirname,
        env: {
            ...process.env,
            PLAYWRIGHT_HEADLESS: 'false',
            NODE_ENV: 'test'
        }
    }, (error, stdout, stderr) => {
        if (error) {
            testExitCode = error.code || 1;
        }
        resolve();
    });
});
```
**특징**: 
- 비동기식 실행
- exitCode를 직접 저장해서 사용

---

## 📈 통계 표시 결과 비교

### 시나리오: 첫 번째 단계에서 브라우저 강제 종료 (총 4단계)

#### VIOLA
- 총 단계: **3** (results가 없는 테스트는 제외)
- 성공: 0
- 실패: 1 (마지막 테스트)
- 미수행: 2

#### CONTRABASS/CMP (수정 전)
- 총 단계: **4** (모든 테스트 포함)
- 성공: 0
- 실패: 0 ❌
- 미수행: 4 ❌

#### CONTRABASS/CMP (수정 후) ✅
- 총 단계: **4** (모든 테스트 포함)
- 성공: 0
- 실패: 1 (첫 번째 테스트) ✅
- 미수행: 3 ✅

---

## 🎯 권장사항

### VIOLA 방식의 장점
✅ 간단하고 직관적  
✅ results가 있는 테스트만 표시 (깔끔)  
✅ execSync로 동기 처리 (코드 단순)

### CONTRABASS/CMP 방식의 장점
✅ 모든 테스트를 리포트에 포함 (투명성)  
✅ 첫 번째 테스트 실패 = 실제 실패 지점에 더 가까움  
✅ 보수적 처리 (모든 not-test인 경우만 첫 번째를 fail로)

### 결론
두 방식 모두 **정상적으로 동작**하지만 접근 방법이 다릅니다:
- **VIOLA**: 실행된 테스트만 표시, 마지막 테스트 실패
- **CONTRABASS/CMP**: 모든 계획된 테스트 표시, 첫 번째 테스트 실패

사용자의 요구사항 "총 단계 4, 실패 1, 미수행 3"은 **CONTRABASS/CMP 방식**이 더 적합합니다.

