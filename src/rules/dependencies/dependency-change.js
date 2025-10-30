/**
 * Dependency Files Changed Rule
 *
 * Adds `dependency-change` if dependency manifest/lock files change.
 */

module.exports = function dependencyChangeRule({ files, pr, enableDebug }) {
  const labels = [];

  const patterns = [
    /(^|\/)package\.json$/i,
    /(^|\/)package-lock\.json$/i,
    /(^|\/)yarn\.lock$/i,
    /(^|\/)pnpm-lock\.yaml$/i,
    /(^|\/)requirements\.txt$/i,
    /(^|\/)poetry\.lock$/i
  ];

  const detected = (files || []).some(f => {
    const name = (f && f.filename ? String(f.filename) : '').toLowerCase();
    return name && patterns.some(rx => rx.test(name));
  });

  if (detected) {
    labels.push('dependency-change');
  }

  if (enableDebug) {
    console.log(`[Dependency Change Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Dependency Files Changed',
  description: 'Detects changes to dependency manifests/lock files',
  labels: [
    { name: 'dependency-change', color: '0075CA', description: 'Dependency files modified' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'dependencies'
};


