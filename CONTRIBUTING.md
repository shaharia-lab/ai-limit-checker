# Contributing to AI Limit Checker

Thank you for your interest in contributing to AI Limit Checker! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ai-limit-checker.git
   cd ai-limit-checker
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building

```bash
npm run build
```

This compiles TypeScript files from `src/` to JavaScript in `dist/`.

### Testing Your Changes

After building, you can test the CLI locally:

```bash
# Link the package globally
npm link

# Run the CLI
ai-limit-checker

# Or run directly
node dist/cli.js
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

## Making Changes

### Adding a New LLM Provider

To add support for a new provider:

1. Create a new directory under `src/` (e.g., `src/newprovider/`)
2. Create `types.ts` with TypeScript interfaces
3. Create `client.ts` with the client implementation:
   ```typescript
   export class NewProviderClient {
     async getUsageStats(): Promise<NewProviderStatus> {
       // Implementation
     }
   }
   ```
4. Update `src/index.ts`:
   - Import the new client
   - Add a function like `getNewProviderStatus()`
   - Include it in the `checkLimits()` function
5. Update `README.md` with documentation
6. Export types and client from `src/index.ts`

### Fixing Bugs

1. Create an issue describing the bug (if one doesn't exist)
2. Reference the issue number in your commit message
3. Add a test case if applicable
4. Ensure your fix doesn't break existing functionality

### Improving Documentation

Documentation improvements are always welcome:
- Fix typos or unclear explanations
- Add more examples
- Improve setup instructions
- Add troubleshooting tips

## Submitting Changes

1. **Commit your changes** with a clear message:
   ```bash
   git commit -m "Add support for OpenAI provider"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Use a clear title describing the change
   - Reference any related issues
   - Describe what you changed and why
   - Include any breaking changes

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Ensure the build passes (`npm run build`)
- Update documentation if needed
- Follow the existing code style
- Be responsive to feedback

## Commit Message Guidelines

Use clear, descriptive commit messages:

- **Good**: "Add support for OpenAI API rate limits"
- **Good**: "Fix Chrome timeout issue in z.ai client"
- **Bad**: "Update files"
- **Bad**: "Fix bug"

Format:
```
<type>: <short description>

<optional longer description>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism gracefully
- Focus on what's best for the project

## Questions?

If you have questions:
- Open an issue for discussion
- Check existing issues and PRs
- Review the README.md

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AI Limit Checker!
