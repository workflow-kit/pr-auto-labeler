# Contributing to PR Auto-Labeler

Thank you for your interest in contributing to PR Auto-Labeler! This document provides guidelines for adding new rules and contributing to the project.

## 🎯 How to Contribute a New Rule

### Super Quick Start ⚡

Contributing is now incredibly simple:

1. **Fork the repository** on GitHub
2. **Create a new file** in `src/rules/` or appropriate category folder (e.g., `src/rules/frontend/my-rule.js` or `src/rules/environment/my-rule.js`)
3. **Copy the template** from `src/rules/RULE_TEMPLATE.js`
4. **Implement your logic** - just the detection code!
5. **Submit a PR** with ONLY your new file

That's it! No need to modify any other files. The workflow automatically discovers and loads your rule from any subdirectory.

### Detailed Steps

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your rule: `git checkout -b add-rule-your-rule-name`
4. **Add your rule** following the steps below
5. **Test your rule** (see Testing section)
6. **Submit a pull request** with a clear description

### Step 1: Create Your Rule File

Create a new file in the appropriate category folder:
- **Frontend rules:** `src/rules/frontend/your-rule-name.js`
- **Environment rules:** `src/rules/environment/your-rule-name.js`
- **Infrastructure rules:** `src/rules/infrastructure/your-rule-name.js`
- **Database rules:** `src/rules/database/your-rule-name.js`
- **New category:** Create `src/rules/your-category/your-rule-name.js`

Use the template as a starting point:

```bash
cp src/rules/RULE_TEMPLATE.js src/rules/frontend/your-rule-name.js
# or
cp src/rules/RULE_TEMPLATE.js src/rules/environment/your-rule-name.js
# or
cp src/rules/RULE_TEMPLATE.js src/rules/infrastructure/your-rule-name.js
```

**Note:** Rules are organized by category, but you can place a rule anywhere in `src/rules/` - the workflow will find it automatically.

### Step 2: Implement Your Rule Logic

Edit your rule file to implement the detection logic. A rule is a function that receives a context object and returns an array of labels.

```javascript
/**
 * Your Rule Description
 */
function yourRuleNameRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Your logic here
  for (const file of files) {
    if (someCondition(file)) {
      labels.push('your-label');
    }
  }
  
  return labels;
}

// Don't forget to add metadata!
yourRuleNameRule.metadata = {
  name: 'Your Rule Name',
  description: 'What your rule does',
  labels: [
    {
      name: 'your-label',
      color: 'FBCA04',
      description: 'Description of the label'
    }
  ],
  author: 'your-github-username',
  version: '1.0.0'
};

module.exports = yourRuleNameRule;
```

### Step 3: Test Your Rule (Optional but Recommended)

Before submitting, test your rule works correctly:

1. Enable debug mode in your test repository
2. Create a test PR with files that should trigger your rule
3. Verify the correct labels are applied
4. Check the workflow logs for any errors

### Step 4: Submit Your Pull Request

That's it! You only need to submit your new rule file. The workflow automatically discovers and loads all rules from the `src/rules/` directory.

**What to include in your PR:**
- ✅ Your new rule file in `src/rules/` (or category subfolder)
- ✅ Test file in `__tests__/` (matching the folder structure)
- ❌ No changes to `.github/workflows/pr-auto-labeler.yml` needed!
- ❌ No changes to `src/rules/index.js` needed!

The system is fully automatic - just add your rule file and tests!

## 📋 Rule Development Guidelines

### Rule Structure

Every rule must follow this structure:

```javascript
function ruleName({ files, pr, enableDebug }) {
  // 1. Initialize labels array
  const labels = [];
  
  // 2. Analyze PR data
  // ... your logic ...
  
  // 3. Add labels based on conditions
  if (condition) {
    labels.push('label-name');
  }
  
  // 4. Debug logging (optional but recommended)
  if (enableDebug && labels.length > 0) {
    console.log(`[Rule Name] Labels: ${labels.join(', ')}`);
  }
  
  // 5. Return labels array
  return labels;
}

// REQUIRED: Add metadata
ruleName.metadata = {
  name: 'Human Readable Rule Name',
  description: 'Brief description',
  labels: [/* label definitions */],
  author: 'github-username',
  version: '1.0.0'
};
```

