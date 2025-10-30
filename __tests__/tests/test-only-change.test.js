const rule = require('../../src/rules/tests/test-only-change');

describe('Test Only Change Rule', () => {
  it('labels when only tests are changed', () => {
    const files = [{ filename: '__tests__/a.test.js' }, { filename: 'tests/utils.spec.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-only-change');
  });

  it('does not label when source files also change', () => {
    const files = [{ filename: '__tests__/a.test.js' }, { filename: 'src/app.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


