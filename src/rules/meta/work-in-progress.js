/**
 * Work In Progress Detection Rule
 *
 * Adds `work-in-progress` if PR is draft or title/body indicates WIP.
 */

module.exports = function workInProgressRule({ files, pr, enableDebug }) {
  const labels = [];

  const isDraft = !!(pr && pr.draft);
  const title = (pr && typeof pr.title === 'string') ? pr.title : '';
  const body = (pr && typeof pr.body === 'string') ? pr.body : '';
  const text = `${title}\n${body}`.toLowerCase();

  const wipPatterns = /(\bWIP\b|\[wip\]|\bdraft\b|do\s*not\s*merge|dnm)/i;
  const detected = isDraft || wipPatterns.test(text);

  if (detected) {
    labels.push('work-in-progress');
  }

  if (enableDebug) {
    console.log(`[WIP Rule] draft=${isDraft} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Work in Progress Detection',
  description: 'Detects draft or WIP PRs based on flags and keywords',
  labels: [
    { name: 'work-in-progress', color: 'FBCA04', description: 'PR is work in progress' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'meta'
};


