const rule = require('../../src/rules/tests/test-improvement');

describe('Test Improvement Rule', () => {
  it('labels when both source and tests change', () => {
    const files = [{ filename: 'src/app.ts' }, { filename: '__tests__/app.test.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-improvement');
  });

  it('labels for various source and test combinations', () => {
    const files = [{ filename: 'lib/util.js' }, { filename: 'test/util.spec.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-improvement');
  });

  it('does not label when only tests change', () => {
    const files = [{ filename: '__tests__/app.test.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when only source changes', () => {
    const files = [{ filename: 'src/app.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when only docs change', () => {
    const files = [{ filename: 'README.md' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'src/app.js' }, { filename: '__tests__/app.test.js' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
