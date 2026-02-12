// Electron API 접근 (contextIsolation에 따라 다른 방식 사용)
let electronAPI;
try {
  // contextIsolation: false인 경우 (nodeIntegration: true)
  if (typeof require !== 'undefined') {
    const { ipcRenderer } = require('electron');
    electronAPI = {
      loadConfig: () => ipcRenderer.invoke('load-config'),
      saveConfig: (config) => ipcRenderer.invoke('save-config', config),
      updateConfig: (updates) => ipcRenderer.invoke('update-config', updates),
      openSheetInBrowser: (spreadsheetId, currentProduct) => ipcRenderer.invoke('open-sheet-in-browser', spreadsheetId, currentProduct),
      fetchSheetCases: () => ipcRenderer.invoke('fetch-sheet-cases'),
      runCodegen: (params) => ipcRenderer.invoke('run-codegen', params),
      runDirectCodegen: (params) => ipcRenderer.invoke('run-direct-codegen', params),
      generatePlaywrightCode: (params) => ipcRenderer.invoke('generate-playwright-code', params),
      getManagerList: (params) => ipcRenderer.invoke('get-manager-list', params),
      createScenarioFromManager: (params) => ipcRenderer.invoke('create-scenario-from-manager', params),
      parseManagerMethods: (filePath) => ipcRenderer.invoke('parse-manager-methods', filePath),
      generateScenarioSpec: (params) => ipcRenderer.invoke('generate-scenario-spec', params),
      checkScenarioExists: (params) => ipcRenderer.invoke('check-scenario-exists', params),
      getNextAvailableScenarioNumber: (product) => ipcRenderer.invoke('get-next-available-scenario-number', product),
      openInExplorer: (filePath) => ipcRenderer.invoke('open-in-explorer', filePath),
      selectFile: (options) => ipcRenderer.invoke('select-file', options),
      saveUniqueValues: (params) => ipcRenderer.invoke('save-unique-values', params),
      loadUniqueValues: (className) => ipcRenderer.invoke('load-unique-values', className),
      parseManagerFillValues: (filePath) => ipcRenderer.invoke('parse-manager-fill-values', filePath),
      onCodegenLog: (callback) => {
        ipcRenderer.on('codegen-log', (event, data) => callback(data));
      },
      onLogMessage: (callback) => {
        ipcRenderer.on('log-message', (event, data) => callback(data));
      },
      removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
      }
    };
    console.log('✅ Electron API (nodeIntegration) 로드 완료');
  } else if (window.electronAPI) {
    // contextIsolation: true인 경우 (preload 스크립트 사용)
    electronAPI = window.electronAPI;
    console.log('✅ Electron API (preload) 로드 완료');
  } else {
    console.error('❌ Electron API를 사용할 수 없습니다');
  }
} catch (error) {
  console.error('❌ Electron API 로드 실패:', error);
}

// 전역 상태
let config = null;
let currentGeneratedFile = null;
let currentUniqueValuesData = {
  className: '',
  fillValues: [],
  selectedIndices: []
};

// DOM 요소
const elements = {
  // 제품 선택
  productList: document.getElementById('productList'),
  
  // Codegen 탭
  urlInput: document.getElementById('urlInput'),
  caseIdInput: document.getElementById('caseIdInput'),
  titleInput: document.getElementById('titleInput'),
  fileNameInput: document.getElementById('fileNameInput'),
  directModeInputs: document.getElementById('directModeInputs'),
  sheetModeInputs: document.getElementById('sheetModeInputs'),
  startCodegenBtn: document.getElementById('startCodegenBtn'),
  managerSelectSection: document.getElementById('managerSelectSection'),
  managerSelect: document.getElementById('managerSelect'),
  managerInfo: document.getElementById('managerInfo'),
  createScenarioBtn: document.getElementById('createScenarioBtn'),
  scenarioHistorySection: document.getElementById('scenarioHistorySection'),
  scenarioHistory: document.getElementById('scenarioHistory'),
  
  // 코드 변환 탭
  convertCaseId: document.getElementById('convertCaseId'),
  useManagerFormat: document.getElementById('useManagerFormat'),
  convertCodeBtn: document.getElementById('convertCodeBtn'),
  convertedFileInfo: document.getElementById('convertedFileInfo'),
  convertedFilePath: document.getElementById('convertedFilePath'),
  
  // 시나리오 빌더 탭
  managerList: document.getElementById('managerList'),
  resetScenarioBtn: document.getElementById('resetScenarioBtn'),
  generateScenarioBtn: document.getElementById('generateScenarioBtn'),
  
  // 시나리오 정보 입력 모달
  scenarioInfoModal: document.getElementById('scenarioInfoModal'),
  modalScenarioNumber: document.getElementById('modalScenarioNumber'),
  modalScenarioTitle: document.getElementById('modalScenarioTitle'),
  modalScenarioDescription: document.getElementById('modalScenarioDescription'),
  closeScenarioInfoModal: document.getElementById('closeScenarioInfoModal'),
  cancelScenarioInfoBtn: document.getElementById('cancelScenarioInfoBtn'),
  confirmScenarioInfoBtn: document.getElementById('confirmScenarioInfoBtn'),
  scenarioSequence: document.getElementById('scenarioSequence'),
  methodList: document.getElementById('methodList'),
  selectAllMethodsBtn: document.getElementById('selectAllMethodsBtn'),
  deselectAllMethodsBtn: document.getElementById('deselectAllMethodsBtn'),
  
  // 모달
  successModal: document.getElementById('successModal'),
  successModalMessage: document.getElementById('successModalMessage'),
  successModalPath: document.getElementById('successModalPath'),
  closeSuccessModalBtn: document.getElementById('closeSuccessModalBtn'),
  resetConfirmModal: document.getElementById('resetConfirmModal'),
  confirmResetBtn: document.getElementById('confirmResetBtn'),
  cancelResetBtn: document.getElementById('cancelResetBtn'),
  
  // 사이드바
  openSheetBtn: document.getElementById('openSheetBtn'),
  
  // 로그
  logOutput: document.getElementById('logOutput'),
  clearLogBtn: document.getElementById('clearLogBtn'),
  
  // Unique 값 선택 모달
  uniqueValuesModal: document.getElementById('uniqueValuesModal'),
  uniqueValuesList: document.getElementById('uniqueValuesList'),
  closeUniqueValuesBtn: document.getElementById('closeUniqueValuesBtn'),
  skipUniqueValuesBtn: document.getElementById('skipUniqueValuesBtn'),
  saveUniqueValuesBtn: document.getElementById('saveUniqueValuesBtn'),
  manageUniqueValuesBtn: document.getElementById('manageUniqueValuesBtn'),
  deleteManagerBtn: document.getElementById('deleteManagerBtn'),
  
  // 헤더
  backBtn: document.getElementById('backBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  
  // 비밀번호 모달
  passwordModal: document.getElementById('passwordModal'),
  passwordInput: document.getElementById('passwordInput'),
  passwordError: document.getElementById('passwordError'),
  confirmPasswordBtn: document.getElementById('confirmPasswordBtn'),
  cancelPasswordBtn: document.getElementById('cancelPasswordBtn'),
  closePasswordBtn: document.getElementById('closePasswordBtn'),
  
  // 설정 모달
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  spreadsheetIdInput: document.getElementById('spreadsheetIdInput'),
  credentialsPathInput: document.getElementById('credentialsPathInput'),
  selectCredentialsBtn: document.getElementById('selectCredentialsBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  cancelSettingsBtn: document.getElementById('cancelSettingsBtn')
};

// 시나리오 빌더 상태 (제품별로 분리)
let scenarioStateByProduct = {};

// 현재 제품의 시나리오 상태 가져오기
function getScenarioState() {
  if (!config || !config.currentProduct) {
    return null;
  }
  if (!scenarioStateByProduct[config.currentProduct]) {
    scenarioStateByProduct[config.currentProduct] = {
      managers: [],
      selectedManagers: [],
      currentManager: null,
      currentMethods: []
    };
  }
  return scenarioStateByProduct[config.currentProduct];
}

// 이전 페이지로 돌아가기
function navigateBack(fromPage) {
  console.log('🔙 이전 페이지로 돌아가기:', fromPage);
  
  // fromPage에 따라 적절한 경로로 이동
  // 현재 위치: autoscript/electron-codegen-gui/renderer/index.html
  // 목표: test/VIOLA/viola-main.html
  // 상대 경로: ../../../VIOLA/viola-main.html
  const pageMap = {
    'viola-main': '../../../VIOLA/viola-main.html',
    'trombone-main': '../../../TROMBONE/trombone-main.html',
    'contrabass-main': '../../../CONTRABASS/contrabass-main.html',
    'cmp-main': '../../../CMP/cmp-main.html'
  };
  
  const targetPath = pageMap[fromPage];
  if (targetPath) {
    window.location.href = targetPath;
  } else {
    console.error('알 수 없는 fromPage:', fromPage);
    // 기본적으로 뒤로 가기
    window.history.back();
  }
}

// 초기화
async function init() {
  addLog('info', '🚀 애플리케이션 시작');
  
  // URL 파라미터에서 제품 정보 및 돌아갈 경로 확인
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedProduct = urlParams.get('product');
  const fromPage = urlParams.get('from');
  
  // 뒤로가기 버튼 표시 (from 파라미터가 있을 때)
  if (fromPage && elements.backBtn) {
    elements.backBtn.style.display = 'inline-block';
    elements.backBtn.onclick = () => navigateBack(fromPage);
    addLog('info', `🔙 뒤로가기 버튼 활성화: ${fromPage}`);
  }
  
  // 설정 로드
  try {
    if (electronAPI && electronAPI.loadConfig) {
      config = await electronAPI.loadConfig();
      addLog('success', '✅ 설정 로드 완료');
    } else {
      // Electron API가 없을 경우 기본 설정 사용
      console.warn('⚠️ Electron API를 사용할 수 없습니다. 기본 설정을 사용합니다.');
      const productUpper = preselectedProduct ? preselectedProduct.toUpperCase() : 'VIOLA';
      config = {
        products: ['TROMBONE', 'VIOLA', 'CONTRABASS', 'CMP'],
        currentProduct: productUpper,
        productUrls: {
          'TROMBONE': 'http://tst.console.trombone.okestro.cloud/login',
          'VIOLA': 'http://tst.console.viola.okestro.cloud/login',
          'CONTRABASS': 'http://tst.console.contrabass.okestro.cloud/login',
          'CMP': 'http://tst.console.cmp.okestro.cloud/login'
        },
        lastUrl: '',
        googleSheets: {
          spreadsheetId: '',
          credentialsPath: ''
        }
      };
      addLog('warning', '⚠️ 기본 설정으로 시작 (Electron API 없음)');
      
      // Electron API 필요한 기능 비활성화
      if (elements.openSheetBtn) {
        elements.openSheetBtn.disabled = true;
        elements.openSheetBtn.style.opacity = '0.5';
        elements.openSheetBtn.title = 'Electron API를 사용할 수 없습니다';
      }
      if (elements.settingsBtn) {
        elements.settingsBtn.disabled = true;
        elements.settingsBtn.style.opacity = '0.5';
        elements.settingsBtn.title = 'Electron API를 사용할 수 없습니다';
      }
      if (elements.startCodegenBtn) {
        elements.startCodegenBtn.disabled = true;
        elements.startCodegenBtn.style.opacity = '0.5';
        elements.startCodegenBtn.title = 'Electron API를 사용할 수 없습니다';
      }
    }
  } catch (error) {
    console.error('❌ 설정 로드 실패:', error);
    addLog('error', `❌ 설정 로드 실패: ${error.message}`);
    return;
  }
  
  // URL 파라미터로 제품이 지정되어 있으면 자동 선택
  if (preselectedProduct) {
    const productUpper = preselectedProduct.toUpperCase();
    if (config.products.includes(productUpper)) {
      config.currentProduct = productUpper;
      addLog('info', `🎯 자동 제품 선택: ${productUpper}`);
      
      // 사이드바의 제품 선택 섹션 숨기기
      const productSection = document.querySelector('.sidebar-section:first-child');
      if (productSection) {
        productSection.style.display = 'none';
      }
    }
  }
  
  // 제품별 색상 적용 (초기 로드 시)
  if (config.currentProduct) {
    document.body.classList.add(`product-${config.currentProduct.toLowerCase()}`);
  }
  
  // UI 초기화
  renderProductList();
  
  // URL 초기값 설정 (제품별 기본 URL 우선)
  if (config.currentProduct && config.productUrls && config.productUrls[config.currentProduct]) {
    // 현재 선택된 제품의 기본 URL 사용
    elements.urlInput.value = config.productUrls[config.currentProduct];
    config.lastUrl = config.productUrls[config.currentProduct];
    addLog('info', `🌐 ${config.currentProduct} 기본 URL 설정: ${config.lastUrl}`);
  } else if (config.lastUrl) {
    // 저장된 URL이 있으면 사용
    elements.urlInput.value = config.lastUrl;
  }
  
  // 이벤트 리스너 등록
  setupEventListeners();
  
  // 시나리오 빌더 초기화
  if (elements.scenarioSequence) {
    setupScenarioBuilder();
  }
  
  // Manager 목록 로드
  if (config.currentProduct) {
    await refreshManagerList();
  }
  
  addLog('success', '✅ 준비 완료');
}

// iframe 모드일 때 Electron API 기능 비활성화
// 제품 목록 렌더링
function renderProductList() {
  elements.productList.innerHTML = '';
  
  config.products.forEach(product => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.setAttribute('data-product', product); // 제품별 색상을 위한 data 속성 추가
    if (product === config.currentProduct) {
      item.classList.add('active');
    }
    item.textContent = product;
    item.onclick = () => selectProduct(product);
    elements.productList.appendChild(item);
  });
}

// 제품 선택
async function selectProduct(product) {
  console.log('🔵 selectProduct 호출:', product);
  
  const previousProduct = config.currentProduct;
  config.currentProduct = product;
  
  // 제품별 기본 URL 설정
  if (config.productUrls && config.productUrls[product]) {
    elements.urlInput.value = config.productUrls[product];
    config.lastUrl = config.productUrls[product];
  }
  
  // 제품별 색상 적용
  document.body.className = '';
  document.body.classList.add(`product-${product.toLowerCase()}`);
  
  // 설정 저장
  await electronAPI.updateConfig({ 
    currentProduct: product,
    lastUrl: config.lastUrl
  });
  
  // 사이드바 제품 목록 업데이트 (active 표시)
  renderProductList();
  
  // 로그 출력
  addLog('info', `📦 제품 선택: ${product}`);
  addLog('info', `🌐 기본 URL 설정: ${config.lastUrl}`);
  
  // Manager 목록 새로고침
  await refreshManagerList();
  
  // 시나리오 히스토리 로드
  loadScenarioHistory();
  
  // 제품이 변경되면 시나리오 상태 준비
  if (previousProduct && previousProduct !== product) {
    const currentState = getScenarioState();
    if (currentState) {
      renderSequence();
      if (elements.methodList) {
        if (currentState.currentManager && currentState.currentMethods.length > 0) {
          renderMethodList(currentState.currentMethods);
        } else {
          elements.methodList.innerHTML = '<div class="empty-state">Manager를 선택하세요</div>';
        }
      }
    }
  }
}


// 탭 전환
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 모든 탭 비활성화
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      // 선택한 탭 활성화
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      const tabElement = document.getElementById(`${tabName}Tab`);
      if (tabElement) {
        tabElement.classList.add('active');
        
        // 시나리오 빌더 탭이 활성화되면 Manager 목록 로드
        if (tabName === 'scenario') {
          loadManagers();
        }
      }
    });
  });
}

