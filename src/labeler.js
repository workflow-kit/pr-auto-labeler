/**
 * PR Auto-Labeler Main Script
 * 
 * This script loads all rules and applies labels to pull requests.
 */

const rules = require('./rules');

/**
 * Main labeler function
 * 
 * @param {Object} context - Execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {Object} context.github - GitHub API client
 * @param {Object} context.config - Configuration options
 * @returns {Promise<Array<string>>} - Array of labels that were applied
 */
async function labelPullRequest(context) {
  const { files, pr, github, config } = context;
  const { enableDebug, labelOverrides, skipLabels, repoOwner, repoName, prNumber } = config;
  
  if (enableDebug) {
    console.log('=== PR Auto-Labeler Starting ===');
    console.log(`PR #${prNumber}: ${pr.title}`);
    console.log(`Files changed: ${files.length}`);
    console.log(`Active rules: ${rules.length}`);
  }
  
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
        // Apply label overrides
        const finalLabel = labelOverrides[label] || label;
        
        // Check if label should be skipped
        if (!skipLabels.includes(finalLabel)) {
          labelsToApply.add(finalLabel);
        } else if (enableDebug) {
          console.log(`[Skipped] Label: ${finalLabel}`);
        }
      }
    } catch (error) {
      console.error(`Error executing rule ${rule.metadata?.name || 'Unknown'}:`, error);
    }
  }
  
  if (enableDebug) {
    console.log(`\n=== Final Labels to Apply: ${Array.from(labelsToApply).join(', ') || 'none'} ===`);
  }
  
  // Apply labels to PR
  if (labelsToApply.size > 0) {
    try {
      await github.rest.issues.addLabels({
        owner: repoOwner,
        repo: repoName,
        issue_number: prNumber,
        labels: Array.from(labelsToApply)
      });
      console.log(`✅ Successfully applied labels: ${Array.from(labelsToApply).join(', ')}`);
    } catch (error) {
      // Labels might not exist, try to create them
      console.log('⚠️  Some labels may not exist. Attempting to create them...');
      
      for (const label of labelsToApply) {
        const metadata = labelMetadata.get(label);
        if (metadata) {
          try {
            await github.rest.issues.createLabel({
              owner: repoOwner,
              repo: repoName,
              name: metadata.name,
              color: metadata.color,
              description: metadata.description
            });
            console.log(`✅ Created label: ${label}`);
          } catch (createError) {
            if (enableDebug) {
              console.log(`Label ${label} might already exist or couldn't be created`);
            }
          }
        }
      }
      
      // Try applying labels again
      await github.rest.issues.addLabels({
        owner: repoOwner,
        repo: repoName,
        issue_number: prNumber,
        labels: Array.from(labelsToApply)
      });
      console.log(`✅ Successfully applied labels: ${Array.from(labelsToApply).join(', ')}`);
    }
  } else {
    console.log('ℹ️  No labels to apply based on current rules');
  }
  
  return Array.from(labelsToApply);
}

module.exports = { labelPullRequest };

