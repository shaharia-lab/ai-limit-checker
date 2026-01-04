# Setting Up Trusted Publishing for npm

This guide walks you through configuring npm trusted publishing for the `@shaharia-lab/ai-limit-checker` package. Trusted publishing uses OpenID Connect (OIDC) to securely publish packages without long-lived npm tokens.

## Why Trusted Publishing?

✅ **More Secure**: No long-lived tokens that can be compromised
✅ **Automatic Provenance**: Cryptographic proof of package authenticity
✅ **Simpler Management**: No manual token rotation needed
✅ **Industry Standard**: Recommended by npm and OpenSSF

## Prerequisites

Before setting up trusted publishing:

1. **npm CLI version 11.5.1 or later** is required
   ```bash
   npm --version  # Should be 11.5.1+
   ```

2. **You must be an owner or maintainer** of the `@shaharia-lab/ai-limit-checker` package on npmjs.com

3. **GitHub repository** must be public (for automatic provenance generation)

## Step-by-Step Setup

### Step 1: Configure Trusted Publisher on npmjs.com

1. **Log in to npmjs.com** and navigate to your package:
   https://www.npmjs.com/package/@shaharia-lab/ai-limit-checker/access

2. **Scroll to the "Trusted Publisher" section**

3. **Click the "GitHub Actions" button** under "Select your publisher"

4. **Fill in the configuration**:
   - **Organization or user**: `shaharia-lab`
   - **Repository**: `ai-limit-checker`
   - **Workflow filename**: `release.yml`
   - **Environment name**: Leave empty (optional)

   **Important**: The workflow filename must be exact and include the `.yml` extension!

5. **Save the configuration**

### Step 2: Verify Workflow Configuration

The workflow file `.github/workflows/release.yml` is already configured with:

```yaml
permissions:
  id-token: write  # Required for OIDC trusted publishing
  contents: read
```

This permission allows GitHub Actions to generate OIDC tokens for authentication.

### Step 3: (Recommended) Restrict Token Access

For maximum security, restrict traditional token-based publishing:

1. Go to your package settings on npmjs.com:
   https://www.npmjs.com/package/@shaharia-lab/ai-limit-checker/access

2. Under "Publishing access", select:
   - ✅ **"Require two-factor authentication and disallow tokens"**

3. Click **"Update Package Settings"**

This ensures that only your trusted publisher (GitHub Actions) can publish, not traditional tokens.

### Step 4: Revoke Old Tokens (if any)

If you have existing automation tokens for this package:

1. Go to your npm account settings:
   https://www.npmjs.com/settings/YOUR_USERNAME/tokens

2. Find and revoke any tokens that were used for publishing this package

3. Keep any read-only tokens you need for installing private dependencies

## How to Publish a Release

Once trusted publishing is configured:

1. **Create a new release on GitHub**:
   - Go to: https://github.com/shaharia-lab/ai-limit-checker/releases/new
   - Tag: `v1.0.0` (or your version number)
   - Title: `v1.0.0 - Initial Release`
   - Description: Add release notes
   - Click "Publish release"

2. **The workflow automatically**:
   - ✅ Authenticates using OIDC (no token needed!)
   - ✅ Builds the package
   - ✅ Publishes to npm
   - ✅ Generates provenance attestations automatically

3. **Verify on npm**:
   ```bash
   npm view @shaharia-lab/ai-limit-checker
   ```

## What is Provenance?

When you publish using trusted publishing, npm automatically generates **provenance attestations**. This provides:

- 🔐 Cryptographic proof of where your package was built
- 📋 Verifiable build information (repository, commit, workflow)
- 🛡️ Protection against supply chain attacks

You'll see a **"Provenance"** badge on your package page showing:
- Source repository
- Build workflow
- Commit SHA
- And more!

## Troubleshooting

### "Unable to authenticate" error

✅ **Check workflow filename**: Must exactly match what you configured on npmjs.com (`release.yml`)
✅ **Verify permissions**: Ensure `id-token: write` is set in the workflow
✅ **Check repository**: Must use GitHub-hosted runners (self-hosted not supported)
✅ **Verify fields**: All fields are case-sensitive and must match exactly

### Workflow runs but publish fails

✅ **Check npm CLI version**: Workflow uses Node 20.x which includes npm 11.x
✅ **Verify trusted publisher config**: Double-check all fields on npmjs.com
✅ **Check package permissions**: Ensure you're an owner/maintainer

### Package already exists

If this is your first publish and the package name is already taken:

1. Choose a different package name, or
2. Request transfer of the existing package (if abandoned)

### Private dependencies

If your package has private dependencies, you'll still need a **read-only token** for `npm ci`:

```yaml
- name: Install dependencies
  run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_READ_TOKEN }}

# Publish step uses OIDC - no token needed
- name: Publish to npm
  run: npm publish --access public
```

## Verification Checklist

Before your first release, verify:

- [ ] Trusted publisher configured on npmjs.com
- [ ] Organization: `shaharia-lab`
- [ ] Repository: `ai-limit-checker`
- [ ] Workflow filename: `release.yml` (exact)
- [ ] Workflow has `id-token: write` permission
- [ ] (Optional) Token access restricted for extra security
- [ ] (Optional) Old automation tokens revoked

## Testing the Configuration

You can test without publishing by:

1. Creating a draft release on GitHub
2. Watching the workflow run (it will fail at publish, which is expected)
3. Verifying that authentication works
4. Deleting the draft release

Or simply create your first real release - the workflow will work!

## Security Best Practices

✅ **Use trusted publishing** instead of long-lived tokens
✅ **Restrict token access** once trusted publishing is working
✅ **Enable 2FA** on your npm account
✅ **Use read-only tokens** for private dependencies
✅ **Regularly audit** your trusted publisher configurations
✅ **Enable tag protection** on GitHub to control who can create releases

## Additional Resources

- [npm Trusted Publishing Documentation](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [OpenSSF Trusted Publishers Specification](https://repos.openssf.org/trusted-publishers-for-all-package-repositories)
- [npm API Documentation for OIDC](https://api-docs.npmjs.com/#tag/registry.npmjs.org/operation/exchangeOidcToken)

## Questions?

If you encounter issues:
- Check the [npm support documentation](https://docs.npmjs.com/packages-and-modules/securing-your-code/about-trusted-publishing)
- Open an issue on this repository
- Contact npm support

---

**Once configured, trusted publishing is automatic!** Every release you create on GitHub will automatically publish to npm with full provenance. 🎉
