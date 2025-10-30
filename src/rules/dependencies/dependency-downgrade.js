/**
 * Dependency Downgrade Detection Rule
 *
 * Adds `dependency-downgrade` if a version decreases in package.json patch.
 */

function parseVersion(v) {
  const cleaned = (v || '').replace(/^[^0-9]*/, ''); // drop ^ ~ etc.
  const [major, minor, patch] = cleaned.split('.').map(n => parseInt(n, 10) || 0);
  return { major, minor, patch };
}

function isLess(a, b) {
  if (a.major !== b.major) return a.major < b.major;
  if (a.minor !== b.minor) return a.minor < b.minor;
  return a.patch < b.patch;
}

module.exports = function dependencyDowngradeRule({ files, pr, enableDebug }) {
  const labels = [];

  const isPkgJson = (name) => /(^|\/)package\.json$/i.test(name);

  let detected = false;
  for (const file of files || []) {
    const name = (file && file.filename ? String(file.filename) : '').toLowerCase();
    if (!isPkgJson(name)) continue;
    const patch = file && file.patch ? String(file.patch) : '';
    if (!patch) continue;

    // Scan pairs of removed and added lines for same dep with lower version
    const removed = [...patch.matchAll(/^-\s*"([^"]+)"\s*:\s*"([^"]+)"/gm)];
    const added = [...patch.matchAll(/^\+\s*"([^"]+)"\s*:\s*"([^"]+)"/gm)];
    const addMap = new Map(added.map((m) => [m[1], m[2]]));

    for (const m of removed) {
      const dep = m[1];
      const oldV = parseVersion(m[2]);
      const newVRaw = addMap.get(dep);
      if (!newVRaw) continue;
      const newV = parseVersion(newVRaw);
      if (isLess(newV, oldV)) {
        detected = true;
        break;
      }
    }
    if (detected) break;
  }

  if (detected) {
    labels.push('dependency-downgrade');
  }

  if (enableDebug) {
    console.log(`[Dependency Downgrade Rule] → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Dependency Downgrade Detection',
  description: 'Detects decreased versions in package.json changes',
  labels: [
    { name: 'dependency-downgrade', color: 'D93F0B', description: 'Dependency version downgraded' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'dependencies'
};


