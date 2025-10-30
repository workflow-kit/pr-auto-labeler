const rule = require('../../src/rules/meta/large-pr');

describe('Large PR Rule', () => {
  it('labels when total changes exceed threshold', () => {
    const files = [ { changes: 300 }, { changes: 250 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('large-pr');
  });

  it('does not label when total changes are below threshold', () => {
    const files = [ { changes: 100 }, { changes: 200 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


