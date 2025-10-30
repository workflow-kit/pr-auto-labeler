# Release v0.0.1 - Initial Release: Automated PR Labeling Made Simple

**Release Date**: [To be determined]  
**Tag**: `v0.0.1`

---

## 🎉 Initial Release

Welcome to the first stable release of **PR Auto-Labeler**! This is a reusable GitHub Actions workflow that automatically labels pull requests based on code changes, helping teams maintain consistent PR triage and review practices.

---

## ✨ Key Features

- **🔄 Reusable Workflow**: Drop-in reusable workflow that works across multiple repositories
- **🔍 Dynamic Rule Discovery**: Automatically discovers and loads rules from `src/rules/` directory
- **⚙️ Opt-in Rule System**: All rules are disabled by default - enable only what you need
- **🏷️ Automatic Label Creation**: Creates labels automatically with proper colors and descriptions
- **🎨 Flexible Configuration**: Custom label names, debug mode, and extensible rule system

---

## 🏷️ Available Rules (9 Rules)

### Frontend Detection (2 rules)

| Rule | Label | Description |
|------|-------|-------------|
| `ui-change` | 🟢 `ui-change` | Detects changes to frontend files (HTML, CSS, SCSS, JSX, TSX, Vue) |
| `style-change` | 🟣 `style-change` | Identifies style-only changes (CSS/SCSS without JavaScript/TypeScript) |

**Example Use Case**: Automatically label PRs that modify UI components or styling

```yaml
enabled_rules: '["ui-change", "style-change"]'
```

### Environment & Security (3 rules)

| Rule | Label | Description |
|------|-------|-------------|
| `env-change` | 🟠 `env-change` | Tracks environment and configuration file changes (`.env`, `config.yml`, etc.) |
| `new-env-variable` | 🟡 `new-env-variable` | Flags newly introduced environment variables |
| `potential-secret-leak` | 🔴 `potential-secret-leak` | Detects potential secrets (API keys, passwords, tokens, secrets) |

**Example Use Case**: Security-focused teams can enable these rules to track configuration changes and flag potential security issues

```yaml
enabled_rules: '["env-change", "new-env-variable", "potential-secret-leak"]'
```

### Database Migration (3 rules)

| Rule | Label | Description |
|------|-------|-------------|
| `migration` | 🔵 `migration` | Identifies database migration files in common directories |
| `risky-migration` | 🔴 `risky-migration` | Flags dangerous migration operations (DROP, TRUNCATE, ALTER DROP) |
| `schema-change` | 🟡 `schema-change` | Tracks database schema modifications (ALTER, RENAME, MODIFY COLUMN) |

**Example Use Case**: Database teams can automatically catch risky migrations that need extra review

```yaml
enabled_rules: '["migration", "risky-migration", "schema-change"]'
```

### Infrastructure (1 rule)

| Rule | Label | Description |
|------|-------|-------------|
| `docker-change` | ⚫ `docker-change` | Detects changes to Docker files (Dockerfile, docker-compose.yml, .dockerignore) |

**Example Use Case**: DevOps teams tracking infrastructure and containerization changes

```yaml
enabled_rules: '["docker-change"]'
```

---

## 📦 Installation & Quick Start

### Step 1: Create Workflow File

Create `.github/workflows/pr-labeler.yml` in your repository:

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
    uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@v0.0.1
    with:
      # ⚠️ IMPORTANT: Enable the rules you want (all disabled by default)
      enabled_rules: '["ui-change", "env-change", "potential-secret-leak"]'
```

### Step 2: Commit & Push

```bash
git add .github/workflows/pr-labeler.yml
git commit -m "Add PR auto-labeler workflow"
git push
```

### Step 3: Done! ✅

Create a pull request and labels will be applied automatically based on your enabled rules.

---

## 🔧 Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled_rules` | JSON Array | `[]` | **Required:** Rules to enable (all disabled by default) |
| `label_overrides` | JSON Object | `{}` | **Optional:** Custom label names (e.g., `{"ui-change":"frontend"}`) |
| `enable_debug` | Boolean | `false` | **Optional:** Enable debug logging for troubleshooting |

### Configuration Examples

**Override label names:**
```yaml
enabled_rules: '["ui-change"]'
label_overrides: '{"ui-change":"frontend"}'
# Will apply "frontend" label instead of "ui-change"
```

**Enable debug mode:**
```yaml
enabled_rules: '["ui-change"]'
enable_debug: true
# Shows detailed logs: files analyzed, rules executed, labels detected
```

**Enable all rules:**
```yaml
enabled_rules: '["ui-change", "style-change", "env-change", "new-env-variable", "potential-secret-leak", "docker-change", "migration", "risky-migration", "schema-change"]'
```

**Frontend team only:**
```yaml
enabled_rules: '["ui-change", "style-change"]'
```

**Security-focused:**
```yaml
enabled_rules: '["potential-secret-leak", "env-change", "new-env-variable"]'
```

**Infrastructure team:**
```yaml
enabled_rules: '["docker-change", "env-change"]'
```

---

## 🧪 Testing & Quality

- ✅ Full test suite with Jest
- ✅ 80%+ code coverage threshold
- ✅ Comprehensive tests for all implemented rules
- ✅ Edge case handling for various file types and scenarios

---

## 📚 Documentation

- **[README.md](README.md)** - Complete setup guide, configuration options, and usage examples
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guide for adding new rules and contributing
- **[docs/DESIGN.md](docs/DESIGN.md)** - Architecture overview and design decisions

---

## 🐛 Known Limitations

- All rules are disabled by default - you must explicitly enable them in your workflow
- Works best with PRs up to 5000 lines of changes
- Requires appropriate GitHub Actions permissions

---

## 🙏 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to add new rules
- Testing guidelines
- Code style and best practices
- Rule development templates

---

## 🔗 Links

- **Repository**: [GitHub](https://github.com/workflow-kit/pr-auto-labeler)
- **Issues**: [Report a bug](https://github.com/workflow-kit/pr-auto-labeler/issues)
- **Discussions**: [GitHub Discussions](https://github.com/workflow-kit/pr-auto-labeler/discussions)

---

## 📝 Changelog

### v0.0.1 (Initial Release)

**Added:**
- Reusable GitHub Actions workflow for automatic PR labeling
- Dynamic rule discovery system from `src/rules/` directory
- 9 detection rules across 4 categories:
  - Frontend: `ui-change`, `style-change`
  - Environment: `env-change`, `new-env-variable`, `potential-secret-leak`
  - Database: `migration`, `risky-migration`, `schema-change`
  - Infrastructure: `docker-change`
- Automatic label creation with colors and descriptions
- Configurable rule system with opt-in architecture
- Label override functionality
- Debug mode for troubleshooting
- Comprehensive test suite with Jest
- Complete documentation (README, CONTRIBUTING, DESIGN docs)

**Notes:**
- This is the first stable release
- All rules are disabled by default - users must explicitly enable them
- The system is designed to be extensible - new rules can be added easily

---

**Made with ❤️ by the community**

