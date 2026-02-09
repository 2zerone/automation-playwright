#!/usr/bin/env node

import { google } from 'googleapis';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Google Sheets 설정
const SHEET_ID = process.env.SHEET_ID || "1UhI2li9ep1l77_9njpqVBY-g8bDDbyX5E7VmZ7Yc3AA";
const SHEET_RANGE = 'TEST!A1:I9999';

// Google Sheets 인증
let credentials;
try {
  const keyPath = join(__dirname, '../sheets-mcp/balmy-state-471105-h5-c819a6c1e5f3.json');
  credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  console.log('✅ Google Sheets 인증 파일 로드 성공');
} catch (error) {
  console.error('❌ Google Sheets 인증 파일 로드 실패:', error.message);
  process.exit(1);
}

// Google Sheets 클라이언트 생성
function createSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function checkSheetsLocation() {
  console.log('🔍 Google Sheets 저장 위치 확인 중...\n');
  
  try {
    const sheets = createSheetsClient();
    
    // 스프레드시트 정보 조회
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    
    const spreadsheet = spreadsheetInfo.data;
    
    console.log('📊 스프레드시트 정보:');
    console.log(`   제목: ${spreadsheet.properties.title}`);
    console.log(`   ID: ${spreadsheet.properties.spreadsheetId}`);
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${spreadsheet.properties.spreadsheetId}/edit`);
    console.log(`   시트 수: ${spreadsheet.sheets.length}개`);
    console.log('');
    
    // 시트 목록
    console.log('📋 시트 목록:');
    spreadsheet.sheets.forEach((sheet, index) => {
      console.log(`   ${index + 1}. ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
    });
    console.log('');
    
    // TEST 시트 데이터 확인
    console.log('📝 TEST 시트 데이터 확인:');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    
    const rows = response.data.values || [];
    console.log(`   총 행 수: ${rows.length}개`);
    
    if (rows.length > 0) {
      console.log('   헤더:', rows[0]);
      console.log(`   데이터 행 수: ${rows.length - 1}개`);
      
      // 최근 3개 행 출력
      console.log('   최근 3개 행:');
      rows.slice(-3).forEach((row, index) => {
        console.log(`     ${rows.length - 3 + index + 1}: ${row.join(' | ')}`);
      });
    } else {
      console.log('   데이터가 없습니다.');
    }
    
    console.log('');
    console.log('🎯 자동 Codegen으로 녹화한 데이터는 다음 위치에 저장됩니다:');
    console.log(`   시트: TEST`);
    console.log(`   범위: A1:I9999`);
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`);
    
  } catch (error) {
    console.error('❌ Google Sheets 정보 조회 실패:', error.message);
    process.exit(1);
  }
}

checkSheetsLocation();
