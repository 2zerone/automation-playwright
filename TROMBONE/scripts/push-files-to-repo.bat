@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Git 저장소에 파일 푸시 배치 스크립트
REM ========================================

REM 매개변수 확인
if "%~1"=="" (
    echo ❌ 오류: 업무코드를 입력해주세요.
    echo 사용법: push-files-to-repo.bat [업무코드]
    echo 예시: push-files-to-repo.bat LYH0105
    exit /b 1
)

REM 변수 설정
set TASK_CODE=%~1
set REPO_NAME=%TASK_CODE%-REPO
set GIT_URL=http://gitlab.tst.console.trombone.okestro.cloud/%TASK_CODE%/%REPO_NAME%.git
set LOCAL_PATH=D:\auto-test\%TASK_CODE%\%REPO_NAME%
set SOURCE_PATH=D:\auto-test-file
set BRANCHES=prd stg dev

echo ========================================
echo 🚀 Git 저장소 파일 푸시 시작
echo ========================================
echo 📋 업무코드: %TASK_CODE%
echo 📋 저장소명: %REPO_NAME%
echo 📋 Git URL: %GIT_URL%
echo 📋 로컬 경로: %LOCAL_PATH%
echo 📋 소스 경로: %SOURCE_PATH%
echo ========================================

REM 1. D:\auto-test 폴더로 이동
echo 📁 D:\auto-test 폴더로 이동 중...
cd /d D:\auto-test
if errorlevel 1 (
    echo ❌ 오류: D:\auto-test 폴더에 접근할 수 없습니다.
    exit /b 1
)
echo ✅ D:\auto-test 폴더 이동 완료

REM 2. 기존 폴더가 있으면 삭제
if exist "%LOCAL_PATH%" (
    echo 🗑️ 기존 폴더 삭제 중: %LOCAL_PATH%
    rmdir /s /q "%LOCAL_PATH%"
    if errorlevel 1 (
        echo ❌ 오류: 기존 폴더 삭제 실패
        exit /b 1
    )
    echo ✅ 기존 폴더 삭제 완료
)

REM 3. Git clone 수행 (자동으로 폴더 생성됨)
echo 🔄 Git clone 수행 중...
git clone %GIT_URL%
if errorlevel 1 (
    echo ❌ 오류: Git clone 실패
    exit /b 1
)
echo ✅ Git clone 완료

REM 4. 생성된 저장소 폴더로 이동
echo 📁 저장소 폴더로 이동 중...
cd /d "%REPO_NAME%"
if errorlevel 1 (
    echo ❌ 오류: 저장소 폴더로 이동할 수 없습니다.
    exit /b 1
)
echo ✅ 저장소 폴더 이동 완료

REM 5. 소스 파일 복사
echo 📋 소스 파일 복사 중...
if not exist "%SOURCE_PATH%" (
    echo ❌ 오류: 소스 폴더가 존재하지 않습니다: %SOURCE_PATH%
    exit /b 1
)

REM 소스 폴더의 모든 파일 복사
xcopy "%SOURCE_PATH%\*" "." /E /I /Y
if errorlevel 1 (
    echo ❌ 오류: 파일 복사 실패
    exit /b 1
)
echo ✅ 소스 파일 복사 완료

REM 6. 각 브랜치에 파일 푸시
for %%b in (%BRANCHES%) do (
    echo ========================================
    echo 🌿 브랜치: %%b
    echo ========================================
    
    REM 브랜치 체크아웃
    echo 🔄 %%b 브랜치로 체크아웃 중...
    git checkout -b %%b
    if errorlevel 1 (
        echo ⚠️ %%b 브랜치가 이미 존재합니다. 기존 브랜치로 전환합니다.
        git checkout %%b
        if errorlevel 1 (
            echo ❌ 오류: %%b 브랜치 전환 실패
            continue
        )
    )
    echo ✅ %%b 브랜치 체크아웃 완료
    
    REM 파일 추가
    echo 📝 파일 추가 중...
    git add .
    if errorlevel 1 (
        echo ❌ 오류: 파일 추가 실패
        continue
    )
    echo ✅ 파일 추가 완료
    
    REM 커밋
    echo 💾 커밋 중...
    git commit -m "Auto-test: Add test files for %TASK_CODE% - %%b branch"
    if errorlevel 1 (
        echo ⚠️ 커밋할 변경사항이 없습니다.
    ) else (
        echo ✅ 커밋 완료
    )
    
    REM 푸시
    echo 🚀 푸시 중...
    git push origin %%b
    if errorlevel 1 (
        echo ❌ 오류: %%b 브랜치 푸시 실패
        continue
    )
    echo ✅ %%b 브랜치 푸시 완료
)

echo ========================================
echo 🎉 모든 작업 완료!
echo ========================================
echo 📋 처리된 업무코드: %TASK_CODE%
echo 📋 처리된 저장소: %REPO_NAME%
echo 📋 처리된 브랜치: %BRANCHES%
echo 📋 로컬 경로: %LOCAL_PATH%
echo ========================================

endlocal
