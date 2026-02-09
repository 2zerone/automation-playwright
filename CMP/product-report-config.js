/**
 * CMP 제품 전용 리포트 설정
 * 목적: 리포트 생성 시 필요한 제품별 메타데이터 및 기본값 정의
 * 
 * 주의: 현재 CMP는 TROMBONE의 복사본으로, 향후 독립적으로 발전할 예정
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // ===== 제품 식별자 =====
    name: 'cmp',
    displayName: 'CMP',

    // ===== 아이콘 및 브랜딩 =====
    icon: {
        class: 'fas fa-cloud',        // Font Awesome 클래스 (클라우드 아이콘)
        emoji: '☁️'                   // 이모지
    },

    // ===== 테마 색상 =====
    color: {
        primary: '#3498db',           // 주 색상 (파랑)
        secondary: '#2980b9',         // 보조 색상 (진한 파랑)
        gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
    },

    // ===== 시나리오 설정 =====
    scenarios: {
        count: 1,                     // 총 시나리오 개수 (현재 개발 중)
        defaultNames: {},             // 자동 파싱 (파일에서 읽기)
        
        // 시나리오 파싱 패턴
        parsePatterns: [
            /test\.describe\.serial\('([^']+)'/,  // 기본 패턴
        ]
    },

    // ===== 기본 설정값 (test-settings.json 로드 실패 시 사용) =====
    defaultSettings: {
        project: {
            code: "CMP001",
            name: "CMP 프로젝트"
        },
        repository: {
            name: "CMP-REPO"
        },
        users: [],
        user: {
            id: 'admin',
            name: '관리자'
        }
    },

    // ===== 데이터 소스 전략 =====
    dataSource: {
        type: 'file',                 // 'file' | 'realtime-map'
        paths: {
            globalResults: 'custom-reports/global-test-results.json',
            scenarioConfig: 'config/scenario/test-settings-${scenarioId}.json'
        }
    },

    // ===== 파일 경로 설정 =====
    paths: {
        rootDir: __dirname,
        tests: path.join(__dirname, 'tests'),
        scenarios: path.join(__dirname, 'tests', 'scenario'),
        config: path.join(__dirname, 'config'),
        reports: path.join(__dirname, 'custom-reports'),
        lib: path.join(__dirname, 'lib')
    },

    // ===== 리포트 생성 옵션 =====
    reportOptions: {
        includeScreenshots: true,
        includeVideos: true,
        includeHistory: true,
        screenshotFormat: 'png',
        videoFormat: 'webm'
    },

    // ===== 로그 설정 =====
    logging: {
        level: 'info',                // 'debug' | 'info' | 'warn' | 'error'
        prefix: '☁️  CMP',            // 로그 접두사
        includeTimestamp: true
    }
};

