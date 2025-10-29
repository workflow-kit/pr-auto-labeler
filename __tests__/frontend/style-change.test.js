/**
 * Unit tests for Style-Only Change Detection Rule
 */

const styleChangeRule = require('../../src/rules/frontend/style-change');

describe('Style-Only Change Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(styleChangeRule.metadata).toBeDefined();
      expect(styleChangeRule.metadata.name).toBe('Style-Only Change Detection');
      expect(styleChangeRule.metadata.description).toBeDefined();
      expect(styleChangeRule.metadata.category).toBe('frontend');
      expect(styleChangeRule.metadata.labels).toHaveLength(1);
    });

    it('should define style-change label', () => {
      const styleLabel = styleChangeRule.metadata.labels[0];
      expect(styleLabel.name).toBe('style-change');
      expect(styleLabel.color).toBe('D4C5F9');
      expect(styleLabel.description).toBeDefined();
    });
  });

  describe('Style-Only Detection', () => {
    it('should apply style-change when only CSS is modified', () => {
      const files = [
        { filename: 'main.css' },
        { filename: 'theme.scss' }
      ];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('style-change');
    });

    it('should NOT apply style-change when JS is also modified', () => {
      const files = [
        { filename: 'styles.css' },
        { filename: 'app.js' }
      ];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('style-change');
      expect(labels).toEqual([]);
    });

    it('should NOT apply style-change when JSX is also modified', () => {
      const files = [
        { filename: 'styles.scss' },
        { filename: 'Component.jsx' }
      ];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should NOT apply style-change when TSX is also modified', () => {
      const files = [
        { filename: 'styles.css' },
        { filename: 'Component.tsx' }
      ];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should NOT apply style-change when Vue file is modified', () => {
      const files = [
        { filename: 'styles.css' },
        { filename: 'App.vue' }
      ];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle only SCSS files', () => {
      const files = [
        { filename: 'main.scss' },
        { filename: 'variables.scss' }
      ];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('style-change');
    });

    it('should handle only SASS files', () => {
      const files = [{ filename: 'main.sass' }];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('style-change');
    });

    it('should handle only LESS files', () => {
      const files = [{ filename: 'theme.less' }];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('style-change');
    });
  });

  describe('Non-Style File Detection', () => {
    it('should return empty array for non-style files', () => {
      const files = [{ filename: 'README.md' }];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should return empty array for only JS files', () => {
      const files = [{ filename: 'app.js' }];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should return empty array for HTML without styles', () => {
      const files = [{ filename: 'index.html' }];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should handle files without extensions', () => {
      const files = [{ filename: 'Makefile' }];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });

    it('should not break with null or undefined filename', () => {
      const files = [{ filename: null }, { filename: undefined }];
      const labels = styleChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toEqual([]);
    });
  });

  describe('Debug Mode', () => {
    it('should not throw errors when debug is enabled', () => {
      const files = [{ filename: 'styles.css' }];
      
      expect(() => {
        styleChangeRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
    });
  });
});

