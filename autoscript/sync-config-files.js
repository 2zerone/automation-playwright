/**
 * scenario-list.json을 기준으로 recording-settings.json과 user-recording-folders.json 동기화
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS = ['TROMBONE', 'VIOLA', 'CMP', 'CONTRABASS'];

function syncConfigFiles() {
  console.log('🔄 설정 파일 동기화 시작...\n');
  
  PRODUCTS.forEach(product => {
    console.log(`\n📦 ${product} 처리 중...`);
    
    const productPath = path.join(__dirname, '..', product);
    const scenarioListPath = path.join(productPath, 'custom-reports', 'scenario-list.json');
    const recordingSettingsPath = path.join(productPath, 'config', 'recording-settings.json');
    const userFoldersPath = path.join(productPath, 'config', 'user-recording-folders.json');
    
    // scenario-list.json 읽기
    if (!fs.existsSync(scenarioListPath)) {
      console.log(`⚠️ scenario-list.json이 없습니다. 건너뜁니다.`);
      return;
    }
    
    const scenarioList = JSON.parse(fs.readFileSync(scenarioListPath, 'utf8'));
    const validIds = scenarioList.scenarios.map(s => s.id);
    console.log(`✅ 유효한 시나리오 ID: [${validIds.join(', ')}]`);
    
    // recording-settings.json 동기화
    if (fs.existsSync(recordingSettingsPath)) {
      const recordingSettings = JSON.parse(fs.readFileSync(recordingSettingsPath, 'utf8'));
      const currentIds = Object.keys(recordingSettings).map(id => parseInt(id));
      
      // 삭제할 ID들
      const idsToRemove = currentIds.filter(id => !validIds.includes(id));
      
      // 추가할 ID들
      const idsToAdd = validIds.filter(id => recordingSettings[id] === undefined);
      
      if (idsToRemove.length > 0) {
        console.log(`🗑️ recording-settings.json에서 제거: [${idsToRemove.join(', ')}]`);
        idsToRemove.forEach(id => delete recordingSettings[id]);
      }
      
      if (idsToAdd.length > 0) {
        console.log(`➕ recording-settings.json에 추가: [${idsToAdd.join(', ')}]`);
        idsToAdd.forEach(id => recordingSettings[id] = false);
      }
      
      if (idsToRemove.length > 0 || idsToAdd.length > 0) {
        fs.writeFileSync(recordingSettingsPath, JSON.stringify(recordingSettings, null, 2), 'utf8');
        console.log(`✅ recording-settings.json 동기화 완료`);
      } else {
        console.log(`✅ recording-settings.json 이미 동기화됨`);
      }
    } else {
      // 파일이 없으면 생성
      const configDir = path.join(productPath, 'config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const recordingSettings = {};
      validIds.forEach(id => recordingSettings[id] = false);
      fs.writeFileSync(recordingSettingsPath, JSON.stringify(recordingSettings, null, 2), 'utf8');
      console.log(`✅ recording-settings.json 생성 완료`);
    }
    
    // user-recording-folders.json 동기화
    if (fs.existsSync(userFoldersPath)) {
      const userFolders = JSON.parse(fs.readFileSync(userFoldersPath, 'utf8'));
      const currentIds = Object.keys(userFolders).map(id => parseInt(id));
      
      // 삭제할 ID들
      const idsToRemove = currentIds.filter(id => !validIds.includes(id));
      
      // 추가할 ID들
      const idsToAdd = validIds.filter(id => userFolders[id] === undefined);
      
      if (idsToRemove.length > 0) {
        console.log(`🗑️ user-recording-folders.json에서 제거: [${idsToRemove.join(', ')}]`);
        idsToRemove.forEach(id => delete userFolders[id]);
      }
      
      if (idsToAdd.length > 0) {
        console.log(`➕ user-recording-folders.json에 추가: [${idsToAdd.join(', ')}]`);
        idsToAdd.forEach(id => userFolders[id] = null);
      }
      
      if (idsToRemove.length > 0 || idsToAdd.length > 0) {
        fs.writeFileSync(userFoldersPath, JSON.stringify(userFolders, null, 2), 'utf8');
        console.log(`✅ user-recording-folders.json 동기화 완료`);
      } else {
        console.log(`✅ user-recording-folders.json 이미 동기화됨`);
      }
    } else {
      // 파일이 없으면 생성
      const configDir = path.join(productPath, 'config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const userFolders = {};
      validIds.forEach(id => userFolders[id] = null);
      fs.writeFileSync(userFoldersPath, JSON.stringify(userFolders, null, 2), 'utf8');
      console.log(`✅ user-recording-folders.json 생성 완료`);
    }
  });
  
  console.log('\n\n✅ 모든 제품의 설정 파일 동기화 완료!');
}

// 실행
syncConfigFiles();
