/**
 * Test-Only Change Detection Rule
 *
 * Adds `test-only-change` when only test files are changed.
 */

module.exports = function testOnlyChangeRule({ files, pr, enableDebug }) {
  const labels = [];

  const isTestFile = (name) => /(^|\/)__tests__\//i.test(name) || /\.(test|spec)\.[a-z0-9]+$/i.test(name) || /(^|\/)tests?\//i.test(name);

  const names = (files || []).map(f => (f && f.filename ? String(f.filename).toLowerCase() : ''));
  const hasAny = names.length > 0;
  const allAreTests = hasAny && names.every(n => n && isTestFile(n));

  if (allAreTests) {
    labels.push('test-only-change');
  }

  if (enableDebug) {
    console.log(`[Test Only Change Rule] allAreTests=${allAreTests} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Test-only Change Detection',
  description: 'Detects PRs that modify only test files',
  labels: [
    { name: 'test-only-change', color: '0E8A16', description: 'Only test files changed' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'tests'
};


