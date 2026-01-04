#!/usr/bin/env node

/**
 * CLI entry point for AI Limit Checker
 */

import { checkLimits } from './index.js';

async function main() {
  try {
    const results = await checkLimits();
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

main();
