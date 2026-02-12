const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

let mainWindow;
const isDev = process.argv.includes('--dev');

// 설정 파일 경로
const CONFIG_PATH = path.join(__dirname, 'config.json');

// 기본 설정
const DEFAULT_CONFIG = {
  products: ['TROMBONE', 'VIOLA', 'CMP', 'CONTRABASS'],
  currentProduct: 'TROMBONE',
  googleSheets: {
    spreadsheetId: '1UhI2li9ep1l77_9njpqVBY-g8bDDbyX5E7VmZ7Yc3AA',
    credentialsPath: path.join(__dirname, '..', 'balmy-state-471105-h5-c819a6c1e5f3.json'),
    sheetNames: {
      TROMBONE: 'TROMBONE',
      VIOLA: 'VIOLA',
      CMP: 'CMP',
      CONTRABASS: 'CONTRABASS'
    }
  },
  productUrls: {
    TROMBONE: 'http://tst.console.trombone.okestro.cloud/login',
    VIOLA: 'https://305tst.console.bf.okestro.cloud/',
    CMP: 'https://305tst.console.bf.okestro.cloud/',
    CONTRABASS: 'https://305tst.console.bf.okestro.cloud/'
  },
  lastUrl: 'http://tst.console.trombone.okestro.cloud/login',
  recentCases: []
};

// 설정 로드
function loadConfig() {
  let config = DEFAULT_CONFIG;
  
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('설정 로드 실패:', error);
  }
  
  // 환경 변수에서 제품 정보 확인 (각 제품에서 실행 시 전달됨)
  const envProduct = process.env.CODEGEN_GUI_PRODUCT;
  if (envProduct && ['TROMBONE', 'VIOLA', 'CMP', 'CONTRABASS'].includes(envProduct)) {
    config.currentProduct = envProduct;
    console.log(`📦 환경 변수에서 제품 정보 확인: ${envProduct}`);
    // 설정 파일에도 저장
    saveConfig(config);
  }
  
  return config;
}

// 설정 저장
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('설정 저장 실패:', error);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Codegen Autoscript GUI',
    backgroundColor: '#1e1e1e'
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============================================================================
// IPC 핸들러
// ============================================================================

// 설정 관련
ipcMain.handle('load-config', async () => {
  return loadConfig();
});

ipcMain.handle('save-config', async (event, config) => {
  return saveConfig(config);
});

ipcMain.handle('update-config', async (event, updates) => {
  const config = loadConfig();
  const newConfig = { ...config, ...updates };
  return saveConfig(newConfig);
});

// Google Sheets 브라우저로 열기 (현재 선택된 제품의 시트 탭으로 이동)
ipcMain.handle('open-sheet-in-browser', async (event, spreadsheetId, currentProduct) => {
  try {
    // Google Sheets API를 사용하여 시트 탭의 gid 조회
    const config = loadConfig();
    const sheetName = config.googleSheets?.sheetNames?.[currentProduct] || currentProduct;
    
    console.log(`📊 Google Sheets 열기: ${currentProduct} 시트 탭`);
    
    // 시트 이름으로 필터링된 URL 생성 (gid 대신 range 사용)
    // Google Sheets는 시트 이름을 URL fragment로 지원
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0&range=${encodeURIComponent(sheetName)}!A1`;
    
    await shell.openExternal(url);
    console.log(`✅ 브라우저에서 ${currentProduct} 시트 열기 완료`);
    
    return { success: true, product: currentProduct };
  } catch (error) {
    console.error('❌ Google Sheets 열기 실패:', error);
    // 실패 시 기본 URL로 폴백
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    await shell.openExternal(url);
    return { success: true, fallback: true };
  }
});

// Codegen 실행
ipcMain.handle('run-codegen', async (event, { url, caseId, title, product }) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'codegen-auto-sheets.js');
    
    // Node.js 프로세스 실행 (플랫폼 인수도 전달)
    const productLower = product ? product.toLowerCase() : 'trombone';
    const child = spawn('node', [scriptPath, productLower], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        CODEGEN_URL: url,
        CODEGEN_CASE_ID: caseId,
        CODEGEN_TITLE: title,
        CODEGEN_PRODUCT: product
      }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      // 실시간 로그 전송
      try {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('codegen-log', {
            type: 'info',
            message: message.trim()
          });
        }
      } catch (error) {
        // EPIPE 오류는 무시
        if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
          safeConsoleError('codegen-log 전송 오류:', error.message);
        }
      }
    });

    child.stderr.on('data', (data) => {
      const message = data.toString();
      errorOutput += message;
      try {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('codegen-log', {
            type: 'error',
            message: message.trim()
          });
        }
      } catch (error) {
        // EPIPE 오류는 무시
        if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
          safeConsoleError('codegen-log 전송 오류:', error.message);
        }
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          output,
          message: 'Codegen 실행 및 Google Sheets 저장 완료'
        });
      } else {
        reject({
          success: false,
          error: errorOutput || 'Codegen 실행 실패',
          code
        });
      }
    });

    child.on('error', (error) => {
      reject({
        success: false,
        error: error.message
      });
    });
  });
});

// Sheets → Playwright 코드 생성
ipcMain.handle('generate-playwright-code', async (event, { caseId, product, useManager = false }) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'sheets-to-playwright-direct.js');
    const productLower = product ? product.toLowerCase() : 'trombone';
    
    // 명령어 구성: node sheets-to-playwright-direct.js generate [platform] [caseId] [--manager]
    let command = `node "${scriptPath}" generate ${productLower} "${caseId}"`;
    if (useManager) {
      command += ' --manager';
    }
    
    exec(command, {
      cwd: path.join(__dirname, '..')
    }, (error, stdout, stderr) => {
      if (error) {
        reject({
          success: false,
          error: stderr || error.message
        });
        return;
      }

      // 생성된 파일 경로 찾기 (stdout에서 파싱)
      // Manager 형식과 일반 형식 모두 stdout에서 파일 경로 파싱
      let outputPath;
      const filePathMatch = stdout.match(/📁 저장 위치: (.+)/);
      if (filePathMatch && filePathMatch[1]) {
        outputPath = filePathMatch[1].trim();
      } else {
        // 파싱 실패 시 기본 경로 사용 (각 제품의 lib/classes)
        const fileName = useManager ? '' : `${caseId}.spec.js`;
        outputPath = path.join(__dirname, '..', product.toUpperCase(), 'lib', 'classes', fileName);
      }
      
      resolve({
        success: true,
        output: stdout,
        filePath: outputPath,
        message: `코드 변환 완료: ${useManager ? 'Manager 클래스' : '테스트 파일'}`
      });
    });
  });
});

// Google Sheets 케이스 목록 조회 (현재 선택된 제품의 시트에서)
ipcMain.handle('fetch-sheet-cases', async (event) => {
  return new Promise((resolve, reject) => {
    const config = loadConfig();
    const currentProduct = config.currentProduct || 'TROMBONE';
    const sheetName = config.googleSheets?.sheetNames?.[currentProduct] || currentProduct;
    
    console.log(`📋 케이스 목록 조회 중... (${currentProduct} 시트)`);
    
    // sheets-api-server.js를 임시로 실행해서 데이터 가져오기
    exec(`node -e "
      const { google } = require('googleapis');
      const fs = require('fs');
      const path = require('path');
      
      async function getCases() {
        try {
          const config = JSON.parse(fs.readFileSync('${CONFIG_PATH.replace(/\\/g, '\\\\')}', 'utf8'));
          const credentials = JSON.parse(fs.readFileSync(config.googleSheets.credentialsPath, 'utf8'));
          
          const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
          });
          
          const sheets = google.sheets({ version: 'v4', auth });
          const sheetRange = '${sheetName}!A2:I9999';
          
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.googleSheets.spreadsheetId,
            range: sheetRange
          });
          
          const rows = response.data.values || [];
          // CASE_ID 컬럼(B열, 인덱스 1)에서 중복 제거
          const cases = [...new Set(rows.map(row => row[1]).filter(Boolean))];
          console.log(JSON.stringify({ success: true, cases, sheetName: '${sheetName}' }));
        } catch (error) {
          console.log(JSON.stringify({ success: false, error: error.message, stack: error.stack }));
        }
      }
      
      getCases();
    "`, {
      cwd: path.join(__dirname, '..'),
      timeout: 10000 // 10초 타임아웃
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 케이스 목록 조회 실패:', error);
        console.error('stderr:', stderr);
        reject({
          success: false,
          error: stderr || error.message
        });
        return;
      }

      try {
        // 마지막 JSON 라인만 파싱
        const lines = stdout.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);
        
        if (result.success) {
          console.log(`✅ ${result.cases.length}개 케이스 조회 완료 (${result.sheetName})`);
        } else {
          console.error('❌ 케이스 조회 실패:', result.error);
        }
        
        resolve(result);
      } catch (e) {
        console.error('❌ 케이스 목록 파싱 실패:', e);
        console.error('stdout:', stdout);
        reject({
          success: false,
          error: `케이스 목록 파싱 실패: ${e.message}`
        });
      }
    });
  });
});

