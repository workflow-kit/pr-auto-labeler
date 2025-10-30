/**
 * Security-Sensitive Area Change Rule
 *
 * Adds `security-change` if files in security/auth areas are modified.
 */

module.exports = function securityChangeRule({ files, pr, enableDebug }) {
  const labels = [];

  const pathHints = [
    /(?:^|\/)auth(?:[\/.\-_]|$)/i,
    /(?:^|\/)security(?:[\/.\-_]|$)/i,
    /(?:^|\/)secrets?(?:[\/.\-_]|$)/i,
    /(?:^|\/)keys?(?:[\/.\-_]|$)/i,
    /(?:^|\/)crypto(?:[\/.\-_]|$)/i,
    /jwt/i,
    /(?:^|\/)oauth(?:[\/.\-_]|$)/i,
    /(?:^|\/)permissions?(?:[\/.\-_]|$)/i
  ];

  let detected = false;
  for (const file of files || []) {
    const name = (file && file.filename ? String(file.filename) : '').toLowerCase();
    if (!name) continue;
    if (pathHints.some(rx => rx.test(name))) {
      detected = true;
      if (enableDebug) {
        console.log(`[Security Change Rule] sensitive path: ${name}`);
      }
      break;
    }
  }

  if (detected) {
    labels.push('security-change');
  }

  if (enableDebug) {
    console.log(`[Security Change Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Security-Sensitive Area Changes',
  description: 'Detects modifications to authentication/security-sensitive code',
  labels: [
    { name: 'security-change', color: 'D93F0B', description: 'Security-sensitive areas changed' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'security'
};


