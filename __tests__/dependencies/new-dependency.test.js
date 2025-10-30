const rule = require('../../src/rules/dependencies/new-dependency');

describe('New Dependency Rule', () => {
  it('labels when dependency is added in patch', () => {
    const patch = `@@\n+   "dependencies": {\n+ +   "left-pad": "^1.3.0"\n+   }`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-dependency');
  });

  it('labels for simple dependency addition', () => {
    const patch = `@@\n+    "lodash": "^4.17.21",`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-dependency');
  });

  it('labels for nested package.json', () => {
    const patch = `@@\n+    "express": "^4.18.0"`;
    const files = [{ filename: 'api/package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-dependency');
  });

  it('does not label without additions', () => {
    const patch = `@@\n-  "left-pad": "^1.2.0"`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label for non-package.json files', () => {
    const patch = `@@\n+    "test": "value"`;
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
    const patch = `@@\n+    "react": "^18.0.0"`;
    const files = [{ filename: 'package.json', patch }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
