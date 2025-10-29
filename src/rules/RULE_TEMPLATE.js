/**
 * ============================================================================
 * RULE TEMPLATE - Copy this file to create a new rule
 * ============================================================================
 * 
 * To create a new rule:
 * 1. Copy this file to a new file in src/rules/ (e.g., my-rule.js)
 * 2. Replace "yourRuleName" with your rule name
 * 3. Implement your detection logic in the function
 * 4. Update the metadata section
 * 5. Submit a PR with ONLY your new rule file - no other changes needed!
 * 
 * The workflow will automatically discover and load your rule.
 * ============================================================================
 */

/**
 * Your Rule Function
 * 
 * This function receives PR information and returns an array of labels to apply.
 * 
 * @param {Object} context - Rule execution context
 * @param {Array} context.files - Changed files in the PR
 *   - Each file has: filename, status, additions, deletions, changes, patch
 * @param {Object} context.pr - Pull request information
 *   - Contains: title, body, number, user, labels, etc.
 * @param {boolean} context.enableDebug - Enable debug logging
 * @returns {Array<string>} Array of label names to apply
 */
function yourRuleNameRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // ==========================================
  // YOUR DETECTION LOGIC GOES HERE
  // ==========================================
  
  // Example 1: Check file extensions
  for (const file of files) {
    const filename = file.filename.toLowerCase();
    
    if (filename.endsWith('.md')) {
      labels.push('documentation');
    }
  }
  
  // Example 2: Check file paths
  for (const file of files) {
    if (file.filename.startsWith('test/')) {
      labels.push('test');
    }
  }
  
  // Example 3: Check file content (patch/diff)
  for (const file of files) {
    if (file.patch && file.patch.includes('DROP TABLE')) {
      labels.push('risky-migration');
    }
  }
  
  // Example 4: Check PR title or body
  if (pr.title.toLowerCase().includes('[wip]')) {
    labels.push('work-in-progress');
  }
  
  // Example 5: Count total changes
  const totalChanges = files.reduce((sum, f) => sum + (f.changes || 0), 0);
  if (totalChanges > 500) {
    labels.push('large-pr');
  }
  
  // ==========================================
  // DEBUG LOGGING (Optional but recommended)
  // ==========================================
  
  if (enableDebug && labels.length > 0) {
    console.log(`[Your Rule] Applying labels: ${labels.join(', ')}`);
  }
  
  return labels;
}

/**
 * ============================================================================
 * RULE METADATA - Required
 * ============================================================================
 * This metadata is used to:
 * - Document your rule
 * - Create labels automatically if they don't exist
 * - Display rule information in logs
 */
yourRuleNameRule.metadata = {
  // Human-readable name for your rule
  name: 'Your Rule Name',
  
  // Brief description of what this rule detects
  description: 'Detects [what your rule detects]',
  
  // All labels that this rule can apply
  labels: [
    {
      name: 'example-label',        // Label name (lowercase, use hyphens)
      color: 'FBCA04',               // Hex color WITHOUT '#'
      description: 'What this label means'  // Short description
    }
    // Add more labels as needed
  ],
  
  // Your GitHub username
  author: 'your-github-username',
  
  // Rule version (semver format)
  version: '1.0.0'
};

/**
 * ============================================================================
 * EXPORT - Required
 * ============================================================================
 * This makes your rule available to the workflow
 */
module.exports = yourRuleNameRule;

/**
 * ============================================================================
 * USEFUL PATTERNS & TIPS
 * ============================================================================
 * 
 * File Extension Detection:
 * -----------------------
 * const ext = filename.substring(filename.lastIndexOf('.'));
 * if (ext === '.js') { ... }
 * 
 * Path Pattern Matching:
 * ---------------------
 * if (filename.startsWith('src/')) { ... }
 * if (filename.includes('/migrations/')) { ... }
 * if (filename.match(/\/db\/.*\.sql$/)) { ... }
 * 
 * Content Search (in diffs):
 * ------------------------
 * if (file.patch && file.patch.includes('console.log')) { ... }
 * if (file.patch && file.patch.match(/DROP\s+TABLE/i)) { ... }
 * 
 * Multiple File Types:
 * ------------------
 * const extensions = ['.js', '.jsx', '.ts', '.tsx'];
 * if (extensions.some(ext => filename.endsWith(ext))) { ... }
 * 
 * Conditional Labels:
 * -----------------
 * Only apply label B if label A is already going to be applied:
 * if (labels.includes('label-a')) {
 *   labels.push('label-b');
 * }
 * 
 * File Status:
 * ----------
 * file.status can be: 'added', 'modified', 'removed', 'renamed'
 * 
 * PR Information:
 * -------------
 * pr.title, pr.body, pr.user.login, pr.labels, pr.draft, etc.
 * 
 * Color Palette:
 * ------------
 * Red (danger):    'D93F0B'
 * Yellow (warning):'FBCA04'
 * Green (safe):    '0E8A16'
 * Blue (info):     '0075CA'
 * Purple (style):  'D4C5F9'
 * Gray (meta):     '7F8C8D'
 * ============================================================================
 */

