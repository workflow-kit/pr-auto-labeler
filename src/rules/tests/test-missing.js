/**
 * Source Changed Without Tests Detection Rule
 *
 * Adds `test-missing` when source files changed but no test files changed.
 */

module.exports = function testMissingRule({ files, pr, enableDebug }) {
  const labels = [];

  const isTestFile = (name) => /(^|\/)__tests__\//i.test(name) || /\.(test|spec)\.[a-z0-9]+$/i.test(name) || /(^|\/)tests?\//i.test(name);
  const isSourceFile = (name) => /\.(js|jsx|ts|tsx|java|go|py|rb|rs|php|cpp|c|cs|scala|kt|swift|vue|svelte)$/i.test(name);

  const names = (files || []).map(f => (f && f.filename ? String(f.filename).toLowerCase() : ''));
  const hasSource = names.some(n => n && isSourceFile(n));
  const hasTests = names.some(n => n && isTestFile(n));

  if (hasSource && !hasTests) {
    labels.push('test-missing');
  }

  if (enableDebug) {
    console.log(`[Test Missing Rule] hasSource=${hasSource} hasTests=${hasTests} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Source Changed Without Tests',
  description: 'Detects code changes without accompanying tests',
  labels: [
    { name: 'test-missing', color: 'D93F0B', description: 'Code changes without tests' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'tests'
};


