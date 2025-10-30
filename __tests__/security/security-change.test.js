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

  it('labels when security directory changes', () => {
    const files = [{ filename: 'lib/security/encrypt.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('labels when secrets directory changes', () => {
    const files = [{ filename: 'config/secrets/api.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('labels when keys directory changes', () => {
    const files = [{ filename: 'certs/keys/private.pem' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('labels when crypto files change', () => {
    const files = [{ filename: 'src/crypto/hash.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('labels when oauth files change', () => {
    const files = [{ filename: 'src/oauth/callback.ts' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('labels when permissions files change', () => {
    const files = [{ filename: 'src/permissions/check.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('security-change');
  });

  it('does not label for unrelated files', () => {
    const files = [{ filename: 'src/components/Button.tsx' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles null filename', () => {
    const files = [{ filename: null }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'src/auth/login.js' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
