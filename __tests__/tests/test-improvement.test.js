const rule = require('../../src/rules/tests/test-improvement');

describe('Test Improvement Rule', () => {
  it('labels when both source and tests change', () => {
    const files = [{ filename: 'src/app.ts' }, { filename: '__tests__/app.test.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-improvement');
  });

  it('does not label when only tests change', () => {
    const files = [{ filename: '__tests__/app.test.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


