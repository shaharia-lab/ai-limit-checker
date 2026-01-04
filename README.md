# AI Limit Checker

[![npm version](https://badge.fury.io/js/%40shaharia-lab%2Fai-limit-checker.svg)](https://www.npmjs.com/package/@shaharia-lab/ai-limit-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@shaharia-lab/ai-limit-checker)](https://nodejs.org)

A powerful CLI tool and library for monitoring rate limits across multiple LLM providers (Claude, Gemini, and z.ai). Perfect for developers, automation scripts, and monitoring systems that need to track API usage and avoid rate limit errors.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
  - [CLI Usage](#cli-usage)
  - [Library Usage](#library-usage)
- [Output Format](#output-format)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Use Cases](#use-cases)
- [Development](#development)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## Features

- ✅ **Multi-Provider Support**: Check rate limits for Claude, Gemini, and z.ai in one command
- ✅ **CLI & Library**: Use as a standalone CLI tool or integrate into your Node.js projects
- ✅ **JSON Output**: Structured JSON output perfect for automation and monitoring
- ✅ **Real-time Status**: Get current usage and reset times for each provider
- ✅ **Zero Configuration**: Works out of the box with provider CLIs already installed
- ✅ **TypeScript Support**: Fully typed for TypeScript projects
- ✅ **Lightweight**: Minimal dependencies, fast execution

## Installation

### Global Installation (CLI)

```bash
npm install -g @shaharia-lab/ai-limit-checker
```

### Local Installation (Library)

```bash
npm install @shaharia-lab/ai-limit-checker
```

## Quick Start

After installing globally, simply run:

```bash
ai-limit-checker
```

**Example Output:**

```json
[
  {
    "provider": "claude",
    "status": "available",
    "resetAt": 1704384000000,
    "resetAtHuman": "2024-01-04T16:00:00.000Z"
  },
  {
    "provider": "gemini",
    "status": "rate_limit_exceed",
    "resetAt": 1704393000000,
    "resetAtHuman": "2024-01-04T18:30:00.000Z"
  },
  {
    "provider": "zai",
    "status": "available",
    "resetAt": 1704412800000,
    "resetAtHuman": "2024-01-05T00:00:00.000Z"
  }
]
```

## Prerequisites

### Required for All Providers

- **Node.js**: Version 18.0.0 or higher
- **npm**: Latest version recommended

### Provider-Specific Requirements

#### Claude
- **Claude CLI**: Install from [claude.ai/code](https://claude.ai/code)
- Ensure you're logged in: `claude`

#### Gemini
- **Gemini CLI**: Install from [Google AI Studio](https://ai.google.dev/)
- Authentication configured with your API key

#### z.ai
- **Chrome Browser**: Required for Playwright automation
- **Environment Variables**: Configure Chrome directories (see [Configuration](#configuration))

## Usage

### CLI Usage

#### Basic Command

```bash
ai-limit-checker
```

#### Integration with Shell Scripts

```bash
#!/bin/bash

# Check if any provider is rate limited
result=$(ai-limit-checker)
if echo "$result" | grep -q "rate_limit_exceed"; then
    echo "Warning: One or more providers are rate limited!"
    echo "$result" | jq '.[] | select(.status=="rate_limit_exceed")'
    exit 1
fi

echo "All providers available"
```

#### Monitoring with Cron

Add to your crontab to check limits every hour:

```bash
0 * * * * /usr/local/bin/ai-limit-checker >> /var/log/llm-limits.log 2>&1
```

### Library Usage

#### Basic Example

```typescript
import { checkLimits } from '@shaharia-lab/ai-limit-checker';

async function main() {
  try {
    const limits = await checkLimits();

    for (const limit of limits) {
      console.log(`${limit.provider}: ${limit.status}`);
      if (limit.resetAtHuman) {
        console.log(`  Resets at: ${limit.resetAtHuman}`);
      }
    }
  } catch (error) {
    console.error('Error checking limits:', error);
  }
}

main();
```

#### Advanced Example: Smart Request Router

```typescript
import { checkLimits, type LlmLimitStatus } from '@shaharia-lab/ai-limit-checker';

async function getAvailableProvider(): Promise<string | null> {
  const limits = await checkLimits();

  // Find the first available provider
  const available = limits.find(limit => limit.status === 'available');

  if (available) {
    console.log(`Using ${available.provider}`);
    return available.provider;
  }

  // All providers rate limited - find the one that resets soonest
  const soonest = limits
    .filter(l => l.resetAt && l.resetAt > 0)
    .sort((a, b) => (a.resetAt! - b.resetAt!))[0];

  if (soonest) {
    const waitTime = soonest.resetAt! - Date.now();
    console.log(`All providers limited. ${soonest.provider} resets in ${waitTime}ms`);
  }

  return null;
}

// Use in your application
const provider = await getAvailableProvider();
if (provider) {
  // Make your API request to the available provider
}
```

#### Using Individual Clients

```typescript
import { ClaudeClient, GeminiClient, ZaiClient } from '@shaharia-lab/ai-limit-checker';

// Check only Claude
const claudeClient = new ClaudeClient();
const claudeStatus = await claudeClient.getUsageStats();
console.log(`Claude session usage: ${claudeStatus.sessionUsed}%`);

// Check only Gemini
const geminiClient = new GeminiClient();
const geminiUsage = await geminiClient.getUsageStats();
geminiUsage.forEach(model => {
  console.log(`${model.model}: ${model.usage}% (resets in ${model.resets})`);
});

// Check only z.ai (requires Chrome configuration)
const zaiClient = new ZaiClient({
  outputDir: process.env.CHROME_OUTPUT_DIR!,
  userDataDir: process.env.CHROME_USER_DATA_DIR!,
});
const zaiLimits = await zaiClient.getUsageQuota();
const tokensLimit = zaiLimits.find(l => l.type === 'TOKENS_LIMIT');
console.log(`z.ai tokens used: ${tokensLimit?.percentage}%`);
```

## Output Format

### Status Object

Each provider returns a status object with the following structure:

```typescript
interface LlmLimitStatus {
  provider: string;                           // Provider name: 'claude', 'gemini', or 'zai'
  status: 'rate_limit_exceed' | 'available';  // Current status
  resetAt?: number;                           // Unix timestamp (ms) when limit resets
  resetAtHuman?: string;                      // ISO 8601 formatted date string
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `available` | Provider is operational and accepting requests |
| `rate_limit_exceed` | Provider has reached its rate limit threshold |

### Example Outputs

#### All Providers Available

```json
[
  {
    "provider": "claude",
    "status": "available",
    "resetAt": 1704384000000,
    "resetAtHuman": "2024-01-04T16:00:00.000Z"
  },
  {
    "provider": "gemini",
    "status": "available",
    "resetAt": 1704470400000,
    "resetAtHuman": "2024-01-05T16:00:00.000Z"
  },
  {
    "provider": "zai",
    "status": "available",
    "resetAt": 1704412800000,
    "resetAtHuman": "2024-01-05T00:00:00.000Z"
  }
]
```

#### One Provider Rate Limited

```json
[
  {
    "provider": "claude",
    "status": "available",
    "resetAt": 1704384000000,
    "resetAtHuman": "2024-01-04T16:00:00.000Z"
  },
  {
    "provider": "gemini",
    "status": "rate_limit_exceed",
    "resetAt": 1704393000000,
    "resetAtHuman": "2024-01-04T18:30:00.000Z"
  },
  {
    "provider": "zai",
    "status": "available",
    "resetAt": 0,
    "resetAtHuman": "Unknown"
  }
]
```

## Configuration

### z.ai Chrome Setup

z.ai requires Chrome browser automation using Playwright. Follow these steps:

#### 1. Create Required Directories

```bash
mkdir -p ~/.chrome-data
mkdir -p ~/.chrome-output
```

#### 2. Set Up Chrome User Data

Launch Chrome with a persistent user data directory and log into z.ai:

```bash
google-chrome --user-data-dir="$HOME/.chrome-data"
```

**Note**: On macOS, use:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir="$HOME/.chrome-data"
```

#### 3. Log into z.ai

1. Navigate to [z.ai](https://z.ai)
2. Complete the login process
3. Close the browser window

#### 4. Set Environment Variables

Add these to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
export CHROME_OUTPUT_DIR="$HOME/.chrome-output"
export CHROME_USER_DATA_DIR="$HOME/.chrome-data"
```

Then reload your shell:

```bash
source ~/.bashrc  # or ~/.zshrc
```

#### 5. Verify Configuration

```bash
echo $CHROME_OUTPUT_DIR
echo $CHROME_USER_DATA_DIR
```

Both should output the paths you set.

### Alternative: Using .env File

For project-specific configuration, create a `.env` file:

```bash
CHROME_OUTPUT_DIR=/path/to/chrome/output
CHROME_USER_DATA_DIR=/path/to/chrome/user-data
```

Then load it in your script:

```typescript
import { config } from 'dotenv';
config();

import { checkLimits } from '@shaharia-lab/ai-limit-checker';
// ...
```

## API Reference

### `checkLimits()`

Main function that checks all provider limits.

```typescript
function checkLimits(): Promise<LlmLimitStatus[]>
```

**Returns**: Promise that resolves to an array of status objects for all providers.

**Example**:
```typescript
const limits = await checkLimits();
```

### `ClaudeClient`

Client for checking Claude CLI usage.

```typescript
class ClaudeClient {
  async getUsageStats(): Promise<ClaudeStatusInfo>
}

interface ClaudeStatusInfo {
  sessionUsed: number;        // Session usage percentage (0-100)
  sessionResetTime: string;   // Human-readable reset time
  weeklyUsed: number;         // Weekly usage percentage (0-100)
  weeklyResetTime: string;    // Human-readable weekly reset time
  hasSubscription: boolean;   // Whether user has a subscription
}
```

### `GeminiClient`

Client for checking Gemini CLI usage.

```typescript
class GeminiClient {
  async getUsageStats(): Promise<GeminiModelUsage[]>
}

interface GeminiModelUsage {
  model: string;     // Model name (e.g., "gemini-2.5-flash")
  requests: string;  // Number of requests or "-"
  usage: string;     // Usage percentage
  resets: string;    // Time until reset (e.g., "2h 30m")
}
```

### `ZaiClient`

Client for checking z.ai usage via browser automation.

```typescript
class ZaiClient {
  constructor(config: ZaiConfig)
  async getUsageQuota(): Promise<ZaiLimit[]>
}

interface ZaiConfig {
  outputDir: string;    // Chrome output directory
  userDataDir: string;  // Chrome user data directory
}

interface ZaiLimit {
  type: string;           // Limit type (e.g., "TOKENS_LIMIT")
  percentage: number;     // Usage percentage (0-100)
  nextResetTime?: number; // Unix timestamp of next reset
  // ... other fields
}
```

## Use Cases

### 1. CI/CD Pipeline Integration

```yaml
# .github/workflows/check-llm-limits.yml
name: Check LLM Limits

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  check-limits:
    runs-on: ubuntu-latest
    steps:
      - name: Install AI Limit Checker
        run: npm install -g @shaharia-lab/ai-limit-checker

      - name: Check Limits
        run: |
          ai-limit-checker > limits.json
          cat limits.json

      - name: Alert on Rate Limit
        run: |
          if grep -q "rate_limit_exceed" limits.json; then
            echo "::warning::One or more LLM providers are rate limited"
          fi
```

### 2. Smart Load Balancer

```typescript
import { checkLimits } from '@shaharia-lab/ai-limit-checker';

class LLMLoadBalancer {
  async getOptimalProvider(): Promise<string> {
    const limits = await checkLimits();

    // Prefer available providers
    const available = limits.filter(l => l.status === 'available');
    if (available.length > 0) {
      // Return random available provider for load distribution
      return available[Math.floor(Math.random() * available.length)].provider;
    }

    // All limited - queue request for soonest reset
    const soonest = limits
      .filter(l => l.resetAt && l.resetAt > 0)
      .sort((a, b) => a.resetAt! - b.resetAt!)[0];

    throw new Error(`All providers limited. Retry after ${soonest.resetAtHuman}`);
  }
}
```

### 3. Monitoring Dashboard

```typescript
import { checkLimits } from '@shaharia-lab/ai-limit-checker';
import express from 'express';

const app = express();

app.get('/api/llm-status', async (req, res) => {
  try {
    const limits = await checkLimits();
    res.json({
      timestamp: new Date().toISOString(),
      providers: limits,
      healthy: limits.every(l => l.status === 'available')
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check limits' });
  }
});

app.listen(3000, () => console.log('Dashboard running on http://localhost:3000'));
```

### 4. Cost Optimization

```typescript
import { checkLimits } from '@shaharia-lab/ai-limit-checker';

async function selectCostEffectiveProvider(preferCheaper: boolean = true) {
  const limits = await checkLimits();
  const available = limits.filter(l => l.status === 'available');

  if (available.length === 0) {
    throw new Error('No providers available');
  }

  // Example: Gemini is cheaper than Claude for most tasks
  const costOrder = preferCheaper
    ? ['gemini', 'zai', 'claude']
    : ['claude', 'zai', 'gemini'];

  for (const provider of costOrder) {
    if (available.some(a => a.provider === provider)) {
      return provider;
    }
  }

  return available[0].provider;
}
```

## Development

### Prerequisites for Development

- Node.js >= 18.0.0
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/shaharia-lab/ai-limit-checker.git
cd ai-limit-checker

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

### Project Structure

```
ai-limit-checker/
├── src/
│   ├── claude/         # Claude CLI client
│   ├── gemini/         # Gemini CLI client
│   ├── zai/            # z.ai browser automation client
│   ├── config/         # Environment configuration
│   ├── index.ts        # Main library exports
│   └── cli.ts          # CLI entry point
├── dist/               # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Testing Locally

```bash
# After linking
ai-limit-checker

# Or run directly
node dist/cli.js
```

## FAQ

### Q: Do I need accounts for all providers?

**A**: No. The tool will gracefully handle missing providers and return status information only for those you have configured.

### Q: How often should I check limits?

**A**: It depends on your usage. For active development, checking every 5-10 minutes is reasonable. For production monitoring, every hour is usually sufficient.

### Q: What if I don't use z.ai?

**A**: The tool works fine without z.ai configured. Simply don't set the `CHROME_OUTPUT_DIR` and `CHROME_USER_DATA_DIR` environment variables. The z.ai check will return `available` status with unknown reset time.

### Q: Can I use this in a Docker container?

**A**: Yes! For z.ai support in Docker, you'll need to install Chrome and configure Playwright. See the [Playwright Docker documentation](https://playwright.dev/docs/docker) for details.

### Q: Does this work on Windows/macOS/Linux?

**A**: Yes! The tool is cross-platform. Note that Chrome paths may differ:
- **Windows**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **macOS**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux**: `google-chrome` or `chromium-browser`

### Q: How accurate are the rate limit checks?

**A**: Very accurate. The tool uses the same interfaces (CLIs and web interfaces) that you use manually, ensuring the data is as current as what the providers report.

### Q: Can I contribute support for other providers?

**A**: Absolutely! We welcome contributions. Please see our [Contributing](#contributing) section and open a PR.

## Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues

- Use the [GitHub Issues](https://github.com/shaharia-lab/ai-limit-checker/issues) page
- Include your Node.js version, OS, and error messages
- Provide steps to reproduce the issue

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and build: `npm run build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Adding New Providers

To add support for a new LLM provider:

1. Create a new directory under `src/` (e.g., `src/newprovider/`)
2. Implement `client.ts` with the provider's API/CLI interface
3. Define types in `types.ts`
4. Update `src/index.ts` to include the new provider in `checkLimits()`
5. Add documentation to README.md
6. Submit a PR!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **npm Package**: https://www.npmjs.com/package/@shaharia-lab/ai-limit-checker
- **GitHub Repository**: https://github.com/shaharia-lab/ai-limit-checker
- **Issue Tracker**: https://github.com/shaharia-lab/ai-limit-checker/issues
- **Changelog**: https://github.com/shaharia-lab/ai-limit-checker/releases

## Acknowledgments

- Built with [Playwright](https://playwright.dev/) for browser automation
- Uses [node-pty](https://github.com/microsoft/node-pty) for CLI interaction
- Developed by [Shaharia Lab](https://github.com/shaharia-lab)

---

**Made with ❤️ by the Shaharia Lab team**

If you find this tool useful, please consider giving it a ⭐ on [GitHub](https://github.com/shaharia-lab/ai-limit-checker)!
