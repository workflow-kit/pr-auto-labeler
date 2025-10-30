const rule = require('../../src/rules/semantics/new-feature');

describe('New Feature Rule', () => {
  it('labels when title/body has feat keyword', () => {
    const pr = { title: 'feat: add search', body: '' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('new-feature');
  });

  it('labels when body contains feature keyword', () => {
    const pr = { title: 'Update', body: 'This adds a new feature for users' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('new-feature');
  });

  it('labels when new files are added in src/', () => {
    const files = [{ filename: 'src/new/feature.js', status: 'added' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-feature');
  });

  it('labels when new files are added in lib/', () => {
    const files = [{ filename: 'lib/helper.ts', status: 'added' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-feature');
  });

  it('labels when new files are added in packages/', () => {
    const files = [{ filename: 'packages/core/index.js', status: 'added' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-feature');
  });

  it('does not label for unrelated changes', () => {
    const files = [{ filename: 'README.md', status: 'modified' }];
    const labels = rule({ files, pr: { title: 'chore' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label for test files', () => {
    const files = [{ filename: 'tests/new.test.js', status: 'added' }];
    const labels = rule({ files, pr: { title: 'test' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files and pr', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const pr = { title: 'feat: new feature' };
    expect(() => rule({ files: [], pr, enableDebug: true })).not.toThrow();
  });
});
