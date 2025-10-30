/**
 * Safe Migration Detection Rule
 *
 * Adds `safe-migration` when migration files are present and no risky/schema
 * keywords are detected (i.e., only additive changes like ADD COLUMN/INDEX).
 */

module.exports = function safeMigrationRule({ files, pr, enableDebug }) {
  const labels = [];

  const isMigration = (name) => /(^|\/)(migrations|db\/migrations|database\/migrations)\//i.test(name) || /\.sql$/i.test(name);
  const risky = /(DROP\s+TABLE|TRUNCATE\s+TABLE|ALTER\s+TABLE\s+[^;]*\s+DROP\b|RENAME\s+COLUMN|MODIFY\s+COLUMN)/i;
  const additive = /(CREATE\s+INDEX|ADD\s+COLUMN|CREATE\s+TABLE|ADD\s+CONSTRAINT)/i;

  let hasMigration = false;
  let hasRisky = false;
  let hasAdditive = false;

  for (const file of files || []) {
    const name = (file && file.filename ? String(file.filename) : '').toLowerCase();
    if (!name || !isMigration(name)) continue;
    hasMigration = true;
    const patch = file && file.patch ? String(file.patch) : '';
    if (patch) {
      if (risky.test(patch)) hasRisky = true;
      if (additive.test(patch)) hasAdditive = true;
    }
  }

  if (hasMigration && !hasRisky && hasAdditive) {
    labels.push('safe-migration');
  }

  if (enableDebug) {
    console.log(`[Safe Migration Rule] hasMigration=${hasMigration} risky=${hasRisky} additive=${hasAdditive} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Safe Migration Detection',
  description: 'Detects additive-only DB migrations (safe to apply)',
  labels: [
    { name: 'safe-migration', color: '0E8A16', description: 'Additive database migration detected' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'database'
};


