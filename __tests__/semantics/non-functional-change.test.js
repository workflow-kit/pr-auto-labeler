const rule = require('../../src/rules/semantics/non-functional-change');

describe('Non-Functional Change Rule', () => {
  it('labels when only markdown files changed', () => {
    const files = [{ filename: 'README.md' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('labels when only docs directory files changed', () => {
    const files = [{ filename: 'docs/guide.md' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('labels when only text files changed', () => {
    const files = [{ filename: 'notes.txt' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('labels when only RST files changed', () => {
    const files = [{ filename: 'docs/index.rst' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('labels when multiple doc files changed', () => {
    const files = [
      { filename: 'README.md' },
      { filename: 'docs/guide.md' },
      { filename: 'CHANGELOG.txt' }
    ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('labels when only MDX files changed', () => {
    const files = [{ filename: 'docs/tutorial.mdx' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('labels when only asciidoc files changed', () => {
    const files = [{ filename: 'manual.adoc' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('non-functional-change');
  });

  it('does not label when code files are present', () => {
    const files = [
      { filename: 'README.md' },
      { filename: 'src/app.js' }
    ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when only code files changed', () => {
    const files = [{ filename: 'src/app.js', patch: '- return 1;\n+ return 2;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when TypeScript files changed', () => {
    const files = [{ filename: 'src/app.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles null filename', () => {
    const files = [{ filename: null }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'README.md' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
