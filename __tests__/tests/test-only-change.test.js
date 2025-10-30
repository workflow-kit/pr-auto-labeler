const rule = require('../../src/rules/tests/test-only-change');

describe('Test Only Change Rule', () => {
  it('labels when only tests are changed', () => {
    const files = [{ filename: '__tests__/a.test.js' }, { filename: 'tests/utils.spec.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-only-change');
  });

  it('labels when test/ directory files change', () => {
    const files = [{ filename: 'test/unit.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-only-change');
  });

  it('does not label when source files also change', () => {
    const files = [{ filename: '__tests__/a.test.js' }, { filename: 'src/app.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when only source files change', () => {
    const files = [{ filename: 'src/app.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: '__tests__/test.js' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