// Codegen 시작
async function startCodegen() {
  const url = elements.urlInput.value.trim();
  
  // 선택된 모드 확인
  const selectedMode = document.querySelector('input[name="recordMode"]:checked');
  const mode = selectedMode ? selectedMode.value : 'direct';
  
  let caseId, title;
  
  if (mode === 'direct') {
    // 일반 모드: 파일명만 필요
    const fileName = elements.fileNameInput.value.trim();
    
    if (!url || !fileName) {
      addLog('error', '❌ URL과 파일명을 모두 입력하세요');
      return;
    }
    
    // 파일명 유효성 검증 (영문, 숫자, 하이픈, 언더스코어만)
    const fileNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!fileNameRegex.test(fileName)) {
      addLog('error', '❌ 파일명은 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다');
      return;
    }
    
    caseId = fileName;
    title = fileName.replace(/[-_]/g, ' '); // 파일명을 제목으로 변환
    
    addLog('info', `🎬 Codegen 시작 (일반 모드): ${fileName}`);
  } else {
    // 기록 모드: 케이스 ID, 제목 필요
    caseId = elements.caseIdInput.value.trim();
    title = elements.titleInput.value.trim();
    
    if (!url || !caseId || !title) {
      addLog('error', '❌ URL, 케이스 ID, 제목을 모두 입력하세요');
      return;
    }
    
    addLog('info', `🎬 Codegen 시작 (기록 모드): ${caseId} - ${title}`);
  }
  
  addLog('info', `🌐 URL: ${url}`);
  
  elements.startCodegenBtn.disabled = true;
  elements.startCodegenBtn.textContent = '⏳ 녹화 중...';
  
  try {
    if (mode === 'direct') {
      // 일반 모드: 바로 .spec.js 파일 생성
      const result = await electronAPI.runDirectCodegen({
        url,
        caseId,
        title,
        product: config.currentProduct
      });
      
      addLog('success', `✅ ${result.message}`);
      if (result.managerFile) {
        addLog('info', `📁 저장 위치: ${result.managerFile}`);
        addLog('info', `📦 클래스명: ${result.className}`);
        addLog('info', `📝 단계 수: ${result.steps.length}개`);
        
        // Unique 값 후보가 있으면 모달 표시
        if (result.fillValues && result.fillValues.length > 0) {
          addLog('info', `🔑 입력된 값 ${result.fillValues.length}개 감지됨`);
          
          // 입력된 값들 목록 표시
          result.fillValues.forEach((fv, idx) => {
            addLog('info', `   ${idx + 1}. [${fv.fieldLabel}] "${fv.value}"`);
          });
          
          // Unique 값 선택 모달 표시
          openUniqueValuesModal(result.className, result.fillValues);
        }
      }
      
      // 입력 필드 초기화
      elements.fileNameInput.value = '';
      
      // Manager 목록 새로고침
      await refreshManagerList();
    } else {
      // 기록 모드: Google Sheets에 기록
      const result = await electronAPI.runCodegen({
        url,
        caseId,
        title,
        product: config.currentProduct
      });
      
      addLog('success', `✅ ${result.message}`);
      
      // 입력 필드 초기화
      elements.caseIdInput.value = '';
      elements.titleInput.value = '';
    }
    
    // URL 저장
    await electronAPI.updateConfig({ lastUrl: url });
    
  } catch (error) {
    addLog('error', `❌ Codegen 실패: ${error.error || error.message}`);
  } finally {
    elements.startCodegenBtn.disabled = false;
    elements.startCodegenBtn.textContent = '🎬 Codegen 녹화 시작';
  }
}

// Playwright 코드 변환
async function convertCode() {
  const caseId = elements.convertCaseId.value.trim();
  const useManager = elements.useManagerFormat.checked;
  
  if (!caseId) {
    addLog('error', '❌ 케이스 ID를 입력하세요');
    return;
  }
  
  addLog('info', `🔄 코드 변환 시작: ${caseId} (${useManager ? 'Manager 형식' : '일반 형식'})`);
  
  elements.convertCodeBtn.disabled = true;
  elements.convertCodeBtn.textContent = '⏳ 변환 중...';
  
  try {
    const result = await electronAPI.generatePlaywrightCode({
      caseId,
      product: config.currentProduct,
      useManager
    });
    
    addLog('success', `✅ ${result.message}`);
    addLog('info', `📂 파일 경로: ${result.filePath}`);
    
    // 생성된 파일 정보 표시
    currentGeneratedFile = result.filePath;
    elements.convertedFileInfo.classList.remove('hidden');
    elements.convertedFilePath.textContent = result.filePath;
    
  } catch (error) {
    // 에러 객체가 복잡한 경우 상세 정보 추출
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && error.error) {
      errorMessage = typeof error.error === 'string' ? error.error : error.error.message || JSON.stringify(error.error);
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (error) {
      errorMessage = JSON.stringify(error);
    }
    addLog('error', `❌ 코드 변환 실패: ${errorMessage}`);
    console.error('코드 변환 에러 상세:', error);
  } finally {
    elements.convertCodeBtn.disabled = false;
    elements.convertCodeBtn.textContent = '🔄 코드 변환';
  }
}



