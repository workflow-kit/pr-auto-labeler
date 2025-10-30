const rule = require('../../src/rules/meta/no-linked-issue');

describe('No Linked Issue Rule', () => {
  it('labels when no issue linked', () => {
    const labels = rule({ files: [], pr: { body: 'Just some changes' }, enableDebug: false });
    expect(labels).toContain('no-linked-issue');
  });

  it('labels when body is empty', () => {
    const labels = rule({ files: [], pr: { body: '' }, enableDebug: false });
    expect(labels).toContain('no-linked-issue');
  });

  it('labels when body is null', () => {
    const labels = rule({ files: [], pr: { body: null }, enableDebug: false });
    expect(labels).toContain('no-linked-issue');
  });

  it('does not label when "Closes #123" is present', () => {
    const labels = rule({ files: [], pr: { body: 'Closes #123' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when "Fixes #456" is present', () => {
    const labels = rule({ files: [], pr: { body: 'Fixes #456' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when "Resolves #789" is present', () => {
    const labels = rule({ files: [], pr: { body: 'Resolves #789' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when bare "#123" is present in title', () => {
    const labels = rule({ files: [], pr: { title: 'Fix #123', body: 'Changes' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when bare "#123" is present in body', () => {
    const labels = rule({ files: [], pr: { body: 'This fixes #123' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    expect(() => rule({ files: [], pr: { body: 'test' }, enableDebug: true })).not.toThrow();
  });
});
