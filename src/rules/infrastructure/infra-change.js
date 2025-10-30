/**
 * Infrastructure Config Change Rule
 *
 * Adds `infra-change` if infra-related files are modified.
 */

module.exports = function infraChangeRule({ files, pr, enableDebug }) {
  const labels = [];

  const hints = [
    /^(infra|infrastructure|ops|deploy|deployment|k8s|helm|charts|terraform|ansible|chef|salt)\//i,
    /^config\//i,
    /\.(tf|tfvars|hcl|tpl)$/i,
    /(^|\/)Dockerfile(\.|$)/i,
    /(^|\/)docker-compose\.(ya?ml)$/i
  ];

  const detected = (files || []).some(f => {
    const name = (f && f.filename ? String(f.filename) : '').toLowerCase();
    return name && hints.some(rx => rx.test(name));
  });

  if (detected) {
    labels.push('infra-change');
  }

  if (enableDebug) {
    console.log(`[Infra Change Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Infrastructure Config Changes',
  description: 'Detects changes to infrastructure/configuration files',
  labels: [
    { name: 'infra-change', color: '0075CA', description: 'Infrastructure/config changed' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'infrastructure'
};


