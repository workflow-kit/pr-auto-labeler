/**
 * Refactor/Rename Detection Rule
 *
 * Adds `refactor` when title/body indicates refactor or many renames.
 */

module.exports = function refactorRule({ files, pr, enableDebug }) {
  const labels = [];

  const title = (pr && pr.title ? pr.title : '').toLowerCase();
  const body = (pr && pr.body ? pr.body : '').toLowerCase();
  const hasKeyword = /\brefactor\b|\bcleanup\b/.test(`${title} ${body}`);

  const renameCount = (files || []).filter(f => f && f.status === 'renamed').length;
  const manyRenames = renameCount >= 2;

  if (hasKeyword || manyRenames) {
    labels.push('refactor');
  }

  if (enableDebug) {
    console.log(`[Refactor Rule] hasKeyword=${hasKeyword} renameCount=${renameCount} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Refactor/Rename Only Changes',
  description: 'Flags refactor-focused PRs or multiple renames',
  labels: [
    { name: 'refactor', color: '7F8C8D', description: 'Refactor changes (low-risk code movement)' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'semantics'
};


