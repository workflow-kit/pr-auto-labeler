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

  it('labels when title contains WIP in uppercase', () => {
    const labels = rule({ files: [], pr: { title: 'WIP: Add feature' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('labels when title contains draft keyword', () => {
    const labels = rule({ files: [], pr: { title: 'DRAFT: New feature' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('labels when title contains "do not merge"', () => {
    const labels = rule({ files: [], pr: { title: 'DO NOT MERGE - Testing' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('labels when title contains DNM', () => {
    const labels = rule({ files: [], pr: { title: 'DNM: Experimental' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('labels when body contains WIP', () => {
    const labels = rule({ files: [], pr: { title: 'Feature', body: 'This is still WIP' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('labels when body contains draft', () => {
    const labels = rule({ files: [], pr: { title: 'Feature', body: 'draft changes' }, enableDebug: false });
    expect(labels).toContain('work-in-progress');
  });

  it('does not label for normal PRs', () => {
    const labels = rule({ files: [], pr: { draft: false, title: 'Feature', body: 'Ready' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles undefined title and body', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles null title and body', () => {
    const labels = rule({ files: [], pr: { title: null, body: null }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    expect(() => rule({ files: [], pr: { draft: true }, enableDebug: true })).not.toThrow();
  });
});
