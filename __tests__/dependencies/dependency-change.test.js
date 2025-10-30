const rule = require('../../src/rules/dependencies/dependency-change');

describe('Dependency Change Rule', () => {
  it('labels for package.json', () => {
    const files = [{ filename: 'package.json' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('labels for package-lock.json', () => {
    const files = [{ filename: 'package-lock.json' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('labels for yarn.lock', () => {
    const files = [{ filename: 'yarn.lock' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('labels for pnpm-lock.yaml', () => {
    const files = [{ filename: 'pnpm-lock.yaml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('labels for requirements.txt', () => {
    const files = [{ filename: 'requirements.txt' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('labels for poetry.lock', () => {
    const files = [{ filename: 'poetry.lock' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('labels for nested package.json', () => {
    const files = [{ filename: 'packages/app/package.json' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-change');
  });

  it('does not label for source files', () => {
    const files = [{ filename: 'src/app.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'package.json' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
