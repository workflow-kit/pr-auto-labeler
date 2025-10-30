/**
 * Risky Code Usage Detection Rule
 *
 * Adds `risky-code` if diffs include risky APIs or patterns.
 */

module.exports = function riskyCodeRule({ files, pr, enableDebug }) {
  const labels = [];

  const patterns = [
    /\beval\s*\(/i,
    /new\s+Function\s*\(/i,
    /child_process/i,
    /exec\s*\(/i,
    /spawn\s*\(/i,
    /dangerouslySetInnerHTML/i,
    /document\.write\s*\(/i,
    /crypto\.(createCipher|createDecipher)/i
  ];

  let detected = false;
  for (const file of files || []) {
    const patch = file && file.patch ? String(file.patch) : '';
    if (!patch) continue;
    if (patterns.some(rx => rx.test(patch))) {
      detected = true;
      if (enableDebug) {
        console.log(`[Risky Code Rule] risky pattern in ${file.filename}`);
      }
      break;
    }
  }

  if (detected) {
    labels.push('risky-code');
  }

  if (enableDebug) {
    console.log(`[Risky Code Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Risky Code Usage',
  description: 'Detects risky APIs/patterns in diffs (eval, exec, etc.)',
  labels: [
    { name: 'risky-code', color: 'D93F0B', description: 'Potentially dangerous code introduced' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'security'
};


