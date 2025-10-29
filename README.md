# 🏷️ PR Auto-Labeler

> **Automatically label your pull requests** based on code changes. Zero configuration required for basic setup.

[![GitHub](https://img.shields.io/badge/GitHub-workflow--kit%2Fpr--auto--labeler-blue?logo=github)](https://github.com/workflow-kit/pr-auto-labeler)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Quick Setup (2 Minutes)

### 1. Create Workflow File

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
    uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
    with:
      # ⚠️ IMPORTANT: Enable the rules you want to use
      enabled_rules: '["ui-change", "style-change", "env-change", "new-env-variable", "potential-secret-leak"]'
```

### 2. Commit & Push

```bash
git add .github/workflows/pr-labeler.yml
git commit -m "Add PR auto-labeler workflow"
git push
```

### 3. Done! ✅

Create a pull request and labels will be applied automatically.

---

## 📚 Supported Rules

All rules are **disabled by default**. Add them to `enabled_rules` to use them.

### 🎨 Frontend Rules

#### `ui-change` - UI/Frontend Changes
- **What it detects:** Any frontend files (HTML, CSS, JS frameworks)
- **Labels:** `ui-change`
- **File types:** `.html`, `.css`, `.scss`, `.sass`, `.less`, `.jsx`, `.tsx`, `.vue`
- **Enable:**
  ```yaml
  enabled_rules: '["ui-change"]'
  ```
- **When to use:** Track any frontend changes in your PRs
- **Example:** Modify `index.html` → Gets `ui-change` label

---

#### `style-change` - Style-Only Changes
- **What it detects:** Only CSS/SCSS files changed (no JavaScript)
- **Labels:** `style-change`
- **File types:** `.css`, `.scss`, `.sass`, `.less` (without `.js`, `.jsx`, `.ts`, `.tsx`)
- **Enable:**
  ```yaml
  enabled_rules: '["style-change"]'
  ```
- **When to use:** Identify purely cosmetic changes
- **Example:** Modify `styles.css` only → Gets `style-change` label
- **Note:** Requires `ui-change` to be enabled if you want both labels

---

### 🔐 Environment Rules

#### `env-change` - Environment File Changes
- **What it detects:** Changes to environment configuration files
- **Labels:** `env-change`
- **File types:** `.env`, `.env.*`, `config.yml`, `config.yaml`, `config.json`
- **Enable:**
  ```yaml
  enabled_rules: '["env-change"]'
  ```
- **When to use:** Track configuration changes that may affect deployments
- **Example:** Modify `.env.production` → Gets `env-change` label

---

#### `new-env-variable` - New Environment Variables
- **What it detects:** New variables added to environment files
- **Labels:** `new-env-variable`
- **Detection:** Analyzes git diff for new `KEY=value` patterns
- **Enable:**
  ```yaml
  enabled_rules: '["new-env-variable"]'
  ```
- **When to use:** Flag new config requirements needing documentation
- **Example:** Add `NEW_API_KEY=value` to `.env` → Gets `new-env-variable` label
- **Note:** Requires `env-change` rule to detect the file first

---

#### `potential-secret-leak` - Secret Detection
- **What it detects:** Environment variables with sensitive keywords
- **Labels:** `potential-secret-leak` 🔴
- **Keywords detected:** `API_KEY`, `PASSWORD`, `SECRET`, `TOKEN`, `PRIVATE_KEY`, `CREDENTIAL` (case-insensitive)
- **Enable:**
  ```yaml
  enabled_rules: '["potential-secret-leak"]'
  ```
- **When to use:** Critical security review required
- **Example:** Add `API_KEY=secret123` → Gets `potential-secret-leak` label
- **Security note:** Helps prevent accidental credential commits

---

## 📋 Quick Reference Table

| Rule Name | Label | Color | When Applied |
|-----------|-------|-------|--------------|
| `ui-change` | `ui-change` | 🟢 Green | HTML, CSS, JSX, TSX, Vue files |
| `style-change` | `style-change` | 🟣 Purple | Only CSS/SCSS (no JS/TS) |
| `env-change` | `env-change` | 🟠 Orange | `.env` or `config.*` files |
| `new-env-variable` | `new-env-variable` | 🟡 Yellow | New `KEY=value` in env files |
| `potential-secret-leak` | `potential-secret-leak` | 🔴 Red | Secrets detected (API_KEY, etc.) |

---

## 🎯 Common Configurations

### Enable All Rules
```yaml
enabled_rules: '["ui-change", "style-change", "env-change", "new-env-variable", "potential-secret-leak"]'
```

### Frontend Team Only
```yaml
enabled_rules: '["ui-change", "style-change"]'
```

### Security-Focused (Secrets Only)
```yaml
enabled_rules: '["potential-secret-leak"]'
```

### Backend Team (Environment Config)
```yaml
enabled_rules: '["env-change", "new-env-variable", "potential-secret-leak"]'
```

### Minimal (UI Changes Only)
```yaml
enabled_rules: '["ui-change"]'
```

---

## ⚙️ Advanced Configuration

### Filter Specific Labels Only
Enable rules but only apply certain labels:
```yaml
with:
  enabled_rules: '["ui-change", "style-change", "env-change"]'
  enabled_labels: '["ui-change", "env-change"]'  # Only these labels
  # style-change label will be filtered out
```

### Override Label Names
Use custom label names:
```yaml
with:
  enabled_rules: '["ui-change"]'
  label_overrides: '{"ui-change":"frontend"}'
  # Will apply "frontend" label instead of "ui-change"
```

### Skip Labels
Prevent certain labels from being applied:
```yaml
with:
  enabled_rules: '["ui-change", "style-change"]'
  skip_labels: '["style-change"]'
  # Only ui-change will be applied
```

### Debug Mode
Enable detailed logging for troubleshooting:
```yaml
with:
  enabled_rules: '["ui-change"]'
  enable_debug: true
  # Shows detailed logs: files analyzed, rules executed, labels detected
```

### Full Configuration Example
```yaml
jobs:
  label:
    uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
    with:
      # Enable rules (REQUIRED)
      enabled_rules: '["ui-change", "env-change", "potential-secret-leak"]'
      
      # Optional: Filter to specific labels
      enabled_labels: '["ui-change", "potential-secret-leak"]'
      
      # Optional: Custom label names
      label_overrides: '{"ui-change":"frontend"}'
      
      # Optional: Skip certain labels
      skip_labels: '["style-change"]'
      
      # Optional: Debug logging
      enable_debug: false
```

---

## 🐛 Troubleshooting

### Labels Not Applied?

**Problem:** Workflow runs but no labels appear

**Solutions:**
1. ✅ **Most Common:** Check if rules are enabled
   ```yaml
   enabled_rules: '["ui-change"]'  # Make sure this is not empty!
   ```
2. ✅ Enable debug mode to see what's happening:
   ```yaml
   enable_debug: true
   ```
3. ✅ Check workflow logs for messages like:
   - `⚠️ No rules enabled`
   - `⚠️ No rules loaded`
4. ✅ Verify PR files match rule criteria (check file extensions)

### Workflow Not Running?

**Solutions:**
1. ✅ Verify file is at `.github/workflows/pr-labeler.yml`
2. ✅ Check permissions are set:
   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```
3. ✅ Ensure GitHub Actions is enabled in repository settings

### Permission Errors?

**Solutions:**
1. ✅ Add required permissions to workflow
2. ✅ Check organization/repository policies don't block Actions

---

## 📖 How It Works

1. **PR Created/Updated** → Workflow triggers
2. **Analyze Files** → Checks file types and content
3. **Run Rules** → Each enabled rule checks the PR
4. **Collect Labels** → Gathers all matching labels
5. **Apply Labels** → Adds labels to PR (creates if needed)

**That's it!** Simple and fast. 🚀

---

## 🤝 Contributing

Want to add a new rule? It's super easy!

1. **Create a file** in `src/rules/` (e.g., `database-migration.js`)
2. **Use the template** from `src/rules/RULE_TEMPLATE.js`
3. **Write detection logic** (usually 10-50 lines)
4. **Submit a PR** with just your new file!

**See [CONTRIBUTING.md](CONTRIBUTING.md) for complete guide.**

---

## 📝 Examples

### Example 1: Frontend Change
**PR modifies:** `index.html`, `styles.css`

**Configuration:**
```yaml
enabled_rules: '["ui-change", "style-change"]'
```

**Result:** Gets `ui-change` and `style-change` labels

---

### Example 2: Adding Secret
**PR adds:** `.env` with `API_KEY=secret123`

**Configuration:**
```yaml
enabled_rules: '["env-change", "new-env-variable", "potential-secret-leak"]'
```

**Result:** Gets `env-change`, `new-env-variable`, and `potential-secret-leak` labels

---

### Example 3: Only UI Files
**PR modifies:** `App.jsx`, `Component.tsx`

**Configuration:**
```yaml
enabled_rules: '["ui-change"]'
```

**Result:** Gets `ui-change` label (no `style-change` because JS files are present)

---

## 🔗 Useful Links

- **📖 Full Documentation:** [docs/DESIGN.md](docs/DESIGN.md)
- **🤝 Contributing Guide:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **💬 Discussions:** [GitHub Discussions](https://github.com/workflow-kit/pr-auto-labeler/discussions)
- **🐛 Issues:** [GitHub Issues](https://github.com/workflow-kit/pr-auto-labeler/issues)
- **📋 Roadmap:** [DESIGN.md](docs/DESIGN.md)

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the community**

*Need help? [Open an issue](https://github.com/workflow-kit/pr-auto-labeler/issues) or [start a discussion](https://github.com/workflow-kit/pr-auto-labeler/discussions)*
