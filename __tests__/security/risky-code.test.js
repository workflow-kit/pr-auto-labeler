const rule = require('../../src/rules/security/risky-code');

describe('Risky Code Rule', () => {
  it('labels when eval is introduced', () => {
    const files = [{ filename: 'src/a.js', patch: '+ eval("x")' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('labels when child_process is used', () => {
    const files = [{ filename: 'src/a.js', patch: '+ const cp = require("child_process")' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('risky-code');
  });

  it('does not label for safe changes', () => {
    const files = [{ filename: 'src/a.js', patch: '+ const a = 1' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


