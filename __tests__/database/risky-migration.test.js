/**
 * Unit tests for Risky Migration Detection Rule
 */

const riskyMigrationRule = require('../../src/rules/database/risky-migration');

describe('Risky Migration Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(riskyMigrationRule.metadata).toBeDefined();
      expect(riskyMigrationRule.metadata.name).toBe('Risky Migration Detection');
      expect(riskyMigrationRule.metadata.description).toBeDefined();
      expect(riskyMigrationRule.metadata.category).toBe('database');
      expect(riskyMigrationRule.metadata.labels).toHaveLength(1);
    });

    it('should define risky-migration label with correct color', () => {
      const label = riskyMigrationRule.metadata.labels[0];
      expect(label.name).toBe('risky-migration');
      expect(label.color).toBe('d73a4a');
      expect(label.description).toBe('Destructive migration operations detected (DROP, TRUNCATE, etc.)');
    });
  });

  describe('DROP TABLE Detection', () => {
    it('should detect DROP TABLE in migration file', () => {
      const files = [{
        filename: 'migrations/001_drop_table.sql',
        patch: '+DROP TABLE old_users;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });

    it('should detect DROP TABLE case-insensitive', () => {
      const files = [{
        filename: 'migrations/002.sql',
        patch: '+drop table users;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });

    it('should detect DROP TABLE with whitespace variations', () => {
      const files = [{
        filename: 'migrations/003.sql',
        patch: '+DROP  TABLE  users;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });
  });

  describe('DROP COLUMN Detection', () => {
    it('should detect DROP COLUMN in migration', () => {
      const files = [{
        filename: 'migrations/004.sql',
        patch: '+ALTER TABLE users DROP COLUMN email;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });

    it('should detect DROP COLUMN case-insensitive', () => {
      const files = [{
        filename: 'db/migrations/005.sql',
        patch: '+alter table users drop column name;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });
  });

  describe('TRUNCATE TABLE Detection', () => {
    it('should detect TRUNCATE TABLE', () => {
      const files = [{
        filename: 'migrations/006.sql',
        patch: '+TRUNCATE TABLE logs;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });

    it('should detect TRUNCATE TABLE case-insensitive', () => {
      const files = [{
        filename: 'migrations/007.sql',
        patch: '+truncate table temp_data;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });
  });

  describe('ALTER TABLE DROP Detection', () => {
    it('should detect ALTER TABLE ... DROP', () => {
      const files = [{
        filename: 'migrations/008.sql',
        patch: '+ALTER TABLE users DROP COLUMN old_field;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });

    it('should detect ALTER TABLE with DROP constraint', () => {
      const files = [{
        filename: 'migrations/009.sql',
        patch: '+ALTER TABLE users DROP CONSTRAINT pk_users;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });
  });

  describe('DROP INDEX and CONSTRAINT Detection', () => {
    it('should detect DROP INDEX', () => {
      const files = [{
        filename: 'migrations/010.sql',
        patch: '+DROP INDEX idx_users_email;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });

    it('should detect DROP CONSTRAINT', () => {
      const files = [{
        filename: 'migrations/011.sql',
        patch: '+ALTER TABLE users DROP CONSTRAINT unique_email;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });
  });

  describe('False Positives - Should NOT Trigger', () => {
    it('should ignore DROP in comments', () => {
      const files = [{
        filename: 'migrations/012.sql',
        patch: '+-- DROP TABLE users\n+CREATE TABLE users;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('risky-migration');
    });

    it('should ignore DROP in string literals', () => {
      const files = [{
        filename: 'migrations/013.sql',
        patch: "+INSERT INTO logs VALUES ('DROP TABLE users');"
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('risky-migration');
    });

    it('should ignore safe ALTER TABLE operations', () => {
      const files = [{
        filename: 'migrations/014.sql',
        patch: '+ALTER TABLE users ADD COLUMN email VARCHAR(255);'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('risky-migration');
    });

    it('should ignore CREATE TABLE operations', () => {
      const files = [{
        filename: 'migrations/015.sql',
        patch: '+CREATE TABLE users (id INT PRIMARY KEY);'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('risky-migration');
    });

    it('should ignore UPDATE statements', () => {
      const files = [{
        filename: 'migrations/016.sql',
        patch: '+UPDATE users SET name = \'test\';'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('risky-migration');
    });

    it('should ignore non-migration files', () => {
      const files = [{
        filename: 'src/app.js',
        patch: '+DROP TABLE users;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('risky-migration');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle files with no patch', () => {
      const files = [{
        filename: 'migrations/017.sql'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('risky-migration');
    });

    it('should handle multiple risky operations in one file', () => {
      const files = [{
        filename: 'migrations/018.sql',
        patch: '+DROP TABLE old_users;\n+TRUNCATE TABLE logs;'
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
      expect(labels).toHaveLength(1);
    });

    it('should detect risky operations in different migration files', () => {
      const files = [
        { filename: 'migrations/019.sql', patch: '+DROP TABLE users;' },
        { filename: 'migrations/020.sql', patch: '+TRUNCATE TABLE logs;' }
      ];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should detect complex migration with DROP', () => {
      const files = [{
        filename: 'db/migrations/20251029_remove_deprecated.sql',
        patch: `@@
+-- Remove deprecated table
+DROP TABLE deprecated_logs;
+
+-- Update schema
+ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
+@@`
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });

    it('should detect migration with TRUNCATE and data migration', () => {
      const files = [{
        filename: 'migrations/021_cleanup.sql',
        patch: `@@
+-- Clean up old data
+TRUNCATE TABLE temporary_data;
+
+-- Migrate to new format
+INSERT INTO new_table SELECT * FROM old_table;
+@@`
      }];
      const labels = riskyMigrationRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('risky-migration');
    });
  });
});

