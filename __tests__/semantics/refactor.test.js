const rule = require('../../src/rules/semantics/refactor');

describe('Refactor Rule', () => {
  it('labels when PR title contains refactor', () => {
    const pr = { title: 'refactor: cleanup code', body: '' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('refactor');
  });

  it('labels when PR body contains refactor', () => {
    const pr = { title: 'Update', body: 'This PR should refactor the codebase' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('refactor');
  });

  it('labels when PR body contains cleanup', () => {
    const pr = { title: 'Update', body: 'Code cleanup and simplification' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('refactor');
  });

  it('labels when multiple renamed files detected', () => {
    const files = [
      { filename: 'new1.js', status: 'renamed' },
      { filename: 'new2.js', status: 'renamed' }
    ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('refactor');
  });

  it('labels when three renamed files detected', () => {
    const files = [
      { filename: 'a.js', status: 'renamed' },
      { filename: 'b.js', status: 'renamed' },
      { filename: 'c.js', status: 'renamed' }
    ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('refactor');
  });

  it('does not label for only one renamed file', () => {
    const files = [{ filename: 'new.js', status: 'renamed' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label for new features', () => {
    const pr = { title: 'feat: add search' };
    const files = [{ filename: 'src/search.js', status: 'added' }];
    const labels = rule({ files, pr, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label for bug fixes', () => {
    const pr = { title: 'fix: resolve issue' };
    const files = [{ filename: 'src/app.js', patch: '- return null;\n+ return value;' }];
    const labels = rule({ files, pr, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files and PR', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles null PR title/body', () => {
    const labels = rule({ files: [], pr: { title: null, body: null }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const pr = { title: 'refactor: update' };
    expect(() => rule({ files: [], pr, enableDebug: true })).not.toThrow();
  });
});
