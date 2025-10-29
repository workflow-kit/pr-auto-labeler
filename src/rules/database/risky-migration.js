/**
 * Risky Migration Detection Rule
 * 
 * Detects potentially dangerous database migration operations that could cause
 * data loss or service disruption (DROP, TRUNCATE, etc.).
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function riskyMigrationRule({ files, pr, enableDebug }) {
  const labels = [];
  
  let hasRiskyOperations = false;
  
  // First, check if any files are migration files
  const migrationPatterns = [
    /^migrations\//i,
    /\/migrations\//i,
    /^db\/migrations\//i,
    /\/db\/migrations\//i,
    /^database\/migrations\//i,
    /\/database\/migrations\//i
  ];
  
  // Risky SQL patterns (case-insensitive)
  const riskyPatterns = [
    /DROP\s+TABLE\s+/i,              // DROP TABLE
    /DROP\s+COLUMN\s+/i,             // DROP COLUMN
    /TRUNCATE\s+TABLE\s+/i,          // TRUNCATE TABLE
    /ALTER\s+TABLE\s+[^;]*\s+DROP/i, // ALTER TABLE ... DROP
    /DROP\s+INDEX\s+/i,              // DROP INDEX
    /DROP\s+CONSTRAINT\s+/i          // DROP CONSTRAINT
  ];
  
  // Analyze files
  for (const file of files) {
    // Skip files with null or undefined filename
    if (!file.filename) {
      continue;
    }
    
    const filename = file.filename;
    
    // Check if this is a migration file
    const isMigrationFile = migrationPatterns.some(pattern => pattern.test(filename));
    
    if (!isMigrationFile) {
      continue; // Skip non-migration files
    }
    
    // Check the patch/diff content for risky operations
    if (file.patch) {
      // Remove SQL comments and string literals to avoid false positives
      const cleanPatch = file.patch
        .replace(/--[^\n]*/g, '')           // Remove SQL comments (-- ...)
        .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove block comments (/* ... */)
        .replace(/'[^']*'/g, '')            // Remove string literals
        .replace(/"[^"]*"/g, '');           // Remove double-quoted strings
      
      // Check for risky patterns
      const hasRisky = riskyPatterns.some(pattern => pattern.test(cleanPatch));
      
      if (hasRisky) {
        hasRiskyOperations = true;
        
        if (enableDebug) {
          console.log(`[Risky Migration Rule] Risky operation detected in: ${filename}`);
        }
        
        // Continue checking all files for debug logging
      }
    }
  }
  
  // Apply label if risky operations detected
  if (hasRiskyOperations) {
    labels.push('risky-migration');
  }
  
  if (enableDebug) {
    console.log(`[Risky Migration Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Risky Migration Detection',
  description: 'Detects destructive migration operations (DROP, TRUNCATE, etc.)',
  labels: [
    {
      name: 'risky-migration',
      color: 'd73a4a',
      description: 'Destructive migration operations detected (DROP, TRUNCATE, etc.)'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'database'
};

