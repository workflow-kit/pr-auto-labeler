/**
 * New Dependency Added Rule
 *
 * Adds `new-dependency` if package.json adds new dependencies in patch.
 */

module.exports = function newDependencyRule({ files, pr, enableDebug }) {
  const labels = [];

  const isPkgJson = (name) => /(^|\/)package\.json$/i.test(name);

  let detected = false;
  for (const file of files || []) {
    const name = (file && file.filename ? String(file.filename) : '').toLowerCase();
    if (!isPkgJson(name)) continue;
    const patch = file && file.patch ? String(file.patch) : '';
    if (!patch) continue;

    // Look for added dependency lines like: +    "lib": "^1.2.3",
    // Some fixtures may include an extra '+' artifact, allow optional second '+'.
    const addedDepLine = /^\+\s*\+?\s*"[^"]+"\s*:\s*"[^"]+",?\s*$/m;
    if (addedDepLine.test(patch)) {
      detected = true;
      break;
    }
  }

  if (detected) {
    labels.push('new-dependency');
  }

  if (enableDebug) {
    console.log(`[New Dependency Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'New Dependency Added',
  description: 'Detects additions of dependencies in package.json',
  labels: [
    { name: 'new-dependency', color: '0E8A16', description: 'New dependency added' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'dependencies'
};


