const rule = require('../../src/rules/meta/no-linked-issue');

describe('No Linked Issue Rule', () => {
  it('labels when no issue reference present', () => {
    const pr = { title: 'Add feature', body: 'Implements new capability' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toContain('no-linked-issue');
  });

  it('does not label when using Fixes #123', () => {
    const pr = { title: 'Add feature', body: 'Fixes #123' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when bare #123 is present', () => {
    const pr = { title: 'Add feature #45', body: '' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


