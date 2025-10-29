/**
 * Tests for workflow-script.js
 * 
 * These tests verify the workflow orchestration logic with mocked GitHub API
 */

// Mock the rule files before requiring the workflow script
const mockFrontendUIRule = jest.fn();
mockFrontendUIRule.metadata = {
  name: 'Frontend/UI Detection',
  description: 'Detects changes to frontend and UI files',
  labels: [
    { name: 'ui-change', color: '0E8A16', description: 'UI/Frontend changes detected' },
    { name: 'style-change', color: 'D4C5F9', description: 'Style-only changes (CSS/SCSS)' }
  ]
};

const mockEnvRule = jest.fn();
mockEnvRule.metadata = {
  name: 'Environment Variables Detection',
  labels: [
    { name: 'env-change', color: 'FFA500', description: 'Environment files modified' }
  ]
};

describe('Workflow Script', () => {
  let workflowScript;
  let mockGitHub;
  let mockContext;
  let mockCore;
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
    
    // Clear module cache to get fresh instance
    jest.resetModules();
    
    // Mock GitHub API
    mockGitHub = {
      rest: {
        pulls: {
          listFiles: jest.fn()
        },
        repos: {
          getContent: jest.fn()
        },
        issues: {
          addLabels: jest.fn(),
          createLabel: jest.fn(),
          updateLabel: jest.fn()
        }
      }
    };

    // Mock context
    mockContext = {
      repo: {
        owner: 'test-owner',
        repo: 'test-repo'
      },
      payload: {
        pull_request: {
          number: 123,
          title: 'Test PR'
        }
      }
    };

    // Mock core
    mockCore = {};

    // Reset all mocks
    jest.clearAllMocks();
    
    // Set default successful responses
    mockGitHub.rest.pulls.listFiles.mockResolvedValue({
      data: [
        { filename: 'index.html', status: 'modified' }
      ]
    });
    
    mockGitHub.rest.issues.addLabels.mockResolvedValue({});
    mockGitHub.rest.issues.createLabel.mockResolvedValue({});
    mockGitHub.rest.issues.updateLabel.mockResolvedValue({});

    // Load the workflow script
    workflowScript = require('../src/workflow-script');
  });

  afterEach(() => {
    // Restore env
    process.env = originalEnv;
  });

  describe('Configuration Validation', () => {
    it('should exit early when no rules are enabled', async () => {
      process.env.ENABLED_RULES = '[]';
      process.env.ENABLE_DEBUG = 'false';

      const consoleSpy = jest.spyOn(console, 'log');

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(consoleSpy).toHaveBeenCalledWith('⚠️  No rules enabled. All labels are disabled by default.');
      expect(mockGitHub.rest.repos.getContent).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should fetch PR files when rules are enabled', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      // Mock rule discovery
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [
            { name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }
          ]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return []; }').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.pulls.listFiles).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 123
      });
    });
  });

  describe('Rule Discovery and Loading', () => {
    it('should discover rules from pr-auto-labeler repository', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [
            { name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' },
            { name: 'index.js', path: 'src/rules/index.js' },
            { name: 'RULE_TEMPLATE.js', path: 'src/rules/RULE_TEMPLATE.js' }
          ]
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'workflow-kit',
        repo: 'pr-auto-labeler',
        path: 'src/rules',
        ref: 'main'
      });
    });

    it('should only load enabled rules', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [
            { name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' },
            { name: 'env-variables.js', path: 'src/rules/env-variables.js' }
          ]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16", description: "UI"}]};').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      // Should only fetch frontend-ui.js, not env-variables.js
      expect(mockGitHub.rest.repos.getContent).toHaveBeenCalledTimes(2); // 1 for list, 1 for frontend-ui
    });

    it('should handle rule loading errors gracefully', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error');

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error loading rule'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Label Filtering', () => {
    it('should apply enabled_labels filter', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      process.env.ENABLED_LABELS = '["ui-change"]'; // Only ui-change, not style-change
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change", "style-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16"}, {name: "style-change", color: "D4C5F9"}]};').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.issues.addLabels).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        labels: ['ui-change'] // Only ui-change, style-change filtered out
      });
    });

    it('should apply skip_labels filter', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      process.env.SKIP_LABELS = '["style-change"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change", "style-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16"}, {name: "style-change", color: "D4C5F9"}]};').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.issues.addLabels).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        labels: ['ui-change']
      });
    });

    it('should apply label_overrides', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      process.env.LABEL_OVERRIDES = '{"ui-change":"frontend-change"}';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16"}]};').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.issues.addLabels).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        labels: ['frontend-change']
      });
    });
  });

  describe('Label Creation and Update', () => {
    it('should create labels if they do not exist', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16", description: "UI changes"}]};').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.issues.createLabel).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        name: 'ui-change',
        color: '0E8A16',
        description: 'UI changes'
      });
    });

    it('should update existing labels with correct colors', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16", description: "UI changes"}]};').toString('base64')
          }
        });

      // Simulate label already exists
      mockGitHub.rest.issues.createLabel.mockRejectedValueOnce({
        status: 422,
        message: 'Label already exists'
      });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.issues.updateLabel).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        name: 'ui-change',
        color: '0E8A16',
        description: 'UI changes'
      });
    });

    it('should apply labels after ensuring they exist', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16"}]};').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(mockGitHub.rest.issues.addLabels).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        labels: ['ui-change']
      });
    });
  });

  describe('Debug Mode', () => {
    it('should log debug information when enabled', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      process.env.ENABLE_DEBUG = 'true';
      
      const consoleSpy = jest.spyOn(console, 'log');
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change"]; }; module.exports.metadata = {name: "Test Rule", labels: [{name: "ui-change", color: "0E8A16"}]};').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(consoleSpy).toHaveBeenCalledWith('=== PR Auto-Labeler Starting ===');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('PR #123'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Enabled rules: frontend-ui'));

      consoleSpy.mockRestore();
    });

    it('should not log debug info when disabled', async () => {
      process.env.ENABLED_RULES = '[]';
      process.env.ENABLE_DEBUG = 'false';
      
      const consoleSpy = jest.spyOn(console, 'log');

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(consoleSpy).not.toHaveBeenCalledWith('=== PR Auto-Labeler Starting ===');

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle rule execution errors', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { throw new Error("Rule error"); }; module.exports.metadata = {name: "Test Rule", labels: []};').toString('base64')
          }
        });

      const consoleSpy = jest.spyOn(console, 'error');

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error executing rule'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should handle label application errors', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return ["ui-change"]; }; module.exports.metadata = {labels: [{name: "ui-change", color: "0E8A16"}]};').toString('base64')
          }
        });

      mockGitHub.rest.issues.addLabels.mockRejectedValue(new Error('API error'));

      const consoleSpy = jest.spyOn(console, 'error');

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error applying labels: API error')
      );

      consoleSpy.mockRestore();
    });

    it('should handle no labels to apply', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return []; }; module.exports.metadata = {labels: []};').toString('base64')
          }
        });

      const consoleSpy = jest.spyOn(console, 'log');

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      expect(consoleSpy).toHaveBeenCalledWith('ℹ️  No labels to apply based on current rules');
      expect(mockGitHub.rest.issues.addLabels).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list from PR', async () => {
      process.env.ENABLED_RULES = '["frontend-ui"]';
      
      mockGitHub.rest.pulls.listFiles.mockResolvedValue({ data: [] });
      
      mockGitHub.rest.repos.getContent
        .mockResolvedValueOnce({
          data: [{ name: 'frontend-ui.js', path: 'src/rules/frontend-ui.js' }]
        })
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from('module.exports = function() { return []; };').toString('base64')
          }
        });

      await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });

      // Should still execute but with no files
      expect(mockGitHub.rest.pulls.listFiles).toHaveBeenCalled();
    });

    it('should handle malformed JSON in environment variables', async () => {
      process.env.ENABLED_RULES = 'invalid-json';
      
      // Should fall back to empty array and log warning
      await expect(async () => {
        await workflowScript({ github: mockGitHub, context: mockContext, core: mockCore });
      }).rejects.toThrow();
    });
  });
});

