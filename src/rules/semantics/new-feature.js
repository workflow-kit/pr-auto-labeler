/**
 * New Feature Detection Rule
 *
 * Adds `new-feature` if title/body suggests feature or new files added in src/.
 */

module.exports = function newFeatureRule({ files, pr, enableDebug }) {
  const labels = [];

  const title = (pr && pr.title ? pr.title : '').toLowerCase();
  const body = (pr && pr.body ? pr.body : '').toLowerCase();
  const hasKeyword = /\bfeat\b|\bfeature\b|\bnew\s+feature\b/.test(`${title} ${body}`);

  const hasAddedInSrc = (files || []).some(f => f && f.status === 'added' && /^(src|lib|packages)\//i.test(String(f.filename)));

  if (hasKeyword || hasAddedInSrc) {
    labels.push('new-feature');
  }

  if (enableDebug) {
    console.log(`[New Feature Rule] keyword=${hasKeyword} addedInSrc=${hasAddedInSrc} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'New Feature Introduced',
  description: 'Flags PRs that introduce new features or new source files',
  labels: [
    { name: 'new-feature', color: '0E8A16', description: 'New feature introduced' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'semantics'
};


