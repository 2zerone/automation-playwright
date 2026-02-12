// Generated at: 2026-02-12T01:09:05.942Z
// Platform: CMP
// Auto-generated from Playwright codegen

import { expect } from '@playwright/test';
import BaseManager from './BaseManager.js';

class yh_test extends BaseManager {
  constructor(page) {
    super(null);
    this.page = page;
    this.utils = { page: this.page };
  }

  /**
   * yh test process
   * @param {Object} config - Configuration object
   * @returns {Object} Execution result
   */
  async processYhTest(config) {
    try {
      console.log('🚀 Starting yh test process...');
      
      await this.executeWithRetry(() => this.navigateToPage(config), 'Navigate to page', 3);
      await this.executeWithRetry(() => this.clickCancelButton(config), 'Click cancel button', 3);
      
      console.log('✅ yh test process completed');
      return { success: true, message: 'yh test completed' };
      
    } catch (error) {
      console.error('❌ yh test failed:', error.message);
      throw error;
    }
  }

  /**
   * Navigate to page
   */
  async navigateToPage(config) {
    console.log('📝 Executing: Navigate to page...');
    await this.page.goto('https://305tst.console.bf.okestro.cloud/contrabass/compute/instance/create');
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('navigateToPage');
    console.log('✅ Completed: Navigate to page');
  }

  /**
   * Click cancel button
   */
  async clickCancelButton(config) {
    console.log('📝 Executing: Click cancel button...');
    await this.page.getByRole('button', { name: '취소' }).click();
    await this.page.waitForTimeout(1000);
    await this.captureScreenshot('clickCancelButton');
    console.log('✅ Completed: Click cancel button');
  }
}

export default yh_test;
