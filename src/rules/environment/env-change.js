/**
 * Environment File Change Detection Rule
 * 
 * Detects when environment configuration files are modified.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function envChangeRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Define environment file patterns
  const envFilePatterns = [
    /\.env$/,
    /\.env\./,
    /^\.env$/,
    /config\.ya?ml$/,
    /config\.json$/
  ];
  
  let hasEnvChanges = false;
  
  // Analyze files
  for (const file of files) {
    // Skip files with null or undefined filename
    if (!file.filename) {
      continue;
    }
    
    const filename = file.filename.toLowerCase();
    
    // Check if this is an environment file
    const isEnvFile = envFilePatterns.some(pattern => pattern.test(filename));
    
    if (isEnvFile) {
      hasEnvChanges = true;
      
      if (enableDebug) {
        console.log(`[Env Change Rule] Environment file detected: ${filename}`);
      }
      break; // Found at least one env file
    }
  }
  
  // Apply label if environment files changed
  if (hasEnvChanges) {
    labels.push('env-change');
  }
  
  if (enableDebug) {
    console.log(`[Env Change Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Environment File Change Detection',
  description: 'Detects changes to environment configuration files',
  labels: [
    {
      name: 'env-change',
      color: 'FFA500',
      description: 'Environment configuration files modified'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'environment'
};

