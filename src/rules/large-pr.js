/**
 * Large PR Detection Rule
 *
 * Labels PRs with a large number of total changes.
 */
module.exports = function largePrRule({ files, pr, enableDebug }) {
  const labels = [];

  const totalChanges = files.reduce((sum, f) => sum + (f.changes || 0), 0);
  const threshold = 500; // heuristic

  if (totalChanges > threshold) {
    labels.push('large-pr');
  }

  if (enableDebug) {
    console.log(`[Large PR Rule] totalChanges=${totalChanges} threshold=${threshold}`);
    console.log(`[Large PR Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Large PR Detection',
  description: 'Detects PRs with a large number of changes',
  labels: [
    { name: 'large-pr', color: 'FBCA04', description: 'PR is large and may need focused review' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'meta'
};


