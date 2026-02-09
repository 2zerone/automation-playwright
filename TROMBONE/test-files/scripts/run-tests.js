#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎺 TROMBONE 테스트 실행기 시작\n');



// 테스트 실행 옵션
const testOptions = {
    // 전체 테스트 실행
    full: () => {
        console.log('🚀 전체 테스트 실행을 시작합니다...\n');
        execSync('npx playwright test tests/trombone-main.spec.js', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..', '..') 
        });
    },
    
    // 특정 대메뉴만 실행
    menu: (menuNumber) => {
        console.log(`🚀 ${menuNumber}번 대메뉴 테스트만 실행합니다...\n`);
        
        // 대메뉴 번호에 따른 검색 패턴 매핑
        const menuPatterns = {
            '1': '업무코드 등록',
            '2': '툴체인 관리',
            '3': '저장소 관리',
            '4': '사용자 관리',
            '5': '사용자 업무코드 관리',
            '6': 'SonarQube 관리',
            '7': 'JUnit 관리',
            '8': '파이프라인 관리',
            '9': '워크플로우 컴포넌트 관리'
        };
        
        const pattern = menuPatterns[menuNumber];
        if (!pattern) {
            console.error(`❌ 알 수 없는 대메뉴 번호입니다: ${menuNumber}`);
            process.exit(1);
        }
        
        execSync(`npx playwright test tests/steps/*.spec.js --grep "${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..', '..') 
        });
    },
    
    // 특정 테스트 파일만 실행
    file: (fileName) => {
        console.log(`🚀 ${fileName} 테스트 파일을 실행합니다...\n`);
        execSync(`npx playwright test tests/steps/${fileName}.spec.js`, { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..', '..') 
        });
    },
    
    // Playwright 리포트 열기
    report: () => {
        const reportPath = path.join(__dirname, '../../playwright-report/index.html');
        console.log(`📊 Playwright 리포트를 엽니다: ${reportPath}`);
        
        // 운영체제별 브라우저 열기
        const platform = process.platform;
        let command;
        
        if (platform === 'win32') {
            command = `start "" "${reportPath}"`;
        } else if (platform === 'darwin') {
            command = `open "${reportPath}"`;
        } else {
            command = `xdg-open "${reportPath}"`;
        }
        
        try {
            execSync(command, { stdio: 'inherit' });
        } catch (error) {
            console.log('브라우저를 자동으로 열 수 없습니다. 수동으로 파일을 열어주세요.');
        }
    },
    
    // 테스트 결과 정리
    clean: () => {
        console.log('🧹 테스트 결과를 정리합니다...');
        
        const dirsToClean = ['playwright-report'];
        dirsToClean.forEach(dir => {
            const dirPath = path.join(__dirname, '..', dir);
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(`✅ ${dir} 디렉토리 삭제됨`);
            }
        });
        
        console.log('✅ 정리 완료');
    },
    
    // 도움말
    help: () => {
        console.log(`
🎺 TROMBONE 테스트 실행기 사용법

사용법: node run-tests.js [옵션]

옵션:
  full                    전체 테스트 실행
  menu <번호>            특정 대메뉴만 실행 (예: menu 1)
  file <파일명>          특정 테스트 파일만 실행 (예: file taskcode)
  report                  Playwright 리포트 열기
  clean                  테스트 결과 정리
  help                   이 도움말 표시

예시:
  node run-tests.js full              # 전체 테스트 실행
  node run-tests.js menu 1            # 1번 대메뉴만 실행
  node run-tests.js file taskcode     # 업무코드 테스트만 실행
  node run-tests.js report            # Playwright 리포트 열기
  node run-tests.js clean             # 결과 정리

테스트 대메뉴:
  1번: 업무코드 등록
  2번: 툴체인 관리
  3번: 저장소 관리
  4번: 사용자 관리
  5번: 사용자 업무코드 관리
  6번: SonarQube 관리
  7번: JUnit 관리
  8번: 파이프라인 관리
  9번: 워크플로우 컴포넌트 관리
        `);
    }
};

// 명령행 인수 처리
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help') {
    testOptions.help();
} else if (testOptions[command]) {
    if (command === 'menu' || command === 'file') {
        const param = args[1];
        if (!param) {
            console.error('❌ 매개변수가 필요합니다.');
            testOptions.help();
            process.exit(1);
        }
        testOptions[command](param);
    } else {
        testOptions[command]();
    }
} else {
    console.error('❌ 알 수 없는 명령입니다:', command);
    testOptions.help();
    process.exit(1);
}

console.log('\n🏁 테스트 실행기 종료'); 