// Sheet 브라우저에서 열기
async function openSheetInBrowser() {
  try {
    const result = await electronAPI.openSheetInBrowser(
      config.googleSheets.spreadsheetId, 
      config.currentProduct
    );
    
    if (result.fallback) {
      addLog('warning', '🌐 Google Sheets를 열었습니다 (기본 탭)');
    } else {
      addLog('success', `🌐 Google Sheets ${config.currentProduct} 시트를 브라우저에서 열었습니다`);
    }
  } catch (error) {
    addLog('error', `❌ Sheet 열기 실패: ${error.message}`);
  }
}

// 로그 추가
function addLog(type, message) {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const time = new Date().toLocaleTimeString('ko-KR');
  entry.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-message">${message}</span>
  `;
  
  elements.logOutput.appendChild(entry);
  elements.logOutput.scrollTop = elements.logOutput.scrollHeight;
}

// 로그 지우기
function clearLog() {
  elements.logOutput.innerHTML = '';
  addLog('info', '🧹 로그가 지워졌습니다');
}

// 비밀번호 모달 열기
function openPasswordModal() {
  elements.passwordInput.value = '';
  elements.passwordError.classList.add('hidden');
  elements.passwordModal.classList.remove('hidden');
  elements.passwordInput.focus();
}

// 비밀번호 모달 닫기
function closePasswordModal() {
  elements.passwordModal.classList.add('hidden');
  elements.passwordInput.value = '';
  elements.passwordError.classList.add('hidden');
}

// 비밀번호 확인
function confirmPassword() {
  const password = elements.passwordInput.value;
  const correctPassword = 'Okestro2018!';
  
  if (password === correctPassword) {
    closePasswordModal();
    openSettings();
  } else {
    elements.passwordError.classList.remove('hidden');
    elements.passwordInput.value = '';
    elements.passwordInput.focus();
  }
}

// 설정 모달 열기
function openSettings() {
  elements.spreadsheetIdInput.value = config.googleSheets.spreadsheetId;
  elements.credentialsPathInput.value = config.googleSheets.credentialsPath;
  elements.settingsModal.classList.remove('hidden');
}

// 설정 모달 닫기
function closeSettings() {
  elements.settingsModal.classList.add('hidden');
}

// 인증 파일 선택
async function selectCredentialsFile() {
  const result = await electronAPI.selectFile({
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });
  
  if (result.success) {
    elements.credentialsPathInput.value = result.path;
  }
}

// 설정 저장
async function saveSettings() {
  const newConfig = {
    ...config,
    googleSheets: {
      spreadsheetId: elements.spreadsheetIdInput.value.trim(),
      credentialsPath: elements.credentialsPathInput.value.trim()
    }
  };
  
  const success = await electronAPI.saveConfig(newConfig);
  
  if (success) {
    config = newConfig;
    addLog('success', '✅ 설정이 저장되었습니다');
    closeSettings();
  } else {
    addLog('error', '❌ 설정 저장에 실패했습니다');
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 탭
  setupTabs();
  
  // Codegen
  elements.startCodegenBtn.addEventListener('click', startCodegen);
  
  // Manager 선택 및 시나리오 생성
  elements.managerSelect.addEventListener('change', () => {
    const selected = elements.managerSelect.value;
    const selectedOption = elements.managerSelect.options[elements.managerSelect.selectedIndex];
    
    if (selected) {
      elements.createScenarioBtn.disabled = false;
      elements.manageUniqueValuesBtn.disabled = false;
      elements.deleteManagerBtn.disabled = false;
      const title = selectedOption.dataset.title;
      const steps = selectedOption.dataset.steps;
      const date = selectedOption.dataset.date;
      const fileName = selectedOption.dataset.filename;
      
      elements.managerInfo.innerHTML = `
        <strong>📄 파일:</strong> ${fileName}<br>
        <strong>📋 제목:</strong> ${title}<br>
        <strong>📅 생성일:</strong> ${new Date(date).toLocaleString('ko-KR')}
      `;
    } else {
      elements.createScenarioBtn.disabled = true;
      elements.manageUniqueValuesBtn.disabled = true;
      elements.deleteManagerBtn.disabled = true;
      elements.managerInfo.innerHTML = '';
    }
  });
  
  elements.createScenarioBtn.addEventListener('click', createScenario);
  elements.manageUniqueValuesBtn.addEventListener('click', manageUniqueValues);
  elements.deleteManagerBtn.addEventListener('click', deleteManager);
  
  // 코드 변환
  elements.convertCodeBtn.addEventListener('click', convertCode);
  
  // 사이드바
  elements.openSheetBtn.addEventListener('click', openSheetInBrowser);
  
  // 로그
  elements.clearLogBtn.addEventListener('click', clearLog);
  
  // 헤더
  elements.settingsBtn.addEventListener('click', openPasswordModal);
  elements.refreshBtn.addEventListener('click', () => {
    location.reload();
  });
  
  // 비밀번호 모달
  elements.confirmPasswordBtn.addEventListener('click', confirmPassword);
  elements.cancelPasswordBtn.addEventListener('click', closePasswordModal);
  elements.closePasswordBtn.addEventListener('click', closePasswordModal);
  elements.passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmPassword();
    }
  });
  
  // 설정 모달
  elements.closeSettingsBtn.addEventListener('click', closeSettings);
  elements.cancelSettingsBtn.addEventListener('click', closeSettings);
  elements.saveSettingsBtn.addEventListener('click', saveSettings);
  elements.selectCredentialsBtn.addEventListener('click', selectCredentialsFile);
  
  // Codegen 로그 수신
  electronAPI.onCodegenLog((data) => {
    addLog(data.type, data.message);
  });
  
  // 일반 로그 수신
  electronAPI.onLogMessage((data) => {
    addLog(data.type, data.message);
  });
  
  // Enter 키로 폼 제출
  elements.caseIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && elements.titleInput.value.trim()) {
      startCodegen();
    }
  });
  
  elements.titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      startCodegen();
    }
  });
  
  elements.convertCaseId.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      convertCode();
    }
  });
  
  // 시나리오 빌더 이벤트
  const loadManagersBtn = document.getElementById('loadManagersBtn');
  if (loadManagersBtn) {
    loadManagersBtn.addEventListener('click', loadManagers);
  }
  
  if (elements.generateScenarioBtn) {
    elements.generateScenarioBtn.addEventListener('click', openScenarioInfoModal);
  }
  
  if (elements.resetScenarioBtn) {
    elements.resetScenarioBtn.addEventListener('click', resetScenario);
  }
  
  // 시나리오 정보 입력 모달 이벤트
  if (elements.closeScenarioInfoModal) {
    elements.closeScenarioInfoModal.addEventListener('click', closeScenarioInfoModal);
  }
  
  if (elements.cancelScenarioInfoBtn) {
    elements.cancelScenarioInfoBtn.addEventListener('click', closeScenarioInfoModal);
  }
  
  if (elements.confirmScenarioInfoBtn) {
    elements.confirmScenarioInfoBtn.addEventListener('click', () => {
      // Manager에서 시나리오 생성하는 경우와 직접 생성하는 경우 구분
      if (window.tempManagerClassName) {
        confirmCreateScenarioFromManager();
      } else {
        confirmGenerateScenario();
      }
    });
  }
  
  // 모달 배경 클릭 시 닫기 (드래그 방지)
  if (elements.scenarioInfoModal) {
    let isDragging = false;
    let startX = null;
    let startY = null;
    let mouseDownOnModal = false;
    
    elements.scenarioInfoModal.addEventListener('mousedown', (e) => {
      if (e.target === elements.scenarioInfoModal) {
        mouseDownOnModal = true;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;
      }
    });
    
    // document에서 mousemove를 감지 (모달 밖으로 드래그해도 추적)
    document.addEventListener('mousemove', (e) => {
      if (mouseDownOnModal && startX !== null && startY !== null) {
        const diffX = Math.abs(e.clientX - startX);
        const diffY = Math.abs(e.clientY - startY);
        if (diffX > 5 || diffY > 5) {
          isDragging = true;
        }
      }
    });
    
    // document에서 mouseup을 감지 (모달 밖에서 놓아도 처리)
    document.addEventListener('mouseup', (e) => {
      if (mouseDownOnModal) {
        // 모달 배경에서 시작했고, 드래그하지 않았고, 모달 배경에서 끝난 경우만 닫기
        if (e.target === elements.scenarioInfoModal && !isDragging) {
          closeScenarioInfoModal();
        }
        // 상태 초기화
        mouseDownOnModal = false;
        isDragging = false;
        startX = null;
        startY = null;
      }
    });
  }
  
  if (elements.closeSuccessModalBtn) {
    elements.closeSuccessModalBtn.addEventListener('click', () => {
      if (elements.successModal) {
        elements.successModal.classList.remove('show');
      }
    });
  }
  
  // 모달 외부 클릭 시 닫기
  if (elements.successModal) {
    elements.successModal.addEventListener('click', (e) => {
      if (e.target === elements.successModal) {
        elements.successModal.classList.remove('show');
      }
    });
  }
  
  // 초기화 확인 모달 이벤트
  if (elements.confirmResetBtn) {
    elements.confirmResetBtn.addEventListener('click', () => {
      if (elements.resetConfirmModal) {
        elements.resetConfirmModal.classList.add('hidden');
      }
      performReset();
    });
  }
  
  if (elements.cancelResetBtn) {
    elements.cancelResetBtn.addEventListener('click', () => {
      if (elements.resetConfirmModal) {
        elements.resetConfirmModal.classList.add('hidden');
      }
    });
  }
  
  if (elements.resetConfirmModal) {
    elements.resetConfirmModal.addEventListener('click', (e) => {
      if (e.target === elements.resetConfirmModal) {
        elements.resetConfirmModal.classList.add('hidden');
      }
    });
  }
  
  if (elements.selectAllMethodsBtn) {
    elements.selectAllMethodsBtn.addEventListener('click', selectAllMethods);
  }
  
  if (elements.deselectAllMethodsBtn) {
    elements.deselectAllMethodsBtn.addEventListener('click', deselectAllMethods);
  }
  
  // 파일 목록 → 시나리오 구성 추가 버튼
  const addToScenarioBtn = document.getElementById('addToScenarioBtn');
  if (addToScenarioBtn) {
    addToScenarioBtn.addEventListener('click', addSelectedManagersToScenario);
  }
  
  // 로그창 접기/펼치기 버튼
  const toggleLogBtn = document.getElementById('toggleLogBtn');
  if (toggleLogBtn) {
    toggleLogBtn.addEventListener('click', toggleLogSection);
  }
  
  // 녹화 모드 선택 이벤트
  const recordModeRadios = document.querySelectorAll('input[name="recordMode"]');
  recordModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      const directModeInfo = document.getElementById('directModeInfo');
      const sheetModeInfo = document.getElementById('sheetModeInfo');
      
      if (mode === 'direct') {
        // 일반 모드: 파일명 입력만 표시
        if (directModeInfo) directModeInfo.style.display = 'block';
        if (sheetModeInfo) sheetModeInfo.style.display = 'none';
        if (elements.directModeInputs) elements.directModeInputs.style.display = 'block';
        if (elements.sheetModeInputs) elements.sheetModeInputs.style.display = 'none';
      } else {
        // 기록 모드: 케이스 ID, 테스트명 입력 표시
        if (directModeInfo) directModeInfo.style.display = 'none';
        if (sheetModeInfo) sheetModeInfo.style.display = 'block';
        if (elements.directModeInputs) elements.directModeInputs.style.display = 'none';
        if (elements.sheetModeInputs) elements.sheetModeInputs.style.display = 'block';
      }
    });
  });
}

// 시나리오 빌더 초기화
function setupScenarioBuilder() {
  setupDropZone();
}

// Manager 목록 로드 (lib/classes 폴더의 모든 파일)
async function loadManagers() {
  if (!config || !config.currentProduct) {
    addLog('error', '❌ 제품을 먼저 선택하세요');
    return;
  }
  
  addLog('info', '🔄 파일 목록 로드 중...');
  
  try {
    const result = await electronAPI.getManagerList(config.currentProduct);
    
    if (result.success) {
      const scenarioState = getScenarioState();
      if (scenarioState) {
        scenarioState.managers = result.managers;
        renderManagerList(result.managers);
        addLog('success', `✅ 파일 ${result.managers.length}개 로드 완료`);
      }
    } else {
      addLog('error', `❌ 파일 목록 로드 실패: ${result.error}`);
    }
  } catch (error) {
    addLog('error', `❌ 파일 목록 로드 실패: ${error.message}`);
  }
}

// 파일 목록 렌더링
function renderManagerList(managers) {
  if (!elements.managerList) return;
  
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  elements.managerList.innerHTML = '';
  
  if (managers.length === 0) {
    elements.managerList.innerHTML = '<div class="empty-state">파일이 없습니다</div>';
    return;
  }
  
  managers.forEach(manager => {
    const card = document.createElement('div');
    card.className = 'manager-card';
    card.draggable = true;
    card.dataset.managerName = manager.managerName;
    card.dataset.filePath = manager.filePath;
    
    // 이미 시나리오 구성에 추가된 Manager인지 확인
    const isInScenario = scenarioState.selectedManagers.some(m => m.managerName === manager.managerName);
    
    // 모든 파일을 박스 모양 아이콘으로 통일
    const icon = '📦';
    
    card.innerHTML = `
      <input type="checkbox" class="manager-checkbox" ${isInScenario ? 'disabled' : ''} />
      <div class="manager-icon">${icon}</div>
      <div class="manager-name">${manager.managerName}</div>
    `;
    
    // 체크박스 클릭 이벤트 (전파 방지)
    const checkbox = card.querySelector('.manager-checkbox');
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // 비활성화된 체크박스는 체크 불가
      if (checkbox.disabled) {
        e.preventDefault();
        checkbox.checked = false;
        return;
      }
      
      updateAddToScenarioButton();
    });
    
    // 드래그 이벤트
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('manager', JSON.stringify(manager));
      card.classList.add('dragging');
    });
    
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
    
    // 카드 클릭 이벤트 (체크박스 제외) - 체크박스 선택/해제
    card.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      
      // 비활성화된 체크박스는 체크 불가
      if (checkbox.disabled) return;
      
      // 체크박스 토글
      checkbox.checked = !checkbox.checked;
      updateAddToScenarioButton();
    });
    
    elements.managerList.appendChild(card);
  });
  
  updateAddToScenarioButton();
}

// Manager 메서드 로드
async function loadManagerMethods(filePath) {
  if (!elements.methodList) return;
  
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  addLog('info', '🔄 Manager 메서드 파싱 중...');
  
  try {
    const result = await electronAPI.parseManagerMethods(filePath);
    
    if (result.success) {
      scenarioState.currentMethods = result.methods;
      // 현재 Manager의 description 업데이트
      if (scenarioState.currentManager) {
        const managerIndex = scenarioState.selectedManagers.findIndex(m => m.managerName === scenarioState.currentManager.managerName);
        if (managerIndex >= 0 && result.description) {
          scenarioState.selectedManagers[managerIndex].description = result.description;
          scenarioState.currentManager.description = result.description;
        }
      }
      renderMethodList(result.methods);
      addLog('success', `✅ 메서드 ${result.methods.length}개 로드 완료`);
    } else {
      addLog('error', `❌ 메서드 파싱 실패: ${result.error}`);
      elements.methodList.innerHTML = '<div class="empty-state">메서드를 불러올 수 없습니다</div>';
    }
  } catch (error) {
    addLog('error', `❌ 메서드 파싱 실패: ${error.message}`);
    elements.methodList.innerHTML = '<div class="empty-state">메서드를 불러올 수 없습니다</div>';
  }
}

// 메서드 목록 렌더링
function renderMethodList(methods) {
  if (!elements.methodList) return;
  
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  elements.methodList.innerHTML = '';
  
  if (methods.length === 0) {
    elements.methodList.innerHTML = '<div class="empty-state">사용 가능한 메서드가 없습니다</div>';
    // 전체 선택/해제 버튼 숨기기
    if (elements.selectAllMethodsBtn) elements.selectAllMethodsBtn.style.display = 'none';
    if (elements.deselectAllMethodsBtn) elements.deselectAllMethodsBtn.style.display = 'none';
    return;
  }
  
  // 전체 선택/해제 버튼 표시
  if (elements.selectAllMethodsBtn) elements.selectAllMethodsBtn.style.display = 'block';
  if (elements.deselectAllMethodsBtn) elements.deselectAllMethodsBtn.style.display = 'block';
  
  methods.forEach(method => {
    const item = document.createElement('div');
    item.className = 'method-item';
    item.dataset.methodName = method.name;
    
    item.innerHTML = `
      <div class="method-name">${method.displayName || method.name}</div>
      <div class="method-description">${method.description || ''}</div>
    `;
    
    item.addEventListener('click', () => {
      // 선택 상태 토글
      item.classList.toggle('selected');
      
      // 선택된 메서드 업데이트
      updateSelectedMethods();
    });
    
    elements.methodList.appendChild(item);
  });
  
  // 기존에 선택된 메서드가 있으면 표시, 없으면 모두 선택 (디폴트)
  if (scenarioState.currentManager) {
    const managerIndex = scenarioState.selectedManagers.findIndex(m => m.managerName === scenarioState.currentManager.managerName);
    if (managerIndex >= 0) {
      const selectedMethods = scenarioState.selectedManagers[managerIndex].selectedMethods || [];
      if (selectedMethods.length > 0) {
        // 기존 선택된 메서드가 있으면 그대로 표시
        selectedMethods.forEach(method => {
          const item = elements.methodList.querySelector(`[data-method-name="${method.name}"]`);
          if (item) {
            item.classList.add('selected');
          }
        });
      } else {
        // 선택된 메서드가 없으면 모두 선택 (디폴트)
        selectAllMethods();
      }
    } else {
      // 시나리오 구성에 없는 Manager면 모두 선택 (디폴트)
      selectAllMethods();
    }
  }
}

// 전체 메서드 선택
function selectAllMethods() {
  const methodItems = elements.methodList.querySelectorAll('.method-item');
  methodItems.forEach(item => {
    item.classList.add('selected');
  });
  updateSelectedMethods();
}

// 전체 메서드 해제
function deselectAllMethods() {
  const methodItems = elements.methodList.querySelectorAll('.method-item');
  methodItems.forEach(item => {
    item.classList.remove('selected');
  });
  updateSelectedMethods();
}

// 선택된 메서드 업데이트
function updateSelectedMethods() {
  const scenarioState = getScenarioState();
  if (!scenarioState || !scenarioState.currentManager) return;
  
  const selectedMethodItems = elements.methodList.querySelectorAll('.method-item.selected');
  const selectedMethods = Array.from(selectedMethodItems).map(item => {
    const methodName = item.dataset.methodName;
    return scenarioState.currentMethods.find(m => m.name === methodName);
  }).filter(Boolean);
  
  // 현재 Manager의 선택된 메서드 업데이트
  const managerIndex = scenarioState.selectedManagers.findIndex(m => m.managerName === scenarioState.currentManager.managerName);
  if (managerIndex >= 0) {
    scenarioState.selectedManagers[managerIndex].selectedMethods = selectedMethods;
  }
}

// 드롭 존 설정
function setupDropZone() {
  if (!elements.scenarioSequence) return;
  
  elements.scenarioSequence.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.scenarioSequence.classList.add('drag-over');
  });
  
  elements.scenarioSequence.addEventListener('dragleave', () => {
    elements.scenarioSequence.classList.remove('drag-over');
  });
  
  elements.scenarioSequence.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.scenarioSequence.classList.remove('drag-over');
    
    try {
      const managerData = JSON.parse(e.dataTransfer.getData('manager'));
      addManagerToSequence(managerData);
    } catch (error) {
      addLog('error', `❌ Manager 추가 실패: ${error.message}`);
    }
  });
}

// 시나리오에 Manager 추가
function addManagerToSequence(manager) {
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  // 이미 추가된 Manager인지 확인
  if (scenarioState.selectedManagers.find(m => m.managerName === manager.managerName)) {
    addLog('warning', `⚠️ ${manager.managerName}는 이미 추가되었습니다`);
    return;
  }
  
  // Manager 추가
  const managerWithMethods = {
    ...manager,
    selectedMethods: []
  };
  
  scenarioState.selectedManagers.push(managerWithMethods);
  
  // UI 업데이트
  renderSequence();
  
  addLog('success', `✅ ${manager.managerName} 추가됨`);
}

// 시퀀스 렌더링
function renderSequence() {
  if (!elements.scenarioSequence) return;
  
  const scenarioState = getScenarioState();
  if (!scenarioState) {
    elements.scenarioSequence.innerHTML = `
      <div class="drop-zone-empty" id="emptyDropZone">
        <div class="drop-zone-icon">📦</div>
        <div class="drop-zone-text">제품을 선택하세요</div>
      </div>
    `;
    return;
  }
  
  const emptyZone = elements.scenarioSequence.querySelector('.drop-zone-empty');
  if (emptyZone) {
    emptyZone.remove();
  }
  
  if (scenarioState.selectedManagers.length === 0) {
    elements.scenarioSequence.innerHTML = `
      <div class="drop-zone-empty" id="emptyDropZone">
        <div class="drop-zone-icon">📦</div>
        <div class="drop-zone-text">Manager를 여기에 드래그하세요</div>
      </div>
    `;
    setupDropZone();
    return;
  }
  
  elements.scenarioSequence.innerHTML = '';
  
  scenarioState.selectedManagers.forEach((manager, index) => {
    const item = document.createElement('div');
    item.className = 'sequence-item';
    item.draggable = true;
    item.dataset.managerIndex = index;
    
    // 현재 선택된 Manager인지 확인하여 selected 클래스 추가
    if (scenarioState.currentManager && scenarioState.currentManager.managerName === manager.managerName) {
      item.classList.add('selected');
    }
    
    // 파일의 첫 번째 줄 설명 표시 (메서드 선택 여부와 관계없이)
    const description = manager.description || '메서드를 선택하세요';
    
    // Manager 이름을 풀네임으로 표시
    const displayName = manager.managerName;
    
    item.innerHTML = `
      <div class="sequence-item-header">
        <div class="sequence-item-number">${index + 1}</div>
        <div class="sequence-item-info">
          <div class="sequence-item-name">${displayName}</div>
          <div class="sequence-item-methods">${description}</div>
        </div>
      </div>
      <div class="sequence-item-actions">
        <button class="sequence-item-btn edit" onclick="editManagerMethods(${index})">메서드 선택</button>
        <button class="sequence-item-btn delete" onclick="removeManagerFromSequence(${index})">삭제</button>
      </div>
    `;
    
    // 항목 클릭 이벤트 (버튼 제외) - 메서드 선택 목록 표시
    item.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      
      // 메서드 선택 목록 표시
      editManagerMethods(index);
    });
    
    // 드래그 이벤트
    let draggedIndex = null;
    
    item.addEventListener('dragstart', (e) => {
      draggedIndex = index;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedIndex = null;
      // 모든 drag-over 클래스 제거
      elements.scenarioSequence.querySelectorAll('.sequence-item').forEach(i => i.classList.remove('drag-over'));
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedIndex !== null && draggedIndex !== index) {
        item.classList.add('drag-over');
      }
    });
    
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const scenarioState = getScenarioState();
        if (scenarioState && sourceIndex !== index && sourceIndex >= 0 && sourceIndex < scenarioState.selectedManagers.length) {
          // 순서 변경
          const [draggedItem] = scenarioState.selectedManagers.splice(sourceIndex, 1);
          scenarioState.selectedManagers.splice(index, 0, draggedItem);
          renderSequence();
          addLog('info', `🔄 Manager 순서 변경됨`);
        }
    });
    
    elements.scenarioSequence.appendChild(item);
  });
}

// 선택된 파일 목록의 Manager들을 시나리오 구성에 추가
async function addSelectedManagersToScenario() {
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  const selectedCheckboxes = elements.managerList.querySelectorAll('.manager-checkbox:checked:not(:disabled)');
  
  if (selectedCheckboxes.length === 0) {
    addLog('warning', '⚠️ 추가할 파일을 선택하세요');
    return;
  }
  
  for (const checkbox of selectedCheckboxes) {
    const card = checkbox.closest('.manager-card');
    const managerName = card.dataset.managerName;
    const filePath = card.dataset.filePath;
    
    // 이미 추가된 Manager인지 확인
    if (scenarioState.selectedManagers.find(m => m.managerName === managerName)) {
      continue;
    }
    
    // Manager 추가
    const manager = scenarioState.managers.find(m => m.managerName === managerName);
    if (manager) {
      // description을 가져오기 위해 파일을 파싱
      const parseResult = await electronAPI.parseManagerMethods(filePath);
      const managerWithMethods = {
        ...manager,
        selectedMethods: [],
        description: parseResult.success && parseResult.description ? parseResult.description : ''
      };
      scenarioState.selectedManagers.push(managerWithMethods);
    }
  }
  
  // UI 업데이트
  renderSequence();
  renderManagerList(scenarioState.managers);
  
  addLog('success', `✅ ${selectedCheckboxes.length}개 파일이 시나리오 구성에 추가되었습니다`);
}

// 선택된 시나리오 구성의 Manager들을 제거
function removeSelectedManagersFromScenario() {
  const selectedCheckboxes = elements.scenarioSequence.querySelectorAll('.sequence-checkbox:checked');
  
  if (selectedCheckboxes.length === 0) {
    addLog('warning', '⚠️ 제거할 항목을 선택하세요');
    return;
  }
  
  // 역순으로 제거 (인덱스 변경 방지)
  const indicesToRemove = Array.from(selectedCheckboxes).map(checkbox => {
    const item = checkbox.closest('.sequence-item');
    return parseInt(item.dataset.managerIndex);
  }).sort((a, b) => b - a);
  
  indicesToRemove.forEach(index => {
    scenarioState.selectedManagers.splice(index, 1);
  });
  
  // UI 업데이트
  renderSequence();
  renderManagerList(scenarioState.managers);
  
  addLog('info', `🗑️ ${indicesToRemove.length}개 항목이 시나리오 구성에서 제거되었습니다`);
}

// ▶ 버튼 상태 업데이트
function updateAddToScenarioButton() {
  const addBtn = document.getElementById('addToScenarioBtn');
  if (!addBtn) return;
  
  const selectedCount = elements.managerList.querySelectorAll('.manager-checkbox:checked:not(:disabled)').length;
  addBtn.disabled = selectedCount === 0;
  addBtn.title = selectedCount > 0 ? `선택한 ${selectedCount}개 파일을 시나리오 구성에 추가` : '추가할 파일을 선택하세요';
}

// 로그창 접기/펼치기
function toggleLogSection() {
  const logSection = document.querySelector('.log-section');
  const toggleBtn = document.getElementById('toggleLogBtn');
  
  if (!logSection || !toggleBtn) return;
  
  const isCollapsed = logSection.classList.contains('collapsed');
  
  if (isCollapsed) {
    logSection.classList.remove('collapsed');
    toggleBtn.textContent = '▼';
    toggleBtn.title = '로그창 접기';
  } else {
    logSection.classList.add('collapsed');
    toggleBtn.textContent = '▲';
    toggleBtn.title = '로그창 펼치기';
  }
}


// Manager 메서드 편집
window.editManagerMethods = async function(index) {
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  const manager = scenarioState.selectedManagers[index];
  if (!manager) return;
  
  // 현재 Manager 설정
  scenarioState.currentManager = manager;
  
  // 메서드 로드 (description도 함께 가져옴)
  await loadManagerMethods(manager.filePath);
  
  // 시퀀스 다시 렌더링하여 description 표시 업데이트
  renderSequence();
};

// 시퀀스에서 Manager 제거
window.removeManagerFromSequence = function(index) {
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  scenarioState.selectedManagers.splice(index, 1);
  renderSequence();
  // 파일 목록 체크박스 즉시 리프레시
  renderManagerList(scenarioState.managers);
  addLog('info', `🗑️ Manager 제거됨`);
};

// 시나리오 초기화 확인 모달 표시
function resetScenario() {
  if (elements.resetConfirmModal) {
    elements.resetConfirmModal.classList.remove('hidden');
  }
}

// 시나리오 초기화 실행
function performReset() {
  const scenarioState = getScenarioState();
  if (!scenarioState) return;
  
  // 시나리오 구성 초기화
  scenarioState.selectedManagers = [];
  scenarioState.currentManager = null;
  scenarioState.currentMethods = [];
  
  // UI 초기화
  renderSequence();
  if (elements.methodList) {
    elements.methodList.innerHTML = '<div class="empty-state">Manager를 선택하세요</div>';
  }
  
  // 파일 목록 체크박스 리프레시
  if (scenarioState.managers && scenarioState.managers.length > 0) {
    renderManagerList(scenarioState.managers);
  }
  
  addLog('info', '🔄 시나리오 구성이 초기화되었습니다');
}

// 성공 모달 표시
function showSuccessModal(scenarioNumber, filePath) {
  if (!elements.successModal || !elements.successModalMessage || !elements.successModalPath) return;
  
  elements.successModalMessage.textContent = `시나리오 ${scenarioNumber} spec 파일이 생성되었습니다!`;
  elements.successModalPath.textContent = filePath;
  elements.successModal.classList.add('show');
}

// 시나리오 생성 모달 열기
async function openScenarioInfoModal() {
  const scenarioState = getScenarioState();
  if (!scenarioState) {
    addLog('error', '❌ 제품을 선택하세요');
    return;
  }
  
  if (scenarioState.selectedManagers.length === 0) {
    addLog('error', '❌ 최소 1개 이상의 Manager를 추가하세요');
    return;
  }
  
  // 메서드가 선택되지 않은 Manager 확인
  const managersWithoutMethods = scenarioState.selectedManagers.filter(m => m.selectedMethods.length === 0);
  if (managersWithoutMethods.length > 0) {
    addLog('warning', `⚠️ 메서드가 선택되지 않은 Manager: ${managersWithoutMethods.map(m => m.managerName).join(', ')}`);
  }
  
  // 다음 사용 가능한 시나리오 번호 자동 설정
  let suggestedNumber = null;
  try {
    addLog('info', '🔍 다음 사용 가능한 시나리오 번호 검색 중...');
    const result = await electronAPI.getNextAvailableScenarioNumber(config.currentProduct);
    if (result.success) {
      suggestedNumber = result.nextNumber;
      if (elements.modalScenarioNumber) {
        elements.modalScenarioNumber.value = result.nextNumber;
        elements.modalScenarioNumber.dataset.suggestedNumber = result.nextNumber;
      }
      addLog('success', `✅ 다음 사용 가능한 번호: ${result.nextNumber}`);
    }
  } catch (error) {
    addLog('warning', `⚠️ 시나리오 번호 자동 설정 실패: ${error.message}`);
  }
  
  // 모달 필드 초기화
  if (elements.modalScenarioTitle) elements.modalScenarioTitle.value = '';
  if (elements.modalScenarioDescription) elements.modalScenarioDescription.value = '';
  
  // 시나리오 번호 입력 시 유효성 검사
  if (elements.modalScenarioNumber) {
    elements.modalScenarioNumber.addEventListener('input', async function() {
      const enteredNumber = parseInt(this.value);
      if (!enteredNumber || enteredNumber < 1) {
        this.style.borderColor = '';
        return;
      }
      
      // 중복 체크
      try {
        const checkResult = await electronAPI.checkScenarioExists({
          product: config.currentProduct,
          scenarioNumber: enteredNumber
        });
        
        if (checkResult.exists) {
          this.style.borderColor = '#e74c3c';
          this.title = `시나리오 ${enteredNumber}은(는) 이미 존재합니다.`;
        } else {
          this.style.borderColor = '#27ae60';
          this.title = `시나리오 ${enteredNumber}을(를) 사용할 수 있습니다.`;
        }
      } catch (error) {
        this.style.borderColor = '';
      }
    });
  }
  
  // 모달 표시
  if (elements.scenarioInfoModal) {
    elements.scenarioInfoModal.classList.remove('hidden');
  }
}

// 시나리오 생성 모달 닫기
function closeScenarioInfoModal() {
  if (elements.scenarioInfoModal) {
    elements.scenarioInfoModal.classList.add('hidden');
  }
  // 임시 저장된 Manager 정보 초기화
  window.tempManagerClassName = null;
}

// 시나리오 생성 확인
async function confirmGenerateScenario() {
  let scenarioNumber = elements.modalScenarioNumber?.value;
  
  // 시나리오 번호가 비어있으면 자동으로 다음 번호 가져오기
  if (!scenarioNumber) {
    try {
      const result = await electronAPI.getNextAvailableScenarioNumber(config.currentProduct);
      if (result.success) {
        scenarioNumber = result.nextNumber.toString();
        addLog('info', `✅ 시나리오 번호 자동 설정: ${scenarioNumber}`);
      } else {
        addLog('error', '❌ 시나리오 번호를 설정할 수 없습니다.');
        return;
      }
    } catch (error) {
      addLog('error', `❌ 시나리오 번호 자동 설정 실패: ${error.message}`);
      return;
    }
  }
  
  // 시나리오 번호 중복 체크
  try {
    const checkResult = await electronAPI.checkScenarioExists({
      product: config.currentProduct,
      scenarioNumber: parseInt(scenarioNumber)
    });
    
    if (checkResult.exists) {
      addLog('error', `❌ 시나리오 ${scenarioNumber}은(는) 이미 존재합니다. 다른 번호를 사용하세요.`);
      // 모달 다시 표시
      if (elements.scenarioInfoModal) {
        elements.scenarioInfoModal.classList.remove('hidden');
      }
      if (elements.modalScenarioNumber) {
        elements.modalScenarioNumber.style.borderColor = '#e74c3c';
        elements.modalScenarioNumber.focus();
      }
      return;
    } else {
      if (elements.modalScenarioNumber) {
        elements.modalScenarioNumber.style.borderColor = '';
      }
    }
  } catch (error) {
    addLog('warning', `⚠️ 파일 존재 여부 확인 실패: ${error.message}`);
  }
  
  const scenarioState = getScenarioState();
  if (!scenarioState || scenarioState.selectedManagers.length === 0) {
    addLog('error', '❌ Manager가 선택되지 않았습니다.');
    closeScenarioInfoModal();
    return;
  }
  
  // 시나리오 제목과 설명 가져오기
  const scenarioTitle = elements.modalScenarioTitle?.value?.trim() || '';
  const scenarioDescription = elements.modalScenarioDescription?.value?.trim() || '';
  
  // 모달 닫기
  closeScenarioInfoModal();
  
  addLog('info', `📋 시나리오 ${scenarioNumber} 생성 중...`);
  if (elements.generateScenarioBtn) {
    elements.generateScenarioBtn.disabled = true;
    elements.generateScenarioBtn.textContent = '⏳ 생성 중...';
  }
  
  try {
    const result = await electronAPI.generateScenarioSpec({
      product: config.currentProduct,
      scenarioNumber: parseInt(scenarioNumber),
      scenarioTitle: scenarioTitle,
      scenarioDescription: scenarioDescription,
      managers: scenarioState.selectedManagers,
      templateScenario: 1 // 항상 scenario-1.spec.js 참조
    });
    
    if (result.success) {
      addLog('success', `✅ ${result.message}`);
      addLog('info', `📂 파일 경로: ${result.filePath}`);
      
      // 성공 모달 표시
      showSuccessModal(scenarioNumber, result.filePath);
    } else {
      addLog('error', `❌ 시나리오 생성 실패: ${result.error}`);
    }
  } catch (error) {
    addLog('error', `❌ 시나리오 생성 실패: ${error.message}`);
  } finally {
    if (elements.generateScenarioBtn) {
      elements.generateScenarioBtn.disabled = false;
      elements.generateScenarioBtn.textContent = '✅ 시나리오 생성';
    }
  }
}

// ============================================================================
// 신규: 테스트 유형 선택 화면 관련 함수
// ============================================================================

// 테스트 유형 선택 화면 표시
function showTestTypeSelection(productName) {
  console.log('🎯 showTestTypeSelection 호출됨:', productName);
  
  // 1. 메인 콘텐츠 숨김
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.display = 'none';
    console.log('✅ 메인 콘텐츠 숨김');
  } else {
    console.error('❌ main-content 요소를 찾을 수 없습니다');
  }
  
  // 2. 테스트 유형 선택 화면 표시 (클래스 제거하면 CSS에서 flex로 표시됨)
  const testTypeScreen = document.getElementById('testTypeSelectionScreen');
  if (testTypeScreen) {
    testTypeScreen.classList.remove('hidden'); // hidden 클래스 제거 → display: flex로 표시
    console.log('✅ 테스트 유형 선택 화면 표시');
  } else {
    console.error('❌ testTypeSelectionScreen 요소를 찾을 수 없습니다');
  }
  
  // 3. 제품명 표시
  const productNameElement = document.getElementById('selectedProductName');
  if (productNameElement) {
    productNameElement.textContent = productName;
    console.log('✅ 제품명 설정:', productName);
  } else {
    console.error('❌ selectedProductName 요소를 찾을 수 없습니다');
  }
  
  addLog('info', '🎯 테스트 유형을 선택하세요');
  console.log('🎯 showTestTypeSelection 완료 - 테스트 유형 화면이 보여야 합니다!');
}

// 테스트 유형 선택 (전역 함수로 HTML에서 접근)
window.selectTestType = function(testType) {
  console.log('🟣 selectTestType 호출:', testType);
  
  if (testType === 'api') {
    addLog('warning', '⚠️ API 테스트는 아직 개발 중입니다');
    console.log('⚠️ API 테스트는 개발 중');
    return;
  }
  
  if (testType === 'ui') {
    console.log('🟣 UI 테스트 모드로 전환 시작');
    
    // 1. 테스트 유형 선택 화면 숨김
    const testTypeScreen = document.getElementById('testTypeSelectionScreen');
    if (testTypeScreen) {
      testTypeScreen.classList.add('hidden'); // hidden 클래스 추가 → display: none
      console.log('✅ 테스트 유형 화면 숨김');
    }
    
    // 2. 메인 콘텐츠 표시 (탭 화면)
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'flex';
      console.log('✅ 메인 콘텐츠(탭 화면) 표시');
    }
    
    addLog('success', `✅ UI 테스트 모드로 진입했습니다`);
    
    // 3. 시나리오 빌더 탭이 활성화되어 있으면 Manager 목록 로드
    const scenarioTab = document.getElementById('scenarioTab');
    if (scenarioTab && scenarioTab.classList.contains('active')) {
      console.log('📋 시나리오 빌더 Manager 목록 로드');
      loadManagers();
    }
    
    console.log('🟣 UI 테스트 모드 전환 완료 - 탭 화면이 보여야 합니다!');
  }
};

// Manager 목록 새로고침
// Manager 목록을 Select Box에 로드
let managerListData = []; // 전역 변수로 Manager 목록 저장

async function refreshManagerList() {
  try {
    const managers = await electronAPI.getManagerList({ product: config.currentProduct });
    
    // 전역 변수에 저장
    managerListData = managers || [];
    
    // Manager 섹션 항상 표시
    elements.managerSelectSection.style.display = 'block';
    
    if (!managers || managers.length === 0) {
      // Manager가 없을 때
      elements.managerSelect.innerHTML = '<option value="">-- 아직 녹화된 Manager가 없습니다 --</option>';
      elements.managerSelect.disabled = true;
      elements.createScenarioBtn.disabled = true;
      
      // 안내 메시지 추가
      if (!elements.managerInfo.textContent.includes('녹화를 먼저')) {
        elements.managerInfo.textContent = '💡 위의 "일반 모드"로 녹화를 먼저 진행하세요.';
        elements.managerInfo.style.color = 'var(--text-secondary)';
      }
      
      addLog('info', `📦 ${config.currentProduct} Manager 없음 - 녹화 필요`);
      return;
    }
    
    // Manager가 있을 때
    elements.managerSelect.disabled = false;
    
    // Select Box 옵션 업데이트
    elements.managerSelect.innerHTML = '<option value="">-- Manager를 선택하세요 --</option>' +
      managers.map(m => `
        <option value="${m.className}" 
                data-title="${m.title}" 
                data-steps="${m.stepCount}"
                data-date="${m.createdAt}"
                data-filename="${m.fileName}">
          ${m.className}
        </option>
      `).join('');
    
    addLog('info', `📦 Manager 목록 로드 완료: ${managers.length}개`);
    
  } catch (error) {
    console.error('Manager 목록 로드 실패:', error);
    addLog('error', `❌ Manager 목록 로드 실패: ${error.message}`);
  }
}

// 시나리오 히스토리 저장 (LocalStorage)
let scenarioHistory = [];

function loadScenarioHistory() {
  try {
    const saved = localStorage.getItem(`scenarioHistory_${config.currentProduct}`);
    scenarioHistory = saved ? JSON.parse(saved) : [];
    updateScenarioHistoryUI();
  } catch (error) {
    console.error('시나리오 히스토리 로드 실패:', error);
    scenarioHistory = [];
  }
}

function saveScenarioHistory() {
  try {
    localStorage.setItem(`scenarioHistory_${config.currentProduct}`, JSON.stringify(scenarioHistory));
    updateScenarioHistoryUI();
  } catch (error) {
    console.error('시나리오 히스토리 저장 실패:', error);
  }
}

function updateScenarioHistoryUI() {
  if (scenarioHistory.length === 0) {
    elements.scenarioHistorySection.style.display = 'none';
    return;
  }
  
  elements.scenarioHistorySection.style.display = 'block';
  elements.scenarioHistory.innerHTML = scenarioHistory
    .sort((a, b) => b.scenarioNumber - a.scenarioNumber) // 최신순
    .map(item => `
      <div class="scenario-item">
        <div class="scenario-item-info">
          <div class="scenario-item-title">시나리오 ${item.scenarioNumber}: ${item.title}</div>
          <div class="scenario-item-meta">
            Manager: ${item.managerClassName} | 생성: ${new Date(item.createdAt).toLocaleString('ko-KR')}
          </div>
        </div>
        <span class="scenario-item-badge">생성 완료</span>
      </div>
    `).join('');
}

// 시나리오 생성 (Select Box 기반)
async function createScenario() {
  // elements.managerSelect가 없거나 값이 없으면 오류 처리
  if (!elements.managerSelect) {
    addLog('error', '❌ Manager 선택 요소를 찾을 수 없습니다.');
    showModal('알림', 'Manager 선택 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.', false);
    return;
  }
  
  const selectedManager = elements.managerSelect.value;
  
  if (!selectedManager) {
    showModal('알림', 'Manager를 먼저 선택해주세요.', false);
    return;
  }
  
  // 시나리오 정보 입력 모달 표시
  await openScenarioCreationModal(selectedManager);
}

// 시나리오 생성 모달 열기 (Manager 선택 후)
async function openScenarioCreationModal(managerClassName) {
  // 다음 사용 가능한 시나리오 번호 자동 설정
  let suggestedNumber = null;
  try {
    addLog('info', '🔍 다음 사용 가능한 시나리오 번호 검색 중...');
    const result = await electronAPI.getNextAvailableScenarioNumber(config.currentProduct);
    if (result.success) {
      suggestedNumber = result.nextNumber;
      if (elements.modalScenarioNumber) {
        elements.modalScenarioNumber.value = result.nextNumber;
        elements.modalScenarioNumber.dataset.suggestedNumber = result.nextNumber;
      }
      addLog('success', `✅ 다음 사용 가능한 번호: ${result.nextNumber}`);
    }
  } catch (error) {
    addLog('warning', `⚠️ 시나리오 번호 자동 설정 실패: ${error.message}`);
  }
  
  // 모달 필드 초기화
  if (elements.modalScenarioTitle) elements.modalScenarioTitle.value = '';
  if (elements.modalScenarioDescription) elements.modalScenarioDescription.value = '';
  
  // 시나리오 번호 입력 시 유효성 검사
  if (elements.modalScenarioNumber) {
    // 기존 이벤트 리스너 제거 (중복 방지)
    elements.modalScenarioNumber.replaceWith(elements.modalScenarioNumber.cloneNode(true));
    elements.modalScenarioNumber = document.getElementById('modalScenarioNumber');
    elements.modalScenarioNumber.value = suggestedNumber || '';
    
    elements.modalScenarioNumber.addEventListener('input', async function() {
      const enteredNumber = parseInt(this.value);
      if (!enteredNumber || enteredNumber < 1) {
        this.style.borderColor = '';
        return;
      }
      
      // 중복 체크
      try {
        const checkResult = await electronAPI.checkScenarioExists({
          product: config.currentProduct,
          scenarioNumber: enteredNumber
        });
        
        if (checkResult.exists) {
          this.style.borderColor = '#e74c3c';
          this.title = `시나리오 ${enteredNumber}은(는) 이미 존재합니다.`;
        } else {
          this.style.borderColor = '#27ae60';
          this.title = `시나리오 ${enteredNumber}을(를) 사용할 수 있습니다.`;
        }
      } catch (error) {
        this.style.borderColor = '';
      }
    });
  }
  
  // managerClassName을 임시로 저장 (confirmCreateScenarioFromManager에서 사용)
  window.tempManagerClassName = managerClassName;
  
  // 모달 표시
  if (elements.scenarioInfoModal) {
    elements.scenarioInfoModal.classList.remove('hidden');
  }
}

// Manager에서 시나리오 생성 확인
async function confirmCreateScenarioFromManager() {
  const managerClassName = window.tempManagerClassName;
  if (!managerClassName) {
    addLog('error', '❌ Manager가 선택되지 않았습니다.');
    closeScenarioInfoModal();
    return;
  }
  
  let scenarioNumber = elements.modalScenarioNumber?.value;
  
  // 시나리오 번호가 비어있으면 자동으로 다음 번호 가져오기
  if (!scenarioNumber) {
    try {
      const result = await electronAPI.getNextAvailableScenarioNumber(config.currentProduct);
      if (result.success) {
        scenarioNumber = result.nextNumber.toString();
        addLog('info', `✅ 시나리오 번호 자동 설정: ${scenarioNumber}`);
      } else {
        addLog('error', '❌ 시나리오 번호를 설정할 수 없습니다.');
        return;
      }
    } catch (error) {
      addLog('error', `❌ 시나리오 번호 자동 설정 실패: ${error.message}`);
      return;
    }
  }
  
  // 시나리오 번호 중복 체크
  try {
    const checkResult = await electronAPI.checkScenarioExists({
      product: config.currentProduct,
      scenarioNumber: parseInt(scenarioNumber)
    });
    
    if (checkResult.exists) {
      addLog('error', `❌ 시나리오 ${scenarioNumber}은(는) 이미 존재합니다. 다른 번호를 사용하세요.`);
      // 모달 다시 표시
      if (elements.scenarioInfoModal) {
        elements.scenarioInfoModal.classList.remove('hidden');
      }
      if (elements.modalScenarioNumber) {
        elements.modalScenarioNumber.style.borderColor = '#e74c3c';
        elements.modalScenarioNumber.focus();
      }
      return;
    } else {
      if (elements.modalScenarioNumber) {
        elements.modalScenarioNumber.style.borderColor = '';
      }
    }
  } catch (error) {
    addLog('warning', `⚠️ 파일 존재 여부 확인 실패: ${error.message}`);
  }
  
  // 시나리오 제목과 설명 가져오기
  const scenarioTitle = elements.modalScenarioTitle?.value?.trim() || '';
  const scenarioDescription = elements.modalScenarioDescription?.value?.trim() || '';
  
  // 모달 닫기
  closeScenarioInfoModal();
  
  try {
    addLog('info', `🔄 시나리오 생성 중: ${managerClassName}`);
    
    const result = await electronAPI.createScenarioFromManager({
      managerClassName: managerClassName,
      product: config.currentProduct,
      scenarioNumber: parseInt(scenarioNumber),
      scenarioTitle: scenarioTitle,
      scenarioDescription: scenarioDescription
    });
    
    addLog('success', `✅ 시나리오 ${result.scenarioNumber} 생성 완료!`);
    addLog('success', `📋 제목: ${result.scenarioTitle}`);
    addLog('info', `📁 ${result.scenarioFile}`);
    addLog('info', `🎯 ${config.currentProduct} UI 테스트 화면의 "시나리오 목록"에서 확인하세요!`);
    
    // 히스토리에 추가
    scenarioHistory.push({
      managerClassName: managerClassName,  // selectedManager → managerClassName으로 수정
      scenarioNumber: result.scenarioNumber,
      title: result.scenarioTitle,
      createdAt: new Date().toISOString()
    });
    saveScenarioHistory();
    
    // 성공 알림
    await showModal(
      '✅ 생성 완료', 
      `시나리오 ${result.scenarioNumber} 생성 완료!`,
      false
    );
    
  } catch (error) {
    console.error('시나리오 생성 실패:', error);
    addLog('error', `❌ 시나리오 생성 실패: ${error.message}`);
    await showModal('❌ 생성 실패', `시나리오 생성에 실패했습니다:\n${error.message}`, false);
  }
}

/**
 * 커스텀 모달 표시
 * @param {string} title - 모달 제목
 * @param {string} message - 모달 메시지
 * @param {boolean} showCancel - 취소 버튼 표시 여부
 * @returns {Promise<boolean>} - 확인 클릭 시 true, 취소 클릭 시 false
 */
function showModal(title, message, showCancel = false) {
  return new Promise((resolve) => {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    cancelBtn.style.display = showCancel ? 'block' : 'none';
    
    modal.classList.add('show');
    
    const handleConfirm = () => {
      modal.classList.remove('show');
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      modal.classList.remove('show');
      cleanup();
      resolve(false);
    };
    
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      modal.removeEventListener('click', handleBackdropClick);
    };
    
    const handleBackdropClick = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleBackdropClick);
  });
}

// createScenario는 이제 이벤트 리스너로만 호출됨

/**
 * Manager의 Unique 값 관리
 */
async function manageUniqueValues() {
  const selectedManager = elements.managerSelect.value;
  
  if (!selectedManager) {
    addLog('error', '❌ Manager를 먼저 선택하세요');
    return;
  }
  
  try {
    addLog('info', `🔑 ${selectedManager}의 Unique 값 설정을 불러옵니다...`);
    
    // Manager 파일 내용 읽기
    const result = await electronAPI.getManagerList({ product: config.currentProduct });
    const managerData = result.find(m => m.className === selectedManager);
    
    if (!managerData) {
      addLog('error', '❌ Manager 파일을 찾을 수 없습니다');
      return;
    }
    
    // Manager 파일 파싱하여 fill 값들 추출
    const parseResult = await electronAPI.parseManagerFillValues(managerData.filePath);
    
    if (!parseResult.success) {
      addLog('error', `❌ Manager 파일 파싱 실패: ${parseResult.error}`);
      return;
    }
    
    const fillValues = parseResult.fillValues;
    
    if (fillValues.length === 0) {
      addLog('info', '📝 이 Manager에는 입력 값이 없습니다.');
      return;
    }
    
    // 기존 unique 값 설정 로드
    const uniqueResult = await electronAPI.loadUniqueValues(selectedManager);
    const existingUniqueValues = uniqueResult.uniqueValues || [];
    
    addLog('info', `📝 ${fillValues.length}개의 입력 값을 발견했습니다.`);
    if (existingUniqueValues.length > 0) {
      addLog('info', `🔑 현재 ${existingUniqueValues.length}개의 Unique 값이 설정되어 있습니다.`);
    }
    
    // Unique 값 선택 모달 열기 (기존 설정 표시)
    openUniqueValuesModalWithExisting(selectedManager, fillValues, existingUniqueValues);
    
  } catch (error) {
    addLog('error', `❌ Unique 값 관리 중 오류: ${error.message}`);
    console.error('Unique 값 관리 실패:', error);
  }
}

/**
 * Manager 클래스 삭제
 */
async function deleteManager() {
  const selectedManager = elements.managerSelect.value;
  
  if (!selectedManager) {
    addLog('error', '❌ Manager를 먼저 선택하세요');
    return;
  }
  
  const confirmed = confirm(`정말로 "${selectedManager}" Manager 클래스를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 다음 항목들이 삭제됩니다:\n- Manager .js 파일\n- Unique 값 설정\n- 관련 카운터 정보\n\n계속하시겠습니까?`);
  
  if (!confirmed) {
    return;
  }
  
  try {
    addLog('info', `🗑️ ${selectedManager} 삭제 중...`);
    
    const result = await electronAPI.deleteManager({ 
      product: config.currentProduct, 
      className: selectedManager 
    });
    
    if (result.success) {
      addLog('success', `✅ ${selectedManager}이(가) 삭제되었습니다`);
      
      // Manager 목록 새로고침
      await loadManagerList();
      
      // 선택 초기화
      elements.managerSelect.value = '';
      elements.managerInfo.textContent = '';
      elements.createScenarioBtn.disabled = true;
      elements.manageUniqueValuesBtn.disabled = true;
      elements.deleteManagerBtn.disabled = true;
    } else {
      addLog('error', `❌ Manager 삭제 실패: ${result.error}`);
    }
  } catch (error) {
    addLog('error', `❌ Manager 삭제 중 오류: ${error.message}`);
    console.error('Manager 삭제 실패:', error);
  }
}

/**
 * 기존 설정을 포함하여 Unique 값 선택 모달 열기
 */
function openUniqueValuesModalWithExisting(className, fillValues, existingUniqueValues) {
  currentUniqueValuesData = {
    className,
    fillValues,
    selectedIndices: []
  };

  // 기존 설정에 따라 선택 인덱스 설정
  existingUniqueValues.forEach(existing => {
    const index = fillValues.findIndex(fv => 
      fv.fieldName === existing.fieldName && fv.value === existing.value
    );
    if (index >= 0) {
      currentUniqueValuesData.selectedIndices.push(index);
    }
  });

  // 모달 내용 생성
  const listContainer = elements.uniqueValuesList;
  listContainer.innerHTML = fillValues.map((item, index) => {
    const isSelected = currentUniqueValuesData.selectedIndices.includes(index);
    return `
      <div class="unique-value-item ${isSelected ? 'selected' : ''}" data-index="${index}">
        <input type="checkbox" class="unique-value-checkbox" id="unique-checkbox-${index}" data-index="${index}" ${isSelected ? 'checked' : ''}>
        <div class="unique-value-content">
          <div class="unique-value-field">
            ${item.fieldLabel || item.fieldName}
          </div>
          <div class="unique-value-value">
            값: <code>${item.value}</code>
          </div>
          <div class="unique-value-preview">
            선택 시 → <code>${item.value}_001</code>, <code>${item.value}_002</code> ...
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 체크박스 이벤트 연결
  listContainer.querySelectorAll('.unique-value-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleUniqueValueToggle);
  });

  // 아이템 클릭 이벤트 연결
  listContainer.querySelectorAll('.unique-value-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const index = parseInt(item.dataset.index);
        const checkbox = document.getElementById(`unique-checkbox-${index}`);
        checkbox.checked = !checkbox.checked;
        handleUniqueValueToggle({ target: checkbox });
      }
    });
  });

  // 모달 표시
  elements.uniqueValuesModal.classList.remove('hidden');
  
  addLog('info', '🔑 Unique 값 관리 모달이 열렸습니다. 중복 방지가 필요한 값을 선택하세요.');
}

