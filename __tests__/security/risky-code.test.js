const rule = require('../../src/rules/security/risky-code');

describe('Risky Code Rule', () => {
  it('labels when eval is introduced', () => {
    const files = [{ filename: 'src/a.js', patch: '+ eval("x")' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when new Function is used', () => {
    const files = [{ filename: 'src/a.js', patch: '+ const fn = new Function("return 1")' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when child_process is used', () => {
    const files = [{ filename: 'src/a.js', patch: '+ const cp = require("child_process")' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when exec is used', () => {
    const files = [{ filename: 'src/a.js', patch: '+ exec("ls -la")' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when spawn is used', () => {
    const files = [{ filename: 'src/a.js', patch: '+ spawn("node", args)' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when dangerouslySetInnerHTML is used', () => {
    const files = [{ filename: 'src/a.jsx', patch: '+ <div dangerouslySetInnerHTML={{__html: data}} />' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when document.write is used', () => {
    const files = [{ filename: 'src/a.js', patch: '+ document.write(content)' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when crypto.createCipher is used', () => {
    const files = [{ filename: 'src/crypto.js', patch: '+ const cipher = crypto.createCipher("aes256", key)' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('does not label for safe changes', () => {
    const files = [{ filename: 'src/a.js', patch: '+ const a = 1' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles files without patch', () => {
    const files = [{ filename: 'src/a.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'src/a.js', patch: '+ eval("x")' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
