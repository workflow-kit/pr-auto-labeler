/**
 * Potential Secret Leak Detection Rule
 * 
 * Detects when environment variables with potentially sensitive names
 * (containing keywords like "secret", "password", "api_key", etc.) are added.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function potentialSecretLeakRule({ files, pr, enableDebug }) {
  const labels = [];
  
  // Define environment file patterns
  const envFilePatterns = [
    /\.env$/,
    /\.env\./,
    /^\.env$/,
    /config\.ya?ml$/,
    /config\.json$/
  ];
  
  // Keywords that might indicate secrets
  const secretKeywords = [
    'api_key', 'apikey', 'api-key',
    'secret', 'password', 'passwd', 'pwd',
    'token', 'auth', 'credential',
    'private_key', 'private-key',
    'access_key', 'access-key'
  ];
  
  let hasPotentialSecret = false;
  
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
          
          // Check if line contains a key=value pattern
          if (trimmedLine.includes('=')) {
            const lineForSecretCheck = trimmedLine.toLowerCase();
            
            // Check for potential secrets
            if (secretKeywords.some(keyword => lineForSecretCheck.includes(keyword))) {
              hasPotentialSecret = true;
              
              if (enableDebug) {
                console.log(`[Potential Secret Leak Rule] Potential secret detected in ${filename}: ${trimmedLine.split('=')[0]}`);
              }
              break; // Found at least one potential secret
            }
          }
        }
      }
      
      if (hasPotentialSecret) {
        break; // Already found, no need to check more files
      }
    }
  }
  
  // Apply label if potential secrets detected
  if (hasPotentialSecret) {
    labels.push('potential-secret-leak');
  }
  
  if (enableDebug) {
    console.log(`[Potential Secret Leak Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Potential Secret Leak Detection',
  description: 'Detects potential secrets or sensitive data in environment files',
  labels: [
    {
      name: 'potential-secret-leak',
      color: 'D93F0B',
      description: 'Potential secret or sensitive data detected'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'environment'
};

