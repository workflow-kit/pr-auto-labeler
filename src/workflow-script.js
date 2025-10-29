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
  
  try {
    // List all files in src/rules/ directory
    const { data: ruleFiles } = await github.rest.repos.getContent({
      owner: workflowRepo.owner,
      repo: workflowRepo.repo,
      path: 'src/rules',
      ref: 'main'
    });
    
    if (enableDebug) {
      console.log(`\n🔍 Discovering rules in src/rules/...`);
    }
    
    // Filter for .js files (exclude template and index)
    const jsFiles = ruleFiles.filter(file => 
      file.name.endsWith('.js') && 
      file.name !== 'index.js' &&
      !file.name.includes('TEMPLATE')
    );
    
    if (enableDebug) {
      console.log(`Found ${jsFiles.length} rule files: ${jsFiles.map(f => f.name).join(', ')}`);
    }
    
    // Load each rule file (only if enabled)
    for (const file of jsFiles) {
      // Extract rule name from filename (remove .js extension)
      const ruleName = file.name.replace('.js', '');
      
      // Check if this rule is enabled
      if (!enabledRules.includes(ruleName)) {
        if (enableDebug) {
          console.log(`⏭️  Skipping disabled rule: ${ruleName}`);
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
            console.log(`✅ Loaded enabled rule: ${ruleFunction.metadata?.name || file.name}`);
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

