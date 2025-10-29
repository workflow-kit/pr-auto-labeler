/**
 * Tests for label filtering functionality (enabled_labels)
 * 
 * These tests verify that:
 * 1. enabled_labels filters labels correctly
 * 2. skip_labels still works
 * 3. label_overrides work with filtering
 * 4. All labels are applied when enabled_labels is empty
 * 
 * Note: With the refactored structure, rules now return single labels.
 * These tests combine multiple rule outputs to simulate the workflow behavior.
 */

const uiChangeRule = require('../src/rules/frontend/ui-change');
const styleChangeRule = require('../src/rules/frontend/style-change');
const envChangeRule = require('../src/rules/environment/env-change');
const newEnvVariableRule = require('../src/rules/environment/new-env-variable');
const potentialSecretLeakRule = require('../src/rules/environment/potential-secret-leak');

describe('Label Filtering', () => {
  
  describe('enabled_labels parameter', () => {
    
    it('should apply all labels when enabled_labels is empty', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.css' }
      ];
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const styleLabels = styleChangeRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...uiLabels, ...styleLabels];
      
      // Should get both labels
      expect(allLabels).toContain('ui-change');
      expect(allLabels).toContain('style-change');
      expect(allLabels.length).toBe(2);
    });
    
    it('should filter to only enabled labels', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.css' }
      ];
      
      const enabledLabels = ['ui-change'];
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const styleLabels = styleChangeRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...uiLabels, ...styleLabels];
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).not.toContain('style-change');
      expect(filteredLabels.length).toBe(1);
    });
    
    it('should filter multiple labels correctly', () => {
      const files = [
        { 
          filename: '.env',
          patch: '+API_KEY=secret123'
        }
      ];
      
      const enabledLabels = ['env-change', 'new-env-variable'];
      const envLabels = envChangeRule({ files, pr: {}, enableDebug: false });
      const newVarLabels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      const secretLabels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...envLabels, ...newVarLabels, ...secretLabels];
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('env-change');
      expect(filteredLabels).toContain('new-env-variable');
      expect(filteredLabels).not.toContain('potential-secret-leak');
      expect(filteredLabels.length).toBe(2);
    });
    
    it('should return empty array when no labels match enabled_labels', () => {
      const files = [{ filename: 'index.html' }];
      
      const enabledLabels = ['non-existent-label'];
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const styleLabels = styleChangeRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...uiLabels, ...styleLabels];
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toEqual([]);
    });
    
    it('should allow only security-critical labels', () => {
      const files = [
        { 
          filename: '.env',
          patch: '+API_KEY=secret123'
        }
      ];
      
      const enabledLabels = ['potential-secret-leak'];
      const envLabels = envChangeRule({ files, pr: {}, enableDebug: false });
      const newVarLabels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      const secretLabels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...envLabels, ...newVarLabels, ...secretLabels];
      
      // Simulate filtering
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('potential-secret-leak');
      expect(filteredLabels).not.toContain('env-change');
      expect(filteredLabels).not.toContain('new-env-variable');
      expect(filteredLabels.length).toBe(1);
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
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const styleLabels = styleChangeRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...uiLabels, ...styleLabels];
      
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
      
      const envLabels = envChangeRule({ files, pr: {}, enableDebug: false });
      const newVarLabels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      const secretLabels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...envLabels, ...newVarLabels, ...secretLabels];
      
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
      const files = [{ filename: 'index.html' }];
      
      const enabledLabels = ['ui-change'];
      const labelOverrides = { 'ui-change': 'frontend-change' };
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      // Simulate filtering then overriding
      let filteredLabels = uiLabels.filter(label => enabledLabels.includes(label));
      filteredLabels = filteredLabels.map(label => labelOverrides[label] || label);
      
      expect(filteredLabels).toContain('frontend-change');
      expect(filteredLabels).not.toContain('ui-change');
    });
    
    it('should check original label name for filtering, not overridden name', () => {
      const files = [{ filename: 'index.html' }];
      
      const enabledLabels = ['ui-change'];
      const labelOverrides = { 'ui-change': 'frontend' };
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      
      // Filtering happens on original names
      let filteredLabels = uiLabels.filter(label => enabledLabels.includes(label));
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
      
      const enabledLabels = ['potential-secret-leak'];
      const envLabels = envChangeRule({ files, pr: {}, enableDebug: false });
      const newVarLabels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      const secretLabels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...envLabels, ...newVarLabels, ...secretLabels];
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toEqual(['potential-secret-leak']);
    });
    
    it('should support frontend team configuration', () => {
      const files = [
        { filename: 'index.html' },
        { filename: 'styles.scss' }
      ];
      
      const enabledLabels = ['ui-change'];
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const filteredLabels = uiLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels.length).toBe(1);
    });
    
    it('should support custom mix configuration', () => {
      const files = [
        { filename: 'index.html' },
        { 
          filename: '.env',
          patch: '+NEW_VAR=test'
        }
      ];
      
      const enabledLabels = ['ui-change', 'env-change'];
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const envLabels = envChangeRule({ files, pr: {}, enableDebug: false });
      const newVarLabels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      
      const allLabels = [...uiLabels, ...envLabels, ...newVarLabels];
      const filteredLabels = allLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
      expect(filteredLabels).toContain('env-change');
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
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const styleLabels = styleChangeRule({ files, pr: {}, enableDebug: false });
      const allLabels = [...uiLabels, ...styleLabels];
      
      // Empty enabled_labels means no filtering
      const filteredLabels = enabledLabels.length > 0 
        ? allLabels.filter(label => enabledLabels.includes(label))
        : allLabels;
      
      expect(filteredLabels.length).toBe(2);
    });
    
    it('should handle case when rule returns no labels', () => {
      const files = [{ filename: 'README.md' }];
      
      const enabledLabels = ['ui-change'];
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const filteredLabels = uiLabels.filter(label => enabledLabels.includes(label));
      
      expect(uiLabels.length).toBe(0);
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
      
      const uiEnabledLabels = ['ui-change'];
      const envEnabledLabels = ['potential-secret-leak'];
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const envLabels = envChangeRule({ files, pr: {}, enableDebug: false });
      const newVarLabels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      const secretLabels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      const filteredUILabels = uiLabels.filter(label => uiEnabledLabels.includes(label));
      const filteredEnvLabels = [...envLabels, ...newVarLabels, ...secretLabels].filter(label => envEnabledLabels.includes(label));
      
      const finalLabels = [...filteredUILabels, ...filteredEnvLabels];
      
      expect(finalLabels).toContain('ui-change');
      expect(finalLabels).toContain('potential-secret-leak');
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
      
      const enabledLabels = ['ui-change', 'potential-secret-leak'];
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const envLabels = envChangeRule({ files, pr: {}, enableDebug: false });
      const newVarLabels = newEnvVariableRule({ files, pr: {}, enableDebug: false });
      const secretLabels = potentialSecretLeakRule({ files, pr: {}, enableDebug: false });
      
      const allLabels = [...uiLabels, ...envLabels, ...newVarLabels, ...secretLabels];
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
      
      const enabledLabels = ['ui-change'];
      
      const uiLabels = uiChangeRule({ files, pr: {}, enableDebug: false });
      const filteredLabels = uiLabels.filter(label => enabledLabels.includes(label));
      
      expect(filteredLabels).toContain('ui-change');
    });
  });
});
