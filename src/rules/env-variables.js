/**
 * Environment Variables Detection Rule
 * 
 * Detects changes to environment configuration files and identifies
 * new environment variables being introduced.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
function envVariablesRule({ files, pr, enableDebug }) {
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
  let hasNewEnvVariable = false;
  let hasPotentialSecret = false;
  
  // Keywords that might indicate secrets
  const secretKeywords = [
    'api_key', 'apikey', 'api-key',
    'secret', 'password', 'passwd', 'pwd',
    'token', 'auth', 'credential',
    'private_key', 'private-key',
    'access_key', 'access-key'
  ];
  
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
        console.log(`[Env Variables Rule] Detected env file: ${filename}`);
      }
      
      // Check the patch/diff for new variables
      if (file.patch) {
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
              hasNewEnvVariable = true;
              
              // Check for potential secrets
              const lineForSecretCheck = trimmedLine.toLowerCase();
              if (secretKeywords.some(keyword => lineForSecretCheck.includes(keyword))) {
                hasPotentialSecret = true;
                
                if (enableDebug) {
                  console.log(`[Env Variables Rule] Potential secret detected: ${trimmedLine.split('=')[0]}`);
                }
              }
              
              if (enableDebug) {
                console.log(`[Env Variables Rule] New variable detected: ${trimmedLine.split('=')[0]}`);
              }
            }
          }
        }
      }
    }
  }
  
  // Apply labels based on detection
  if (hasEnvChanges) {
    labels.push('env-change');
  }
  
  if (hasNewEnvVariable) {
    labels.push('new-env-variable');
  }
  
  if (hasPotentialSecret) {
    labels.push('potential-secret-leak');
  }
  
  if (enableDebug && labels.length > 0) {
    console.log(`[Env Variables Rule] Labels to apply: ${labels.join(', ')}`);
  }
  
  return labels;
}

// Rule metadata
envVariablesRule.metadata = {
  name: 'Environment Variables Detection',
  description: 'Detects changes to environment files and new variables',
  labels: [
    {
      name: 'env-change',
      color: 'FFA500',
      description: 'Environment configuration files modified'
    },
    {
      name: 'new-env-variable',
      color: 'FBCA04',
      description: 'New environment variable introduced'
    },
    {
      name: 'potential-secret-leak',
      color: 'D93F0B',
      description: 'Potential secret or sensitive data detected'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0'
};

module.exports = envVariablesRule;

