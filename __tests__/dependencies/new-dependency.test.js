const rule = require('../../src/rules/dependencies/new-dependency');

describe('New Dependency Rule', () => {
  it('labels when dependency is added in patch', () => {
    const patch = `@@\n+   "dependencies": {\n+ +   "left-pad": "^1.3.0"\n+   }`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('new-dependency');
  });

  it('does not label without additions', () => {
    const patch = `@@\n-  "left-pad": "^1.2.0"`;
    const files = [{ filename: 'package.json', patch }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


