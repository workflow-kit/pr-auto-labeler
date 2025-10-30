const rule = require('../../src/rules/dependencies/dependency-change');

describe('Dependency Change Rule', () => {
  it('labels for package.json', () => {
    const files = [{ filename: 'package.json' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('labels for lock files', () => {
    const files = [{ filename: 'yarn.lock' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('does not label for source files', () => {
    const files = [{ filename: 'src/app.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


