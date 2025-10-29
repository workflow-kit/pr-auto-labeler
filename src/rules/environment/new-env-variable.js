/**
 * New Environment Variable Detection Rule
 * 
 * Detects when new environment variables are introduced in env files.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function newEnvVariableRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Define environment file patterns
  const envFilePatterns = [
    /\.env$/,
    /\.env\./,
    /^\.env$/,
    /config\.ya?ml$/,
    /config\.json$/
  ];
  
  let hasNewEnvVariable = false;
  
  // Analyze files
  for (const file of files) {
    // Skip files with null or undefined filename
    if (!file.filename) {
      continue;
    }
    
    const filename = file.filename.toLowerCase();
    
    // Check if this is an environment file
    const isEnvFile = envFilePatterns.some(pattern => pattern.test(filename));
    
    if (isEnvFile && file.patch) {
      const patchLines = file.patch.split('\n');
      
      for (const line of patchLines) {
        // Look for added lines (starting with +)
        if (line.startsWith('+') && !line.startsWith('+++')) {
          const trimmedLine = line.substring(1).trim();
          
          // Skip empty lines and comments
          if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
          }
          
          // Check if line contains a key=value or key:value pattern (for YAML/JSON)
          if (trimmedLine.includes('=') || trimmedLine.includes(':')) {
            hasNewEnvVariable = true;
            
            if (enableDebug) {
              console.log(`[New Env Variable Rule] New variable detected in ${filename}: ${trimmedLine.split('=')[0]}`);
            }
            break; // Found at least one new variable
          }
        }
      }
      
      if (hasNewEnvVariable) {
        break; // Already found, no need to check more files
      }
    }
  }
  
  // Apply label if new env variables detected
  if (hasNewEnvVariable) {
    labels.push('new-env-variable');
  }
  
  if (enableDebug) {
    console.log(`[New Env Variable Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'New Environment Variable Detection',
  description: 'Detects new environment variables being introduced',
  labels: [
    {
      name: 'new-env-variable',
      color: 'FBCA04',
      description: 'New environment variable introduced'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'environment'
};

