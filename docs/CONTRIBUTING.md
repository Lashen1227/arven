# Contributing to arven

Thank you for your interest in contributing to arven! 🎉

Whether you're fixing bugs, improving documentation, suggesting new features, or submitting code changes, your contributions are greatly appreciated.

## Overview

arven is an open-source CLI that helps developers keep environment variable documentation synchronized with their codebase by automatically generating `.env.example` files and preventing undocumented variables from being committed.

This guide explains how to set up the project, contribute code, report issues, and submit pull requests.

---

## Project Resources

* **Homepage:** https://arven-lashen.onrender.com
* **Docs:** https://arven-lashen.onrender.com/docs/introduction
* **Architecture:** https://github.com/Lashen1227/arven/blob/main/ARCHITECTURE.md
* **Issue Tracker:** https://github.com/Lashen1227/arven/issues
* **Discussion:** https://github.com/Lashen1227/arven/discussions

---

## Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

* Node.js 20 or later
* npm 9 or later
* Git

---

## Setting Up the Development Environment

1. Fork the repository to your GitHub account.
2. Clone Your Fork
3. Install Dependencies

```bash
npm install
```

4. Build the Project

```bash
npm run build
```

5. Run in Development Mode

```bash
npm run dev
```

This will watch for file changes and rebuild automatically.

---

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode (if supported):

```bash
npm run test:watch
```

Please ensure all tests pass before submitting a pull request.

---

## Contributing Code

1. Create a new branch from the latest main branch.
2. Make your changes.
3. Run tests and verify functionality.
4. Commit your changes using a clear commit message.
5. Push your branch.
6. Open a Pull Request against the `main` branch.

---

## Pull Request Guidelines

Before submitting a pull request, please ensure:

* The code builds successfully.
* All tests pass.
* Documentation is updated when necessary.
* Changes are focused on a single feature or fix.
* Commit messages are descriptive and meaningful.
* Existing functionality is not broken.

### Good Examples

```text
feat: add Bun environment variable detection
fix: prevent duplicate variables in generated output
docs: improve installation instructions
refactor: simplify environment parser logic
```

### Avoid

```text
update stuff
fix bug
changes
misc updates
```

---

## Reporting Bugs

If you discover a bug, please create an issue and include:

* A clear description of the problem
* Steps to reproduce
* Expected behavior
* Actual behavior
* Operating system and version
* Node.js version
* arven version

Providing a minimal reproducible example helps us resolve issues faster.

---

## Suggesting Features

Feature requests are welcome.

Before opening a new feature request:

1. Check existing issues to avoid duplicates.
2. Explain the problem you're trying to solve.
3. Describe your proposed solution.
4. Include examples when possible.

---

## Documentation Contributions

Documentation improvements are just as valuable as code contributions.

Examples include:

* Fixing typos
* Improving explanations
* Adding examples
* Enhancing guides and tutorials
* Updating outdated information

---

## Code Style

Please follow the existing code style and project conventions.

General guidelines:

* Write readable and maintainable code.
* Prefer descriptive variable and function names.
* Keep functions focused and small when possible.
* Add comments only when they provide useful context.
* Avoid introducing unnecessary dependencies.

---

## Questions and Discussions

If you're unsure about a contribution, feature idea, or implementation approach, feel free to open an issue and start a discussion before investing significant development time.

Thank you for helping improve arven and making environment variable management easier for developers everywhere. 🚀
