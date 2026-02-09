// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// 현재 파일의 절대 경로를 기준으로 루트 디렉토리 계산
const root = path.resolve(__dirname);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // 테스트 디렉토리 설정 - 절대 경로 기반, POSIX 형식으로 변환
  testDir: path.join(root, 'tests').replace(/\\/g, '/'),
  
  // 테스트 파일 패턴을 steps 디렉토리로 구체화
  testMatch: 'steps/**/*.spec.js',
  
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
  timeout: 600000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: false,
    viewport: null,
    launchOptions: {
      args: [
        '--start-maximized', 
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
        viewport: null,
        video: (process.env.PLAYWRIGHT_VIDEO_ENABLED === 'true') ? 'on' : 'off',
        launchOptions: {
          args: [
            '--start-maximized',
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