// 파일 탐색기에서 열기
ipcMain.handle('open-in-explorer', async (event, filePath) => {
  if (fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
    return { success: true };
  } else {
    return { success: false, error: '파일이 존재하지 않습니다.' };
  }
});

// 파일 선택 다이얼로그
ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options?.filters || [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  
  return { success: false };
});

// 시나리오 빌더: Manager 목록 읽기 (lib/classes 폴더의 모든 파일)
ipcMain.handle('get-manager-list', async (event, product) => {
  try {
    const productPath = path.join(__dirname, '..', '..', product, 'lib', 'classes');
    
    if (!fs.existsSync(productPath)) {
      return { success: false, error: `제품 경로를 찾을 수 없습니다: ${productPath}` };
    }
    
    const files = fs.readdirSync(productPath)
      .filter(file => {
        // .js 파일만 필터링
        if (!file.endsWith('.js')) return false;
        // BaseManager.js는 제외
        if (file === 'BaseManager.js') return false;
        // 디렉토리는 제외
        const filePath = path.join(productPath, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => ({
        fileName: file,
        managerName: file.replace('.js', ''),
        filePath: path.join(productPath, file)
      }))
      .sort((a, b) => {
        // Manager 파일을 먼저, 그 다음 알파벳 순서
        const aIsManager = a.fileName.endsWith('Manager.js');
        const bIsManager = b.fileName.endsWith('Manager.js');
        if (aIsManager && !bIsManager) return -1;
        if (!aIsManager && bIsManager) return 1;
        return a.fileName.localeCompare(b.fileName);
      });
    
    return { success: true, managers: files };
  } catch (error) {
    console.error('파일 목록 읽기 실패:', error);
    return { success: false, error: error.message };
  }
});

// 시나리오 빌더: Manager 파일 파싱하여 메서드 추출
ipcMain.handle('parse-manager-methods', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: '파일이 존재하지 않습니다.' };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const methods = [];
    
    // 클래스 설명 파싱 (파일의 첫 번째 줄)
    let classDescription = '';
    const lines = content.split('\n');
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // 첫 번째 줄이 주석인 경우 주석 내용만 추출
      if (firstLine.startsWith('//')) {
        classDescription = firstLine.replace(/^\/\/\s*/, '').trim();
      } else if (firstLine.startsWith('/*')) {
        // 블록 주석 시작인 경우
        classDescription = firstLine.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '').trim();
      } else {
        // 주석이 아닌 경우 첫 번째 줄 그대로 사용
        classDescription = firstLine;
      }
    }
    
    // async 메서드 추출 (정규식)
    const methodRegex = /async\s+(\w+)\s*\([^)]*\)\s*{/g;
    let match;
    const processedMethods = new Set();
    
    while ((match = methodRegex.exec(content)) !== null) {
      const methodName = match[1];
      
      // process로 시작하는 메서드와 constructor는 제외
      if (!methodName.startsWith('process') && methodName !== 'constructor' && !processedMethods.has(methodName)) {
        processedMethods.add(methodName);
        
        // JSDoc 주석에서 설명 추출 시도
        let description = '';
        const methodIndex = content.indexOf(`async ${methodName}`);
        if (methodIndex > 0) {
          const beforeMethod = content.substring(Math.max(0, methodIndex - 200), methodIndex);
          const jsdocMatch = beforeMethod.match(/\/\*\*[\s\S]*?\*\//);
          if (jsdocMatch) {
            const jsdoc = jsdocMatch[0];
            const descMatch = jsdoc.match(/\*\s+(.+)/);
            if (descMatch) {
              description = descMatch[1].trim();
            }
          }
        }
        
        // executeWithRetry에서 사용된 한글 이름 추출 시도
        // 예: await this.executeWithRetry(() => this.instanceCreateConfirm(config), '인스턴스 생성 확인', 3);
        const executeWithRetryRegex = new RegExp(`executeWithRetry\\([^)]*=>\\s*this\\.${methodName}\\([^)]*\\)[^,]*,\\s*['"]([^'"]+)['"]`, 'g');
        const executeMatch = executeWithRetryRegex.exec(content);
        if (executeMatch && executeMatch[1]) {
          // executeWithRetry에서 사용된 한글 이름이 있으면 우선 사용
          description = executeMatch[1].trim();
        }
        
        methods.push({
          name: methodName,
          displayName: methodName.replace(/([A-Z])/g, ' $1').trim(),
          description: description || `${methodName} 메서드`
        });
      }
    }
    
    return { success: true, methods, description: classDescription };
  } catch (error) {
    console.error('Manager 파싱 실패:', error);
    return { success: false, error: error.message };
  }
});

