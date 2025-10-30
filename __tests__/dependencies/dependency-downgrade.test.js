const rule = require('../../src/rules/dependencies/dependency-downgrade');

describe('Dependency Downgrade Rule', () => {
  it('labels when a version is downgraded', () => {
    const patch = `@@\n-  "react": "^18.2.0"\n+  "react": "^18.1.0"`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-downgrade');
  });

  it('labels when major version decreases', () => {
    const patch = `@@\n-  "lodash": "^5.0.0"\n+  "lodash": "^4.17.0"`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-downgrade');
  });

  it('labels when minor version decreases', () => {
    const patch = `@@\n-  "express": "^4.18.0"\n+  "express": "^4.17.0"`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('dependency-downgrade');
  });

  it('does not label when a version is upgraded', () => {
    const patch = `@@\n-  "react": "^18.1.0"\n+  "react": "^18.2.0"`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when versions are equal', () => {
    const patch = `@@\n-  "vue": "^3.2.0"\n+  "vue": "^3.2.0"`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label for non-package.json files', () => {
    const patch = `@@\n-  "version": "2.0.0"\n+  "version": "1.0.0"`;
    const files = [{ filename: 'config.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when patch is missing', () => {
    const files = [{ filename: 'package.json' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const patch = `@@\n-  "axios": "^1.4.0"\n+  "axios": "^1.3.0"`;
    const files = [{ filename: 'package.json', patch }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
