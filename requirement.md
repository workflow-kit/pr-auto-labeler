# PR Auto-Labeler - Requirements Document

## 🧩 Overview

`pr-auto-labeler` is a reusable GitHub Action workflow designed to automatically label pull requests based on content and metadata analysis. It inspects code, configuration, and migration changes to identify risk levels, missing tests, security implications, and more. The goal is to automate PR triage and enforce consistent review practices across repositories.

---

## 🧱 1. Architecture Overview

### 1.1 Components

- **Reusable Workflow**: `.github/workflows/pr-auto-labeler.yml`
- **Supporting Scripts**: Node.js or Python scripts for regex/diff analysis
- **Inputs & Overrides**: Configurable thresholds and labels via workflow inputs
- **Output**: Adds GitHub labels to PRs using `gh api` or `github-script`

### 1.2 Trigger Events

The workflow should trigger on the following events:

- `pull_request`
  - `opened`
  - `synchronize`
  - `reopened`
- `workflow_dispatch` (for manual runs)

### 1.3 Permissions

The workflow requires the following permissions:

```yaml
permissions:
  contents: read
  pull-requests: write
```

---

## ⚙️ 2. Configuration Inputs

The workflow must support the following configurable inputs:

| Input Name            | Type    | Default | Description                                                      |
|-----------------------|---------|---------|------------------------------------------------------------------|
| `label_overrides`     | JSON    | `{}`    | Custom label names to override defaults                          |
| `large_pr_threshold`  | Number  | `500`   | Number of changed lines considered a large PR                    |
| `enable_debug`        | Boolean | `false` | Enable debug logs in workflow output                             |
| `skip_labels`         | List    | `[]`    | Labels to skip applying (e.g., `["test-missing"]`)               |

### Example Usage

```yaml
uses: org/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@v1
with:
  large_pr_threshold: 800
  label_overrides: '{"risky-migration":"db-risky-change"}'
```

---

## 🧠 3. Rule Categories and Detection Logic

### 🗃️ 3.1 Database & Migration Rules

| Rule                                      | Detection Logic                                              | Default Label        |
|-------------------------------------------|--------------------------------------------------------------|----------------------|
| Migration file added/modified             | File path matches `/migrations/` or `/db/migrations/`        | `migration`          |
| Contains DROP TABLE or DROP COLUMN        | Regex match in diff                                          | `risky-migration`    |
| Contains ALTER TABLE, RENAME, or UPDATE   | Regex match                                                  | `schema-change`      |
| Adds only new table or column             | Detect CREATE TABLE or ADD COLUMN without DROP               | `safe-migration`     |

### ⚙️ 3.2 Environment & Configuration

| Rule                                      | Detection Logic                                              | Label                      |
|-------------------------------------------|--------------------------------------------------------------|----------------------------|
| `.env`, `.env.*`, `config.yml`, etc.      | Path match                                                   | `env-change`               |
| New key introduced in `.env`              | Diff analysis                                                | `new-env-variable`         |
| Secrets or tokens detected                | Regex match for `api_key`, `token`, `secret`                 | `potential-secret-leak`    |

### 🧪 3.3 Test Coverage & Quality

| Rule                                      | Detection Logic                                              | Label                |
|-------------------------------------------|--------------------------------------------------------------|----------------------|
| Source files modified but no test files   | Compare paths                                                | `test-missing`       |
| Only test files changed                   | All modified files match test pattern                        | `test-only-change`   |
| Large test updates (>5 tests added)       | Line diff count                                              | `test-improvement`   |

### 💻 3.4 Code & Dependency Changes

| Rule                                      | Detection Logic                                              | Label                    |
|-------------------------------------------|--------------------------------------------------------------|--------------------------|
| Dependency file modified                  | File path match (`package.json`, `requirements.txt`, etc.)   | `dependency-change`      |
| New dependency added                      | Diff line starts with `+` under dependencies                 | `new-dependency`         |
| Dependency downgraded                     | Version diff from higher to lower                            | `dependency-downgrade`   |

### 📦 3.5 Infrastructure & CI/CD

| Rule                                      | Detection Logic                                              | Label           |
|-------------------------------------------|--------------------------------------------------------------|-----------------|
| `.github/workflows/`, Jenkinsfile, etc.   | File path match                                              | `ci-change`     |
| Dockerfile modified                       | File name match                                              | `docker-change` |
| Infra config files (terraform, ansible)   | Path or extension match                                      | `infra-change`  |

### 🎨 3.6 Frontend/UI

| Rule                                      | Detection Logic                                              | Label          |
|-------------------------------------------|--------------------------------------------------------------|----------------|
| `.html`, `.css`, `.scss`, `.jsx`, etc.    | File extension                                               | `ui-change`    |
| Only CSS/SCSS changed                     | No JS/TS code modified                                       | `style-change` |

