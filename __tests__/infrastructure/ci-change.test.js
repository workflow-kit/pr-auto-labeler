const rule = require('../../src/rules/ci/ci-change');

describe('CI Change Rule', () => {
  it('labels for GitHub Actions workflow', () => {
    const files = [{ filename: '.github/workflows/build.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('labels for Jenkinsfile', () => {
    const files = [{ filename: 'ci/Jenkinsfile' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('ci-change');
  });

  it('does not label for non-ci files', () => {
    const files = [{ filename: 'src/index.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