### Context Object

Your rule receives a context object with:

- **`files`**: Array of changed files
  ```javascript
  {
    filename: 'path/to/file.js',
    status: 'added' | 'modified' | 'removed',
    additions: 10,
    deletions: 5,
    changes: 15,
    patch: '@@diff content@@'
  }
  ```

- **`pr`**: Pull request information
  ```javascript
  {
    number: 123,
    title: 'PR Title',
    body: 'PR description',
    user: { login: 'username' },
    labels: [/* existing labels */]
  }
  ```

- **`enableDebug`**: Boolean flag for debug mode

### Label Definitions

Each label must have:

- **`name`**: Label name (lowercase, use hyphens)
- **`color`**: Hex color code without `#` (e.g., `'FBCA04'`)
- **`description`**: Short description of what the label means

**Color Palette Suggestions:**
- 🔴 Red (`D93F0B`): Risky/dangerous changes
- 🟡 Yellow (`FBCA04`): Warnings/attention needed
- 🟢 Green (`0E8A16`): Safe changes/improvements
- 🔵 Blue (`0075CA`): Information/documentation
- 🟣 Purple (`D4C5F9`): Style/formatting
- ⚫ Gray (`7F8C8D`): Metadata/configuration

### Best Practices

1. **Keep it simple**: One rule should do one thing well
2. **Be specific**: Clear detection criteria reduce false positives
3. **Add debug logging**: Help users understand rule behavior
4. **Handle edge cases**: Consider empty files, special characters, etc.
5. **Document your logic**: Add comments explaining complex conditions
6. **Test thoroughly**: Test with various file types and scenarios

### Common Patterns

#### 1. File Extension Detection
```javascript
const filename = file.filename.toLowerCase();
const ext = filename.substring(filename.lastIndexOf('.'));
if (ext === '.md') {
  labels.push('documentation');
}
```

#### 2. Path Pattern Detection
```javascript
if (file.filename.startsWith('test/')) {
  labels.push('test');
}
if (file.filename.includes('/migrations/')) {
  labels.push('migration');
}
```

#### 3. Content Detection (using patch)
```javascript
if (file.patch && file.patch.includes('DROP TABLE')) {
  labels.push('risky-migration');
}
```

#### 4. PR Title/Body Analysis
```javascript
if (pr.title.toLowerCase().includes('[wip]')) {
  labels.push('work-in-progress');
}
```

#### 5. Size-Based Detection
```javascript
const totalChanges = files.reduce((sum, f) => sum + f.changes, 0);
if (totalChanges > 500) {
  labels.push('large-pr');
}
```

## 🧪 Testing Your Rule

### Automated Testing with Jest

We use Jest for unit testing. Before submitting your rule, add tests for it:

1. **Create a test file** matching your rule's folder structure:
   - Rule in `src/rules/frontend/my-rule.js` → Test in `__tests__/frontend/my-rule.test.js`
   - Rule in `src/rules/environment/my-rule.js` → Test in `__tests__/environment/my-rule.test.js`
   - Rule in `src/rules/my-rule.js` → Test in `__tests__/my-rule.test.js`

2. **Write test cases** covering:
   ```javascript
   const myRule = require('../src/rules/my-rule');

   describe('My Rule', () => {
     it('should detect condition X', () => {
       const files = [{ filename: 'test.txt' }];
       const labels = myRule({ files, pr: {}, enableDebug: false });
       expect(labels).toContain('my-label');
     });

     it('should not detect condition Y', () => {
       const files = [{ filename: 'other.txt' }];
       const labels = myRule({ files, pr: {}, enableDebug: false });
       expect(labels).not.toContain('my-label');
     });
   });
   ```

3. **Run tests locally**:
   ```bash
   npm install
   npm test
   ```

4. **Check coverage**:
   ```bash
   npm run test:coverage
   ```

### Manual Testing

1. **Enable debug mode** to see rule execution:
   ```yaml
   with:
     enable_debug: true
   ```

2. **Create a test PR** with files that should trigger your rule

3. **Check the workflow logs** to verify:
   - Your rule executed
   - Correct labels were applied
   - Debug output is helpful

### Test Checklist

