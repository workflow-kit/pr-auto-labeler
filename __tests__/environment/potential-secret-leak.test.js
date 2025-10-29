/**
 * Unit tests for Potential Secret Leak Detection Rule
 */

const potentialSecretLeakRule = require('../../src/rules/environment/potential-secret-leak');

describe('Potential Secret Leak Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(potentialSecretLeakRule.metadata).toBeDefined();
      expect(potentialSecretLeakRule.metadata.name).toBe('Potential Secret Leak Detection');
      expect(potentialSecretLeakRule.metadata.description).toBeDefined();
      expect(potentialSecretLeakRule.metadata.category).toBe('environment');
      expect(potentialSecretLeakRule.metadata.labels).toHaveLength(1);
    });

    it('should define potential-secret-leak label', () => {
      const label = potentialSecretLeakRule.metadata.labels[0];
      expect(label.name).toBe('potential-secret-leak');
      expect(label.color).toBe('D93F0B');
      expect(label.description).toBeDefined();
    });
  });

  describe('Secret Detection', () => {
    it('should detect API_KEY', () => {
      const patch = '+API_KEY=secret123';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
      expect(labels).toHaveLength(1);
    });

    it('should detect PASSWORD', () => {
      const patch = '+DATABASE_PASSWORD=mypassword';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect SECRET', () => {
      const patch = '+JWT_SECRET=mysecret';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect TOKEN', () => {
      const patch = '+AUTH_TOKEN=mytoken';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect PRIVATE_KEY', () => {
      const patch = '+PRIVATE_KEY=-----BEGIN';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect AUTH credentials', () => {
      const patch = '+AUTH_CREDENTIALS=user:pass';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should be case-insensitive for secret detection', () => {
      const patch = '+api_key=secret123';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
    });

    it('should detect secrets with different naming patterns', () => {
      const patches = [
        '+APIKEY=secret',
        '+API-KEY=secret',
        '+api_key=secret',
        '+ApiKey=secret'
      ];
      
      patches.forEach(patch => {
        const files = [{ filename: '.env', patch }];
        const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
        expect(labels).toContain('potential-secret-leak');
      });
    });

    it('should not flag non-secret variables', () => {
      const patch = `+DATABASE_URL=postgres://localhost
+PORT=3000
+NODE_ENV=development`;
      
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Multiple Secrets', () => {
    it('should detect when multiple secrets are added', () => {
      const patch = `+API_KEY=secret123
+DATABASE_PASSWORD=pass456`;
      
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('potential-secret-leak');
      expect(labels).toHaveLength(1);
    });
  });

  describe('Non-Environment Files', () => {
    it('should return empty array for non-env files', () => {
      const patch = '+const API_KEY = "secret";';
      const files = [{ filename: 'config.js', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should not trigger on files without patches', () => {
      const files = [{ filename: '.env' }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle files without patch', () => {
      const files = [{ filename: '.env', patch: null }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle null or undefined filename', () => {
      const files = [{ filename: null, patch: '+API_KEY=secret' }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should ignore comment lines with secret keywords', () => {
      const patch = '+# API_KEY should be set';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should ignore removed secret lines', () => {
      const patch = '-API_KEY=old_secret';
      const files = [{ filename: '.env', patch }];
      const labels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Debug Mode', () => {
    it('should not throw errors when debug is enabled', () => {
      const patch = '+API_KEY=secret123';
      const files = [{ filename: '.env', patch }];
      
      expect(() => {
        potentialSecretLeakRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
    });
  });
});

