# Release Process

This document describes how to create a new release and publish to npm.

## Prerequisites

Before creating a release, ensure:

1. **Trusted Publishing is configured on npmjs.com**:
   - See [TRUSTED_PUBLISHING_SETUP.md](./TRUSTED_PUBLISHING_SETUP.md) for detailed setup instructions
   - This uses OIDC authentication instead of long-lived tokens (more secure!)
   - No secrets needed in GitHub repository

2. **All changes are committed and pushed** to the `main` branch

3. **Version number follows semantic versioning**: `MAJOR.MINOR.PATCH`
   - `MAJOR` - Breaking changes
   - `MINOR` - New features (backward compatible)
   - `PATCH` - Bug fixes (backward compatible)

## Creating a Release

### Method 1: Using GitHub UI (Recommended)

1. **Go to the Releases page**:
   https://github.com/shaharia-lab/ai-limit-checker/releases

2. **Click "Create a new release"**

3. **Choose a tag**:
   - Click "Choose a tag"
   - Enter the version number with `v` prefix: `v1.0.0`, `v1.0.1`, `v1.1.0`, etc.
   - Click "Create new tag: vX.Y.Z on publish"

4. **Fill in release details**:
   - **Release title**: `v1.0.0 - Initial Release` (or descriptive title)
   - **Description**: Copy from `CHANGELOG.md` or write release notes

   Example:
   ```markdown
   ## What's New
   - Added support for Claude CLI rate limits
   - Added support for Gemini CLI rate limits
   - Added support for z.ai rate limits via Playwright
   - CLI tool for checking all providers
   - Library API for programmatic access

   ## Installation
   \`\`\`bash
   npm install -g @shaharia-lab/ai-limit-checker
   \`\`\`

   ## Full Changelog
   https://github.com/shaharia-lab/ai-limit-checker/blob/main/CHANGELOG.md
   ```

5. **Set as latest release**: Check "Set as the latest release"

6. **Click "Publish release"**

### Method 2: Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Create a release
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "See CHANGELOG.md for details" \
  --latest
```

### Method 3: Using Git Tags

```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Then create the release on GitHub UI using the pushed tag
```

## What Happens After Publishing a Release

Once you publish a release on GitHub, the automated workflow will:

1. ✅ **Checkout the code** at the release tag
2. ✅ **Setup Node.js 20.x** with npm caching
3. ✅ **Install dependencies** (`npm ci`)
4. ✅ **Build the project** (`npm run build`)
5. ✅ **Verify build artifacts**:
   - Check that `dist/cli.js` exists
   - Check that `dist/index.js` exists
   - Check that type definitions exist
6. ✅ **Test the CLI executable** to ensure it runs
7. ✅ **Update package.json version** to match the release tag
8. ✅ **Publish to npm** using OIDC Trusted Publishing (secure, no tokens!)
9. ✅ **Generate provenance attestations** automatically
10. ✅ **Create GitHub deployment** for tracking

## Monitoring the Release

### View Workflow Progress

1. Go to the Actions tab: https://github.com/shaharia-lab/ai-limit-checker/actions
2. Find the "Release" workflow
3. Monitor the progress of each step
4. Check for any errors or warnings

### Verify npm Publication

After successful workflow completion:

1. **Check npm**: https://www.npmjs.com/package/@shaharia-lab/ai-limit-checker
2. **Verify version**: Ensure the new version appears
3. **Test installation**:
   ```bash
   npm install -g @shaharia-lab/ai-limit-checker@latest
   ai-limit-checker
   ```

## Pre-Release Checklist

Before creating a release, ensure:

- [ ] All tests pass (if any)
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated with new version
- [ ] Version number is bumped in package.json (optional, workflow does this)
- [ ] All changes are merged to `main` branch
- [ ] README.md examples work correctly
- [ ] Build completes without errors (`npm run build`)

## Update CHANGELOG.md

Before each release, update `CHANGELOG.md`:

```markdown
## [1.1.0] - 2024-01-10

### Added
- New feature X
- Support for provider Y

### Fixed
- Bug fix Z
- Performance improvement

### Changed
- Updated dependency versions

[1.1.0]: https://github.com/shaharia-lab/ai-limit-checker/compare/v1.0.0...v1.1.0
```

## Troubleshooting

### Release workflow fails

**Check the Actions tab** for detailed error messages:
https://github.com/shaharia-lab/ai-limit-checker/actions

Common issues:

1. **Build fails**:
   - Check TypeScript compilation errors
   - Ensure all dependencies are listed in package.json

2. **npm publish fails**:
   - Verify trusted publishing is configured correctly on npmjs.com
   - Check workflow filename matches exactly: `release.yml`
   - Ensure `id-token: write` permission is set in workflow
   - Check if version already exists on npm
   - Ensure you have publish permissions for `@shaharia-lab` scope
   - See [TRUSTED_PUBLISHING_SETUP.md](./TRUSTED_PUBLISHING_SETUP.md) for troubleshooting

3. **Version conflict**:
   - The version in the release tag must not already exist on npm
   - Check https://www.npmjs.com/package/@shaharia-lab/ai-limit-checker?activeTab=versions

### Unpublishing a version (if needed)

```bash
# Unpublish within 72 hours of publishing
npm unpublish @shaharia-lab/ai-limit-checker@1.0.0

# Deprecate a version (preferred over unpublishing)
npm deprecate @shaharia-lab/ai-limit-checker@1.0.0 "This version has been deprecated"
```

## Example Release Flow

```bash
# 1. Make your changes
git add .
git commit -m "Add new feature"
git push origin main

# 2. Update CHANGELOG.md
# Edit CHANGELOG.md to document changes

git add CHANGELOG.md
git commit -m "Update CHANGELOG for v1.1.0"
git push origin main

# 3. Create release on GitHub
# Go to https://github.com/shaharia-lab/ai-limit-checker/releases/new
# - Tag: v1.1.0
# - Title: v1.1.0 - Feature Release
# - Description: Copy from CHANGELOG.md
# - Click "Publish release"

# 4. Wait for workflow to complete
# Monitor at https://github.com/shaharia-lab/ai-limit-checker/actions

# 5. Verify publication
npm view @shaharia-lab/ai-limit-checker@1.1.0
npm install -g @shaharia-lab/ai-limit-checker@1.1.0
ai-limit-checker
```

## Release Schedule

- **Patch releases** (bug fixes): As needed
- **Minor releases** (new features): Monthly or as needed
- **Major releases** (breaking changes): Quarterly or as needed

## Questions?

If you have questions about the release process:
- Open an issue: https://github.com/shaharia-lab/ai-limit-checker/issues
- Check workflow runs: https://github.com/shaharia-lab/ai-limit-checker/actions
