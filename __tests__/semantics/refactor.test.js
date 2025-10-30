const rule = require('../../src/rules/semantics/refactor');

describe('Refactor Rule', () => {
  it('labels when refactor keyword present', () => {
    const pr = { title: 'refactor: simplify module' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('refactor');
  });

  it('labels when many renames occur', () => {
    const files = [
      { filename: 'a.js', status: 'renamed' },
      { filename: 'b.js', status: 'renamed' }
    ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('refactor');
  });

  it('does not label for normal change', () => {
    const files = [{ filename: 'a.js', status: 'modified' }];
    const labels = rule({ files, pr: { title: 'chore' }, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


