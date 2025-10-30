/**
 * Function/Class Removed Detection Rule
 *
 * Adds `function-removed` if files are removed, or diffs remove function/class.
 */

module.exports = function functionRemovedRule({ files, pr, enableDebug }) {
  const labels = [];

  let detected = false;
  for (const file of files || []) {
    if (file && file.status === 'removed') {
      detected = true;
      break;
    }
    const patch = file && file.patch ? String(file.patch) : '';
    if (!patch) continue;
    if (/^-\s*(export\s+)?(async\s+)?function\b/m.test(patch) || /^-\s*class\b/m.test(patch)) {
      detected = true;
      break;
    }
  }

  if (detected) {
    labels.push('function-removed');
  }

  if (enableDebug) {
    console.log(`[Function Removed Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Function/Class Removed',
  description: 'Detects removal of functions or classes in diffs',
  labels: [
    { name: 'function-removed', color: 'D93F0B', description: 'Functions/classes removed' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'semantics'
};


