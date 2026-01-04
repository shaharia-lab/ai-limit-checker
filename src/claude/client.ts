/**
 * Claude CLI client for fetching usage stats using interactive /status command
 */

import { spawn } from 'node-pty';
import { writeFileSync } from 'node:fs';
import type { ClaudeStatusInfo } from './types.js';

// Function to strip ANSI escape codes
function stripAnsiCodes(text: string): string {
  let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');
  cleaned = cleaned.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  cleaned = cleaned.replace(/\x1b\[?[0-9;]*[0-9;]*[0-9;]*[a-zA-Z]/g, '');
  return cleaned;
}

export class ClaudeClient {
  async getUsageStats(): Promise<ClaudeStatusInfo> {
    const ptyProcess = spawn('claude', [], {
      name: 'xterm-color',
      cols: 120,
      rows: 40,
      cwd: process.cwd(),
      env: process.env,
    });

    let output = '';

    ptyProcess.onData((data) => {
      output += data;
    });

    // Wait for initial prompt - Claude CLI shows various prompts
    await new Promise<void>((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 15000);

      const checkReady = setInterval(() => {
        if (output.includes('Type your message') || output.includes('Type a message') ||
            output.includes('Tips for getting started') || output.includes('? for shortcuts')) {
          clearTimeout(timeout);
          resolved = true;
          clearInterval(checkReady);
          resolve();
        }
      }, 500);
    });

    // Clear input buffer and send /usage command directly
    ptyProcess.write('\u0015'); // Clear line (Ctrl+U)
    await new Promise((resolve) => setTimeout(resolve, 200));
    ptyProcess.write('/usage');
    await new Promise((resolve) => setTimeout(resolve, 300));
    ptyProcess.write('\r'); // Press Enter to execute
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Wait for usage data or subscription message to appear
    await new Promise<void>((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        resolved = true;
        resolve();
      }, 10000);

      const checkUsage = setInterval(() => {
        // Look for usage data: "Current session", "█ 100% used", "Resets 4pm"
        // Or subscription message: "only available for subscription plans"
        if (output.includes('Current session') || output.includes('only available for subscription')) {
          clearTimeout(timeout);
          resolved = true;
          clearInterval(checkUsage);
          resolve();
        }
      }, 500);
    });

    // Press ESC to exit the status view
    ptyProcess.write('\x1b');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send /exit to quit Claude
    ptyProcess.write('\u0015'); // Clear line first
    await new Promise((resolve) => setTimeout(resolve, 200));
    ptyProcess.write('/exit\r');

    // Wait for cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ptyProcess.kill();

    // Debug: write output to temp file
    writeFileSync('/tmp/claude-debug-output.txt', output);

    return this.parseStatusOutput(output);
  }

  private parseStatusOutput(output: string): ClaudeStatusInfo {
    const cleaned = stripAnsiCodes(output);

    // Debug: write cleaned output
    writeFileSync('/tmp/claude-debug-cleaned.txt', cleaned);

    // Check if user has a subscription
    const hasSubscription = !cleaned.includes('only available for subscription plans');

    // Parse session usage - format: "█ 100% used" or similar
    // The block characters █ might appear, or just the percentage
    let sessionUsed = 0;
    const sessionMatch = cleaned.match(/Current session.*?(\d+)%\s*used/is);
    if (sessionMatch) {
      sessionUsed = parseInt(sessionMatch[1], 10);
    }

    // Parse session reset time (e.g., "Resets 4pm (Europe/Berlin)")
    let sessionResetTime = 'Unknown';
    const sessionResetMatch = cleaned.match(/Current session.*?Resets\s+([^\(]+)/is);
    if (sessionResetMatch) {
      sessionResetTime = sessionResetMatch[1].trim();
    }

    // Parse weekly usage
    let weeklyUsed = 0;
    const weeklyMatch = cleaned.match(/Current week.*?(\d+)%\s*used/is);
    if (weeklyMatch) {
      weeklyUsed = parseInt(weeklyMatch[1], 10);
    }

    // Parse weekly reset time (e.g., "Resets Jan 10, 12pm (Europe/Berlin)")
    let weeklyResetTime = 'Unknown';
    const weeklyResetMatch = cleaned.match(/Current week.*?Resets\s+([^\(]+)/is);
    if (weeklyResetMatch) {
      weeklyResetTime = weeklyResetMatch[1].trim();
    }

    return {
      sessionUsed,
      sessionResetTime,
      weeklyUsed,
      weeklyResetTime,
      hasSubscription,
    };
  }
}