// ============================================================================
// Unique 값 선택 모달 관련 함수
// ============================================================================

/**
 * Unique 값 선택 모달 열기
 */
function openUniqueValuesModal(className, fillValues) {
  if (!fillValues || fillValues.length === 0) {
    addLog('info', '📝 입력된 값이 없어 Unique 값 선택을 건너뜁니다.');
    return;
  }

  currentUniqueValuesData = {
    className,
    fillValues,
    selectedIndices: []
  };

  // 모달 내용 생성
  const listContainer = elements.uniqueValuesList;
  listContainer.innerHTML = fillValues.map((item, index) => `
    <div class="unique-value-item" data-index="${index}">
      <input type="checkbox" class="unique-value-checkbox" id="unique-checkbox-${index}" data-index="${index}">
      <div class="unique-value-content">
        <div class="unique-value-field">
          ${item.fieldLabel || item.fieldName}
        </div>
        <div class="unique-value-value">
          값: <code>${item.value}</code>
        </div>
        <div class="unique-value-preview">
          선택 시 → <code>${item.value}_001</code>, <code>${item.value}_002</code> ...
        </div>
      </div>
    </div>
  `).join('');

  // 체크박스 이벤트 연결
  listContainer.querySelectorAll('.unique-value-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleUniqueValueToggle);
  });

  // 아이템 클릭 이벤트 연결
  listContainer.querySelectorAll('.unique-value-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const index = parseInt(item.dataset.index);
        const checkbox = document.getElementById(`unique-checkbox-${index}`);
        checkbox.checked = !checkbox.checked;
        handleUniqueValueToggle({ target: checkbox });
      }
    });
  });

  // 모달 표시
  elements.uniqueValuesModal.classList.remove('hidden');
  
  addLog('info', '🔑 Unique 값 선택 모달이 열렸습니다. 중복 방지가 필요한 값을 선택하세요.');
}

