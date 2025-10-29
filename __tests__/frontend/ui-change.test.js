/**
 * Unit tests for UI Change Detection Rule
 */

const uiChangeRule = require('../../src/rules/frontend/ui-change');

describe('UI Change Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(uiChangeRule.metadata).toBeDefined();
      expect(uiChangeRule.metadata.name).toBe('UI Change Detection');
      expect(uiChangeRule.metadata.description).toBeDefined();
      expect(uiChangeRule.metadata.category).toBe('frontend');
      expect(uiChangeRule.metadata.labels).toHaveLength(1);
    });

    it('should define ui-change label', () => {
      const uiLabel = uiChangeRule.metadata.labels[0];
      expect(uiLabel.name).toBe('ui-change');
      expect(uiLabel.color).toBe('0E8A16');
      expect(uiLabel.description).toBeDefined();
    });
  });

  describe('UI File Detection', () => {
    it('should detect HTML files', () => {
      const files = [{ filename: 'index.html' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).toHaveLength(1);
    });

    it('should detect CSS files', () => {
      const files = [{ filename: 'styles.css' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should detect SCSS files', () => {
      const files = [{ filename: 'styles.scss' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should detect JSX files', () => {
      const files = [{ filename: 'Component.jsx' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should detect TSX files', () => {
      const files = [{ filename: 'Component.tsx' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should detect Vue files', () => {
      const files = [{ filename: 'App.vue' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should handle case-insensitive filenames', () => {
      const files = [{ filename: 'STYLES.CSS' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should handle files in subdirectories', () => {
      const files = [{ filename: 'src/components/Header.jsx' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should detect multiple UI files', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.css' },
        { filename: 'app.jsx' }
      ];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).toHaveLength(1);
    });
  });

  describe('Non-UI File Detection', () => {
    it('should return empty array for non-UI files', () => {
      const files = [{ filename: 'README.md' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should return empty array for backend files', () => {
      const files = [
        { filename: 'server.js' },
        { filename: 'api/routes.js' }
      ];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should return empty array for test files', () => {
      const files = [{ filename: 'test.spec.js' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle files without extensions', () => {
      const files = [{ filename: 'Makefile' }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should not break with null or undefined filename', () => {
      const files = [{ filename: null }, { filename: undefined }];
      const labels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Debug Mode', () => {
    it('should not throw errors when debug is enabled', () => {
      const files = [{ filename: 'index.html' }];
      
      expect(() => {
        uiChangeRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
    });
  });
});

