#!/bin/bash
# scripts/migrate-trombone.sh
# 목적: 루트의 TROMBONE 파일을 TROMBONE 폴더로 안전하게 이동
# 원칙: 기존 동작 100% 보존, 파일 위치만 변경

set -e  # 에러 발생 시 즉시 중단

echo "🎺 TROMBONE 폴더 마이그레이션 시작..."
echo "================================================"
echo ""

# 1. TROMBONE 폴더 생성
echo "📁 1단계: TROMBONE 폴더 생성..."
mkdir -p TROMBONE
echo "✅ TROMBONE 폴더 생성 완료"
echo ""

# 2. 백업 생성 (안전장치)
echo "💾 2단계: 백업 생성..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "✅ 백업 디렉토리 생성: $BACKUP_DIR"
echo ""

# 3. 파일/폴더 이동 (하나씩 검증)
echo "📦 3단계: 파일/폴더 이동..."

# 3-1. src/electron-scenario-runner.js 이동
if [ -f "src/electron-scenario-runner.js" ]; then
    cp -r src "$BACKUP_DIR/"
    mv src/electron-scenario-runner.js TROMBONE/electron-scenario-runner.js
    echo "✅ src/electron-scenario-runner.js → TROMBONE/electron-scenario-runner.js"
fi

# 3-2. src/main.js는 별도 처리
if [ -f "src/main.js" ]; then
    mv src/main.js TROMBONE/main.js
    echo "✅ src/main.js → TROMBONE/main.js"
fi

# src 폴더가 비었으면 제거
if [ -d "src" ] && [ -z "$(ls -A src)" ]; then
    rmdir src
    echo "✅ 빈 src 폴더 제거"
fi

# 3-3. lib 폴더 이동
if [ -d "lib" ]; then
    cp -r lib "$BACKUP_DIR/"
    mv lib TROMBONE/
    echo "✅ lib/ → TROMBONE/lib/"
fi

# 3-4. tests 폴더 이동
if [ -d "tests" ]; then
    cp -r tests "$BACKUP_DIR/"
    mv tests TROMBONE/
    echo "✅ tests/ → TROMBONE/tests/"
fi

# 3-5. config 폴더 이동
if [ -d "config" ]; then
    cp -r config "$BACKUP_DIR/"
    mv config TROMBONE/
    echo "✅ config/ → TROMBONE/config/"
fi

# 3-6. scripts 폴더 이동 (자기 자신 제외)
if [ -d "scripts" ]; then
    cp -r scripts "$BACKUP_DIR/"
    mv scripts TROMBONE/
    echo "✅ scripts/ → TROMBONE/scripts/"
fi

# 3-7. reports 폴더 이동
if [ -d "reports" ]; then
    cp -r reports "$BACKUP_DIR/"
    mv reports TROMBONE/
    echo "✅ reports/ → TROMBONE/reports/"
fi

# 3-8. templates 폴더 이동
if [ -d "templates" ]; then
    cp -r templates "$BACKUP_DIR/"
    mv templates TROMBONE/
    echo "✅ templates/ → TROMBONE/templates/"
fi

# 3-9. test-files 폴더 이동
if [ -d "test-files" ]; then
    cp -r test-files "$BACKUP_DIR/"
    mv test-files TROMBONE/
    echo "✅ test-files/ → TROMBONE/test-files/"
fi

# 3-10. playwright.config.js 이동
if [ -f "playwright.config.js" ]; then
    cp playwright.config.js "$BACKUP_DIR/"
    mv playwright.config.js TROMBONE/
    echo "✅ playwright.config.js → TROMBONE/playwright.config.js"
fi

# 3-11. playwright-steps.config.js 이동
if [ -f "playwright-steps.config.js" ]; then
    cp playwright-steps.config.js "$BACKUP_DIR/"
    mv playwright-steps.config.js TROMBONE/
    echo "✅ playwright-steps.config.js → TROMBONE/playwright-steps.config.js"
fi

# 3-12. package.json 복사 (루트는 monorepo용 유지)
if [ -f "package.json" ]; then
    cp package.json "$BACKUP_DIR/"
    cp package.json TROMBONE/
    echo "✅ package.json 복사 → TROMBONE/package.json"
    echo "⚠️ 루트 package.json은 monorepo용으로 유지됨"
fi

echo ""
echo "================================================"
echo "✅ TROMBONE 폴더 마이그레이션 완료!"
echo ""
echo "📊 마이그레이션 결과:"
echo "  - TROMBONE 폴더 생성: $(ls -l TROMBONE 2>/dev/null | wc -l)개 항목"
echo "  - 백업 위치: $BACKUP_DIR"
echo ""
echo "🔍 다음 단계:"
echo "  1. TROMBONE 폴더 구조 확인: ls -la TROMBONE/"
echo "  2. 테스트 실행 확인: cd TROMBONE && node electron-scenario-runner.js run 1"
echo "  3. 문제 없으면 백업 삭제: rm -rf $BACKUP_DIR"
echo ""

