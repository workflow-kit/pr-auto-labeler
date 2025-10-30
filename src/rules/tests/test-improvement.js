/**
 * Test Improvement Detection Rule
 *
 * Adds `test-improvement` when both source and test files changed.
 */

module.exports = function testImprovementRule({ files, pr, enableDebug }) {
  const labels = [];

  const isTestFile = (name) => /(^|\/).__tests__\//i.test(name) || /\.(test|spec)\.[a-z0-9]+$/i.test(name) || /(^|\/)tests?\//i.test(name);
  const isSourceFile = (name) => /\.(js|jsx|ts|tsx|java|go|py|rb|rs|php|cpp|c|cs|scala|kt|swift|vue|svelte)$/i.test(name) && !isTestFile(name);

  const names = (files || []).map(f => (f && f.filename ? String(f.filename).toLowerCase() : ''));
  const hasSource = names.some(n => n && isSourceFile(n));
  const hasTests = names.some(n => n && isTestFile(n));

  if (hasSource && hasTests) {
    labels.push('test-improvement');
  }

  if (enableDebug) {
    console.log(`[Test Improvement Rule] hasSource=${hasSource} hasTests=${hasTests} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Test Improvement Detection',
  description: 'Detects PRs that modify tests alongside code changes',
  labels: [
    { name: 'test-improvement', color: '0E8A16', description: 'Tests improved/added with code changes' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'tests'
};


