# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-01-04

### Added
- Required `--tools` flag to specify which providers to check
- Automatic skip logic for unavailable providers with warning messages
- Error messages displayed to terminal for all failures

### Changed
- `checkLimits()` now accepts optional `tools` parameter to filter providers
- CLI is now invoked with `--tools=claude,gemini,zai` format
- Skipped providers return `resetAtHuman: "Unknown (skipped)"` instead of `"Unknown"`

### Fixed
- Claude check is skipped when `claude` CLI is not available
- Gemini check is skipped when `gemini` CLI is not available
- z.ai check is skipped when Chrome environment variables are not set

### Dependencies
- Added `which` package for command availability checking
- Added `@types/which` for TypeScript support

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

[0.1.1]: https://github.com/shaharia-lab/ai-limit-checker/releases/tag/v0.1.1
[1.0.0]: https://github.com/shaharia-lab/ai-limit-checker/releases/tag/v1.0.0
