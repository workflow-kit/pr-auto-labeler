/**
 * Migration File Detection Rule
 * 
 * Detects when database migration files are added or modified.
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function migrationRule({ files, pr, enableDebug }) {
  const labels = [];
  
  let hasMigrationChanges = false;
  
  // Define migration directory patterns (case-insensitive)
  // Matches: migrations/, **/migrations/, db/migrations/, database/migrations/, etc.
  const migrationPatterns = [
    /^migrations\//i,              // migrations/ at start
    /\/migrations\//i,             // **/migrations/**
    /^db\/migrations\//i,          // db/migrations/ at start
    /\/db\/migrations\//i,         // **/db/migrations/**
    /^database\/migrations\//i,     // database/migrations/ at start
    /\/database\/migrations\//i     // **/database/migrations/**
  ];
  
  // Analyze files
  for (const file of files) {
    // Skip files with null or undefined filename
    if (!file.filename) {
      continue;
    }
    
    const filename = file.filename;
    
    // Check if this file is in a migration directory
    const isMigrationFile = migrationPatterns.some(pattern => pattern.test(filename));
    
    if (isMigrationFile) {
      hasMigrationChanges = true;
      
      if (enableDebug) {
        console.log(`[Migration Rule] Migration file detected: ${filename}`);
      }
      
      // Continue checking all files for debug logging
    }
  }
  
  // Apply label if migration files changed
  if (hasMigrationChanges) {
    labels.push('migration');
  }
  
  if (enableDebug) {
    console.log(`[Migration Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Migration File Detection',
  description: 'Detects changes to database migration files',
  labels: [
    {
      name: 'migration',
      color: '0366d6',
      description: 'Database migration files detected in PR'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'database'
};