/**
 * Unique 값 체크박스 토글
 */
function handleUniqueValueToggle(e) {
  const checkbox = e.target;
  const index = parseInt(checkbox.dataset.index);
  const item = checkbox.closest('.unique-value-item');
  
  if (checkbox.checked) {
    item.classList.add('selected');
    if (!currentUniqueValuesData.selectedIndices.includes(index)) {
      currentUniqueValuesData.selectedIndices.push(index);
    }
  } else {
    item.classList.remove('selected');
    currentUniqueValuesData.selectedIndices = currentUniqueValuesData.selectedIndices.filter(i => i !== index);
  }
}

/**
 * Unique 값 선택 완료
 */
async function saveUniqueValues() {
  try {
    const selectedValues = currentUniqueValuesData.selectedIndices.map(index => 
      currentUniqueValuesData.fillValues[index]
    );

    if (selectedValues.length > 0) {
      addLog('info', `🔑 ${selectedValues.length}개의 Unique 값을 저장합니다...`);
      
      // electronAPI를 통해 저장 (main.js의 save-unique-values 핸들러 호출)
      const result = await electronAPI.saveUniqueValues({
        className: currentUniqueValuesData.className,
        uniqueValues: selectedValues
      });
      
      if (result.success) {
        addLog('success', `✅ ${selectedValues.length}개의 Unique 값이 설정되었습니다.`);
        
        // 선택된 값 표시
        selectedValues.forEach((val, idx) => {
          addLog('info', `   ${idx + 1}. [${val.fieldLabel}] "${val.value}" → "${val.value}_001", "${val.value}_002" ...`);
        });
      } else {
        addLog('error', `❌ Unique 값 저장 실패: ${result.error}`);
      }
    } else {
      addLog('info', '📝 선택된 Unique 값이 없습니다. 모든 값이 원본 그대로 사용됩니다.');
    }
    
    closeUniqueValuesModal();
  } catch (error) {
    addLog('error', `❌ Unique 값 저장 중 오류: ${error.message}`);
    console.error('Unique 값 저장 실패:', error);
  }
}

/**
 * Unique 값 선택 모달 닫기
 */
function closeUniqueValuesModal() {
  elements.uniqueValuesModal.classList.add('hidden');
  
  // 데이터 초기화
  currentUniqueValuesData = {
    className: '',
    fillValues: [],
    selectedIndices: []
  };
  
  // 이벤트 리스너 제거
  elements.uniqueValuesList.innerHTML = '';
}

/**
 * Unique 값 선택 건너뛰기
 */
function skipUniqueValues() {
  addLog('info', '⏭️ Unique 값 선택을 건너뛰었습니다. 모든 값이 원본 그대로 사용됩니다.');
  closeUniqueValuesModal();
}

// Unique 값 모달 이벤트 리스너 연결
if (elements.closeUniqueValuesBtn) {
  elements.closeUniqueValuesBtn.addEventListener('click', skipUniqueValues);
}

if (elements.skipUniqueValuesBtn) {
  elements.skipUniqueValuesBtn.addEventListener('click', skipUniqueValues);
}

if (elements.saveUniqueValuesBtn) {
  elements.saveUniqueValuesBtn.addEventListener('click', saveUniqueValues);
}

// 앱 시작
init();

