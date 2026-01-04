# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-04

### Added
- Initial release
- Support for Claude CLI rate limit checking
- Support for Gemini CLI rate limit checking
- Support for z.ai rate limit checking via Playwright
- CLI tool `ai-limit-checker`
- Library API with `checkLimits()` function
- Individual client classes (ClaudeClient, GeminiClient, ZaiClient)
- JSON output format
- TypeScript support with full type definitions
- Comprehensive README documentation
- MIT License

### Features
- Multi-provider rate limit checking in a single command
- Real-time status and reset times
- Graceful handling of missing providers
- Environment variable configuration for Chrome/Playwright
- Cross-platform support (Windows, macOS, Linux)

[1.0.0]: https://github.com/shaharia-lab/ai-limit-checker/releases/tag/v1.0.0