- [ ] Unit tests written and passing
- [ ] Test coverage >= 80%
- [ ] Rule applies labels for positive cases
- [ ] Rule doesn't apply labels for negative cases
- [ ] Debug logging is clear and helpful
- [ ] Edge cases are handled (empty files, special chars, etc.)
- [ ] Performance is acceptable for large PRs
- [ ] Rule doesn't conflict with existing rules

## ⚙️ Understanding Label Configuration

When users adopt your rule, they enable it and all labels from that rule are applied automatically.

### How Users Enable Your Rule

Users must explicitly enable your rule to use it:

```yaml
# Enable the rule
enabled_rules: '["your-rule-name"]'
```

**Important:** All rules are disabled by default. When a user enables your rule, all labels returned by your rule will be applied to matching PRs.

### Example Scenario

If your rule returns 3 labels: `db-change`, `migration`, `risky-migration`

When enabled:
```yaml
enabled_rules: '["database"]'
# All 3 labels from the rule will be applied automatically
```

**Note:** If users want fewer labels, they should enable fewer rules or create custom rules that return only the labels they need.

### Best Practices for Rule Authors

1. **Provide Multiple Labels**: Different labels for different scenarios
   - ✅ Good: `ui-change`, `style-change` (2 labels, different scenarios)
   - ✅ Also good: Single label rules are fine if they serve a specific purpose

2. **Use Descriptive Names**: Help users understand what each label means
   - ✅ Good: `potential-secret-leak`, `env-change`
   - ❌ Unclear: `flag`, `warning`

3. **Document Each Label**: In your metadata, explain when each label applies
   ```javascript
   labels: [
     { name: 'db-change', color: 'FBCA04', description: 'Database files modified' },
     { name: 'risky-migration', color: 'D93F0B', description: 'Potentially destructive migration (DROP/ALTER)' }
   ]
   ```

4. **Think About Use Cases**: Different teams may want different labels
   - Security teams: Only `potential-secret-leak`
   - Frontend teams: `ui-change` and `style-change`
   - Full-stack teams: All labels

## 📝 Pull Request Guidelines

### PR Title Format

Use conventional commit style:
```
feat(rules): add [Rule Name] detection
```

Examples:
- `feat(rules): add database migration detection`
- `feat(rules): add test coverage analysis`
- `fix(rules): improve UI detection accuracy`

### PR Description Template

```markdown
## Description
Brief description of the rule and what it detects.

## Rule Details
- **Rule Name**: Your Rule Name
- **Labels Applied**: `label-1`, `label-2`
- **Detection Criteria**: 
  - Condition 1
  - Condition 2

## Testing
- [ ] Tested with positive cases
- [ ] Tested with negative cases
- [ ] Debug logging verified
- [ ] Tested with demo-app repo

## Example PR
Link to a test PR that demonstrates the rule: #123

## Additional Notes
Any additional context or considerations.
```

## 🎨 Rule Ideas

Here are some rule ideas you can implement:

### High Priority
- [ ] Database & Migration Rules (DROP TABLE, ALTER TABLE, etc.)
- [ ] Test Coverage Rules (missing tests, test-only changes)
- [ ] Dependency Changes (package.json, requirements.txt, etc.)
- [ ] Environment & Configuration (`.env`, config files)
- [ ] Large PR Detection (>500 lines changed)

### Medium Priority
- [ ] CI/CD Changes (workflow files, Jenkinsfile)
- [x] Docker Changes (Dockerfile, docker-compose) - **Implemented:** `docker-change` rule
- [x] Detect Migration File Changes - **Implemented:** `migration` rule
- [ ] Documentation Changes (README, docs/)
- [ ] Security Changes (auth, encryption, secrets)
- [ ] Infrastructure Changes (terraform, ansible)

### Nice to Have
- [ ] Refactoring Detection (rename/move operations)
- [ ] Breaking Changes (based on PR title/body)
- [ ] Work in Progress (WIP in title)
- [ ] Missing Issue Link (no "Fixes #" or "Closes #")
- [ ] Missing Description (empty or short PR body)

## 💡 Getting Help

- **Questions?** Open a [GitHub Discussion](../../discussions)
- **Bug Report?** Open an [Issue](../../issues)
- **Need Examples?** Check out existing rules in `src/rules/`

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Keep discussions focused and professional

Thank you for contributing! 🎉

