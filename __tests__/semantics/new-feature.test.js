const rule = require('../../src/rules/semantics/new-feature');

describe('New Feature Rule', () => {
  it('labels when title/body has feat keyword', () => {
    const pr = { title: 'feat: add search', body: '' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('new-feature');
  });

  it('labels when new files are added in src/', () => {
    const files = [{ filename: 'src/new/feature.js', status: 'added' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-feature');
  });

  it('does not label for unrelated changes', () => {
    const files = [{ filename: 'README.md', status: 'modified' }];
    const labels = rule({ files, pr: { title: 'chore' }, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


