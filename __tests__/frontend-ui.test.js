/**
 * Unit tests for Frontend/UI Detection Rule
 */

const frontendUIRule = require('../src/rules/frontend-ui');

describe('Frontend/UI Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(frontendUIRule.metadata).toBeDefined();
      expect(frontendUIRule.metadata.name).toBe('Frontend/UI Detection');
      expect(frontendUIRule.metadata.description).toBeDefined();
      expect(frontendUIRule.metadata.labels).toHaveLength(2);
    });

    it('should define ui-change label', () => {
      const uiLabel = frontendUIRule.metadata.labels.find(l => l.name === 'ui-change');
      expect(uiLabel).toBeDefined();
      expect(uiLabel.color).toBe('0E8A16');
      expect(uiLabel.description).toBeDefined();
    });

    it('should define style-change label', () => {
      const styleLabel = frontendUIRule.metadata.labels.find(l => l.name === 'style-change');
      expect(styleLabel).toBeDefined();
      expect(styleLabel.color).toBe('D4C5F9');
      expect(styleLabel.description).toBeDefined();
    });
  });

  describe('UI File Detection', () => {
    it('should detect HTML files', () => {
      const files = [{ filename: 'index.html' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should detect CSS files', () => {
      const files = [{ filename: 'styles.css' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).toContain('style-change');
    });

    it('should detect SCSS files', () => {
      const files = [{ filename: 'styles.scss' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).toContain('style-change');
    });

    it('should detect JSX files', () => {
      const files = [{ filename: 'Component.jsx' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).not.toContain('style-change');
    });

    it('should detect TSX files', () => {
      const files = [{ filename: 'Component.tsx' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).not.toContain('style-change');
    });

    it('should detect Vue files', () => {
      const files = [{ filename: 'App.vue' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should handle case-insensitive filenames', () => {
      const files = [{ filename: 'STYLES.CSS' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).toContain('style-change');
    });

    it('should handle files in subdirectories', () => {
      const files = [{ filename: 'src/components/Header.jsx' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });
  });

  describe('Style-Only Detection', () => {
    it('should apply style-change when only CSS is modified', () => {
      const files = [
        { filename: 'main.css' },
        { filename: 'theme.scss' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).toContain('style-change');
    });

    it('should NOT apply style-change when JS is also modified', () => {
      const files = [
        { filename: 'styles.css' },
        { filename: 'script.js' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).not.toContain('style-change');
    });

    it('should NOT apply style-change when JSX is also modified', () => {
      const files = [
        { filename: 'styles.css' },
        { filename: 'Component.jsx' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).not.toContain('style-change');
    });

    it('should NOT apply style-change when TSX is also modified', () => {
      const files = [
        { filename: 'styles.scss' },
        { filename: 'Component.tsx' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).not.toContain('style-change');
    });
  });

  describe('Non-UI File Detection', () => {
    it('should return empty array for non-UI files', () => {
      const files = [
        { filename: 'server.js' },
        { filename: 'README.md' },
        { filename: 'package.json' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should return empty array for backend files', () => {
      const files = [
        { filename: 'api/routes.js' },
        { filename: 'models/User.js' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should return empty array for test files', () => {
      const files = [
        { filename: 'test/unit.test.js' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });
  });

  describe('Mixed File Detection', () => {
    it('should detect UI changes among mixed files', () => {
      const files = [
        { filename: 'README.md' },
        { filename: 'index.html' },
        { filename: 'server.js' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should apply correct labels for mixed UI and backend files', () => {
      const files = [
        { filename: 'styles.css' },
        { filename: 'Component.jsx' },
        { filename: 'api/routes.js' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).not.toContain('style-change');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle files without extensions', () => {
      const files = [
        { filename: 'Dockerfile' },
        { filename: 'Makefile' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle files with multiple dots', () => {
      const files = [{ filename: 'Component.test.jsx' }];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should not break with null or undefined filename', () => {
      const files = [{ filename: null }, { filename: undefined }];
      
      expect(() => {
        frontendUIRule({ files, pr: {}, enableDebug: false });
      }).not.toThrow();
    });
  });

  describe('Debug Mode', () => {
    it('should not throw errors when debug is enabled', () => {
      const files = [{ filename: 'index.html' }];
      
      // Mock console.log to suppress output
      const originalLog = console.log;
      console.log = jest.fn();
      
      expect(() => {
        frontendUIRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
      
      console.log = originalLog;
    });

    it('should log debug information when enabled', () => {
      const files = [{ filename: 'styles.css' }];
      
      const originalLog = console.log;
      console.log = jest.fn();
      
      frontendUIRule({ files, pr: {}, enableDebug: true });
      
      expect(console.log).toHaveBeenCalled();
      
      console.log = originalLog;
    });
  });

  describe('Multiple Files of Same Type', () => {
    it('should handle multiple HTML files', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'about.html' },
        { filename: 'contact.html' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
    });

    it('should handle multiple CSS files', () => {
      const files = [
        { filename: 'main.css' },
        { filename: 'theme.css' },
        { filename: 'responsive.css' }
      ];
      const labels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('ui-change');
      expect(labels).toContain('style-change');
    });
  });
});

