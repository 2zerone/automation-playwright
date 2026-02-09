import { codegenToSheets } from './codegen-to-sheets.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 기본 설정 - 각 플랫폼별 URL (필요시 변경 가능)
const TROMBONE_URL = 'http://tst.console.trombone.okestro.cloud/login';
const VIOLA_URL = 'https://305tst.console.bf.okestro.cloud/';
const CONTRABASS_URL = 'https://305tst.console.bf.okestro.cloud/'; // 필요시 CONTRABASS 전용 URL로 변경
const CMP_URL = 'https://305tst.console.bf.okestro.cloud/'; // 필요시 CMP 전용 URL로 변경
const DEFAULT_CASE_ID = `TC${String(Date.now()).slice(-6)}`;
const DEFAULT_TITLE = '자동 생성된 테스트';

// 명령행 인수 파싱
const args = process.argv.slice(2);
const platform = args[0]; // 'trombone', 'viola', 'contrabass', 'cmp'

// 플랫폼에 따른 기본 URL 설정
let DEFAULT_URL = TROMBONE_URL;
let ignoreHttpsErrors = false;

if (platform === 'viola') {
  DEFAULT_URL = VIOLA_URL;
  ignoreHttpsErrors = true;
  console.log('🎻 VIOLA 모드로 실행합니다.');
  console.log('🔒 --ignore-https-errors 옵션이 활성화됩니다.');
} else if (platform === 'contrabass') {
  DEFAULT_URL = CONTRABASS_URL;
  ignoreHttpsErrors = true;
  console.log('🎼 CONTRABASS 모드로 실행합니다.');
  console.log('🔒 --ignore-https-errors 옵션이 활성화됩니다.');
} else if (platform === 'cmp') {
  DEFAULT_URL = CMP_URL;
  ignoreHttpsErrors = true;
  console.log('🖥️ CMP 모드로 실행합니다.');
  console.log('🔒 --ignore-https-errors 옵션이 활성화됩니다.');
} else if (platform === 'trombone') {
  DEFAULT_URL = TROMBONE_URL;
  console.log('🎺 TROMBONE 모드로 실행합니다.');
} else if (platform && !['trombone', 'viola', 'contrabass', 'cmp'].includes(platform)) {
  console.log('❌ 잘못된 플랫폼입니다. trombone, viola, contrabass, cmp 중 하나를 사용하세요.');
  console.log('사용법: node codegen-auto-sheets.js [trombone|viola|contrabass|cmp]');
  process.exit(1);
}

