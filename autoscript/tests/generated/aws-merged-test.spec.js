// Generated Playwright Test: aws
// Test Case ID: aws
// Generated at: 2025-11-13T05:56:31.651Z

import { test, expect } from '@playwright/test';

test('aws', async ({ page }) => {
  // 전역 카운터 (INCREMENT 변수용)
  let globalCounter = 0;
  // Step 1: 'apps' 버튼 클릭
  await page.getByRole('button', { name: 'apps' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 1: 클릭 완료');

  // Step 2: 'Amazon Web Service AWS 관리 서비스' 링크 클릭
  await page.getByRole('link', { name: 'Amazon Web Service AWS 관리 서비스' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 2: 클릭 완료');

  // Step 3: 'AWS-' 텍스트 클릭
  await page.getByText('AWS-').click();
  console.log('Step 3: 클릭 완료');

  // Step 4: '아시아 태평양 (서울)' 텍스트 클릭
  await page.getByText('아시아 태평양 (서울)').click();
  console.log('Step 4: 클릭 완료');

  // Step 5: '선택' 버튼 클릭
  await page.getByRole('button', { name: '선택' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 5: 클릭 완료');

  // Step 6: 메뉴에서 '컴퓨트' 클릭
  await page.getByRole('menu').getByText('컴퓨트').click();
  console.log('Step 6: 클릭 완료');

  // Step 7: '인스턴스' 링크 클릭
  await page.getByRole('link', { name: '인스턴스' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 7: 클릭 완료');

  // Step 8: '생성' 버튼 클릭
  await page.getByRole('button', { name: '생성' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 8: 클릭 완료');

  // Step 9: '인스턴스명을 입력해 주세요' 텍스트박스 클릭
  await page.getByRole('textbox', { name: '인스턴스명을 입력해 주세요' }).click();
  console.log('Step 9: 클릭 완료');

  // Step 10: '인스턴스명을 입력해 주세요' 텍스트박스에 입력
  await page.getByRole('textbox', { name: '인스턴스명을 입력해 주세요' }).fill('aws-yh');
  await page.getByRole('textbox', { name: '인스턴스명을 입력해 주세요' }).blur();
  console.log('Step 10: 입력 완료 (고정 값)');

  // Step 11: '중복확인' 버튼 클릭
  await page.getByRole('button', { name: '중복확인' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 11: 클릭 완료');

  // Step 12: 'Ubuntu' 텍스트 클릭
  await page.getByText('Ubuntu').click();
  console.log('Step 12: 클릭 완료');

  // Step 13: 셀렉터(#rc_select_2) 클릭
  await page.locator('#rc_select_2').click();
  console.log('Step 13: 클릭 완료');
  await expect(page.locator('#rc_select_2')).toBeVisible();

  // Step 14: 'Deep Learning AMI Neuron (' 텍스트 클릭
  await page.getByText('Deep Learning AMI Neuron (').click();
  console.log('Step 14: 클릭 완료');

  // Step 15: 셀렉터(#rc_select_3) 클릭
  await page.locator('#rc_select_3').click();
  console.log('Step 15: 클릭 완료');
  await expect(page.locator('#rc_select_3')).toBeVisible();

  // Step 16: 셀렉터(#rc_select_3)에 'nano' 입력
  await page.locator('#rc_select_3').fill('nano');
  await page.locator('#rc_select_3').blur();
  console.log('Step 16: 입력 완료 (고정 값)');
  await expect(page.locator('#rc_select_3')).toBeVisible();

  // Step 17: 'span'에서 't3a.nano'  포함된 항목 클릭
  await page.locator('span').filter({ hasText: 't3a.nano'   }).click();
  console.log('Step 17: 클릭 완료');

  // Step 18: 셀렉터(#rc_select_4) 클릭
  await page.locator('#rc_select_4').click();
  console.log('Step 18: 클릭 완료');
  await expect(page.locator('#rc_select_4')).toBeVisible();

  // Step 19: '범용 SSD(gp3)' 텍스트 클릭
  await page.getByText('범용 SSD(gp3)').click();
  console.log('Step 19: 클릭 완료');

  // Step 20: '다음' 버튼 클릭
  await page.getByRole('button', { name: '다음' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 20: 클릭 완료');

  // Step 21: 셀렉터(#rc_select_5) 클릭
  await page.locator('#rc_select_5').click();
  console.log('Step 21: 클릭 완료');
  await expect(page.locator('#rc_select_5')).toBeVisible();

  // Step 22: 'cmp-vpc' 텍스트 클릭
  await page.getByText('cmp-vpc').click();
  console.log('Step 22: 클릭 완료');

  // Step 23: 셀렉터(#rc_select_6) 클릭
  await page.locator('#rc_select_6').click();
  console.log('Step 23: 클릭 완료');
  await expect(page.locator('#rc_select_6')).toBeVisible();

  // Step 24: 'cmp-subnet-2a' 텍스트 클릭
  await page.getByText('cmp-subnet-2a').click();
  console.log('Step 24: 클릭 완료');

  // Step 25: 셀렉터(#rc_select_7) 클릭
  await page.locator('#rc_select_7').click();
  console.log('Step 25: 클릭 완료');
  await expect(page.locator('#rc_select_7')).toBeVisible();

  // Step 26: '다음' 버튼 클릭
  await page.getByRole('button', { name: '다음' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 26: 클릭 완료');

  // Step 27: 셀렉터(#rc_select_8) 클릭
  await page.locator('#rc_select_8').click();
  console.log('Step 27: 클릭 완료');
  await expect(page.locator('#rc_select_8')).toBeVisible();

  // Step 28: '다음' 버튼 클릭
  await page.getByRole('button', { name: '다음' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 28: 클릭 완료');

  // Step 29: '생성' 버튼 클릭
  await page.getByRole('button', { name: '생성' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 29: 클릭 완료');

  // Step 30: 'a'에서 'close'  포함된 항목 클릭
  await page.locator('a').filter({ hasText: 'close'   }).click();
  console.log('Step 30: 클릭 완료');

  // Step 31: '새로고침' 버튼 클릭
  await page.getByRole('button', { name: '새로고침' }).click();
  // 클릭 후 안정화 대기 (팝업/새창 환경 대응)
  await page.waitForTimeout(1000);
  console.log('Step 31: 클릭 완료');

  // Step 32: 'i-0f8e0f5ef5cdda567' 텍스트 클릭
  await page.getByText('i-0f8e0f5ef5cdda567').click();
  console.log('Step 32: 클릭 완료');

  // Step 33: RUNNING' 텍스트 표시 확인 (🤖 Groq AI 변환)
  await page.locator('text=RUNNING').is_visible();.click();
  console.log('Step 33: 클릭 완료');

});
