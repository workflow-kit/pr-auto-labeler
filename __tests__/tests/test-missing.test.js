const rule = require('../../src/rules/tests/test-missing');

describe('Test Missing Rule', () => {
  it('labels when source changes without tests', () => {
    const files = [{ filename: 'src/app.ts' }, { filename: 'src/util.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-missing');
  });

  it('labels for various source file types', () => {
    const files = [{ filename: 'lib/helper.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-missing');
  });

  it('does not label when tests are present', () => {
    const files = [{ filename: 'src/app.ts' }, { filename: '__tests__/app.test.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when only tests change', () => {
    const files = [{ filename: '__tests__/app.test.ts' }];
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
    const files = [{ filename: 'src/app.js' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
