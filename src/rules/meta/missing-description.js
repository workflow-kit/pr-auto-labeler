/**
 * Missing/Short Description Detection Rule
 *
 * Adds `missing-description` if PR description is missing or too short.
 */

module.exports = function missingDescriptionRule({ files, pr, enableDebug }) {
  const labels = [];

  const bodyText = (pr && typeof pr.body === 'string') ? pr.body.trim() : '';

  // Strip common markdown artifacts to better approximate content length
  const normalized = bodyText
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // links
    .replace(/^>.*$/gm, '') // blockquotes
    .replace(/^#+\s.*$/gm, '') // headings
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();

  // Threshold: 30 characters of meaningful content
  if (!normalized || normalized.length < 30) {
    labels.push('missing-description');
  }

  if (enableDebug) {
    console.log(`[Missing Description Rule] length=${normalized.length} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Missing/Short Description Detection',
  description: 'Detects PRs with missing or too-short descriptions',
  labels: [
    { name: 'missing-description', color: '7F8C8D', description: 'PR description is missing or too short' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'meta'
};

/**
 * Missing/Short Description Detection Rule
 *
 * Labels PRs with missing or too-short descriptions.
 */
module.exports = function missingDescriptionRule({ files, pr, enableDebug }) {
  const labels = [];

  const body = (pr.body || '').trim();
  const hasSufficientDescription = body.length >= 20; // heuristic

  if (!hasSufficientDescription) {
    labels.push('missing-description');
  }

  if (enableDebug) {
    console.log(`[Missing Description Rule] length=${body.length}`);
    console.log(`[Missing Description Rule] Labels to apply: ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Missing/Short Description Detection',
  description: 'Detects PRs without a description or with too-short descriptions',
  labels: [
    { name: 'missing-description', color: '7F8C8D', description: 'PR description is missing or too short' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'meta'
};


