const rule = require('../../src/rules/meta/large-pr');

describe('Large PR Rule', () => {
  it('labels when total changes exceed threshold', () => {
    const files = [ { changes: 300 }, { changes: 250 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('large-pr');
  });

  it('labels when total changes equal 501 (just over threshold)', () => {
    const files = [ { changes: 501 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('large-pr');
  });

  it('does not label when total changes are below threshold', () => {
    const files = [ { changes: 100 }, { changes: 200 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when total changes equal 500 (at threshold)', () => {
    const files = [ { changes: 500 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles files without changes field', () => {
    const files = [ { filename: 'test.js' }, { changes: 100 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles non-numeric changes', () => {
    const files = [ { changes: 'invalid' }, { changes: 200 } ];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles null files', () => {
    const labels = rule({ files: null, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles undefined files', () => {
    const labels = rule({ pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [ { changes: 600 } ];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
