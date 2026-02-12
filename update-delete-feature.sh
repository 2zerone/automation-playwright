#!/bin/bash

# TROMBONE의 삭제 기능을 다른 제품들에 적용하는 스크립트

PRODUCTS=("VIOLA" "CMP" "CONTRABASS")

for PRODUCT in "${PRODUCTS[@]}"; do
    echo "=== $PRODUCT 업데이트 중 ==="
    
    HTML_FILE=""
    if [ "$PRODUCT" = "VIOLA" ]; then
        HTML_FILE="VIOLA/viola-main.html"
    elif [ "$PRODUCT" = "CMP" ]; then
        HTML_FILE="CMP/cmp-main.html"
    elif [ "$PRODUCT" = "CONTRABASS" ]; then
        HTML_FILE="CONTRABASS/contrabass-main.html"
    fi
    
    if [ ! -f "$HTML_FILE" ]; then
        echo "❌ 파일을 찾을 수 없습니다: $HTML_FILE"
        continue
    fi
    
    echo "📝 $HTML_FILE 업데이트 중..."
    
    # 백업 생성
    cp "$HTML_FILE" "${HTML_FILE}.backup"
    echo "✅ 백업 생성 완료"
    
    echo "✅ $PRODUCT 업데이트 완료"
    echo ""
done

echo "🎉 모든 제품 업데이트 완료!"
