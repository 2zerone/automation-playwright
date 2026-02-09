import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Google Sheets 설정
const SHEET_ID = "1UhI2li9ep1l77_9njpqVBY-g8bDDbyX5E7VmZ7Yc3AA";
const SHEET_RANGE = 'TEST!A1:I9999';

// Google Sheets 인증
let credentials;
try {
  const keyPath = join(__dirname, 'balmy-state-471105-h5-c819a6c1e5f3.json');
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
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// 미들웨어
app.use(cors());
app.use(express.json());

// Google Sheets에서 데이터 조회
app.get('/api/sheets/data', async (req, res) => {
  try {
    console.log('📊 Google Sheets 데이터 조회 요청');
    
    const sheets = createSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    
    const values = response.data.values || [];
    console.log(`📊 총 ${values.length}개 행이 조회되었습니다.`);
    
    res.json({
      success: true,
      data: values,
      count: values.length
    });
    
  } catch (error) {
    console.error('❌ Google Sheets 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Google Sheets에 데이터 추가
app.post('/api/sheets/data', async (req, res) => {
  try {
    console.log('📊 Google Sheets 데이터 추가 요청');
    
    const { actions } = req.body;
    
    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        error: 'actions 배열이 필요합니다.'
      });
    }
    
    const sheets = createSheetsClient();
    
    // 기존 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    
    const existingData = response.data.values || [];
    console.log(`📊 기존 데이터: ${existingData.length}개 행`);
    
    // 새 데이터를 2차원 배열로 변환
    const newRows = actions.map(action => [
      action.enabled || 'TRUE',
      action.caseId || '',
      action.title || '',
      action.stepNo || 1,
      action.selector || '',
      action.action || '',
      action.data || '',
      action.assert || '',
      action.timeoutMs || '1000'
    ]);
    
    // 기존 데이터와 새 데이터 합치기
    const allData = [...existingData, ...newRows];
    
    // Google Sheets에 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: 'RAW',
      resource: {
        values: allData
      }
    });
    
    console.log(`✅ Google Sheets에 ${newRows.length}개 행이 추가되었습니다.`);
    
    res.json({
      success: true,
      added: newRows.length,
      total: allData.length,
      message: `${newRows.length}개 행이 추가되었습니다.`
    });
    
  } catch (error) {
    console.error('❌ Google Sheets 데이터 추가 실패:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 특정 케이스 ID로 데이터 조회
app.get('/api/sheets/data/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    console.log(`📊 케이스 ID ${caseId} 데이터 조회 요청`);
    
    const sheets = createSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    
    const values = response.data.values || [];
    const dataRows = values.slice(1); // 헤더 제거
    
    // 특정 케이스 ID 필터링
    const filteredRows = dataRows.filter(row => row[1] === caseId);
    
    console.log(`📊 케이스 ID ${caseId}: ${filteredRows.length}개 행`);
    
    res.json({
      success: true,
      caseId,
      data: filteredRows,
      count: filteredRows.length
    });
    
  } catch (error) {
    console.error('❌ 케이스 데이터 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 특정 케이스 ID 데이터 삭제
app.delete('/api/sheets/data/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    console.log(`📊 케이스 ID ${caseId} 데이터 삭제 요청`);
    
    const sheets = createSheetsClient();
    
    // 기존 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    
    const values = response.data.values || [];
    const header = values[0] || [];
    const dataRows = values.slice(1); // 헤더 제거
    
    // 특정 케이스 ID가 아닌 행만 유지
    const filteredRows = dataRows.filter(row => row[1] !== caseId);
    
    // 헤더와 필터링된 데이터 합치기
    const allData = [header, ...filteredRows];
    
    // Google Sheets에 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: 'RAW',
      resource: {
        values: allData
      }
    });
    
    const deletedCount = dataRows.length - filteredRows.length;
    console.log(`✅ 케이스 ID ${caseId}: ${deletedCount}개 행이 삭제되었습니다.`);
    
    res.json({
      success: true,
      deleted: deletedCount,
      remaining: filteredRows.length,
      message: `${deletedCount}개 행이 삭제되었습니다.`
    });
    
  } catch (error) {
    console.error('❌ 케이스 데이터 삭제 실패:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 테스트 케이스 목록 조회
app.get('/api/sheets/cases', async (req, res) => {
  try {
    console.log('📋 테스트 케이스 목록 조회 요청');
    
    const sheets = createSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    
    const values = response.data.values || [];
    const dataRows = values.slice(1); // 헤더 제거
    
    // 케이스별 그룹화
    const cases = {};
    dataRows.forEach(row => {
      const caseId = row[1];
      const title = row[2];
      if (!cases[caseId]) {
        cases[caseId] = {
          caseId,
          title,
          stepCount: 0,
          enabledSteps: 0
        };
      }
      cases[caseId].stepCount++;
      if (row[0] === 'TRUE') {
        cases[caseId].enabledSteps++;
      }
    });
    
    const caseList = Object.values(cases);
    console.log(`📊 총 ${caseList.length}개의 테스트 케이스`);
    
    res.json({
      success: true,
      cases: caseList,
      count: caseList.length
    });
    
  } catch (error) {
    console.error('❌ 테스트 케이스 목록 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Google Sheets API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 Sheet ID: ${SHEET_ID}`);
  console.log(`📊 Range: ${SHEET_RANGE}`);
  console.log('');
  console.log('사용 가능한 API:');
  console.log(`  GET  http://localhost:${PORT}/api/sheets/data`);
  console.log(`  POST http://localhost:${PORT}/api/sheets/data`);
  console.log(`  GET  http://localhost:${PORT}/api/sheets/data/:caseId`);
  console.log(`  DELETE http://localhost:${PORT}/api/sheets/data/:caseId`);
  console.log(`  GET  http://localhost:${PORT}/api/sheets/cases`);
});
