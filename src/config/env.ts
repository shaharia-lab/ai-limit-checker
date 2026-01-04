/**
 * Environment configuration for Chrome/Playwright
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ChromeConfig {
  outputDir: string;
  userDataDir: string;
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

export function loadChromeConfig(): ChromeConfig {
  const outputDir = resolve(getRequiredEnv('CHROME_OUTPUT_DIR'));
  const userDataDir = resolve(getRequiredEnv('CHROME_USER_DATA_DIR'));

  // Check if directories exist
  for (const [name, path] of [['output-dir', outputDir], ['user-data-dir', userDataDir]]) {
    if (!existsSync(path)) {
      throw new Error(`Chrome ${name} directory does not exist: ${path}`);
    }
  }

  return { outputDir, userDataDir };
}
