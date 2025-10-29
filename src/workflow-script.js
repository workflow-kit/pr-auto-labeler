/**
 * PR Auto-Labeler - Main Workflow Script
 * 
 * This script is executed by the GitHub Actions workflow to analyze PRs
 * and apply labels based on enabled rules.
 */

module.exports = async ({ github, context, core }) => {
  // ==============================================================
  // PR Auto-Labeler - Dynamic Rule Loading System with Opt-in
  // ==============================================================
  // This workflow discovers rules from src/rules/ directory.
  // ALL RULES ARE DISABLED BY DEFAULT - you must explicitly enable them!
  //
  // To enable rules, pass them in enabled_rules input:
  // enabled_rules: '["frontend-ui", "env-variables"]'
  //
  // To add a new rule:
  // 1. Create a new .js file in src/rules/ (e.g., my-rule.js)
  // 2. Follow the rule template format
  // 3. Submit a PR with just that file!
  // 4. Users enable it in their workflow configuration
  // ==============================================================
  
  const enabledRules = JSON.parse(process.env.ENABLED_RULES || '[]');
  const enabledLabels = JSON.parse(process.env.ENABLED_LABELS || '[]');
  const enableDebug = process.env.ENABLE_DEBUG === 'true';
  const labelOverrides = JSON.parse(process.env.LABEL_OVERRIDES || '{}');
  const skipLabels = JSON.parse(process.env.SKIP_LABELS || '[]');
  
  // Fetch PR information
  const { data: files } = await github.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request.number,
  });
  
  const pr = context.payload.pull_request;
  const prNumber = pr.number;
  
  if (enableDebug) {
    console.log('=== PR Auto-Labeler Starting ===');
    console.log(`PR #${prNumber}: ${pr.title}`);
    console.log(`Files changed: ${files.length}`);
    console.log(`Enabled rules: ${enabledRules.length > 0 ? enabledRules.join(', ') : 'NONE (all rules disabled)'}`);
    console.log(`Enabled labels: ${enabledLabels.length > 0 ? enabledLabels.join(', ') : 'ALL (from enabled rules)'}`);
  }
  
  // Check if any rules are enabled
  if (enabledRules.length === 0) {
    console.log('⚠️  No rules enabled. All labels are disabled by default.');
    console.log('💡 To enable rules, add enabled_rules input to your workflow:');
    console.log('   enabled_rules: \'["frontend-ui", "env-variables"]\'');
    return;
  }
  
  // ==============================================================
  // Dynamic Rule Discovery and Loading
  // ==============================================================
  
  // Get the repository where the workflow is defined (pr-auto-labeler repo)
  const workflowRepo = {
    owner: 'workflow-kit',
    repo: 'pr-auto-labeler'
  };
  
  let rules = [];
  
  // Helper function to recursively discover rule files
  async function discoverRules(path = 'src/rules') {
    const ruleFiles = [];
    
    try {
      const { data: contents } = await github.rest.repos.getContent({
        owner: workflowRepo.owner,
        repo: workflowRepo.repo,
        path: path,
        ref: 'main'
      });
      
      for (const item of contents) {
        if (item.type === 'dir') {
          // Recursively discover rules in subdirectories
          const subRules = await discoverRules(item.path);
          ruleFiles.push(...subRules);
        } else if (item.name.endsWith('.js') && 
                   item.name !== 'index.js' && 
                   !item.name.includes('TEMPLATE')) {
          // Extract rule name from path (e.g., "src/rules/frontend/ui-change.js" -> "frontend/ui-change")
          const ruleName = item.path
            .replace('src/rules/', '')
            .replace('.js', '');
          
          ruleFiles.push({
            name: item.name,
            path: item.path,
            ruleName: ruleName
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error discovering rules in ${path}:`, error.message);
    }
    
    return ruleFiles;
  }
  
  try {
    if (enableDebug) {
      console.log(`\n🔍 Discovering rules in src/rules/...`);
    }
    
    // Discover all rule files recursively
    const ruleFiles = await discoverRules();
    
    if (enableDebug) {
      console.log(`Found ${ruleFiles.length} rule files: ${ruleFiles.map(f => f.ruleName).join(', ')}`);
    }
    
    // Load each rule file (only if enabled)
    for (const file of ruleFiles) {
      // Check if this rule is enabled
      // Support both formats: "frontend/ui-change" and "ui-change" and old format "frontend-ui"
      const isEnabled = enabledRules.some(enabledRule => {
        return enabledRule === file.ruleName || // Full path match (frontend/ui-change)
               enabledRule === file.name.replace('.js', '') || // Filename only (ui-change)
               (file.ruleName.includes('/') && enabledRule === file.ruleName.replace('/', '-')); // Legacy format (frontend-ui)
      });
      
      if (!isEnabled) {
        if (enableDebug) {
          console.log(`⏭️  Skipping disabled rule: ${file.ruleName}`);
        }
        continue;
      }
      
      try {
        // Fetch the rule file content
        const { data: fileData } = await github.rest.repos.getContent({
          owner: workflowRepo.owner,
          repo: workflowRepo.repo,
          path: file.path,
          ref: 'main'
        });
        
        // Decode the content
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        
        // Create a module-like environment and execute the rule
        const moduleExports = {};
        const moduleFunction = new Function('exports', 'module', content + '\nreturn module.exports;');
        const ruleFunction = moduleFunction(moduleExports, { exports: moduleExports });
        
        if (typeof ruleFunction === 'function') {
          rules.push(ruleFunction);
          if (enableDebug) {
            console.log(`✅ Loaded enabled rule: ${ruleFunction.metadata?.name || file.ruleName}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error loading rule ${file.name}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error discovering rules:', error.message);
    console.log('ℹ️  Falling back to no rules. Make sure src/rules/ directory exists.');
  }
  
  if (rules.length === 0) {
    console.log('⚠️  No rules loaded. No labels will be applied.');
    return;
  }
  
  if (enableDebug) {
    console.log(`\n📋 Active rules: ${rules.length}`);
  }
  
  // ==============================================================
  // Rule Execution Engine
  // ==============================================================
  
  const labelsToApply = new Set();
  const labelMetadata = new Map();
  
  // Execute all rules
  for (const rule of rules) {
    if (enableDebug) {
      console.log(`\n--- Running Rule: ${rule.metadata?.name || 'Unknown'} ---`);
    }
    
    try {
      const ruleLabels = rule({ files, pr, enableDebug });
      
      // Store metadata for label creation
      if (rule.metadata?.labels) {
        for (const labelDef of rule.metadata.labels) {
          labelMetadata.set(labelDef.name, labelDef);
        }
      }
      
      // Add labels from this rule
      for (const label of ruleLabels) {
        const finalLabel = labelOverrides[label] || label;
        
        // Check if label should be skipped
        if (skipLabels.includes(finalLabel)) {
          if (enableDebug) {
            console.log(`[Skipped via skip_labels] Label: ${finalLabel}`);
          }
          continue;
        }
        
        // Check if label filtering is enabled
        if (enabledLabels.length > 0 && !enabledLabels.includes(label)) {
          if (enableDebug) {
            console.log(`[Filtered] Label not in enabled_labels: ${finalLabel}`);
          }
          continue;
        }
        
        labelsToApply.add(finalLabel);
      }
    } catch (error) {
      console.error(`❌ Error executing rule ${rule.metadata?.name}:`, error.message);
    }
  }
  
  if (enableDebug) {
    console.log(`\n=== Final Labels: ${Array.from(labelsToApply).join(', ') || 'none'} ===`);
  }
  
  // ==============================================================
  // Apply Labels to PR
  // ==============================================================
  
  if (labelsToApply.size > 0) {
    // Ensure all labels exist with correct colors
    for (const label of labelsToApply) {
      const metadata = labelMetadata.get(label);
      if (metadata) {
        try {
          // Try to create the label
          await github.rest.issues.createLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            name: metadata.name,
            color: metadata.color,
            description: metadata.description
          });
          if (enableDebug) {
            console.log(`✅ Created label: ${label}`);
          }
        } catch (createError) {
          // Label already exists, update it to ensure correct color/description
          if (createError.status === 422) {
            try {
              await github.rest.issues.updateLabel({
                owner: context.repo.owner,
                repo: context.repo.repo,
                name: metadata.name,
                color: metadata.color,
                description: metadata.description
              });
              if (enableDebug) {
                console.log(`🔄 Updated label: ${label}`);
              }
            } catch (updateError) {
              if (enableDebug) {
                console.log(`⚠️  Could not update label ${label}: ${updateError.message}`);
              }
            }
          }
        }
      }
    }
    
    // Apply labels to PR
    try {
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
        labels: Array.from(labelsToApply)
      });
      console.log(`✅ Successfully applied labels: ${Array.from(labelsToApply).join(', ')}`);
    } catch (error) {
      console.error(`❌ Error applying labels: ${error.message}`);
    }
  } else {
    console.log('ℹ️  No labels to apply based on current rules');
  }
};

