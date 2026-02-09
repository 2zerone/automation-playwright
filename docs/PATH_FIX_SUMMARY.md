# 🔧 경로 수정 요약 (보수적 리팩터링)

## 📋 문제 상황

### 1️⃣ TROMBONE 문제
- **증상**: Electron에서 시나리오 실행 시 실제로 실행되지 않고 "모두 성공" 잘못된 리포트 생성
- **원인**: TROMBONE 폴더 이동 후 경로 업데이트 누락

### 2️⃣ VIOLA 문제
- **증상**: 시나리오는 실행되지만 커스텀 리포트에 "4단계"만 표시되고 정확한 결과 표출 안됨
- **원인**: 데이터 로드 로직 문제 (분석 중)

---

## ✅ 수정 완료 사항 (TROMBONE)

### 📁 수정된 파일 (3개)

#### 1. `TROMBONE/main.js` (2개 경로)

**변경 전:**
```javascript
const scenarioPath = path.join(__dirname, '..', 'tests', 'scenario', ...);
const configPath = path.join(__dirname, '..', 'config', 'scenario', ...);
const defaultConfigPath = path.join(__dirname, '..', 'config', 'test-settings.json');
```

**변경 후:**
```javascript
const scenarioPath = path.join(__dirname, 'tests', 'scenario', ...);
const configPath = path.join(__dirname, 'config', 'scenario', ...);
const defaultConfigPath = path.join(__dirname, 'config', 'test-settings.json');
```

**이유:**
- `__dirname` = `TROMBONE/` (이동 후)
- `..` 제거 (한 단계 위로 가면 root가 되므로 잘못됨)

---

#### 2. `TROMBONE/electron-scenario-runner.js` (6개 경로)

**변경 전:**
```javascript
// 라인 122, 438
path.join(__dirname, '../config/scenario/...')

// 라인 129, 130, 419
path.join(__dirname, '..', 'tests', 'scenario', ...)
path.join(__dirname, '..', 'tests', 'test-interrupt.spec.js')

// 라인 390
path.join(__dirname, '../config/scenario')
```

**변경 후:**
```javascript
// 모두 `..` → `.`으로 변경
path.join(__dirname, 'config/scenario/...')
path.join(__dirname, 'tests', 'scenario', ...)
path.join(__dirname, 'tests', 'test-interrupt.spec.js')
path.join(__dirname, 'config/scenario')
```

---

#### 3. `TROMBONE/lib/report-generator.js` (다른 제품 참조 경로)

**변경 전:**
```javascript
// 라인 191-198: 다른 제품 참조
if (this.currentProduct === 'viola') {
    scenarioFilePath = path.join(__dirname, '..', 'VIOLA', 'tests', ...);
    //                                        ↑ TROMBONE/VIOLA/ ❌
}
```

**변경 후:**
```javascript
if (this.currentProduct === 'viola') {
    scenarioFilePath = path.join(__dirname, '../..', 'VIOLA', 'tests', ...);
    //                                        ↑ root/VIOLA/ ✅
}
```

**경로 설명:**
```
TROMBONE/lib/report-generator.js 기준:
- __dirname = TROMBONE/lib/
- .. = TROMBONE/ (자기 제품)
- ../.. = root/ (다른 제품 접근)

따라서:
- TROMBONE 자신: path.join(__dirname, '..', 'tests', ...)  ✅
- 다른 제품: path.join(__dirname, '../..', 'VIOLA', ...)  ✅
```

---

## 🔍 수정 원칙 (보수적 리팩터링)

### ✅ 지켜진 원칙

1. **동작 100% 보존**
   - 로직 변경 없음 (경로만 수정)
   - 퍼블릭 API 동일 유지
   - 출력/로그 메시지 동일

2. **최소 변경**
   - `..` → `.` (상대 경로만 조정)
   - 함수/변수명 변경 없음
   - 제어 흐름 변경 없음

3. **확장성 고려**
   - 제품별 폴더 구조 명확화
   - COMMON 폴더 분리 준비
   - 다른 제품 참조 경로 표준화

---

## 📊 변경 영향 범위

### 직접 영향
- ✅ TROMBONE 시나리오 실행 경로 수정
- ✅ TROMBONE 설정 파일 로드 경로 수정
- ✅ 다른 제품(VIOLA/CMP/CONTRABASS) 참조 경로 수정

### 간접 영향
- 🔄 Electron 앱에서 TROMBONE 시나리오 실행 가능
- 🔄 report-generator.js에서 제품 간 데이터 참조 가능

---

## 🚀 다음 단계: VIOLA 문제 해결

### VIOLA 문제 분석 필요

**증상:**
- 시나리오 실행: ✅ 정상
- 커스텀 리포트: ❌ 4단계만 표시

**가능한 원인:**
1. `global.testResults` Map 데이터 수집 실패
2. `generateTestDataFromResults()` 로직 오류
3. `testCases` 배열 잘못된 필터링
4. 시나리오 파일 파싱 실패

**확인 필요:**
- VIOLA/lib/report-generator.js의 데이터 로드 우선순위
- global.testResults Map 저장 로직
- testCases 생성 및 필터링 로직

---

## 📝 체크리스트

### TROMBONE 수정 ✅
- [x] main.js 경로 수정 (2곳)
- [x] electron-scenario-runner.js 경로 수정 (6곳)
- [x] report-generator.js 다른 제품 참조 경로 수정 (2곳)
- [x] 경로 수정 문서화

### VIOLA 수정 🔄
- [ ] 데이터 로드 로직 분석
- [ ] testCases 생성 로직 확인
- [ ] global.testResults 저장 로직 확인
- [ ] 리포트 생성 테스트

---

## 🎯 검증 방법

### TROMBONE 검증
```bash
# 1. Electron 실행
npm start

# 2. TROMBONE 선택 → 시나리오 1 실행
# 3. 결과 확인:
#    - 시나리오가 실제로 실행되는지
#    - 커스텀 리포트에 정확한 단계 수 표시되는지
#    - 각 단계의 상태(성공/실패)가 정확한지
```

### VIOLA 검증
```bash
# 1. Electron 실행
npm start

# 2. VIOLA 선택 → 시나리오 1 실행
# 3. 결과 확인:
#    - 커스텀 리포트에 정확한 단계 수 표시되는지
#    - 각 단계의 이름/상태가 정확한지
```

---

## 🔧 롤백 방법 (필요 시)

```bash
# 백업 파일 복원
cp TROMBONE/lib/report-generator.old.js TROMBONE/lib/report-generator.js

# 또는 Git으로 되돌리기
git checkout HEAD -- TROMBONE/main.js
git checkout HEAD -- TROMBONE/electron-scenario-runner.js
git checkout HEAD -- TROMBONE/lib/report-generator.js
```

