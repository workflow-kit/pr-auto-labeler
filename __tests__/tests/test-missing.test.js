const rule = require('../../src/rules/tests/test-missing');

describe('Test Missing Rule', () => {
  it('labels when source changes without tests', () => {
    const files = [{ filename: 'src/app.ts' }, { filename: 'src/util.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('test-missing');
  });

  it('does not label when tests are present', () => {
    const files = [{ filename: 'src/app.ts' }, { filename: '__tests__/app.test.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


