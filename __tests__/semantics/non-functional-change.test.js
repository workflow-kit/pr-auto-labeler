const rule = require('../../src/rules/semantics/non-functional-change');

describe('Non-Functional Change Rule', () => {
  it('labels when only docs change', () => {
    const files = [{ filename: 'docs/guide.md' }, { filename: 'README.md' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('does not label when code files change', () => {
    const files = [{ filename: 'README.md' }, { filename: 'src/app.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


