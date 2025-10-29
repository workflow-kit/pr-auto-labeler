/**
 * Frontend/UI Detection Rule
 * 
 * Detects changes to frontend/UI files and applies appropriate labels.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function frontendUIRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Define file extensions
  const uiExtensions = ['.html', '.css', '.scss', '.sass', '.less', '.jsx', '.tsx', '.vue'];
  const styleExtensions = ['.css', '.scss', '.sass', '.less'];
  const jsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue'];
  
  let hasUIChanges = false;
  let hasStyleChanges = false;
  let hasJSChanges = false;
  
  // Analyze files
  for (const file of files) {
    const filename = file.filename.toLowerCase();
    const ext = filename.substring(filename.lastIndexOf('.'));
    
    if (uiExtensions.includes(ext)) {
      hasUIChanges = true;
      
      if (styleExtensions.includes(ext)) {
        hasStyleChanges = true;
      }
      
      if (jsExtensions.includes(ext)) {
        hasJSChanges = true;
      }
    }
    
    if (enableDebug) {
      console.log(`[Frontend/UI Rule] File: ${filename}, Extension: ${ext}, Is UI: ${uiExtensions.includes(ext)}`);
    }
  }
  
  // Apply labels based on detection
  if (hasUIChanges) {
    labels.push('ui-change');
    
    // If only style files changed (no JS/TS)
    if (hasStyleChanges && !hasJSChanges) {
      labels.push('style-change');
    }
  }
  
  if (enableDebug) {
    console.log(`[Frontend/UI Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Frontend/UI Detection',
  description: 'Detects changes to frontend and UI files',
  labels: [
    {
      name: 'ui-change',
      color: '0E8A16',
      description: 'UI/Frontend changes detected'
    },
    {
      name: 'style-change',
      color: 'D4C5F9',
      description: 'Style-only changes (CSS/SCSS)'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0'
};

