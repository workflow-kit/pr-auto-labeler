/**
 * Unit tests for Schema Change Detection Rule
 */

const schemaChangeRule = require('../../src/rules/database/schema-change');

describe('Schema Change Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(schemaChangeRule.metadata).toBeDefined();
      expect(schemaChangeRule.metadata.name).toBe('Schema Change Detection');
      expect(schemaChangeRule.metadata.description).toBeDefined();
      expect(schemaChangeRule.metadata.category).toBe('database');
      expect(schemaChangeRule.metadata.labels).toHaveLength(1);
    });

    it('should define schema-change label with correct color', () => {
      const label = schemaChangeRule.metadata.labels[0];
      expect(label.name).toBe('schema-change');
      expect(label.color).toBe('fbca04');
      expect(label.description).toBe('Database schema modifications detected (ALTER, RENAME, etc.)');
    });
  });

  describe('ALTER TABLE Detection', () => {
    it('should detect ALTER TABLE ADD COLUMN', () => {
      const files = [{
        filename: 'migrations/001_add_column.sql',
        patch: '+ALTER TABLE users ADD COLUMN email VARCHAR(255);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });

    it('should detect ALTER TABLE case-insensitive', () => {
      const files = [{
        filename: 'migrations/002.sql',
        patch: '+alter table users add column name varchar(255);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });

    it('should detect ALTER TABLE MODIFY COLUMN', () => {
      const files = [{
        filename: 'migrations/003.sql',
        patch: '+ALTER TABLE users MODIFY COLUMN email VARCHAR(500);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });
  });

  describe('RENAME Detection', () => {
    it('should detect RENAME TABLE', () => {
      const files = [{
        filename: 'migrations/004.sql',
        patch: '+RENAME TABLE old_users TO users;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });

    it('should detect RENAME TO', () => {
      const files = [{
        filename: 'migrations/005.sql',
        patch: '+ALTER TABLE old_name RENAME TO new_name;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });

    it('should detect RENAME case-insensitive', () => {
      const files = [{
        filename: 'migrations/006.sql',
        patch: '+rename table users to new_users;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });
  });

  describe('ALTER COLUMN Detection', () => {
    it('should detect ALTER COLUMN', () => {
      const files = [{
        filename: 'migrations/007.sql',
        patch: '+ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(500);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });

    it('should detect ALTER COLUMN case-insensitive', () => {
      const files = [{
        filename: 'migrations/008.sql',
        patch: '+alter table users alter column name type varchar(255);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });
  });

  describe('MODIFY COLUMN Detection', () => {
    it('should detect MODIFY COLUMN', () => {
      const files = [{
        filename: 'migrations/009.sql',
        patch: '+ALTER TABLE users MODIFY COLUMN email VARCHAR(500);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });
  });

  describe('ADD CONSTRAINT Detection', () => {
    it('should detect ADD CONSTRAINT', () => {
      const files = [{
        filename: 'migrations/010.sql',
        patch: '+ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });

    it('should detect ADD CONSTRAINT case-insensitive', () => {
      const files = [{
        filename: 'migrations/011.sql',
        patch: '+alter table users add constraint pk_users primary key (id);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });
  });

  describe('Should NOT Trigger on Destructive Operations', () => {
    it('should not trigger on DROP TABLE', () => {
      const files = [{
        filename: 'migrations/012.sql',
        patch: '+DROP TABLE users;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should not trigger on DROP COLUMN', () => {
      const files = [{
        filename: 'migrations/013.sql',
        patch: '+ALTER TABLE users DROP COLUMN email;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should not trigger on TRUNCATE TABLE', () => {
      const files = [{
        filename: 'migrations/014.sql',
        patch: '+TRUNCATE TABLE logs;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should not trigger on mixed ALTER with DROP', () => {
      const files = [{
        filename: 'migrations/015.sql',
        patch: '+ALTER TABLE users DROP COLUMN old_field;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });
  });

  describe('Should NOT Trigger on Non-Schema Operations', () => {
    it('should ignore CREATE TABLE operations', () => {
      const files = [{
        filename: 'migrations/016.sql',
        patch: '+CREATE TABLE users (id INT PRIMARY KEY);'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should ignore INSERT statements', () => {
      const files = [{
        filename: 'migrations/017.sql',
        patch: '+INSERT INTO users VALUES (1, \'test\');'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should ignore UPDATE statements', () => {
      const files = [{
        filename: 'migrations/018.sql',
        patch: '+UPDATE users SET name = \'test\';'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should ignore non-migration files', () => {
      const files = [{
        filename: 'src/app.js',
        patch: '+ALTER TABLE users ADD COLUMN email;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle files with no patch', () => {
      const files = [{
        filename: 'migrations/019.sql'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should handle multiple schema changes in one file', () => {
      const files = [{
        filename: 'migrations/020.sql',
        patch: '+ALTER TABLE users ADD COLUMN email;\n+ALTER TABLE posts ADD COLUMN title;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
      expect(labels).toHaveLength(1);
    });

    it('should ignore ALTER in comments', () => {
      const files = [{
        filename: 'migrations/021.sql',
        patch: '+-- ALTER TABLE users\n+CREATE TABLE users;'
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });

    it('should ignore ALTER in string literals', () => {
      const files = [{
        filename: 'migrations/022.sql',
        patch: "+INSERT INTO logs VALUES ('ALTER TABLE users');"
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('schema-change');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should detect complex ALTER TABLE migration', () => {
      const files = [{
        filename: 'db/migrations/20251029_update_schema.sql',
        patch: `@@
+-- Add new columns
+ALTER TABLE users ADD COLUMN email VARCHAR(255);
+ALTER TABLE users ADD COLUMN phone VARCHAR(20);
+
+-- Add constraints
+ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
+@@`
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });

    it('should detect RENAME migration', () => {
      const files = [{
        filename: 'migrations/023_rename_table.sql',
        patch: `@@
+-- Rename deprecated table
+RENAME TABLE old_users TO users;
+@@`
      }];
      const labels = schemaChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('schema-change');
    });
  });
});