// 사용자 입력을 받는 함수
function getUserInput(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${question}${defaultValue ? ` (기본값: ${defaultValue})` : ''}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Playwright codegen을 대화형으로 실행하는 함수
async function runInteractiveCodegen(url, testCaseId, testTitle) {
  return new Promise((resolve, reject) => {
    console.log('\n🎭 Playwright Codegen을 시작합니다...');
    console.log('📋 사용법:');
    console.log('  1. 브라우저에서 테스트하고 싶은 동작을 수행하세요');
    console.log('  2. 완료되면 브라우저를 닫으세요');
    console.log('  3. 자동으로 Google Sheets에 추가됩니다');
    console.log('');
    console.log(`🌐 URL: ${url}`);
    console.log(`📋 케이스 ID: ${testCaseId}`);
    console.log(`📋 테스트 제목: ${testTitle}`);
    console.log('');
    console.log('⏳ 브라우저를 여는 중...');
    
    // 임시 파일 경로 생성
    const tempFile = join(__dirname, `temp-codegen-${Date.now()}.js`);
    
    // Playwright codegen 명령어 구성
    const codegenArgs = [
      'playwright', 'codegen',
      url,
      '--output', tempFile,
      '--viewport-size=1920,1080'
    ];
    
    // VIOLA 모드인 경우 --ignore-https-errors 옵션 추가
    if (ignoreHttpsErrors) {
      codegenArgs.push('--ignore-https-errors');
    }
    
    const codegen = spawn('npx', codegenArgs, {
      stdio: 'inherit',
      shell: true
    });

    codegen.on('close', async (code) => {
      if (code === 0) {
        console.log('✅ Playwright codegen 완료');
        
        try {
          // 생성된 파일에서 코드 읽기
          if (fs.existsSync(tempFile)) {
            const code = fs.readFileSync(tempFile, 'utf8');
            console.log('📄 생성된 코드를 읽었습니다.');
            
            // 코드를 스프레드시트 형식으로 파싱하고 추가 (플랫폼 정보 전달)
            const result = await codegenToSheets(url, testCaseId, testTitle, code, platform);
            
            console.log('\n🎉 성공!');
            console.log(`📋 케이스 ID: ${result.testCaseId}`);
            console.log(`📋 제목: ${result.testTitle}`);
            console.log(`📋 액션 수: ${result.actionCount}개`);
            console.log('\n📊 Google Sheets에서 확인하세요!');
            
            // 임시 파일 정리
            fs.unlinkSync(tempFile);
            console.log('🧹 임시 파일 정리 완료');
            
            resolve(result);
          } else {
            reject(new Error('생성된 코드 파일을 찾을 수 없습니다.'));
          }
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Playwright codegen 실패 (종료 코드: ${code})`));
      }
    });

    codegen.on('error', (error) => {
      reject(new Error(`Playwright codegen 실행 오류: ${error.message}`));
    });
  });
}

// 메인 함수
async function main() {
  try {
    console.log('🚀 Playwright Codegen to Google Sheets 자동화');
    console.log('==============================================');
    
    if (platform) {
      console.log(`🎯 플랫폼: ${platform.toUpperCase()}`);
      console.log(`🌐 기본 URL: ${DEFAULT_URL}`);
      if (ignoreHttpsErrors) {
        console.log('🔒 HTTPS 오류 무시: 활성화');
      }
      console.log('==============================================');
    }
    
    // 환경 변수로 값이 전달된 경우 (GUI에서 실행)
    const envUrl = process.env.CODEGEN_URL;
    const envCaseId = process.env.CODEGEN_CASE_ID;
    const envTitle = process.env.CODEGEN_TITLE;
    const envProduct = process.env.CODEGEN_PRODUCT;
    
    let url, testCaseId, testTitle;
    
    if (envUrl && envCaseId && envTitle) {
      // GUI에서 실행: 환경 변수 사용
      url = envUrl;
      testCaseId = envCaseId;
      testTitle = envTitle;
      
      console.log('\n📋 GUI에서 전달된 설정:');
      console.log(`  URL: ${url}`);
      console.log(`  케이스 ID: ${testCaseId}`);
      console.log(`  테스트 제목: ${testTitle}`);
      console.log(`  제품: ${envProduct || platform || 'N/A'}`);
      console.log('\n⏳ Codegen 녹화를 시작합니다...\n');
    } else {
      // CLI에서 실행: 사용자 입력 받기
      url = await getUserInput('테스트할 URL을 입력하세요', DEFAULT_URL);
      testCaseId = await getUserInput('테스트 케이스 ID를 입력하세요', DEFAULT_CASE_ID);
      testTitle = await getUserInput('테스트 제목을 입력하세요', DEFAULT_TITLE);
      
      console.log('\n📋 설정 확인:');
      console.log(`  URL: ${url}`);
      console.log(`  케이스 ID: ${testCaseId}`);
      console.log(`  테스트 제목: ${testTitle}`);
      
      // 사용자 확인
      const confirm = await getUserInput('\n계속하시겠습니까? (y/N)', 'y');
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log('❌ 취소되었습니다.');
        process.exit(0);
      }
    }
    
    // Playwright codegen 실행 (완전 자동화)
    await runInteractiveCodegen(url, testCaseId, testTitle);
    
    console.log('\n🎉 모든 작업이 완료되었습니다!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].includes('codegen-auto-sheets.js')) {
  main();
}
