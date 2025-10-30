const rule = require('../../src/rules/meta/missing-description');

describe('Missing/Short Description Rule', () => {
  it('labels when body is missing', () => {
    const labels = rule({ files: [], pr: { title: 'x', body: '' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body is null', () => {
    const labels = rule({ files: [], pr: { title: 'x', body: null }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body is undefined', () => {
    const labels = rule({ files: [], pr: { title: 'x' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body is too short', () => {
    const labels = rule({ files: [], pr: { body: 'Short desc' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body is whitespace only', () => {
    const labels = rule({ files: [], pr: { body: '   \n\n   ' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body has markdown but no content', () => {
    const labels = rule({ files: [], pr: { body: '```code```' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body has only images/links', () => {
    const labels = rule({ files: [], pr: { body: '![img](url) [link](url)' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body has only blockquotes', () => {
    const labels = rule({ files: [], pr: { body: '> quote\n> more' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('labels when body has only headings', () => {
    const labels = rule({ files: [], pr: { body: '# Title\n## Subtitle' }, enableDebug: false });
    expect(labels).toContain('missing-description');
  });

  it('does not label when body is sufficiently descriptive', () => {
    const labels = rule({ files: [], pr: { body: 'This PR implements a detailed feature with context and steps.' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when body is exactly at threshold', () => {
    const labels = rule({ files: [], pr: { body: 'This has exactly thirty chars!' }, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('ignores markdown/code when estimating length', () => {
    const pr = { body: '```code block``` This has enough explanation to pass the threshold of length now.' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles inline code correctly', () => {
    const pr = { body: '`code` This description has sufficient content after removing inline code snippets.' };
    const labels = rule({ files: [], pr, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    expect(() => rule({ files: [], pr: { body: 'test' }, enableDebug: true })).not.toThrow();
  });
});
