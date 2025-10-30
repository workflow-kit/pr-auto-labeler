# Publishing to GitHub Actions Marketplace

This guide will help you publish your PR Auto-Labeler to the GitHub Actions Marketplace.

## Prerequisites

✅ You have created a release tag `v0.0.1`  
✅ Your repository is public  
✅ You have proper README.md with usage instructions  

## Step-by-Step Instructions

### Step 1: Verify Your Release Tag

Make sure you have created a release with tag `v0.0.1`:

1. Go to your repository on GitHub
2. Navigate to **Releases** → **Tags**
3. Verify that `v0.0.1` exists (or create it if needed)
4. Click **Create a new release** if you haven't already:
   - Tag: `v0.0.1`
   - Release title: `v0.0.1` (or any title)
   - Description: Copy from `RELEASE_NOTES.md` if available

### Step 2: Enable Marketplace Publishing

1. Go to your repository: `https://github.com/workflow-kit/pr-auto-labeler`
2. Click **Settings** (top menu)
3. Scroll down to **Actions** → **General** (left sidebar)
4. Scroll to **Actions permissions**
5. Make sure **Allow all actions and reusable workflows** is selected (or at least allow reusable workflows)
6. Scroll down to **Workflow permissions**
7. Make sure permissions are properly configured

### Step 3: Publish to Marketplace

For **Reusable Workflows** (your current setup):

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages & packages** (if available) OR
3. Go directly to the release page: `https://github.com/workflow-kit/pr-auto-labeler/releases/tag/v0.0.1`
4. Click **Publish to Marketplace** button (if available)

**Alternative Method:**

1. Go to the GitHub Actions Marketplace: `https://github.com/marketplace`
2. Click **Publish an action** (or search for how to publish reusable workflows)
3. Note: Reusable workflows might need to be published differently - they may automatically appear if:
   - Your repo is public
   - You have a release tag
   - The workflow file is properly formatted

### Step 4: Using Action.yml (Alternative - Composite Action)

If you want to publish as a **composite action** instead of a reusable workflow:

1. You already have `action.yml` created
2. Users can reference it as:
   ```yaml
   - uses: workflow-kit/pr-auto-labeler@v0.0.1
     with:
       enabled_rules: '["ui-change"]'
   ```
3. This might be easier to discover in the marketplace

### Step 5: Marketplace Requirements Checklist

Before publishing, ensure:

- [ ] Repository is public
- [ ] Release tag exists (v0.0.1)
- [ ] README.md is comprehensive and clear
- [ ] Workflow/action has proper inputs and descriptions
- [ ] License file exists (MIT)
- [ ] Action.yml exists (for composite action publishing)
- [ ] No sensitive information in code

### Step 6: Update Workflow References

Once published, update documentation to use version tags:

**Instead of:**
```yaml
uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@main
```

**Use:**
```yaml
uses: workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@v0.0.1
```

Or for composite action:
```yaml
uses: workflow-kit/pr-auto-labeler@v0.0.1
```

## Publishing as Composite Action vs Reusable Workflow

### Reusable Workflow (Current)
- ✅ Already set up
- ✅ Referenced as: `workflow-kit/pr-auto-labeler/.github/workflows/pr-auto-labeler.yml@v0.0.1`
- ❌ Less discoverable in marketplace
- ❌ Requires full path

### Composite Action (With action.yml)
- ✅ More discoverable in marketplace
- ✅ Shorter reference: `workflow-kit/pr-auto-labeler@v0.0.1`
- ✅ Standard action format
- ⚠️ Requires `action.yml` (already created)

## Verifying Publication

1. Search for "pr-auto-labeler" in GitHub Marketplace: `https://github.com/marketplace`
2. Check if it appears in search results
3. Verify the listing shows correct description, version, and usage

## Troubleshooting

### Action not appearing in marketplace?
- Ensure repository is public
- Wait a few minutes (marketplace updates can be delayed)
- Check if there are any GitHub restrictions on your account
- Verify the release tag format (must be semantic versioning)

### Cannot publish reusable workflow?
- Reusable workflows may need to be manually submitted or may auto-appear
- Consider using `action.yml` as a composite action instead
- Check GitHub's documentation for current reusable workflow marketplace support

## Next Steps After Publishing

1. **Update README** to reference version tags instead of `main`
2. **Add marketplace badge** to README (if desired)
3. **Share on social media** / developer communities
4. **Monitor usage** through GitHub Insights
5. **Gather feedback** and iterate

## Resources

- [GitHub Actions Marketplace Documentation](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace)
- [Creating a Reusable Workflow](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Creating a Composite Action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)

