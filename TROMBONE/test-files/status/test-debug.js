const ReportGenerator = require('../../lib/report-generator');
const fs = require('fs');
const path = require('path');

// 테스트 결과 데이터 생성
const testResults = {
  status: 'fail',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  testCases: [
    {
      name: '업무코드 메뉴 접근',
      status: 'pass',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 1500,
      error: null,
      logs: [
        { timestamp: new Date().toISOString(), type: 'info', message: '📝 업무코드 메뉴 접근 시작...' },
        { timestamp: new Date().toISOString(), type: 'success', message: '✅ 업무코드 메뉴 접근 성공' },
        { timestamp: new Date().toISOString(), type: 'info', message: '⏱️ 업무코드 메뉴 접근 소요시간: 1500ms' }
      ],
      screenshots: ['screenshot-업무코드-메뉴-접근-2025-08-08T08-41-01-429Z.png', 'screenshot-업무코드-메뉴-접근-2025-08-08T08-41-02-581Z.png']
    },
    {
      name: '저장소 저장 및 확인',
      status: 'fail',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 3300,
      error: new Error('저장소 저장 및 확인 실패: page.waitForTimeout: Target page, context or browser has been closed'),
      logs: [
        { timestamp: new Date().toISOString(), type: 'info', message: '📝 저장소 저장 및 확인 시작...' },
        { timestamp: new Date().toISOString(), type: 'error', message: '❌ 저장소 저장 및 확인 실패: page.waitForTimeout: Target page, context or browser has been closed' },
        { timestamp: new Date().toISOString(), type: 'info', message: '⏱️ 저장소 저장 및 확인 소요시간: 3300ms' }
      ],
      screenshots: ['screenshot-저장소-저장-및-확인-2025-08-08T08-41-17-520Z.png']
    }
  ]
};

// 리포트 생성기 인스턴스 생성
const reportGenerator = new ReportGenerator();

// 커스텀 리포트 생성
console.log('📊 커스텀 리포트 생성 중...');
const reportPath = reportGenerator.saveReport(1, testResults);

if (reportPath && fs.existsSync(reportPath)) {
  console.log(`✅ 커스텀 리포트 생성 완료: ${reportPath}`);
  
  // 리포트 내용 확인
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  
  // 스크린샷 관련 내용 확인
  if (reportContent.includes('screenshot')) {
    console.log('📸 스크린샷 관련 HTML이 포함되어 있습니다.');
  } else {
    console.log('⚠️ 스크린샷 관련 HTML이 없습니다.');
  }
  
  // 오류 정보 관련 내용 확인
  if (reportContent.includes('page.waitForTimeout')) {
    console.log('❌ 오류 정보가 제대로 표시됩니다.');
  } else {
    console.log('⚠️ 오류 정보가 표시되지 않습니다.');
  }
  
} else {
  console.error('❌ 커스텀 리포트 생성 실패');
} 