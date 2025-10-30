const rule = require('../../src/rules/ci/ci-change');

describe('CI Change Rule', () => {
  it('labels for GitHub Actions workflow', () => {
    const files = [{ filename: '.github/workflows/build.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('labels for CircleCI config', () => {
    const files = [{ filename: '.circleci/config.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('labels for Jenkinsfile', () => {
    const files = [{ filename: 'ci/Jenkinsfile' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('labels for Azure Pipelines', () => {
    const files = [{ filename: 'azure-pipelines.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('labels for GitLab CI', () => {
    const files = [{ filename: 'root/gitlab-ci.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('labels for Bitrise', () => {
    const files = [{ filename: 'config/bitrise.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('does not label for non-ci files', () => {
    const files = [{ filename: 'src/index.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles null filename', () => {
    const files = [{ filename: null }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: '.github/workflows/test.yml' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
