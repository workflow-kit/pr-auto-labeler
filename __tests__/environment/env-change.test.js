/**
 * Unit tests for Environment File Change Detection Rule
 */

const envChangeRule = require('../../src/rules/environment/env-change');

describe('Environment File Change Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(envChangeRule.metadata).toBeDefined();
      expect(envChangeRule.metadata.name).toBe('Environment File Change Detection');
      expect(envChangeRule.metadata.description).toBeDefined();
      expect(envChangeRule.metadata.category).toBe('environment');
      expect(envChangeRule.metadata.labels).toHaveLength(1);
    });

    it('should define env-change label', () => {
      const label = envChangeRule.metadata.labels[0];
      expect(label.name).toBe('env-change');
      expect(label.color).toBe('FFA500');
      expect(label.description).toBeDefined();
    });
  });

  describe('Environment File Detection', () => {
    it('should detect .env file', () => {
      const files = [{ filename: '.env' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).toHaveLength(1);
    });

    it('should detect .env.local file', () => {
      const files = [{ filename: '.env.local' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect .env.production file', () => {
      const files = [{ filename: '.env.production' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect .env.development file', () => {
      const files = [{ filename: '.env.development' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect config.yml file', () => {
      const files = [{ filename: 'config.yml' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect config.yaml file', () => {
      const files = [{ filename: 'config.yaml' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect config.json file', () => {
      const files = [{ filename: 'config.json' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should handle env files in subdirectories', () => {
      const files = [{ filename: 'config/.env' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
    });

    it('should detect multiple env files', () => {
      const files = [
        { filename: '.env' },
        { filename: 'config.yml' }
      ];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('env-change');
      expect(labels).toHaveLength(1);
    });
  });

  describe('Non-Environment File Detection', () => {
    it('should return empty array for non-env files', () => {
      const files = [{ filename: 'README.md' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should not detect files with "env" in the middle of name', () => {
      const files = [{ filename: 'environment.js' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should not detect normal config files', () => {
      const files = [{ filename: 'webpack.config.js' }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle null or undefined filename', () => {
      const files = [{ filename: null }, { filename: undefined }];
      const labels = envChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Debug Mode', () => {
    it('should not throw errors when debug is enabled', () => {
      const files = [{ filename: '.env' }];
      
      expect(() => {
        envChangeRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
    });
  });
});

