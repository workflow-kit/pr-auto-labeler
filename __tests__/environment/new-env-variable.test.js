/**
 * Unit tests for New Environment Variable Detection Rule
 */

const newEnvVariableRule = require('../../src/rules/environment/new-env-variable');

describe('New Environment Variable Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(newEnvVariableRule.metadata).toBeDefined();
      expect(newEnvVariableRule.metadata.name).toBe('New Environment Variable Detection');
      expect(newEnvVariableRule.metadata.description).toBeDefined();
      expect(newEnvVariableRule.metadata.category).toBe('environment');
      expect(newEnvVariableRule.metadata.labels).toHaveLength(1);
    });

    it('should define new-env-variable label', () => {
      const label = newEnvVariableRule.metadata.labels[0];
      expect(label.name).toBe('new-env-variable');
      expect(label.color).toBe('FBCA04');
      expect(label.description).toBeDefined();
    });
  });

  describe('New Environment Variable Detection', () => {
    it('should detect new environment variable', () => {
      const patch = `@@ -1,3 +1,4 @@
 DATABASE_URL=postgres://localhost
+API_URL=https://api.example.com
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('new-env-variable');
      expect(labels).toHaveLength(1);
    });

    it('should detect multiple new variables', () => {
      const patch = `@@ -1,3 +1,5 @@
 DATABASE_URL=postgres://localhost
+API_URL=https://api.example.com
+REDIS_URL=redis://localhost
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('new-env-variable');
    });

    it('should ignore removed lines', () => {
      const patch = `@@ -1,3 +1,2 @@
 DATABASE_URL=postgres://localhost
-OLD_VAR=value
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('new-env-variable');
      expect(labels).toEqual([]);
    });

    it('should ignore comment lines', () => {
      const patch = `@@ -1,3 +1,4 @@
 DATABASE_URL=postgres://localhost
+# This is a comment
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should ignore empty lines', () => {
      const patch = `@@ -1,3 +1,4 @@
 DATABASE_URL=postgres://localhost
+
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle variables with spaces around equals', () => {
      const patch = `@@ -1,3 +1,4 @@
 DATABASE_URL=postgres://localhost
+NEW_VAR = value
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('new-env-variable');
    });

    it('should detect variables in config.yml', () => {
      const patch = `@@ -1,3 +1,4 @@
 database_url: postgres://localhost
+api_url: https://api.example.com
 port: 3000`;
      
      const files = [{ filename: 'config.yml', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('new-env-variable');
    });
  });

  describe('Non-Environment Files', () => {
    it('should return empty array for non-env files', () => {
      const patch = '+const API_URL = "https://api.example.com";';
      const files = [{ filename: 'config.js', patch }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should not trigger on files without patches', () => {
      const files = [{ filename: '.env' }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle files without patch', () => {
      const files = [{ filename: '.env', patch: null }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle null or undefined filename', () => {
      const files = [{ filename: null, patch: '+KEY=value' }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle empty patch', () => {
      const files = [{ filename: '.env', patch: '' }];
      const labels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Debug Mode', () => {
    it('should not throw errors when debug is enabled', () => {
      const patch = '+API_KEY=secret123';
      const files = [{ filename: '.env', patch }];
      
      expect(() => {
        newEnvVariableRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
    });
  });
});

