/**
 * Schema Change Detection Rule
 * 
 * Detects structural changes to database schema that are significant but not
 * necessarily destructive (ALTER TABLE, RENAME, etc.).
 * 
 * @param {Object} context - The rule execution context
 * @param {Array} context.files - Array of changed files in the PR
 * @param {Object} context.pr - Pull request information
 * @param {boolean} context.enableDebug - Whether debug logging is enabled
 * @returns {Array<string>} - Array of labels to apply
 */
module.exports = function schemaChangeRule({ files, pr, enableDebug }) {
  const labels = [];
  
  let hasSchemaChanges = false;
  
  // First, check if any files are migration files
  const migrationPatterns = [
    /^migrations\//i,
    /\/migrations\//i,
    /^db\/migrations\//i,
    /\/db\/migrations\//i,
    /^database\/migrations\//i,
    /\/database\/migrations\//i
  ];
  
  // Schema change patterns (case-insensitive)
  const schemaChangePatterns = [
    /ALTER\s+TABLE\s+/i,           // ALTER TABLE
    /RENAME\s+(TABLE|TO)\s+/i,     // RENAME TABLE or RENAME TO
    /ALTER\s+COLUMN\s+/i,          // ALTER COLUMN
    /MODIFY\s+COLUMN\s+/i,         // MODIFY COLUMN
    /ADD\s+CONSTRAINT\s+/i          // ADD CONSTRAINT
  ];
  
  // Patterns that indicate destructive operations (should exclude)
  const destructivePatterns = [
    /DROP\s+TABLE\s+/i,
    /DROP\s+COLUMN\s+/i,
    /TRUNCATE\s+TABLE\s+/i,
    /DROP\s+INDEX\s+/i,
    /DROP\s+CONSTRAINT\s+/i,
    /ALTER\s+TABLE\s+[^;]*\s+DROP/i
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
    
    // Check the patch/diff content for schema changes
    if (file.patch) {
      // Remove SQL comments and string literals to avoid false positives
      const cleanPatch = file.patch
        .replace(/--[^\n]*/g, '')           // Remove SQL comments (-- ...)
        .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove block comments (/* ... */)
        .replace(/'[^']*'/g, '')            // Remove string literals
        .replace(/"[^"]*"/g, '');            // Remove double-quoted strings
      
      // Check for destructive patterns first - if found, don't apply schema-change
      const hasDestructive = destructivePatterns.some(pattern => pattern.test(cleanPatch));
      
      if (hasDestructive) {
        // Skip this file - it's a risky migration, not just a schema change
        continue;
      }
      
      // Check for schema change patterns
      const hasSchemaChange = schemaChangePatterns.some(pattern => pattern.test(cleanPatch));
      
      if (hasSchemaChange) {
        hasSchemaChanges = true;
        
        if (enableDebug) {
          console.log(`[Schema Change Rule] Schema change detected in: ${filename}`);
        }
        
        // Continue checking all files for debug logging
      }
    }
  }
  
  // Apply label if schema changes detected
  if (hasSchemaChanges) {
    labels.push('schema-change');
  }
  
  if (enableDebug) {
    console.log(`[Schema Change Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }
  
  return labels;
};

// Rule metadata
module.exports.metadata = {
  name: 'Schema Change Detection',
  description: 'Detects database schema modifications (ALTER, RENAME, etc.)',
  labels: [
    {
      name: 'schema-change',
      color: 'fbca04',
      description: 'Database schema modifications detected (ALTER, RENAME, etc.)'
    }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'database'
};

