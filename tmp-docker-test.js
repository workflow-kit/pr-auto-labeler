const { execSync } = require('child_process');
const path = require('path');
const base = process.argv[2];
if (!base) {
  console.error('Usage: node tmp-docker-test.js /path/to/repo');
  process.exit(1);
}
function rel(p) {
  const normBase = base.endsWith(path.sep) ? base : base + path.sep;
  return p.startsWith(normBase) ? p.slice(normBase.length) : p;
}
const out = execSync(`find "${base}" -type f -print`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const list = out ? out.split('\n').map(rel) : [];
const rule = require('./src/rules/infrastructure/docker-change.js');
const files = list.map(filename => ({ filename }));
const labels = rule({ files, pr: {}, enableDebug: false });
const detectedFiles = list.filter(fn => {
  const lower = fn.toLowerCase();
  const baseName = path.basename(fn);
  const baseLower = baseName.toLowerCase();
  return baseLower === 'dockerfile' ||
         baseLower.startsWith('dockerfile.') ||
         lower.endsWith('.dockerfile') ||
         baseLower === '.dockerignore' ||
         (baseLower.startsWith('docker-compose') && (lower.endsWith('.yml') || lower.endsWith('.yaml')));
});
console.log(JSON.stringify({ base, labels, detectedFiles }, null, 2));
