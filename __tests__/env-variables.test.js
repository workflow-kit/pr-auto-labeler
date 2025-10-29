/**
 * Unit tests for Environment Variables Detection Rule
 */

const envVariablesRule = require('../src/rules/env-variables');

describe('Environment Variables Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(envVariablesRule.metadata).toBeDefined();
      expect(envVariablesRule.metadata.name).toBe('Environment Variables Detection');
      expect(envVariablesRule.metadata.description).toBeDefined();
      expect(envVariablesRule.metadata.labels).toHaveLength(3);
    });

    it('should define env-change label', () => {
      const label = envVariablesRule.metadata.labels.find(l => l.name === 'env-change');
      expect(label).toBeDefined();
      expect(label.color).toBe('FFA500');
      expect(label.description).toBeDefined();
    });

    it('should define new-env-variable label', () => {
      const label = envVariablesRule.metadata.labels.find(l => l.name === 'new-env-variable');
      expect(label).toBeDefined();
      expect(label.color).toBe('FBCA04');
      expect(label.description).toBeDefined();
    });

    it('should define potential-secret-leak label', () => {
      const label = envVariablesRule.metadata.labels.find(l => l.name === 'potential-secret-leak');
      expect(label).toBeDefined();
      expect(label.color).toBe('D93F0B');
      expect(label.description).toBeDefined();
    });
  });

  describe('Environment File Detection', () => {
    it('should detect .env file', () => {
      const files = [{ filename: '.env', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect .env.local file', () => {
      const files = [{ filename: '.env.local', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect .env.production file', () => {
      const files = [{ filename: '.env.production', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect .env.development file', () => {
      const files = [{ filename: '.env.development', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect config.yml file', () => {
      const files = [{ filename: 'config.yml', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect config.yaml file', () => {
      const files = [{ filename: 'config.yaml', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect config.json file', () => {
      const files = [{ filename: 'config.json', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should handle env files in subdirectories', () => {
      const files = [{ filename: 'config/.env', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });
  });

  describe('New Environment Variable Detection', () => {
    it('should detect new environment variable', () => {
      const patch = `@@ -1,3 +1,4 @@
 DATABASE_URL=postgres://localhost
+API_URL=https://api.example.com
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).toContain('new-env-variable');
    });

    it('should detect multiple new variables', () => {
      const patch = `@@ -1,2 +1,4 @@
 DATABASE_URL=postgres://localhost
+API_URL=https://api.example.com
+REDIS_URL=redis://localhost
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('new-env-variable');
    });

    it('should ignore removed lines', () => {
      const patch = `@@ -1,3 +1,2 @@
 DATABASE_URL=postgres://localhost
-OLD_VAR=value
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).not.toContain('new-env-variable');
    });

    it('should ignore comment lines', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+# This is a comment
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).not.toContain('new-env-variable');
    });

    it('should ignore empty lines', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).not.toContain('new-env-variable');
    });

    it('should handle variables with spaces around equals', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+NEW_VAR = value with spaces
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('new-env-variable');
    });
  });

  describe('Secret Detection', () => {
    it('should detect API_KEY', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+API_KEY=sk_test_12345
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect PASSWORD', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+DB_PASSWORD=secretpass123
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect SECRET', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+JWT_SECRET=mysecretkey
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect TOKEN', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+GITHUB_TOKEN=ghp_1234567890
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect PRIVATE_KEY', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect AUTH credentials', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+AUTH_CREDENTIAL=abc123
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should be case-insensitive for secret detection', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+Api_Key=sk_test_12345
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should not flag non-secret variables', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+APP_NAME=MyApp
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('new-env-variable');
      expect(labels).not.toContain('potential-secret-leak');
    });
  });

  describe('Non-Environment File Detection', () => {
    it('should return empty array for non-env files', () => {
      const files = [
        { filename: 'README.md', patch: '' },
        { filename: 'index.js', patch: '' }
      ];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should not detect files with "env" in the middle of name', () => {
      const files = [{ filename: 'environment.js', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });
  });

  describe('Combined Scenarios', () => {
    it('should apply all relevant labels', () => {
      const patch = `@@ -1,2 +1,3 @@
 DATABASE_URL=postgres://localhost
+API_KEY=sk_test_12345
 PORT=3000`;
      
      const files = [{ filename: '.env', patch }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).toContain('new-env-variable');
      expect(labels).toContain('potential-secret-leak');
    });

    it('should handle multiple env files', () => {
      const patch1 = `+API_URL=https://api.example.com`;
      const patch2 = `+DB_HOST=localhost`;
      
      const files = [
        { filename: '.env.local', patch: patch1 },
        { filename: '.env.production', patch: patch2 }
      ];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).toContain('new-env-variable');
    });

    it('should handle mixed file types', () => {
      const patch = `+DATABASE_URL=postgres://localhost`;
      
      const files = [
        { filename: 'README.md', patch: '' },
        { filename: '.env', patch },
        { filename: 'index.js', patch: '' }
      ];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).toContain('new-env-variable');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle files without patch', () => {
      const files = [{ filename: '.env' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).not.toContain('new-env-variable');
    });

    it('should handle null or undefined filename', () => {
      const files = [{ filename: null, patch: '' }, { filename: undefined, patch: '' }];
      
      expect(() => {
        envVariablesRule({ files, pr: {}, enableDebug: false });
      }).not.toThrow();
    });

    it('should handle empty patch', () => {
      const files = [{ filename: '.env', patch: '' }];
      const labels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).not.toContain('new-env-variable');
    });
  });

  describe('Debug Mode', () => {
    it('should not throw errors when debug is enabled', () => {
      const patch = `+API_KEY=sk_test_12345`;
      const files = [{ filename: '.env', patch }];
      
      const originalLog = console.log;
      console.log = jest.fn();
      
      expect(() => {
        envVariablesRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
      
      console.log = originalLog;
    });

    it('should log debug information when enabled', () => {
      const patch = `+NEW_VAR=value`;
      const files = [{ filename: '.env', patch }];
      
      const originalLog = console.log;
      console.log = jest.fn();
      
      envVariablesRule({ files, pr: {}, enableDebug: true });
      
      expect(console.log).toHaveBeenCalled();
      
      console.log = originalLog;
    });
  });
});

