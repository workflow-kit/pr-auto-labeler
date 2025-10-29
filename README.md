# 🏷️ PR Auto-Labeler

> **Automatically label your pull requests** based on code changes. Set up in 2 minutes.

[![GitHub](https://img.shields.io/badge/GitHub-workflow--kit%2Fpr--auto--labeler-blue?logo=github)](https://github.com/workflow-kit/pr-auto-labeler)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Quick Setup

### Step 1: Create Workflow File

Create `.github/workflows/pr-labeler.yml`:

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
    with:
      # ⚠️ IMPORTANT: Enable the rules you want (all disabled by default)
      enabled_rules: '["ui-change", "env-change", "potential-secret-leak"]'
```

### Available Rules

Choose which rules to enable from the table below:

| Rule Name | Label | Detects | File Types | Use Case |
|-----------|-------|---------|------------|----------|
| `ui-change` | `ui-change` 🟢 | Frontend files | `.html`, `.css`, `.scss`, `.jsx`, `.tsx`, `.vue` | Track UI changes |
| `style-change` | `style-change` 🟣 | Style-only changes | `.css`, `.scss` (no JS/TS) | Identify cosmetic changes |
| `env-change` | `env-change` 🟠 | Environment files | `.env`, `.env.*`, `config.yml`, `config.json` | Track config changes |
| `new-env-variable` | `new-env-variable` 🟡 | New env variables | Detects new `KEY=value` in diffs | Flag new config |
| `potential-secret-leak` | `potential-secret-leak` 🔴 | Secrets detected | Keywords: `API_KEY`, `PASSWORD`, `SECRET`, `TOKEN` | Security review |
| `docker-change` | `docker-change` ⚫ | Docker files | `Dockerfile`, `.dockerignore`, `docker-compose.yml` | Track Docker config |
| `migration` | `migration` 🔵 | Migration files | `migrations/**`, `db/migrations/**`, `database/migrations/**` | Track DB migrations |
| `risky-migration` | `risky-migration` 🔴 | Risky migrations | DROP, TRUNCATE, ALTER DROP in migration files | Flag dangerous operations |

**Example configurations:**
```yaml
# Enable all rules
enabled_rules: '["ui-change", "style-change", "env-change", "new-env-variable", "potential-secret-leak", "docker-change"]'

# Frontend team only
enabled_rules: '["ui-change", "style-change"]'

# Security-focused
enabled_rules: '["potential-secret-leak"]'

# Infrastructure team
enabled_rules: '["docker-change", "env-change"]'
```

### Step 2: Commit & Push

```bash
git add .github/workflows/pr-labeler.yml
git commit -m "Add PR auto-labeler"
git push
```

### Step 3: Done! ✅

Create a pull request and labels will be applied automatically.

---

## ⚙️ Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled_rules` | JSON Array | `[]` | **Required:** Rules to enable (all disabled by default) |
| `label_overrides` | JSON Object | `{}` | **Optional:** Custom label names (e.g., `{"ui-change":"frontend"}`) |
| `enable_debug` | Boolean | `false` | **Optional:** Enable debug logging |

**Examples:**

Override label names:
```yaml
enabled_rules: '["ui-change"]'
label_overrides: '{"ui-change":"frontend"}'
# Will apply "frontend" label instead of "ui-change"
```

Enable debug mode:
```yaml
enabled_rules: '["ui-change"]'
enable_debug: true
# Shows detailed logs: files analyzed, rules executed, labels detected
```

---

## 🐛 Troubleshooting

### Labels Not Applied?

1. ✅ **Check if rules are enabled** - All rules are disabled by default!
   ```yaml
   enabled_rules: '["ui-change"]'  # Must not be empty!
   ```

2. ✅ **Enable debug mode** to see what's happening:
   ```yaml
   enable_debug: true
   ```

3. ✅ **Check workflow logs** for messages like:
   - `⚠️ No rules enabled`
   - `⚠️ No rules loaded`

### Workflow Not Running?

1. ✅ Verify file is at `.github/workflows/pr-labeler.yml`
2. ✅ Check permissions are set correctly
3. ✅ Ensure GitHub Actions is enabled in repository settings

---

## 📝 Examples

**Frontend Change:**
- PR modifies: `index.html`, `styles.css`
- Config: `enabled_rules: '["ui-change", "style-change"]'`
- Result: Gets `ui-change` and `style-change` labels

**Adding Secret:**
- PR adds: `.env` with `API_KEY=secret123`
- Config: `enabled_rules: '["env-change", "new-env-variable", "potential-secret-leak"]'`
- Result: Gets all three labels

---

## 🤝 Contributing

Want to add a new rule? See [CONTRIBUTING.md](CONTRIBUTING.md) for complete guide.

---

## 🔗 Links

- **📖 Documentation:** [docs/DESIGN.md](docs/DESIGN.md)
- **🤝 Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **💬 Discussions:** [GitHub Discussions](https://github.com/workflow-kit/pr-auto-labeler/discussions)
- **🐛 Issues:** [GitHub Issues](https://github.com/workflow-kit/pr-auto-labeler/issues)

---

**Made with ❤️ by the community**
