/**
 * Gemini CLI client for fetching usage stats
 */

import { spawn } from 'node-pty';
import { writeFileSync } from 'node:fs';
import type { GeminiModelUsage } from './types.js';

// Function to strip ANSI escape codes
function stripAnsiCodes(text: string): string {
  let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');
  cleaned = cleaned.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  cleaned = cleaned.replace(/\x1b\[?[0-9;]*[0-9;]*[0-9;]*[a-zA-Z]/g, '');
  return cleaned;
}

export class GeminiClient {
  async getUsageStats(): Promise<GeminiModelUsage[]> {
    const ptyProcess = spawn('gemini', ['--yolo'], {
      name: 'xterm-color',
      cols: 120,
      rows: 40,
      cwd: process.cwd(),
      env: process.env,
    });

    let output = '';
    let readyForInput = false;

    ptyProcess.onData((data) => {
      output += data;
      if (data.includes('Type your message') || data.includes('/exit')) {
        readyForInput = true;
      }
    });

    // Wait for the CLI to be fully ready
    await new Promise<void>((resolve) => {
      const checkReady = setInterval(() => {
        if (readyForInput) {
          clearInterval(checkReady);
          resolve();
        }
      }, 500);
    });

    // Send /stats command
    ptyProcess.write('/stats\r');

    // Wait for stats output
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Send exit command
    ptyProcess.write('/exit\r');

    // Wait for cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ptyProcess.kill();

    return this.parseUsageStats(output);
  }

  private parseUsageStats(output: string): GeminiModelUsage[] {
    if (!output.includes('Resets in')) {
      throw new Error('Failed to get usage stats from gemini CLI - "Resets in" not found in output');
    }

    // Normalize line endings and split
    const normalizedOutput = output.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedOutput.split('\n');
    const modelUsage: GeminiModelUsage[] = [];

    for (const line of lines) {
      const cleanLine = stripAnsiCodes(line);
      // Match lines like: "│  gemini-2.5-flash               -    98.6% (Resets in 2h 39m)                                                        │"
      const match = cleanLine.match(/gemini[\w.-]+\s+(-|\d+)\s+([\d.]+)%\s*\(Resets in ([^)]+)\)/);
      if (match) {
        modelUsage.push({
          model: match[0].match(/gemini[\w.-]+/)![0],
          requests: match[1],
          usage: match[2],
          resets: match[3],
        });
      }
    }

    return modelUsage;
  }
}
