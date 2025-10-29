/**
 * UI Change Detection Rule
 * 
 * Detects changes to frontend/UI files (HTML, CSS, JS frameworks, etc.).
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function uiChangeRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Define UI file extensions
  const uiExtensions = ['.html', '.css', '.scss', '.sass', '.less', '.jsx', '.tsx', '.vue'];
  
  let hasUIChanges = false;
  
  // Analyze files
  for (const file of files) {
    // Skip files with null or undefined filename
    if (!file.filename) {
      continue;
    }
    
    const filename = file.filename.toLowerCase();
    const ext = filename.substring(filename.lastIndexOf('.'));
    
    // Check for UI changes
    if (uiExtensions.includes(ext)) {
      hasUIChanges = true;
      
      if (enableDebug) {
        console.log(`[UI Change Rule] UI file detected: ${filename}`);
      }
      break; // Found at least one UI file
    }
  }
  
  // Apply label if UI changes detected
  if (hasUIChanges) {
    labels.push('ui-change');
  }
  
  if (enableDebug) {
    console.log(`[UI Change Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'UI Change Detection',
  description: 'Detects changes to frontend and UI files',
  labels: [
    {
      name: 'ui-change',
      color: '0E8A16',
      description: 'UI/Frontend changes detected'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'frontend'
};

