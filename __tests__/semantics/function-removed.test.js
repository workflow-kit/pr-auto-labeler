const rule = require('../../src/rules/semantics/function-removed');

describe('Function Removed Rule', () => {
  it('labels when file is removed', () => {
    const files = [{ filename: 'src/a.js', status: 'removed' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('function-removed');
  });

  it('labels when a function line is removed in patch', () => {
    const files = [{ filename: 'src/a.js', patch: '- function test() {}' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('function-removed');
  });

  it('labels when export function is removed', () => {
    const files = [{ filename: 'src/utils.js', patch: '- export function helper() {}' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('function-removed');
  });

  it('labels when async function is removed', () => {
    const files = [{ filename: 'src/api.js', patch: '- async function fetchData() {}' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('function-removed');
  });

  it('labels when class is removed', () => {
    const files = [{ filename: 'src/model.js', patch: '- class User {}' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('function-removed');
  });

  it('does not label for additions only', () => {
    const files = [{ filename: 'src/a.js', patch: '+ function test() {}' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when no removals', () => {
    const files = [{ filename: 'src/a.js', status: 'added' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when patch is missing', () => {
    const files = [{ filename: 'src/a.js', status: 'modified' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'src/a.js', status: 'removed' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
