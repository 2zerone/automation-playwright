const { contextBridge, ipcRenderer } = require('electron');

// 안전한 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 설정 관련
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  updateConfig: (updates) => ipcRenderer.invoke('update-config', updates),

  // Google Sheets
  openSheetInBrowser: (spreadsheetId, currentProduct) => ipcRenderer.invoke('open-sheet-in-browser', spreadsheetId, currentProduct),
  fetchSheetCases: () => ipcRenderer.invoke('fetch-sheet-cases'),

  // Codegen 실행
  runCodegen: (params) => ipcRenderer.invoke('run-codegen', params),
  
  // 코드 생성
  generatePlaywrightCode: (params) => ipcRenderer.invoke('generate-playwright-code', params),

  // 시나리오 빌더
  getManagerList: (product) => ipcRenderer.invoke('get-manager-list', product),
  parseManagerMethods: (filePath) => ipcRenderer.invoke('parse-manager-methods', filePath),
  generateScenarioSpec: (params) => ipcRenderer.invoke('generate-scenario-spec', params),
  checkScenarioExists: (params) => ipcRenderer.invoke('check-scenario-exists', params),

  // 파일 관련
  openInExplorer: (filePath) => ipcRenderer.invoke('open-in-explorer', filePath),
  selectFile: (options) => ipcRenderer.invoke('select-file', options),

  // 이벤트 리스너
  onCodegenLog: (callback) => {
    ipcRenderer.on('codegen-log', (event, data) => callback(data));
  },
  onLogMessage: (callback) => {
    ipcRenderer.on('log-message', (event, data) => callback(data));
  },

  // 리스너 제거
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

console.log('🔌 Preload script loaded');

