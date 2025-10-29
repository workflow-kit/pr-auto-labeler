/**
 * Style-Only Change Detection Rule
 * 
 * Detects when only style files (CSS/SCSS/SASS/LESS) are modified without
 * any JavaScript/TypeScript changes.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function styleChangeRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Define file extensions
  const styleExtensions = ['.css', '.scss', '.sass', '.less'];
  const jsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue'];
  
  let hasStyleChanges = false;
  let hasJSChanges = false;
  
  // Analyze files
  for (const file of files) {
    // Skip files with null or undefined filename
    if (!file.filename) {
      continue;
    }
    
    const filename = file.filename.toLowerCase();
    const ext = filename.substring(filename.lastIndexOf('.'));
    
    // Check for style changes
    if (styleExtensions.includes(ext)) {
      hasStyleChanges = true;
      
      if (enableDebug) {
        console.log(`[Style Change Rule] Style file detected: ${filename}`);
      }
    }
    
    // Check for JS/TS changes
    if (jsExtensions.includes(ext)) {
      hasJSChanges = true;
      
      if (enableDebug) {
        console.log(`[Style Change Rule] JS/TS file detected: ${filename}`);
      }
    }
  }
  
  // Apply label only if style files changed without JS/TS changes
  if (hasStyleChanges && !hasJSChanges) {
    labels.push('style-change');
  }
  
  if (enableDebug) {
    console.log(`[Style Change Rule] Has style changes: ${hasStyleChanges}, Has JS changes: ${hasJSChanges}`);
    console.log(`[Style Change Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Style-Only Change Detection',
  description: 'Detects style-only changes without JS/TS modifications',
  labels: [
    {
      name: 'style-change',
      color: 'D4C5F9',
      description: 'Style-only changes (CSS/SCSS)'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'frontend'
};