// 시나리오 빌더: 시나리오 파일 존재 여부 확인
ipcMain.handle('check-scenario-exists', async (event, { product, scenarioNumber }) => {
  try {
    // scenarioNumber를 정수로 변환
    const numericScenarioNumber = parseInt(scenarioNumber);
    console.log(`🔍 시나리오 ${numericScenarioNumber} 존재 여부 확인 중... (제품: ${product})`);
    
    // 제품명을 대문자로 변환 (폴더명은 대문자)
    const productUpper = product ? product.toUpperCase() : 'TROMBONE';
    const productPath = path.join(__dirname, '..', '..', productUpper);
    console.log(`📁 최종 제품 경로: ${productPath}`);
    
    // 1. spec 파일 존재 여부 확인
    const scenarioPath = path.join(productPath, 'tests', 'scenario', `scenario-${numericScenarioNumber}.spec.js`);
    const specExists = fs.existsSync(scenarioPath);
    console.log(`📁 spec 파일 존재: ${specExists}`);
    
    // 2. scenario-list.json에서 ID 확인
    let listExists = false;
    const scenarioListPath = path.join(productPath, 'custom-reports', 'scenario-list.json');
    if (fs.existsSync(scenarioListPath)) {
      try {
        const data = fs.readFileSync(scenarioListPath, 'utf8');
        const scenarioList = JSON.parse(data);
        console.log(`📋 scenario-list.json ID 목록: [${scenarioList.scenarios?.map(s => s.id).join(', ')}]`);
        
        // 숫자로 비교 (타입 불일치 방지)
        listExists = scenarioList.scenarios.some(s => parseInt(s.id) === numericScenarioNumber);
        console.log(`📋 시나리오 ${numericScenarioNumber} 목록 존재 여부: ${listExists}`);
      } catch (jsonError) {
        console.warn('scenario-list.json 파싱 오류:', jsonError.message);
      }
    }
    
    const exists = specExists || listExists;
    
    console.log(`${exists ? '❌' : '✅'} 시나리오 ${numericScenarioNumber}: ${exists ? '이미 존재' : '사용 가능'} (spec: ${specExists}, list: ${listExists})`);
    
    return { success: true, exists };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 다음 사용 가능한 시나리오 번호 가져오기
ipcMain.handle('get-next-available-scenario-number', async (event, product) => {
  try {
    console.log(`🔍 ${product} 제품의 다음 사용 가능한 시나리오 번호 검색 중...`);
    
    // 제품명을 대문자로 변환 (폴더명은 대문자)
    const productUpper = product ? product.toUpperCase() : 'TROMBONE';
    const productPath = path.join(__dirname, '..', '..', productUpper);
    console.log(`📁 최종 제품 경로: ${productPath}`);
    
    // scenario-list.json에서 사용 중인 ID 확인
    const scenarioListPath = path.join(productPath, 'custom-reports', 'scenario-list.json');
    let usedIds = [];
    
    console.log(`📁 scenario-list.json 경로: ${scenarioListPath}`);
    console.log(`📁 존재 여부: ${fs.existsSync(scenarioListPath)}`);
    
    if (fs.existsSync(scenarioListPath)) {
      try {
        const data = fs.readFileSync(scenarioListPath, 'utf8');
        console.log(`📄 scenario-list.json 내용 길이: ${data.length} bytes`);
        
        const scenarioList = JSON.parse(data);
        console.log(`📋 scenario-list.json에서 읽은 시나리오 수: ${scenarioList.scenarios?.length || 0}개`);
        
        if (scenarioList.scenarios && Array.isArray(scenarioList.scenarios)) {
          usedIds = scenarioList.scenarios.map(s => s.id);
          console.log(`📋 scenario-list.json의 ID들: [${usedIds.join(', ')}]`);
        }
      } catch (jsonError) {
        console.error(`❌ scenario-list.json 파싱 오류:`, jsonError);
      }
    } else {
      console.log(`⚠️ scenario-list.json 파일이 존재하지 않습니다`);
    }
    
    // tests/scenario 폴더에서 실제 spec 파일 확인
    const scenarioDir = path.join(productPath, 'tests', 'scenario');
    console.log(`📁 spec 파일 경로: ${scenarioDir}`);
    
    if (fs.existsSync(scenarioDir)) {
      const files = fs.readdirSync(scenarioDir);
      console.log(`📁 spec 파일 개수: ${files.filter(f => f.endsWith('.spec.js')).length}개`);
      
      files.forEach(file => {
        const match = file.match(/^scenario-(\d+)\.spec\.js$/);
        if (match) {
          const id = parseInt(match[1]);
          if (!usedIds.includes(id)) {
            usedIds.push(id);
          }
        }
      });
    }
    
    // 가장 작은 빈 번호 찾기
    let nextNumber = 1;
    while (usedIds.includes(nextNumber)) {
      nextNumber++;
    }
    
    console.log(`✅ ${product} 제품의 다음 사용 가능한 시나리오 번호: ${nextNumber}`);
    console.log(`📋 최종 사용 중인 ID: [${usedIds.sort((a, b) => a - b).join(', ')}]`);
    
    return { success: true, nextNumber };
  } catch (error) {
    console.error('다음 시나리오 번호 검색 중 오류:', error);
    return { success: false, error: error.message, nextNumber: 1 };
  }
});

// 시나리오 빌더: 시나리오 spec 파일 생성
ipcMain.handle('generate-scenario-spec', async (event, { product, scenarioNumber, scenarioTitle, scenarioDescription, managers, templateScenario }) => {
  try {
    // 제품명을 대문자로 변환 (폴더명은 대문자)
    const productUpper = product ? product.toUpperCase() : 'TROMBONE';
    console.log(`📁 시나리오 생성 제품: ${product} → ${productUpper}`);
    
    // 템플릿 파일 경로 (항상 scenario-1.spec.js 참조)
    const templatePath = path.join(__dirname, '..', '..', productUpper, 'tests', 'scenario', 'scenario-1.spec.js');
    
    if (!fs.existsSync(templatePath)) {
      return { success: false, error: `템플릿 파일을 찾을 수 없습니다: ${templatePath}` };
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // 공통 파일 import 추가
    const commonImport = `import { testResults, initializeTestResults, runTestStep, loadTestSettings } from './scenario-common.js';`;
    
    // Manager import 문 생성
    const managerImports = managers.map(m => 
      `import ${m.managerName} from '../../lib/classes/${m.managerName}.js';`
    ).join('\n');
    
    // 기존 import 문 찾기 및 교체
    const importSection = templateContent.match(/import.*?from.*?;/gs);
    const lastImportIndex = templateContent.lastIndexOf('import');
    const lastImportEnd = templateContent.indexOf('\n', lastImportIndex) + 1;
    
    // utils import 찾기
    const utilsImportMatch = templateContent.match(/import\s+utils\s+from.*?;/);
    const utilsImport = utilsImportMatch ? utilsImportMatch[0] : '';
    
    // 새로운 import 섹션 생성 (공통 파일 + Manager + utils)
    const newImports = commonImport + '\n' + managerImports + (utilsImport ? '\n' + utilsImport : '');
    
    // initializeManagers 함수 수정
    // Manager 이름을 camelCase로 변환 (Manager 접미사 제거)
    const managerInstances = managers.map(m => {
      let varName = m.managerName.charAt(0).toLowerCase() + m.managerName.slice(1);
      // Manager 접미사 제거
      if (varName.endsWith('Manager')) {
        varName = varName.slice(0, -7);
      }
      
      // LoginManager는 page를 받음, 나머지는 utils를 받음
      // 실제로는 Manager 파일을 확인해야 하지만, 간단하게 LoginManager만 예외 처리
      const usePage = m.managerName === 'LoginManager' || m.managerName === 'GitLabManager';
      const param = usePage ? 'page' : 'tromboneUtils';
      
      return `    ${varName}: new ${m.managerName}(${param}),`;
    }).join('\n');
    
    // initializeManagers 함수 찾기 및 교체
    const initManagerRegex = /function\s+initializeManagers\([^)]*\)\s*{[\s\S]*?return\s*{[\s\S]*?};[\s\S]*?}/;
    const initManagerMatch = templateContent.match(initManagerRegex);
    
    let newInitManager = '';
    if (initManagerMatch) {
      // 기존 함수 구조 유지하면서 Manager 인스턴스만 교체
      // 함수 시작부터 return { 까지
      const functionStartMatch = initManagerMatch[0].match(/function\s+initializeManagers\([^)]*\)\s*{[\s\S]*?return\s*{/);
      if (functionStartMatch) {
        const beforeReturn = functionStartMatch[0];
        // 함수 끝 부분 찾기 - return { 이후의 }; 와 함수 닫는 } 찾기
        const afterReturnPart = initManagerMatch[0].substring(functionStartMatch[0].length);
        // }; 와 } 사이의 내용 제거하고 깔끔하게 만들기
        newInitManager = beforeReturn + '\n' + managerInstances + '\n  };\n}';
      } else {
        // 매칭 실패 시 새로 생성
        newInitManager = `function initializeManagers(page) {
  const tromboneUtils = new utils(page);
  
  return {
${managerInstances}
  };
}`;
      }
    } else {
      // 함수가 없으면 새로 생성
      newInitManager = `function initializeManagers(page) {
  const tromboneUtils = new utils(page);
  
  return {
${managerInstances}
  };
}`;
    }
    
    // test 케이스 생성 (scenario-1.spec.js 형식 유지)
    const testCases = [];
    managers.forEach((manager, managerIndex) => {
      if (!manager.selectedMethods || manager.selectedMethods.length === 0) {
        safeConsoleError(`⚠️ ${manager.managerName}에 선택된 메서드가 없습니다.`);
        return;
      }
      
      manager.selectedMethods.forEach((method, methodIndex) => {
        // 한글 이름 사용: description이 있으면 사용, 없으면 displayName 사용
        const testName = method.description && method.description.trim() ? method.description.trim() : (method.displayName || method.name);
        
        // Manager 이름을 camelCase로 변환 (Manager 접미사 제거)
        let varName = manager.managerName.charAt(0).toLowerCase() + manager.managerName.slice(1);
        if (varName.endsWith('Manager')) {
          varName = varName.slice(0, -7);
        }
        
        // scenario-1.spec.js와 동일한 형식으로 생성 (scenarioNumber 전달)
        testCases.push({
          name: testName,
          code: `  test('${testName}', async () => {
    await test.step('${testName}', async () => {
      await runTestStep('${testName}', async () => {
        console.log('🔄 ${testName} 중...');
        await managers.${varName}.${method.name}(config);
        console.log('✅ ${testName} 완료');
      }, page, ${scenarioNumber});
    });
  });`
        });
      });
    });
    
    // 디버깅: 생성된 test 케이스 확인
    safeConsoleError(`📝 생성할 test 케이스 개수: ${testCases.length}`);
    testCases.forEach((tc, idx) => {
      safeConsoleError(`  ${idx + 1}. ${tc.name}`);
    });
    
    // allPlannedTestCases 배열 생성 (한글 이름 사용)
    // method.description이 있으면 한글 설명 사용, 없으면 displayName 사용
    const allPlannedTestCasesCode = `const allPlannedTestCases = [\n${testCases.map(tc => `  { name: '${tc.name}', status: 'pending' }`).join(',\n')}\n];\n\n// 테스트 결과 초기화\ninitializeTestResults(allPlannedTestCases);`;
    
    // 템플릿에서 기존 test 케이스 찾기 및 교체
    // scenario-1.spec.js의 구조를 유지하면서 test 케이스만 교체
    const testRegex = /test\.describe\.serial\([^)]*\)\s*{[\s\S]*?let\s+page;[\s\S]*?let\s+managers;[\s\S]*?test\.beforeAll\([^)]*\)\s*{[\s\S]*?}\);[\s\S]*?test\.afterAll\([^)]*\)\s*{[\s\S]*?}\);[\s\S]*?(test\([^)]*\)\s*{[\s\S]*?}\);[\s\S]*?)*}/;
    
    // 간단하게: import 문 교체, initializeManagers 교체, test 케이스 추가
    let newContent = templateContent;
    
    // import 문 교체
    if (importSection) {
      const firstImport = importSection[0];
      const firstImportIndex = templateContent.indexOf(firstImport);
      const lastImportEndIndex = templateContent.lastIndexOf(importSection[importSection.length - 1]) + importSection[importSection.length - 1].length;
      newContent = newContent.substring(0, firstImportIndex) + newImports + '\n\n' + newContent.substring(lastImportEndIndex);
    }
    
    // initializeManagers 교체
    if (initManagerMatch) {
      newContent = newContent.replace(initManagerRegex, newInitManager);
    }
    
    // allPlannedTestCases 배열 및 testResults 교체
    // allPlannedTestCases와 testResults를 함께 찾아서 교체
    const allPlannedTestCasesRegex = /const\s+allPlannedTestCases\s*=\s*\[[\s\S]*?\];[\s\S]*?\/\/\s*테스트 결과를 저장할 객체[\s\S]*?const\s+testResults\s*=\s*{[\s\S]*?testCases:\s*allPlannedTestCases\.map[\s\S]*?};/;
    const allPlannedTestCasesMatch = newContent.match(allPlannedTestCasesRegex);
    if (allPlannedTestCasesMatch) {
      newContent = newContent.replace(allPlannedTestCasesRegex, allPlannedTestCasesCode);
    } else {
      // 매칭 실패 시 allPlannedTestCases만 교체 시도
      const simpleAllPlannedRegex = /const\s+allPlannedTestCases\s*=\s*\[[\s\S]*?\];/;
      const simpleMatch = newContent.match(simpleAllPlannedRegex);
      if (simpleMatch) {
        // testResults도 찾아서 제거
        const testResultsRegex = /\/\/\s*테스트 결과를 저장할 객체[\s\S]*?const\s+testResults\s*=\s*{[\s\S]*?};/;
        newContent = newContent.replace(simpleAllPlannedRegex, allPlannedTestCasesCode);
        newContent = newContent.replace(testResultsRegex, '');
      }
    }
    
    // 공통 함수들 제거 (runTestStep, loadTestSettings 등)
    // runTestStep 함수 제거
    const runTestStepRegex = /\/\/\s*테스트 스텝 실행 및 결과 기록 함수[\s\S]*?async\s+function\s+runTestStep\([^)]*\)\s*{[\s\S]*?^}/m;
    newContent = newContent.replace(runTestStepRegex, '');
    
    // loadTestSettings 함수 제거
    const loadTestSettingsRegex = /\/\/\s*설정 파일에서 데이터를 읽어오는 함수[\s\S]*?function\s+loadTestSettings\([^)]*\)\s*{[\s\S]*?^}/m;
    newContent = newContent.replace(loadTestSettingsRegex, '');
    
    // loadTestSettings 호출 수정 (scenarioNumber 전달)
    newContent = newContent.replace(/config\s*=\s*loadTestSettings\(\)/g, `config = loadTestSettings(${scenarioNumber})`);
    
    // test 케이스 교체: test.afterAll 이후부터 describe.serial의 닫는 괄호 전까지의 모든 test 케이스 제거
    // test.afterAll의 끝을 정확히 찾기 위해 중첩된 블록을 고려한 파싱 사용
    const afterAllStartRegex = /test\.afterAll\([^)]*\)\s*{/;
    const afterAllStartMatch = newContent.match(afterAllStartRegex);
    
    if (afterAllStartMatch) {
      const afterAllStartIndex = newContent.indexOf(afterAllStartMatch[0]);
      let braceCount = 1; // 시작 중괄호 포함
      let afterAllEndIndex = -1;
      
      // 중첩된 블록을 고려하여 test.afterAll의 끝 찾기
      for (let i = afterAllStartIndex + afterAllStartMatch[0].length; i < newContent.length; i++) {
        if (newContent[i] === '{') {
          braceCount++;
        } else if (newContent[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            // 닫는 괄호와 세미콜론 찾기
            if (i + 1 < newContent.length && newContent[i + 1] === ';') {
              afterAllEndIndex = i + 2;
              break;
            }
          }
        }
      }
      
      if (afterAllEndIndex > 0) {
        const beforeTests = newContent.substring(0, afterAllEndIndex);
        const remainingContent = newContent.substring(afterAllEndIndex);
        
        // describe.serial의 닫는 괄호 }); 찾기
        // test.describe.serial 블록의 닫는 괄호를 찾기 위해 중괄호 카운트 사용
        // remainingContent에서 마지막 줄에 있는 });를 찾음
        const lines = remainingContent.split('\n');
        let lastCloseLineIndex = -1;
        
        // 뒤에서부터 찾아서 마지막 });가 있는 줄 찾기
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim() === '});') {
            lastCloseLineIndex = i;
            break;
          }
        }
        
        if (lastCloseLineIndex >= 0) {
          // 마지막 }); 이후의 내용만 가져옴
          const afterClose = '\n' + lines.slice(lastCloseLineIndex).join('\n');
          
          // 디버깅: 제거될 내용 확인
          const toRemove = lines.slice(0, lastCloseLineIndex).join('\n');
          safeConsoleError(`🗑️ 제거할 내용 길이: ${toRemove.length} 문자`);
          safeConsoleError(`🗑️ 제거할 줄 수: ${lastCloseLineIndex}줄`);
          safeConsoleError(`📝 남길 내용 (afterClose) 길이: ${afterClose.length} 문자`);
          safeConsoleError(`📝 생성할 test 케이스 개수: ${testCases.length}`);
          testCases.forEach((tc, idx) => {
            safeConsoleError(`  ${idx + 1}. ${tc.name}`);
          });
          
          // 새로 생성한 테스트 케이스 코드
          const testCasesCode = testCases.length > 0 ? testCases.map(tc => tc.code).join('\n\n') : '';
          
          if (testCasesCode === '') {
            safeConsoleError('⚠️ 생성할 test 케이스가 없습니다!');
            return { success: false, error: '선택된 메서드가 없습니다. 최소 1개 이상의 메서드를 선택하세요.' };
          }
          
          // 기존 테스트 케이스들을 모두 제거하고 새로 생성한 것들만 추가
          // beforeTests (test.afterAll까지) + 새 test 케이스들 + afterClose (마지막 });)
          newContent = beforeTests + '\n\n' + testCasesCode + afterClose;
        } else {
          // 닫는 괄호를 찾지 못했으면 파일 끝에 추가
          const testCasesCode = testCases.length > 0 ? testCases.map(tc => tc.code).join('\n\n') : '';
          if (testCasesCode === '') {
            safeConsoleError('⚠️ 생성할 test 케이스가 없습니다!');
            return { success: false, error: '선택된 메서드가 없습니다. 최소 1개 이상의 메서드를 선택하세요.' };
          }
          newContent = beforeTests + '\n\n' + testCasesCode + '\n});';
        }
      } else {
        safeConsoleError('⚠️ test.afterAll의 끝을 찾을 수 없습니다.');
        // test 케이스 교체 실패 시 원본 반환
        return { success: false, error: 'test.afterAll의 끝을 찾을 수 없습니다.' };
      }
    } else {
      safeConsoleError('⚠️ test.afterAll을 찾을 수 없습니다.');
      return { success: false, error: 'test.afterAll을 찾을 수 없습니다.' };
    }
    
    // 시나리오 번호 교체
    newContent = newContent.replace(/scenario-(\d+)/g, `scenario-${scenarioNumber}`);
    newContent = newContent.replace(/시나리오 (\d+):/g, `시나리오 ${scenarioNumber}:`);
    newContent = newContent.replace(/scenario-(\d+)/g, `scenario-${scenarioNumber}`);
    
    // 출력 파일 경로
    const outputPath = path.join(__dirname, '..', '..', productUpper, 'tests', 'scenario', `scenario-${scenarioNumber}.spec.js`);
    
    // 디렉토리가 없으면 생성
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, newContent, 'utf8');
    
    // 녹화 설정 파일에 새 시나리오 추가
    try {
      const recordingSettingsPath = path.join(__dirname, '..', '..', productUpper, 'config', 'recording-settings.json');
      let recordingSettings = {};
      
      // 기존 설정 파일이 있으면 읽기
      if (fs.existsSync(recordingSettingsPath)) {
        const recordingSettingsContent = fs.readFileSync(recordingSettingsPath, 'utf8');
        recordingSettings = JSON.parse(recordingSettingsContent);
      }
      
      // 새 시나리오 번호를 녹화 설정에 추가 (기본값: false)
      recordingSettings[scenarioNumber] = false;
      
      // 설정 파일 저장
      fs.writeFileSync(recordingSettingsPath, JSON.stringify(recordingSettings, null, 2), 'utf8');
      safeConsoleError(`✅ 녹화 설정에 시나리오 ${scenarioNumber} 추가 완료`);
    } catch (recordError) {
      safeConsoleError(`⚠️ 녹화 설정 추가 실패: ${recordError.message}`);
      // 녹화 설정 추가 실패는 치명적이지 않으므로 계속 진행
    }
    
    // scenario-list.json에 새 시나리오 추가
    try {
      const scenarioListPath = path.join(__dirname, '..', '..', productUpper, 'custom-reports', 'scenario-list.json');
      let scenarioList = { scenarios: [] };
      
      // 기존 scenario-list.json 읽기
      if (fs.existsSync(scenarioListPath)) {
        const scenarioListContent = fs.readFileSync(scenarioListPath, 'utf8');
        scenarioList = JSON.parse(scenarioListContent);
      } else {
        // custom-reports 폴더가 없으면 생성
        const customReportsDir = path.join(__dirname, '..', '..', product, 'custom-reports');
        if (!fs.existsSync(customReportsDir)) {
          fs.mkdirSync(customReportsDir, { recursive: true });
        }
      }
      
      // 기본 시나리오 제목과 설명 설정
      const finalTitle = scenarioTitle || `시나리오 ${scenarioNumber}`;
      const finalDescription = scenarioDescription || '';
      
      // 새 시나리오 항목 생성
      const newScenario = {
        id: scenarioNumber,
        name: `시나리오 ${scenarioNumber}: ${finalTitle}`,
        description: finalDescription,
        path: `./scenario-${scenarioNumber}/custom-report.html`,
        status: 'not-run',
        lastRun: null,
        duration: null,
        startTime: null,
        timestamp: null,
        runCount: 0,
        totalDuration: 0,
        successCount: 0,
        failCount: 0
      };
      
      // 중복 확인 후 추가
      const existingIndex = scenarioList.scenarios.findIndex(s => s.id === scenarioNumber);
      if (existingIndex !== -1) {
        // 이미 존재하면 업데이트
        scenarioList.scenarios[existingIndex] = newScenario;
        safeConsoleError(`✅ scenario-list.json에서 시나리오 ${scenarioNumber} 업데이트`);
      } else {
        // 새로 추가
        scenarioList.scenarios.push(newScenario);
        // ID 순으로 정렬
        scenarioList.scenarios.sort((a, b) => a.id - b.id);
        safeConsoleError(`✅ scenario-list.json에 시나리오 ${scenarioNumber} 추가 완료`);
      }
      
      // scenario-list.json 저장
      fs.writeFileSync(scenarioListPath, JSON.stringify(scenarioList, null, 2), 'utf8');
    } catch (listError) {
      safeConsoleError(`⚠️ scenario-list.json 업데이트 실패: ${listError.message}`);
      // scenario-list.json 업데이트 실패는 치명적이지 않으므로 계속 진행
    }
    
    // recording-settings.json 업데이트
    try {
      const configDir = path.join(__dirname, '..', '..', productUpper, 'config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const recordingSettingsPath = path.join(configDir, 'recording-settings.json');
      let recordingSettings = {};
      
      // 기존 설정 읽기
      if (fs.existsSync(recordingSettingsPath)) {
        recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
      }
      
      // 새 시나리오 번호 추가 (기본값: false)
      if (recordingSettings[scenarioNumber] === undefined) {
        recordingSettings[scenarioNumber] = false;
        fs.writeFileSync(recordingSettingsPath, JSON.stringify(recordingSettings, null, 2), 'utf8');
        safeConsoleError(`✅ recording-settings.json 업데이트 완료 (시나리오 ${scenarioNumber})`);
      }
    } catch (recordingError) {
      safeConsoleError(`⚠️ recording-settings.json 업데이트 실패: ${recordingError.message}`);
    }
    
    // user-recording-folders.json 업데이트
    try {
      const configDir = path.join(__dirname, '..', '..', productUpper, 'config');
      const userFoldersPath = path.join(configDir, 'user-recording-folders.json');
      let userFolders = {};
      
      // 기존 설정 읽기
      if (fs.existsSync(userFoldersPath)) {
        userFolders = JSON.parse(fs.readFileSync(userFoldersPath, 'utf8'));
      }
      
      // 새 시나리오 번호 추가 (기본값: null - 기본 경로 사용)
      if (userFolders[scenarioNumber] === undefined) {
        userFolders[scenarioNumber] = null;
        fs.writeFileSync(userFoldersPath, JSON.stringify(userFolders, null, 2), 'utf8');
        safeConsoleError(`✅ user-recording-folders.json 업데이트 완료 (시나리오 ${scenarioNumber})`);
      }
    } catch (folderError) {
      safeConsoleError(`⚠️ user-recording-folders.json 업데이트 실패: ${folderError.message}`);
    }
    
    return { 
      success: true, 
      filePath: outputPath,
      message: `시나리오 ${scenarioNumber} spec 파일이 생성되었습니다.`
    };
  } catch (error) {
    console.error('시나리오 생성 실패:', error);
    return { success: false, error: error.message };
  }
});