### 🧠 3.7 Logic, Refactor, and Naming

| Rule                                      | Detection Logic                                              | Label                    |
|-------------------------------------------|--------------------------------------------------------------|--------------------------|
| Mostly rename/move                        | `git diff --find-renames`                                    | `refactor`               |
| Only formatting or comment changes        | No function body diff                                        | `non-functional-change`  |
| New function/class introduced             | Diff adds `def`, `class`, `function`                         | `new-feature`            |
| Function/class removed                    | Diff deletes `def`, `class`, `function`                      | `function-removed`       |

### 🔒 3.8 Security & Sensitive Changes

| Rule                                      | Detection Logic                                              | Label             |
|-------------------------------------------|--------------------------------------------------------------|-------------------|
| Auth, token, encryption files modified    | Path or keyword                                              | `security-change` |
| Use of `eval`, `exec`, `os.system`        | Diff regex                                                   | `risky-code`      |

### 📏 3.9 PR Structure & Metadata

| Rule                                      | Detection Logic                                              | Label                  |
|-------------------------------------------|--------------------------------------------------------------|------------------------|
| > N lines of code changed                 | Diff stat > threshold                                        | `large-pr`             |
| PR title contains WIP or Draft            | Title regex                                                  | `work-in-progress`     |
| No "Fixes #" or "Closes #" in description | Regex missing                                                | `no-linked-issue`      |
| No PR description or <20 words            | Word count                                                   | `missing-description`  |

---

## 🧩 4. Implementation Notes

1. **Workflow Tools**: Use `actions/checkout` + `github-script` or `actions/github-cli` for diff analysis
2. **Label Application**: Use `gh api` for applying labels to PRs
3. **State Management**: Optional caching of previous PR state to avoid duplicate labeling
4. **Dry-Run Mode**: Support dry-run mode for debugging without actually applying labels
5. **Performance**: Efficient diff parsing to handle large PRs
6. **Error Handling**: Graceful failure with appropriate error messages

---

## 🧪 5. Testing Scenarios

The following test scenarios must be validated:

| Scenario                                           | Expected Label(s)                                    |
|----------------------------------------------------|------------------------------------------------------|
| Added a `.env` file with new API key               | `new-env-variable`, `potential-secret-leak`          |
| Modified migration file with DROP statement        | `risky-migration`                                    |
| Modified source file without test updates          | `test-missing`                                       |
| Added only test files                              | `test-only-change`                                   |
| Updated workflow YAML                              | `ci-change`                                          |
| Changed Dockerfile                                 | `docker-change`                                      |
| Added large new feature (600 lines)                | `large-pr`, `new-feature`                            |
| PR titled "WIP - Add UI changes"                   | `work-in-progress`, `ui-change`                      |

---

## ⚡ 6. Future Enhancements

The following features are planned for future releases:

1. **Custom Rule Extensions**: Support for custom rule definitions via `.github/pr-auto-labeler.yml` config file
2. **Language-Specific Detection**: Enhanced detection for Python, JavaScript, Go, and other languages
3. **AI-Assisted Classification**: Semantic diff classification using AI models (future phase)
4. **Advanced Analytics**: PR complexity metrics and risk scoring
5. **Team-Specific Rules**: Different rule sets for different teams or repositories
6. **Integration with Review Tools**: Automatic reviewer assignment based on labels
7. **Notification System**: Slack/email notifications for high-risk PRs
8. **Historical Analysis**: Track labeling patterns over time for insights

---

## 📋 7. Acceptance Criteria

### Functional Requirements

- [ ] Workflow can be called as a reusable workflow from other repositories
- [ ] All configuration inputs work as specified
- [ ] All rule categories detect changes correctly
- [ ] Labels are applied accurately based on PR content
- [ ] Label overrides function properly
- [ ] Skip labels feature works correctly
- [ ] Debug mode provides useful logging

### Non-Functional Requirements

- [ ] Workflow completes within 2 minutes for PRs up to 1000 lines
- [ ] Handles PRs with 5000+ lines of changes without timeout
- [ ] Proper error handling with meaningful error messages
- [ ] Documentation is clear and comprehensive
- [ ] Code is maintainable and well-commented

### Security Requirements

- [ ] No secrets or tokens are logged or exposed
- [ ] Workflow follows principle of least privilege
- [ ] Dependencies are pinned and verified
- [ ] No arbitrary code execution vulnerabilities

---

## 📚 8. Dependencies

### GitHub Actions

- `actions/checkout@v4` or later
- `actions/github-script@v7` or later (optional)
- GitHub CLI (gh) if using API approach
