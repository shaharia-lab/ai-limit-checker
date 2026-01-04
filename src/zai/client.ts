/**
 * Z.ai client for fetching usage data via Playwright
 */

import { chromium } from 'playwright';
import type { ZaiUsageResponse, ZaiLimit } from './types.js';

export interface ZaiConfig {
  outputDir: string;
  userDataDir: string;
}

export class ZaiClient {
  private config: ZaiConfig;

  constructor(config: ZaiConfig) {
    this.config = config;
  }

  async getUsageQuota(): Promise<ZaiLimit[]> {
    const context = await chromium.launchPersistentContext(this.config.userDataDir, {
      headless: true,
      channel: 'chrome',
    });

    try {
      const page = await context.newPage();

      // Listen for the usage API response BEFORE navigation
      let apiResponse: ZaiUsageResponse | null = null;
      let responseResolved = false;
      const responsePromise = new Promise<ZaiUsageResponse>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!responseResolved) {
            reject(new Error('Timeout waiting for usage API'));
          }
        }, 30000);

        page.on('response', async (response) => {
          const url = response.url();
          // The API is on api.z.ai subdomain
          if (url.includes('api.z.ai/api/monitor/usage/quota/limit') && !responseResolved) {
            clearTimeout(timeout);
            responseResolved = true;
            try {
              const body = await response.json();
              resolve(body as ZaiUsageResponse);
            } catch (error) {
              reject(error);
            }
          }
        });
      });

      // Navigate to the subscription page - use 'load' instead of 'networkidle'
      await page.goto('https://z.ai/manage-apikey/subscription', { waitUntil: 'load', timeout: 30000 });

      // Wait for the page to settle and for dynamic content to load
      await page.waitForTimeout(3000);

      // Wait for the Usage tab to be available and click it
      try {
        await page.waitForSelector('[role="tab"]', { timeout: 10000 });

        // Click the Usage tab using Playwright's built-in selector
        const usageTab = page.locator('[role="tab"]').filter({ hasText: 'Usage' });

        // Wait for the tab to be visible and enabled
        await usageTab.waitFor({ state: 'visible', timeout: 10000 });

        // Click with increased timeout
        await usageTab.click({ timeout: 10000 });

        // Give some time for the API call to be made after clicking
        await page.waitForTimeout(2000);
      } catch (error) {
        throw new Error('Failed to find or click Usage tab');
      }

      // Wait for the API response
      apiResponse = await responsePromise;

      if (!apiResponse.success || apiResponse.code !== 200) {
        throw new Error(`Z.ai API error: ${apiResponse.msg}`);
      }

      return apiResponse.data.limits;
    } finally {
      await context.close();
    }
  }
}
