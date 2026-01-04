#!/usr/bin/env node

/**
 * CLI entry point for AI Limit Checker
 */

import { checkLimits } from './index.js';

type ProviderName = 'claude' | 'gemini' | 'zai';

function parseToolsFlag(arg: string | undefined): ProviderName[] | null {
  if (!arg) {
    return null;
  }

  // Remove --tools= prefix if present
  const value = arg.replace(/^--tools=/, '');

  // Split by comma and trim each value
  const tools = value.split(',').map(t => t.trim().toLowerCase());

  // Validate tool names
  const validTools: ProviderName[] = ['claude', 'gemini', 'zai'];
  const invalidTools = tools.filter(t => !validTools.includes(t as ProviderName));

  if (invalidTools.length > 0) {
    throw new Error(`Invalid tool(s): ${invalidTools.join(', ')}. Valid options are: ${validTools.join(', ')}`);
  }

  return tools as ProviderName[];
}

function printError(message: string): void {
  console.error(`Error: ${message}`);
}

async function main() {
  try {
    // Parse --tools flag from command line arguments
    const toolsArg = process.argv.find(arg => arg.startsWith('--tools'));

    if (!toolsArg) {
      printError('--tools flag is required. Please specify which tools to check.');
      console.error('\nUsage: ai-limit-checker --tools=<tool1,tool2,...>');
      console.error('\nValid tools: claude, gemini, zai');
      console.error('\nExamples:');
      console.error('  ai-limit-checker --tools=claude');
      console.error('  ai-limit-checker --tools=claude,gemini');
      console.error('  ai-limit-checker --tools=claude,gemini,zai');
      process.exit(1);
    }

    const tools = parseToolsFlag(toolsArg);

    if (!tools || tools.length === 0) {
      throw new Error('At least one tool must be specified');
    }

    const results = await checkLimits(tools);
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      printError(error.message);
    } else {
      printError('An unknown error occurred');
    }
    process.exit(1);
  }
}

main();
