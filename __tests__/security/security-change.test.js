const rule = require('../../src/rules/security/security-change');

describe('Security Change Rule', () => {
  it('labels when files under auth/ change', () => {
    const files = [{ filename: 'src/auth/login.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('labels when jwt related files change', () => {
    const files = [{ filename: 'src/utils/jwt-utils.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('does not label for unrelated files', () => {
    const files = [{ filename: 'src/components/Button.tsx' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


