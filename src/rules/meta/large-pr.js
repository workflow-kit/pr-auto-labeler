/**
 * Large PR Detection Rule
 *
 * Adds `large-pr` if the total number of changed lines exceeds a threshold.
 */

module.exports = function largePrRule({ files, pr, enableDebug }) {
  const labels = [];

  const totalChanges = Array.isArray(files)
    ? files.reduce((sum, f) => sum + (typeof f.changes === 'number' ? f.changes : 0), 0)
    : 0;

  const THRESHOLD = 500;

  if (totalChanges > THRESHOLD) {
    labels.push('large-pr');
  }

  if (enableDebug) {
    console.log(`[Large PR Rule] totalChanges=${totalChanges} threshold=${THRESHOLD} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Large PR Detection',
  description: 'Flags PRs with a large number of changed lines',
  labels: [
    { name: 'large-pr', color: '0075CA', description: 'Large pull request (size threshold exceeded)' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'meta'
};


