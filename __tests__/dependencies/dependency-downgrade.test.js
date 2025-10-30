const rule = require('../../src/rules/dependencies/dependency-downgrade');

describe('Dependency Downgrade Rule', () => {
  it('labels when a version is downgraded', () => {
    const patch = `@@\n-  "react": "^18.2.0"\n+  "react": "^18.1.0"`;
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
});


