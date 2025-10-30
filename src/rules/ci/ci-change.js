/**
 * CI Workflow Change Rule
 *
 * Adds `ci-change` if CI pipeline/workflow files are modified.
 */

module.exports = function ciChangeRule({ files, pr, enableDebug }) {
  const labels = [];

  const patterns = [
    /^\.github\/workflows\//i,
    /^\.circleci\//i,
    /(^|\/)Jenkinsfile$/i,
    /(^|\/)azure-pipelines\.ya?ml$/i,
    /(^|\/)gitlab-ci\.ya?ml$/i,
    /(^|\/)bitrise\.ya?ml$/i
  ];

  const detected = (files || []).some(f => {
    const name = (f && f.filename ? String(f.filename) : '').toLowerCase();
    return name && patterns.some(rx => rx.test(name));
  });

  if (detected) {
    labels.push('ci-change');
  }

  if (enableDebug) {
    console.log(`[CI Change Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'CI Workflow Changes',
  description: 'Detects modifications to CI workflows/pipelines',
  labels: [
    { name: 'ci-change', color: '0075CA', description: 'CI workflow changed' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'infrastructure'
};


