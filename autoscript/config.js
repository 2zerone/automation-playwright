/**
 * Autoscript 설정
 * 
 * API 키와 환경 변수를 자동으로 로드합니다.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 설정 파일 경로
 */
const CONFIG_FILE = join(__dirname, '.groq-api-key');

/**
 * API 키 자동 로드
 */
export function loadGroqApiKey() {
  // 1. 환경 변수에서 로드
  if (process.env.GROQ_API_KEY) {
    return process.env.GROQ_API_KEY;
  }
  
  // 2. 설정 파일에서 로드
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const apiKey = fs.readFileSync(CONFIG_FILE, 'utf8').trim();
      if (apiKey) {
        // 환경 변수에 설정 (다른 모듈에서도 사용 가능)
        process.env.GROQ_API_KEY = apiKey;
        return apiKey;
      }
    }
  } catch (error) {
    // 파일 읽기 실패는 무시
  }
  
  return null;
}

/**
 * API 키 저장
 */
export function saveGroqApiKey(apiKey) {
  try {
    fs.writeFileSync(CONFIG_FILE, apiKey, 'utf8');
    process.env.GROQ_API_KEY = apiKey;
    return true;
  } catch (error) {
    console.error('API 키 저장 실패:', error.message);
    return false;
  }
}

/**
 * 설정 초기화 (자동 실행)
 */
export function initConfig() {
  loadGroqApiKey();
}

// 모듈 로드 시 자동 초기화
initConfig();

