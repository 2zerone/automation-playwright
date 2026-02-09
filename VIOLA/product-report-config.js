/**
 * VIOLA 제품 전용 리포트 설정
 * 목적: 리포트 생성 시 필요한 제품별 메타데이터 및 기본값 정의
 * 
 * 특징:
 * - 실시간 Map 기반 데이터 소스 (global.testResults)
 * - 다중 패턴 파싱 + 하드코딩 폴백
 * - 8개 시나리오
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // ===== 제품 식별자 =====
    name: 'viola',
    displayName: 'VIOLA',

    // ===== 아이콘 및 브랜딩 =====
    icon: {
        class: 'fas fa-violin',       // Font Awesome 클래스
        emoji: '🎻'                   // 이모지
    },

    // ===== 테마 색상 =====
    color: {
        primary: '#28a745',           // 주 색상 (초록)
        secondary: '#20c997',         // 보조 색상 (청록)
        gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
    },

    // ===== 시나리오 설정 =====
    scenarios: {
        count: 8,                     // 총 시나리오 개수
        
        // VIOLA 전용: 하드코딩된 시나리오 이름 (폴백)
        defaultNames: {
            1: 'VIOLA 클러스터 생성 및 확인',
            2: '외부접속 서비스 트래픽 모니터링',
            3: '서비스 어카운트 클러스터 외부접근',
            4: '카탈로그 허브(Helm_Chart) 네트워크 통신 제한',
            5: '카탈로그 허브(YAML) 오토스케일링 및 알림',
            6: 'GPU 파드 생성 및 모니터링',
            7: '일반 배포 파이프라인 생성',
            8: '긴급 배포 파이프라인 생성'
        },
        
        // 다중 파싱 패턴 (순서대로 시도)
        parsePatterns: [
            /test\.describe\.serial\('([^']+)'/,
            /test\.describe\('([^']+)'/,
            /describe\('([^']+)'/,
            /\/\/ .*시나리오.*:.*$/m
        ]
    },

    // ===== 기본 설정값 (test-settings.json 로드 실패 시 사용) =====
    defaultSettings: {
        project: {
            code: "VIOLA",
            name: "kubernetes"
        },
        repository: {
            name: "VIOLA-kubernetes"
        },
        users: [],
        user: {
            id: 'yh.lee5',
            name: '이영호'
        }
    },

    // ===== 데이터 소스 전략 (VIOLA 특화) =====
    dataSource: {
        type: 'realtime-map',         // 'file' | 'realtime-map'
        
        // 데이터 로드 우선순위
        priority: [
            'global.testResults',     // 1순위: 실시간 Map
            'file'                    // 2순위: 파일 폴백
        ],
        
        paths: {
            globalResults: 'custom-reports/global-test-results.json',
            scenarioConfig: 'config/scenario/test-settings-${scenarioId}.json'
        },
        
        // Map 키 형식
        mapKeyFormat: 'viola-scenario-${scenarioId}'
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
        videoFormat: 'webm',
        
        // VIOLA 전용: 동적 파싱 결과 처리
        dynamicParsing: true,
        handleEmptyTestCases: true
    },

    // ===== 로그 설정 (VIOLA는 더 상세한 디버깅) =====
    logging: {
        level: 'debug',               // 'debug' | 'info' | 'warn' | 'error'
        prefix: '🎻 VIOLA',           // 로그 접두사
        includeTimestamp: true,
        includeDataSource: true       // 데이터 소스 표시 (Map/파일)
    },

    // ===== 실패 로직 처리 순서 (VIOLA 전용) =====
    failureHandling: {
        // true: 실패 확인 → 미수행 처리 (VIOLA)
        // false: 미수행 처리 → 실패 확인 (TROMBONE)
        checkFailureFirst: true
    }
};

