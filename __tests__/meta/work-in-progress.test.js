const rule = require('../../src/rules/meta/work-in-progress');

describe('Work In Progress Rule', () => {
  it('labels when PR is draft', () => {
    const labels = rule({ files: [], pr: { draft: true, title: 'Feature' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('labels when title contains WIP', () => {
    const labels = rule({ files: [], pr: { draft: false, title: '[WIP] Feature' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('does not label for normal PRs', () => {
    const labels = rule({ files: [], pr: { draft: false, title: 'Feature', body: 'Ready' }, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


