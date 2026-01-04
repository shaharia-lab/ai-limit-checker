/**
 * AI Limit Checker - Check LLM provider rate limits
 */

import { loadChromeConfig } from './config/env.js';
import { ZaiClient } from './zai/client.js';
import { GeminiClient } from './gemini/client.js';
import { ClaudeClient } from './claude/client.js';
import type { GeminiModelUsage } from './gemini/types.js';
import type { ClaudeStatusInfo } from './claude/types.js';

export interface LlmLimitStatus {
  provider: string;
  status: 'rate_limit_exceed' | 'available';
  resetAt?: number;
  resetAtHuman?: string;
}

interface ZaiLimit {
  type: string;
  nextResetTime?: number;
  percentage: number;
}

function parseZaiResetTime(timestamp?: number): { resetAt: number; human: string } {
  if (!timestamp) {
    const now = Date.now();
    return { resetAt: now, human: 'Unknown' };
  }
  return {
    resetAt: timestamp,
    human: new Date(timestamp).toISOString(),
  };
}

function parseGeminiResetTime(resetStr: string): number {
  // Parse strings like "2h 39m", "23h 45m", "1d 2h 30m"
  const now = Date.now();
  let ms = 0;

  const dayMatch = resetStr.match(/(\d+)d/);
  if (dayMatch) {
    ms += parseInt(dayMatch[1], 10) * 24 * 60 * 60 * 1000;
  }

  const hourMatch = resetStr.match(/(\d+)h/);
  if (hourMatch) {
    ms += parseInt(hourMatch[1], 10) * 60 * 60 * 1000;
  }

  const minMatch = resetStr.match(/(\d+)m/);
  if (minMatch) {
    ms += parseInt(minMatch[1], 10) * 60 * 1000;
  }

  return now + ms;
}

async function getZaiStatus(): Promise<LlmLimitStatus> {
  try {
    // Check if Chrome environment is set up
    if (!process.env.CHROME_OUTPUT_DIR || !process.env.CHROME_USER_DATA_DIR) {
      return {
        provider: 'zai',
        status: 'available',
        resetAt: 0,
        resetAtHuman: 'Unknown',
      };
    }

    const config = loadChromeConfig();
    const client = new ZaiClient(config);
    const limits = await client.getUsageQuota();

    // Find TOKENS_LIMIT
    const tokensLimit = limits.find((limit) => limit.type === 'TOKENS_LIMIT');
    if (tokensLimit) {
      const isRateLimited = tokensLimit.percentage >= 100;
      const { resetAt, human } = parseZaiResetTime(tokensLimit.nextResetTime);
      return {
        provider: 'zai',
        status: isRateLimited ? 'rate_limit_exceed' : 'available',
        resetAt,
        resetAtHuman: human,
      };
    }

    return {
      provider: 'zai',
      status: 'available',
      resetAt: 0,
      resetAtHuman: 'Unknown',
    };
  } catch {
    return {
      provider: 'zai',
      status: 'available',
      resetAt: 0,
      resetAtHuman: 'Unknown',
    };
  }
}

async function getGeminiStatus(): Promise<LlmLimitStatus> {
  try {
    const client = new GeminiClient();
    const usage = await client.getUsageStats();

    // Check if any model is rate limited (usage >= 100% or very close)
    const hasRateLimit = usage.some((u) => parseFloat(u.usage) >= 99);

    // Find the earliest reset time among all models
    let earliestReset = Infinity;
    for (const model of usage) {
      const resetTime = parseGeminiResetTime(model.resets);
      if (resetTime < earliestReset) {
        earliestReset = resetTime;
      }
    }

    return {
      provider: 'gemini',
      status: hasRateLimit ? 'rate_limit_exceed' : 'available',
      resetAt: earliestReset === Infinity ? 0 : earliestReset,
      resetAtHuman: earliestReset === Infinity ? 'Unknown' : new Date(earliestReset).toISOString(),
    };
  } catch {
    return {
      provider: 'gemini',
      status: 'available',
      resetAt: 0,
      resetAtHuman: 'Unknown',
    };
  }
}

async function getClaudeStatus(): Promise<LlmLimitStatus> {
  try {
    const client = new ClaudeClient();
    const status = await client.getUsageStats();

    // If session used is 100%, we're rate limited
    const isRateLimited = status.sessionUsed >= 100;

    // Parse reset time from the status string
    // Format could be "4pm", "Jan 10, 12pm", etc.
    let resetTime = 0;
    if (status.sessionResetTime !== 'Unknown') {
      const now = new Date();
      const resetStr = status.sessionResetTime;

      // Try parsing as time only (e.g., "4pm")
      const timeMatch = resetStr.match(/(\d+)(am|pm)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        if (timeMatch[2].toLowerCase() === 'pm' && hour !== 12) {
          hour += 12;
        } else if (timeMatch[2].toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }
        const resetDate = new Date(now);
        resetDate.setHours(hour, 0, 0, 0);
        if (resetDate < now) {
          resetDate.setDate(resetDate.getDate() + 1);
        }
        resetTime = resetDate.getTime();
      }
    }

    return {
      provider: 'claude',
      status: isRateLimited ? 'rate_limit_exceed' : 'available',
      resetAt: resetTime,
      resetAtHuman: resetTime > 0 ? new Date(resetTime).toISOString() : status.sessionResetTime,
    };
  } catch {
    return {
      provider: 'claude',
      status: 'available',
      resetAt: 0,
      resetAtHuman: 'Unknown',
    };
  }
}

/**
 * Check all LLM provider rate limits
 * @returns Array of limit status for each provider
 */
export async function checkLimits(): Promise<LlmLimitStatus[]> {
  const results = await Promise.all([
    getClaudeStatus(),
    getGeminiStatus(),
    getZaiStatus(),
  ]);

  return results;
}

// Export types
export type { GeminiModelUsage, ClaudeStatusInfo };
export { ZaiClient, GeminiClient, ClaudeClient };