// 로그 메시지 전송 (백엔드에서 프론트엔드로)
function sendLog(type, message) {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('log-message', { type, message, timestamp: new Date().toISOString() });
    }
  } catch (error) {
    // EPIPE 오류 등은 무시 (렌더러가 이미 닫혔을 수 있음)
    if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
      // EPIPE가 아닌 다른 오류만 로깅 (console.error도 안전하게)
      try {
        console.error('sendLog 오류:', error.message);
      } catch (e) {
        // console.error도 실패하면 무시
      }
    }
  }
}

// 안전한 console.error 래퍼
function safeConsoleError(...args) {
  try {
    console.error(...args);
  } catch (error) {
    // EPIPE 오류는 무시
    if (error.code !== 'EPIPE') {
      // 다른 오류는 무시 (이미 console.error가 실패했으므로)
    }
  }
}

// Unique 값 저장
ipcMain.handle('save-unique-values', async (event, { className, uniqueValues }) => {
  try {
    const config = loadConfig();
    const productUpper = config.currentProduct ? config.currentProduct.toUpperCase() : 'TROMBONE';
    const uniqueValuesPath = path.join(__dirname, '..', '..', productUpper, 'config', 'unique-values.json');
    
    // 기존 unique 값 설정 로드
    let allUniqueValues = {};
    if (fs.existsSync(uniqueValuesPath)) {
      const content = fs.readFileSync(uniqueValuesPath, 'utf8');
      allUniqueValues = JSON.parse(content);
    }
    
    // 클래스별 unique 값 저장
    allUniqueValues[className] = {
      values: uniqueValues,
      savedAt: new Date().toISOString()
    };
    
    // config 디렉토리 생성
    const configDir = path.dirname(uniqueValuesPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // 파일 저장
    fs.writeFileSync(uniqueValuesPath, JSON.stringify(allUniqueValues, null, 2), 'utf8');
    
    console.log(`🔑 Unique 값 저장 완료: ${className} (${uniqueValues.length}개)`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Unique 값 저장 실패:', error);
    return { success: false, error: error.message };
  }
});

// Unique 값 불러오기
ipcMain.handle('load-unique-values', async (event, className) => {
  try {
    const config = loadConfig();
    const productUpper = config.currentProduct ? config.currentProduct.toUpperCase() : 'TROMBONE';
    const uniqueValuesPath = path.join(__dirname, '..', '..', productUpper, 'config', 'unique-values.json');
    
    if (!fs.existsSync(uniqueValuesPath)) {
      return { success: true, uniqueValues: [] };
    }
    
    const content = fs.readFileSync(uniqueValuesPath, 'utf8');
    const allUniqueValues = JSON.parse(content);
    
    const classData = allUniqueValues[className];
    const uniqueValues = classData ? classData.values : [];
    
    console.log(`🔑 Unique 값 로드: ${className} (${uniqueValues.length}개)`);
    
    return { success: true, uniqueValues };
  } catch (error) {
    console.error('❌ Unique 값 로드 실패:', error);
    return { success: false, error: error.message, uniqueValues: [] };
  }
});

// Manager 파일에서 fill 값들 추출
ipcMain.handle('parse-manager-fill-values', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: '파일이 존재하지 않습니다.' };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // fill 값 추출 (정규식)
    const fillRegex = /const\s+(\w+)Value\s*=\s*await\s+this\.processUniqueValue\('(\w+)',\s*'([^']+)'\)/g;
    const fillValues = [];
    let match;
    let index = 0;
    
    while ((match = fillRegex.exec(content)) !== null) {
      const varName = match[1];
      const fieldName = match[2];
      const value = match[3];
      
      // 필드 레이블 추출 시도 (getByRole 다음 줄에서)
      const labelRegex = new RegExp(`getByRole\\([^)]+name:\\s*['"]([^'"]+)['"][^)]*\\)\\.fill\\(${varName}Value\\)`, 'g');
      const labelMatch = labelRegex.exec(content);
      const fieldLabel = labelMatch ? labelMatch[1] : fieldName;
      
      fillValues.push({
        index: index++,
        fieldName,
        fieldLabel,
        value,
        action: `fill('${value}')`
      });
    }
    
    console.log(`📝 Manager 파일에서 ${fillValues.length}개의 fill 값 추출`);
    
    return { success: true, fillValues };
  } catch (error) {
    console.error('❌ Manager fill 값 파싱 실패:', error);
    return { success: false, error: error.message, fillValues: [] };
  }
});

