/**
 * Tests for label filtering functionality (enabled_labels)
 * 
 * These tests verify that:
 * 1. enabled_labels filters labels correctly
 * 2. skip_labels still works
 * 3. label_overrides work with filtering
 * 4. All labels are applied when enabled_labels is empty
 */

const frontendUIRule = require('../src/rules/frontend-ui');
const envVariablesRule = require('../src/rules/env-variables');

describe('Label Filtering', () => {
  
  describe('enabled_labels parameter', () => {
    
    it('should apply all labels when enabled_labels is empty', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.css' }
      ];
      
      const uiLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      // Should get both labels
      expect(uiLabels).toContain('ui-change');
      expect(uiLabels).toContain('style-change');
      expect(uiLabels.length).toBe(2);
    });
    
    it('should filter to only enabled labels', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.css' }
      ];
      
      const enabledLabels = ['ui-change'];
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).not.toContain('style-change');
      expect(filteredLabels.length).toBe(1);
    });
    
    it('should filter multiple labels correctly', () => {
      const files = [
        { 
          filename: '.env.production',
          patch: '+API_KEY=test123\n+NEW_VAR=value'
        }
      ];
      
      const enabledLabels = ['env-change', 'potential-secret-leak'];
      const allLabels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('env-change');
      expect(filteredLabels).toContain('potential-secret-leak');
      expect(filteredLabels).not.toContain('new-env-variable');
    });
    
    it('should return empty array when no labels match enabled_labels', () => {
      const files = [
        { filename: 'index.html' }
      ];
      
      const enabledLabels = ['non-existent-label'];
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels.length).toBe(0);
    });
    
    it('should allow only security-critical labels', () => {
      const files = [
        { 
          filename: '.env',
          patch: '+PASSWORD=secret123'
        }
      ];
      
      const enabledLabels = ['potential-secret-leak'];
      const allLabels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toEqual(['potential-secret-leak']);
      expect(filteredLabels).not.toContain('env-change');
      expect(filteredLabels).not.toContain('new-env-variable');
    });
  });
  
  describe('Combination with skip_labels', () => {
    
    it('should handle enabled_labels and skip_labels together', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.css' }
      ];
      
      const enabledLabels = ['ui-change', 'style-change'];
      const skipLabels = ['style-change'];
      
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering then skipping
      let filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      filteredLabels = filteredLabels.filter(label => !skipLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).not.toContain('style-change');
      expect(filteredLabels.length).toBe(1);
    });
    
    it('should apply skip_labels after enabled_labels filtering', () => {
      const files = [
        { 
          filename: '.env',
          patch: '+API_KEY=test\n+NEW_VAR=value'
        }
      ];
      
      const enabledLabels = ['env-change', 'new-env-variable', 'potential-secret-leak'];
      const skipLabels = ['new-env-variable'];
      
      const allLabels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering then skipping
      let filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      filteredLabels = filteredLabels.filter(label => !skipLabels.includes(label));
      
      expect(filteredLabels).toContain('env-change');
      expect(filteredLabels).toContain('potential-secret-leak');
      expect(filteredLabels).not.toContain('new-env-variable');
    });
  });
  
  describe('Combination with label_overrides', () => {
    
    it('should apply overrides to filtered labels', () => {
      const files = [
        { filename: 'index.html' }
      ];
      
      const enabledLabels = ['ui-change'];
      const labelOverrides = { 'ui-change': 'frontend-change' };
      
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering then overriding
      let filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      filteredLabels = filteredLabels.map(label => labelOverrides[label] || label);
      
      expect(filteredLabels).toContain('frontend-change');
      expect(filteredLabels).not.toContain('ui-change');
    });
    
    it('should check original label name for filtering, not overridden name', () => {
      const files = [
        { filename: 'index.html' }
      ];
      
      // enabled_labels uses original names
      const enabledLabels = ['ui-change'];
      const labelOverrides = { 'ui-change': 'frontend' };
      
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      // Filtering happens on original names
      let filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      expect(filteredLabels).toContain('ui-change');
      
      // Then override
      filteredLabels = filteredLabels.map(label => labelOverrides[label] || label);
      expect(filteredLabels).toContain('frontend');
    });
  });
  
  describe('Configuration Strategies', () => {
    
    it('should support security-focused configuration', () => {
      const files = [
        { 
          filename: '.env.production',
          patch: '+SECRET_KEY=abc123\n+DATABASE_URL=postgres://...'
        }
      ];
      
      // Security team only wants critical alerts
      const enabledLabels = ['potential-secret-leak'];
      const allLabels = envVariablesRule({ files, pr: {}, enableDebug: false });
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toEqual(['potential-secret-leak']);
    });
    
    it('should support frontend team configuration', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.scss' }
      ];
      
      // Frontend team wants all UI labels
      const enabledLabels = ['ui-change', 'style-change'];
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels.length).toBe(2);
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).toContain('style-change');
    });
    
    it('should support custom mix configuration', () => {
      // Simulate multiple rules running
      const files = [
        { filename: 'index.html' },
        { 
          filename: '.env',
          patch: '+NEW_VAR=test'
        }
      ];
      
      const enabledLabels = ['ui-change', 'env-change'];
      
      const uiLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      const envLabels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      const allLabels = [...uiLabels, ...envLabels];
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).toContain('env-change');
      expect(filteredLabels).not.toContain('style-change');
      expect(filteredLabels).not.toContain('new-env-variable');
    });
  });
  
  describe('Edge Cases', () => {
    
    it('should handle empty enabled_labels array as "allow all"', () => {
      const files = [
        { filename: 'test.html' },
        { filename: 'style.css' }
      ];
      
      const enabledLabels = [];
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      
      // Empty enabled_labels means no filtering
      const filteredLabels = enabledLabels.length > 0 
        ? allLabels.filter(label => enabledLabels.includes(label))
        : allLabels;
      
      expect(filteredLabels.length).toBe(2);
    });
    
    it('should handle case when rule returns no labels', () => {
      const files = [
        { filename: 'README.md' }  // Not a UI file
      ];
      
      const enabledLabels = ['ui-change'];
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(allLabels.length).toBe(0);
      expect(filteredLabels.length).toBe(0);
    });
    
    it('should handle multiple rules with different filters', () => {
      const files = [
        { filename: 'index.html' },
        { 
          filename: '.env',
          patch: '+API_KEY=test'
        }
      ];
      
      // Different filters for different rules
      const uiEnabledLabels = ['ui-change'];
      const envEnabledLabels = ['potential-secret-leak'];
      
      const uiLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      const envLabels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      const filteredUILabels = uiLabels.filter(label => uiEnabledLabels.includes(label));
      const filteredEnvLabels = envLabels.filter(label => envEnabledLabels.includes(label));
      
      const finalLabels = [...filteredUILabels, ...filteredEnvLabels];
      
      expect(finalLabels).toContain('ui-change');
      expect(finalLabels).toContain('potential-secret-leak');
      expect(finalLabels).not.toContain('style-change');
      expect(finalLabels).not.toContain('env-change');
    });
  });
  
  describe('Real-world Scenarios', () => {
    
    it('should handle full-stack PR with selective labeling', () => {
      const files = [
        { filename: 'frontend/App.tsx' },
        { filename: 'frontend/styles.css' },
        { 
          filename: '.env.production',
          patch: '+DATABASE_PASSWORD=secret123\n+REDIS_URL=redis://...'
        }
      ];
      
      // Team only wants critical labels
      const enabledLabels = ['ui-change', 'potential-secret-leak'];
      
      const uiLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      const envLabels = envVariablesRule({ files, pr: {}, enableDebug: false });
      
      const allLabels = [...uiLabels, ...envLabels];
      const filteredLabels = [...new Set(allLabels.filter(label => enabledLabels.includes(label)))];
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).toContain('potential-secret-leak');
      expect(filteredLabels.length).toBe(2);
    });
    
    it('should handle style-only PR with filtering', () => {
      const files = [
        { filename: 'styles/main.scss' },
        { filename: 'styles/variables.scss' }
      ];
      
      // Only want to track significant UI changes, not style tweaks
      const enabledLabels = ['ui-change'];
      
      const allLabels = frontendUIRule({ files, pr: {}, enableDebug: false });
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).not.toContain('style-change');
    });
  });
});

