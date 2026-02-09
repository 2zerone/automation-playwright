/**
 * CONTRABASS 제품 전용 리포트 설정
 * 목적: 리포트 생성 시 필요한 제품별 메타데이터 및 기본값 정의
 * 
 * 주의: 현재 CONTRABASS는 TROMBONE의 복사본으로, 향후 독립적으로 발전할 예정
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // ===== 제품 식별자 =====
    name: 'contrabass',
    displayName: 'CONTRABASS',

    // ===== 아이콘 및 브랜딩 =====
    icon: {
        class: 'fas fa-guitar',       // Font Awesome 클래스 (기타/베이스 아이콘)
        emoji: '🎸'                   // 이모지
    },

    // ===== 테마 색상 =====
    color: {
        primary: '#e74c3c',           // 주 색상 (빨강)
        secondary: '#c0392b',         // 보조 색상 (진한 빨강)
        gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
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
            code: "CB001",
            name: "CONTRABASS 프로젝트"
        },
        repository: {
            name: "CONTRABASS-REPO"
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
        prefix: '🎸 CONTRABASS',      // 로그 접두사
        includeTimestamp: true
    }
};