// Manager 클래스 삭제
ipcMain.handle('delete-manager', async (event, params) => {
  try {
    const { product, className } = params;
    console.log(`🗑️ Manager 삭제 시작: ${className} (${product})`);
    
    const productPath = path.join(__dirname, '..', '..', product);
    
    // 1. Manager .js 파일 삭제
    const managerFilePath = path.join(productPath, 'lib', 'classes', `${className}.js`);
    if (fs.existsSync(managerFilePath)) {
      fs.unlinkSync(managerFilePath);
      console.log(`✅ Manager 파일 삭제: ${managerFilePath}`);
    }
    
    // 2. unique-values.json에서 항목 제거
    const uniqueValuesPath = path.join(productPath, 'config', 'unique-values.json');
    if (fs.existsSync(uniqueValuesPath)) {
      const data = fs.readFileSync(uniqueValuesPath, 'utf8');
      const uniqueValues = JSON.parse(data);
      
      if (uniqueValues[className]) {
        delete uniqueValues[className];
        fs.writeFileSync(uniqueValuesPath, JSON.stringify(uniqueValues, null, 2), 'utf8');
        console.log(`✅ unique-values.json에서 ${className} 제거`);
      }
    }
    
    // 3. unique-counters.json에서 항목 제거
    const countersPath = path.join(productPath, 'config', 'unique-counters.json');
    if (fs.existsSync(countersPath)) {
      const data = fs.readFileSync(countersPath, 'utf8');
      const counters = JSON.parse(data);
      
      if (counters[className]) {
        delete counters[className];
        fs.writeFileSync(countersPath, JSON.stringify(counters, null, 2), 'utf8');
        console.log(`✅ unique-counters.json에서 ${className} 제거`);
      }
    }
    
    console.log(`✅ Manager ${className} 삭제 완료`);
    return { success: true };
  } catch (error) {
    console.error('❌ Manager 삭제 실패:', error);
    return { success: false, error: error.message };
  }
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  // EPIPE 오류는 무시 (프로세스 종료 중 발생할 수 있음)
  if (error.code === 'EPIPE' || error.message.includes('EPIPE')) {
    return;
  }
  
  try {
    safeConsoleError('Uncaught Exception:', error);
    sendLog('error', `예상치 못한 오류: ${error.message}`);
  } catch (e) {
    // 에러 처리 중 에러 발생 시 무시
  }
});

console.log('🎬 Codegen Autoscript GUI 시작됨');
console.log('📂 작업 디렉토리:', __dirname);

