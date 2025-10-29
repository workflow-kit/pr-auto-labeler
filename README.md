# 🏷️ PR Auto-Labeler

> Intelligent, reusable GitHub Actions workflow that automatically labels pull requests based on content and metadata analysis.

[![GitHub](https://img.shields.io/badge/GitHub-workflow--kit%2Fpr--auto--labeler-blue?logo=github)](https://github.com/workflow-kit/pr-auto-labeler)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Current Rules](#current-rules)
- [Contributing](#contributing)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Overview

PR Auto-Labeler automatically analyzes pull requests and applies labels based on configurable rules. It helps teams:

- **Streamline PR triage** by automatically categorizing changes
- **Improve visibility** into what type of changes a PR contains
- **Enforce consistency** across repositories
- **Save time** by eliminating manual labeling

## ✨ Features

- **🔌 Reusable Workflow**: Use across multiple repositories with minimal setup
- **🎨 Modular Rule System**: Easy to add new detection rules
- **⚙️ Highly Configurable**: Override labels, skip rules, set thresholds
- **🏷️ Auto Label Creation**: Automatically creates labels if they don't exist
- **🐛 Debug Mode**: Detailed logging for troubleshooting
- **🚀 Fast**: Completes in seconds for most PRs
- **🔓 Open Source**: Community-driven rule development

## 🚀 Quick Start

### Step 1: Create Workflow File

In your repository, create `.github/workflows/pr-labeler.yml`:

```yaml
name: Auto Label PRs

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  label:
    uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
```

### Step 2: That's It!

Create a pull request and watch the magic happen! 🎉

## ⚙️ Configuration

### Basic Configuration

Customize behavior with input parameters:

```yaml
jobs:
  label:
    uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
    with:
      # Enable debug logging (default: false)
      enable_debug: true
      
      # Threshold for large PR detection (default: 500)
      large_pr_threshold: 800
      
      # Override default label names (JSON object)
      label_overrides: '{"ui-change":"frontend-change"}'
      
      # Skip specific labels (JSON array)
      skip_labels: '["style-change"]'
```

### Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `label_overrides` | JSON Object | `{}` | Map default labels to custom names |
| `large_pr_threshold` | Number | `500` | Lines changed to trigger `large-pr` label |
| `enable_debug` | Boolean | `false` | Enable detailed debug logging |
| `skip_labels` | JSON Array | `[]` | Labels to skip applying |

### Examples

#### Override Label Names

If your organization uses different naming conventions:

```yaml
with:
  label_overrides: |
    {
      "ui-change": "frontend",
      "style-change": "css-only"
    }
```

#### Skip Certain Labels

If you don't want certain labels applied:

```yaml
with:
  skip_labels: '["style-change", "test-only"]'
```

#### Debug Mode for Troubleshooting

```yaml
with:
  enable_debug: true
```

This will show detailed logs including:
- Files analyzed
- Rules executed
- Labels detected
- Final labels applied

## 📚 Current Rules

### 🎨 Frontend/UI Detection

Detects changes to frontend and UI files.

**Labels Applied:**
- **`ui-change`** (🟢 Green): UI/Frontend files modified
  - Triggered by: `.html`, `.css`, `.scss`, `.sass`, `.less`, `.jsx`, `.tsx`, `.vue`
- **`style-change`** (🟣 Purple): Only style files modified (no JavaScript)
  - Triggered by: `.css`, `.scss`, `.sass`, `.less` (without `.js`, `.jsx`, `.ts`, `.tsx`)

**Example:**
```
PR modifies: index.html, styles.css
→ Labels: ui-change, style-change

PR modifies: App.jsx, styles.css
→ Labels: ui-change (only)
```

---

### 🔜 Coming Soon

More rules are being developed! See [requirement.md](requirement.md) for the full roadmap including:

- 🗃️ Database & Migration Detection
- 🧪 Test Coverage Analysis
- 📦 Dependency Change Detection
- 🔧 Environment & Configuration Changes
- 🏗️ Infrastructure & CI/CD Changes
- 🔒 Security & Sensitive Changes
- 📏 PR Size & Structure Analysis

**Want to contribute a new rule?** See [Contributing](#contributing) below!

## 🤝 Contributing

We love contributions! Contributing a new rule is now super simple:

### ⚡ Quick: Submit a New Rule (Recommended)

**It's now incredibly easy to contribute!** Just add one file:

1. **Fork this repo**
2. **Create a file** in `src/rules/` (e.g., `database-migration.js`)
3. **Copy the template** from `src/rules/RULE_TEMPLATE.js`
4. **Write your detection logic** (10-50 lines of code typically)
5. **Submit a PR** with ONLY your new rule file!

**That's it!** No need to modify any other files. The workflow automatically discovers and loads all rules in `src/rules/`.

### Detailed Guide

1. **Read the Contributing Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions
2. **Use the Template**: Copy `src/rules/RULE_TEMPLATE.js` to start your rule
3. **Implement Your Logic**: Follow the patterns in existing rules
4. **Test Your Rule**: Verify it works with real PRs
5. **Submit a PR**: Include only your new rule file

### Option 2: Report Issues or Suggest Rules

- **Bug Report**: Found a problem? [Open an issue](../../issues)
- **Rule Request**: Have an idea for a rule? [Start a discussion](../../discussions)
- **Question**: Need help? [Ask in discussions](../../discussions)

### 📝 Example: Creating a Rule in 2 Minutes

A rule is just a JavaScript function that returns labels. Here's a complete example:

```javascript
// File: src/rules/documentation.js

function documentationRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Check if any .md files were changed
  for (const file of files) {
    if (file.filename.endsWith('.md')) {
      labels.push('documentation');
      break;
    }
  }
  
  return labels;
}

// Metadata for automatic label creation
documentationRule.metadata = {
  name: 'Documentation Detection',
  description: 'Detects documentation changes',
  labels: [
    { 
      name: 'documentation', 
      color: '0075CA', 
      description: 'Documentation updates' 
    }
  ],
  author: 'your-username',
  version: '1.0.0'
};

module.exports = documentationRule;
```

**That's it!** Submit this file and it's automatically discovered and loaded.

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete guide and more examples!

## 🔧 Advanced Usage

### Version Pinning

Pin to a specific version for stability:

```yaml
uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@v1.0.0
```

Or use a commit SHA for maximum control:

```yaml
uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@abc123def
```

### Multiple Workflows

You can use different configurations for different scenarios:

```yaml
# .github/workflows/pr-labeler-main.yml
on:
  pull_request:
    branches: [main]
jobs:
  label:
    uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
    with:
      enable_debug: false

# .github/workflows/pr-labeler-dev.yml
on:
  pull_request:
    branches: [develop, feature/*]
jobs:
  label:
    uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
    with:
      enable_debug: true
```

### Manual Trigger

Add `workflow_dispatch` to run manually:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
  workflow_dispatch:  # Enable manual runs
```

## 🐛 Troubleshooting

### Workflow Not Running

**Problem**: Workflow doesn't trigger on pull requests

**Solutions**:
1. Verify the workflow file is in `.github/workflows/`
2. Check that permissions are granted:
   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```
3. Ensure the workflow is enabled in your repository settings

### Labels Not Applied

**Problem**: Workflow runs but no labels are applied

**Solutions**:
1. Enable debug mode to see what's happening:
   ```yaml
   with:
     enable_debug: true
   ```
2. Check the workflow logs in the Actions tab
3. Verify PR contains files that match rule criteria
4. Check if labels are being skipped via `skip_labels`

### Permission Denied

**Problem**: Error: "Resource not accessible by integration"

**Solutions**:
1. Add required permissions to workflow:
   ```yaml
   permissions:
     pull-requests: write
   ```
2. Verify GitHub Actions is enabled in repository settings
3. Check organization/repository policies don't block Actions

### Labels Not Created

**Problem**: Workflow tries to create labels but fails

**Solutions**:
1. Verify the user/bot has permission to create labels
2. Check if label names are valid (no special characters)
3. Ensure color codes are valid hex values (without `#`)

## 📖 How It Works

1. **Trigger**: Workflow runs when a PR is opened, updated, or reopened
2. **Fetch**: Downloads PR file information from GitHub API
3. **Analyze**: Runs each rule against the PR files
4. **Collect**: Gathers all labels from all rules
5. **Apply**: Adds labels to the PR (creates them if needed)

### Architecture

```
Pull Request Event
    ↓
Checkout Repository
    ↓
Fetch PR Files ← GitHub API
    ↓
Execute Rules (in order)
  ├─ Frontend/UI Rule
  ├─ [Your Rule Here]
  └─ [More Rules...]
    ↓
Collect Labels
  ├─ Apply Overrides
  └─ Filter Skipped
    ↓
Apply Labels ← GitHub API
  └─ Create if Needed
    ↓
Done ✅
```

## 🧪 Testing

### Running Tests

This project uses Jest for testing. To run tests:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

We maintain high test coverage:
- Minimum 80% coverage required
- Automated tests run on every PR
- Coverage reports available in CI artifacts

### Writing Tests

When contributing a new rule, include tests:

```javascript
// __tests__/my-rule.test.js
const myRule = require('../src/rules/my-rule');

describe('My Rule', () => {
  it('should detect target files', () => {
    const files = [{ filename: 'target.ext' }];
    const labels = myRule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('my-label');
  });
});
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed testing guidelines.

### CI/CD

Tests run automatically on:
- Pull request creation and updates
- Push to main branch
- Manual workflow dispatch

The test workflow includes:
- ✅ Unit tests (Node 18 & 20)
- 🔍 Syntax validation
- 📋 Structure validation
- 📊 Coverage reporting

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [GitHub Actions](https://github.com/features/actions)
- Uses [actions/github-script](https://github.com/actions/github-script)
- Inspired by community feedback and real-world needs

## 📞 Support

- **📖 Documentation**: You're reading it!
- **💬 Discussions**: [GitHub Discussions](../../discussions)
- **🐛 Issues**: [GitHub Issues](../../issues)
- **📝 Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **📋 Roadmap**: [requirement.md](requirement.md)

---

Made with ❤️ by the community • [Contribute](CONTRIBUTING.md) • [Report Bug](../../issues) • [Request Feature](../../discussions)
