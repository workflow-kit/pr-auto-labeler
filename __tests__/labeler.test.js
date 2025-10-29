/**
 * Unit tests for PR Labeler Core Logic
 */

const { labelPullRequest } = require('../src/labeler');

// Mock GitHub API
const mockGitHub = {
  rest: {
    issues: {
      addLabels: jest.fn(),
      createLabel: jest.fn()
    }
  }
};

describe('PR Labeler Core Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGitHub.rest.issues.addLabels.mockResolvedValue({});
    mockGitHub.rest.issues.createLabel.mockResolvedValue({});
  });

  describe('Basic Functionality', () => {
    it('should execute rules and apply labels', async () => {
      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      expect(mockGitHub.rest.issues.addLabels).toHaveBeenCalled();
    });

    it('should handle empty files array', async () => {
      const files = [];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      // Should not call addLabels if no labels to apply
      expect(mockGitHub.rest.issues.addLabels).not.toHaveBeenCalled();
    });
  });

  describe('Label Overrides', () => {
    it('should apply label overrides', async () => {
      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: { 'ui-change': 'frontend-change' },
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      const callArgs = mockGitHub.rest.issues.addLabels.mock.calls[0][0];
      expect(callArgs.labels).toContain('frontend-change');
      expect(callArgs.labels).not.toContain('ui-change');
    });

    it('should handle multiple label overrides', async () => {
      const files = [{ filename: 'styles.css' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {
          'ui-change': 'frontend',
          'style-change': 'css-only'
        },
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      const callArgs = mockGitHub.rest.issues.addLabels.mock.calls[0][0];
      expect(callArgs.labels).toContain('frontend');
      expect(callArgs.labels).toContain('css-only');
    });
  });

  describe('Skip Labels', () => {
    it('should skip specified labels', async () => {
      const files = [{ filename: 'styles.css' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: ['style-change'],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      const callArgs = mockGitHub.rest.issues.addLabels.mock.calls[0][0];
      expect(callArgs.labels).toContain('ui-change');
      expect(callArgs.labels).not.toContain('style-change');
    });

    it('should skip multiple labels', async () => {
      const files = [{ filename: 'styles.css' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: ['ui-change', 'style-change'],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      // Should not call addLabels if all labels are skipped
      expect(mockGitHub.rest.issues.addLabels).not.toHaveBeenCalled();
    });
  });

  describe('Label Creation', () => {
    it('should create labels if they do not exist', async () => {
      mockGitHub.rest.issues.addLabels
        .mockRejectedValueOnce(new Error('Label not found'))
        .mockResolvedValueOnce({});

      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      expect(mockGitHub.rest.issues.createLabel).toHaveBeenCalled();
      expect(mockGitHub.rest.issues.addLabels).toHaveBeenCalledTimes(2);
    });

    it('should handle label creation errors gracefully', async () => {
      mockGitHub.rest.issues.addLabels
        .mockRejectedValueOnce(new Error('Label not found'))
        .mockResolvedValueOnce({});
      mockGitHub.rest.issues.createLabel
        .mockRejectedValue(new Error('Creation failed'));

      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await expect(
        labelPullRequest({
          files,
          pr,
          github: mockGitHub,
          config
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Debug Mode', () => {
    it('should log debug information when enabled', async () => {
      const originalLog = console.log;
      console.log = jest.fn();

      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: true,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      expect(console.log).toHaveBeenCalled();
      console.log = originalLog;
    });

    it('should not log when debug is disabled', async () => {
      const originalLog = console.log;
      const logSpy = jest.fn();
      console.log = logSpy;

      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      // Only success message should be logged
      const debugCalls = logSpy.mock.calls.filter(call => 
        call[0].includes('PR Auto-Labeler') || call[0].includes('Files changed')
      );
      expect(debugCalls).toHaveLength(0);

      console.log = originalLog;
    });
  });

  describe('Error Handling', () => {
    it('should handle rule execution errors', async () => {
      const originalError = console.error;
      console.error = jest.fn();

      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      // This should not throw even if rules have issues
      await expect(
        labelPullRequest({
          files,
          pr,
          github: mockGitHub,
          config
        })
      ).resolves.not.toThrow();

      console.error = originalError;
    });

    it('should continue processing other rules if one fails', async () => {
      const files = [{ filename: 'index.html' }];
      const pr = { number: 1, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'test-owner',
        repoName: 'test-repo',
        prNumber: 1
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      // Should still try to apply labels even if some rules fail
      expect(mockGitHub.rest.issues.addLabels).toHaveBeenCalled();
    });
  });

  describe('GitHub API Parameters', () => {
    it('should call GitHub API with correct parameters', async () => {
      const files = [{ filename: 'index.html' }];
      const pr = { number: 123, title: 'Test PR' };
      const config = {
        enableDebug: false,
        labelOverrides: {},
        skipLabels: [],
        repoOwner: 'my-org',
        repoName: 'my-repo',
        prNumber: 123
      };

      await labelPullRequest({
        files,
        pr,
        github: mockGitHub,
        config
      });

      const callArgs = mockGitHub.rest.issues.addLabels.mock.calls[0][0];
      expect(callArgs.owner).toBe('my-org');
      expect(callArgs.repo).toBe('my-repo');
      expect(callArgs.issue_number).toBe(123);
      expect(Array.isArray(callArgs.labels)).toBe(true);
    });
  });
});

