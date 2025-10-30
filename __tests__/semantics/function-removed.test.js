const rule = require('../../src/rules/semantics/function-removed');

describe('Function Removed Rule', () => {
  it('labels when file is removed', () => {
    const files = [{ filename: 'src/a.js', status: 'removed' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('function-removed');
  });

  it('labels when a function line is removed in patch', () => {
    const files = [{ filename: 'src/a.js', patch: '- function test() {}' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('function-removed');
  });

  it('does not label for additions only', () => {
    const files = [{ filename: 'src/a.js', patch: '+ function test() {}' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


