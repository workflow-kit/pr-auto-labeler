/**
 * Docker Configuration File Change Detection Rule
 * 
 * Detects when Docker configuration files are modified.
 * This includes Dockerfiles, .dockerignore, and docker-compose files.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function dockerChangeRule({ files, pr, enableDebug }) {
  const labels = [];
  
  let hasDockerChanges = false;
  
  // Analyze files
  for (const file of files) {
    // Skip files with null or undefined filename
    if (!file.filename) {
      continue;
    }
    
    const filename = file.filename;
    const filenameLower = filename.toLowerCase();
    const baseName = filename.split('/').pop(); // Get the base filename
    const baseNameLower = baseName.toLowerCase();
    
    // Check for various Docker file patterns
    const isDockerFile = 
      // Exact match: Dockerfile (case-insensitive)
      baseNameLower === 'dockerfile' ||
      
      // Dockerfile with extensions: Dockerfile.prod, Dockerfile.dev, etc.
      baseNameLower.startsWith('dockerfile.') ||
      
      // Files ending with .dockerfile: app.dockerfile, build.dockerfile
      filenameLower.endsWith('.dockerfile') ||
      
      // .dockerignore file
      baseNameLower === '.dockerignore' ||
      
      // docker-compose files: docker-compose.yml, docker-compose.yaml, docker-compose.prod.yml
      (baseNameLower.startsWith('docker-compose') && 
       (filenameLower.endsWith('.yml') || filenameLower.endsWith('.yaml')));
    
    if (isDockerFile) {
      hasDockerChanges = true;
      
      if (enableDebug) {
        console.log(`[Docker Change Rule] Docker configuration file detected: ${filename}`);
      }
      
      // Continue checking all files for debug logging, but we already know we need the label
    }
  }
  
  // Apply label if Docker files changed
  if (hasDockerChanges) {
    labels.push('docker-change');
  }
  
  if (enableDebug) {
    console.log(`[Docker Change Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Docker Configuration Change Detection',
  description: 'Detects changes to Docker configuration files (Dockerfile, .dockerignore, docker-compose.yml)',
  labels: [
    {
      name: 'docker-change',
      color: '384d54',
      description: 'Docker configuration files modified'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'infrastructure'
};

