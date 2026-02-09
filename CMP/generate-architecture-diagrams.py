#!/usr/bin/env python3
"""
Mermaid 다이어그램을 이미지로 변환하는 스크립트
필요한 패키지: pip install playwright mermaid
"""

import os
import re
from pathlib import Path

def extract_mermaid_from_markdown(md_file):
    """Markdown 파일에서 Mermaid 다이어그램 코드 추출"""
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Mermaid 코드 블록 찾기
    pattern = r'```mermaid\n(.*?)```'
    matches = re.findall(pattern, content, re.DOTALL)
    
    if matches:
        return matches[0].strip()
    return None

def generate_image_from_mermaid(mermaid_code, output_file):
    """Mermaid 코드를 이미지로 변환 (Playwright 사용)"""
    try:
        from playwright.sync_api import sync_playwright
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            background: white;
        }}
        .mermaid {{
            background: white;
        }}
    </style>
</head>
<body>
    <div class="mermaid">
{mermaid_code}
    </div>
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'default',
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: true
            }}
        }});
    </script>
</body>
</html>
"""
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            # HTML 파일로 저장 후 로드
            html_file = output_file.with_suffix('.html')
            html_file.write_text(html_content, encoding='utf-8')
            page.goto(f'file://{html_file.absolute()}')
            
            # SVG 요소 찾기
            page.wait_for_selector('svg', timeout=10000)
            svg_element = page.query_selector('svg')
            
            if svg_element:
                # SVG를 이미지로 변환
                svg_element.screenshot(path=str(output_file))
                print(f"✅ 이미지 생성 완료: {output_file}")
            else:
                print("❌ SVG 요소를 찾을 수 없습니다.")
            
            browser.close()
            
            # 임시 HTML 파일 삭제
            html_file.unlink()
            
    except ImportError:
        print("❌ playwright가 설치되지 않았습니다.")
        print("설치 방법: pip install playwright && playwright install chromium")
    except Exception as e:
        print(f"❌ 이미지 생성 실패: {e}")

def main():
    """메인 함수"""
    base_dir = Path(__file__).parent
    
    # Electron 구성도
    electron_md = base_dir / "architecture-electron.md"
    if electron_md.exists():
        print("📊 Electron 애플리케이션 구성도 생성 중...")
        mermaid_code = extract_mermaid_from_markdown(electron_md)
        if mermaid_code:
            output_file = base_dir / "architecture-electron.png"
            generate_image_from_mermaid(mermaid_code, output_file)
        else:
            print("❌ Mermaid 코드를 찾을 수 없습니다.")
    
    # Autoscript 구성도
    autoscript_md = base_dir / "architecture-autoscript.md"
    if autoscript_md.exists():
        print("\n📊 Autoscript 시스템 구성도 생성 중...")
        mermaid_code = extract_mermaid_from_mermaid(autoscript_md)
        if mermaid_code:
            output_file = base_dir / "architecture-autoscript.png"
            generate_image_from_mermaid(mermaid_code, output_file)
        else:
            print("❌ Mermaid 코드를 찾을 수 없습니다.")

if __name__ == "__main__":
    main()

