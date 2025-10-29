# pr-auto-labeler
Intelligent PR auto-labeling workflow — detects risky migrations, missing tests, dependency changes, and large PRs to streamline review workflows.

## 🚀 Quick Start

This is a reusable GitHub Actions workflow that automatically labels pull requests based on their content.

### Usage

To use this workflow in your repository, create a workflow file (e.g., `.github/workflows/pr-labeler.yml`) with the following content:

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
    uses: <YOUR-ORG>/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
```

### Configuration Options

You can customize the behavior with the following inputs:

```yaml
jobs:
  label:
    uses: <YOUR-ORG>/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
    with:
      large_pr_threshold: 800  # Default: 500
      enable_debug: true       # Default: false
      label_overrides: '{"ui-change":"frontend-change"}'  # Custom label names
      skip_labels: '["style-change"]'  # Labels to skip
```

## 🎨 Current Rules

### Frontend/UI Detection
- **`ui-change`**: Applied when files with UI extensions (`.html`, `.css`, `.scss`, `.jsx`, `.tsx`, `.vue`) are modified
- **`style-change`**: Applied when only style files (`.css`, `.scss`, `.sass`, `.less`) are modified (no JS/TS changes)

## 📋 Requirements

- GitHub repository with Actions enabled
- Permissions: `contents: read` and `pull-requests: write`

## 🔧 Development

See [requirement.md](requirement.md) for full specification and planned features.
