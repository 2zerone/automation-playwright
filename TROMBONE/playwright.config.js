// @ts-check
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일의 절대 경로를 기준으로 루트 디렉토리 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 디렉토리 설정 - 절대 경로 기반, POSIX 형식으로 변환
  testDir: path.join(root, 'tests').replace(/\\/g, '/'),
  
  // 테스트 파일 패턴 설정
  testMatch: [
    'scenario/**/*.spec.js',
    '**/*.spec.js'
  ],
  
  // 녹화 파일 출력 디렉토리 설정
  outputDir: path.join(root, 'test-results').replace(/\\/g, '/'),
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', {
      outputFolder: path.join(root, 'playwright-report').replace(/\\/g, '/'),
      open: 'never'
    }],
    ['json', {
      outputFile: path.join(root, 'playwright-report/test-results.json').replace(/\\/g, '/')
    }],
    ['list', { printSteps: true }],
    ['line', { printSteps: true }]
  ],
  /* timeout */
  timeout: 3600000, // 1시간 (3600초)
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: false,
    viewport: null,  // 브라우저 창 크기에 맞춤
    locale: 'ko-KR',
    extraHTTPHeaders: { 'Accept-Language': 'ko-KR,ko;q=0.9' },
    timezoneId: 'Asia/Seoul',
    /* HTTPS 인증서 오류 무시 - VIOLA/CONTRABASS/CMP용 */
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [
        '--start-maximized', 
        '--window-size=1920,1080',  // 브라우저 창 크기 명시
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ], 
    },
    trace: 'on-first-retry',
    video: (process.env.PLAYWRIGHT_VIDEO_ENABLED === 'true') ? 'on' : 'off',
    screenshot: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        headless: false,
        viewport: null,  // 브라우저 창 크기에 맞춤
        locale: 'ko-KR',
        extraHTTPHeaders: { 'Accept-Language': 'ko-KR,ko;q=0.9' },
        timezoneId: 'Asia/Seoul',
        video: (process.env.PLAYWRIGHT_VIDEO_ENABLED === 'true') ? 'on' : 'off',
        launchOptions: {
          args: [
            '--start-maximized',
            '--window-size=1920,1080',  // 브라우저 창 크기 명시
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ],
        },
      },
    },
  ],
});

