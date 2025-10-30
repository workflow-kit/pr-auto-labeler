/**
 * No Linked Issue Detection Rule
 *
 * Adds `no-linked-issue` if PR title/body lacks an issue reference
 * like `Fixes #123`, `Closes owner/repo#45`, or plain `#123`.
 */

module.exports = function noLinkedIssueRule({ files, pr, enableDebug }) {
  const labels = [];

  const title = (pr && typeof pr.title === 'string') ? pr.title : '';
  const body = (pr && typeof pr.body === 'string') ? pr.body : '';
  const text = `${title}\n${body}`;

  const hasKeywordIssue = /(close[sd]?|fix(e[sd])?|resolve[sd]?)\s+((https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+)|#\d+|[\w.-]+\/[\w.-]+#\d+)/i.test(text);
  const hasBareIssue = /(^|\s)#\d+(\s|$)/.test(text);

  if (!hasKeywordIssue && !hasBareIssue) {
    labels.push('no-linked-issue');
  }

  if (enableDebug) {
    console.log(`[No Linked Issue Rule] hasRef=${hasKeywordIssue || hasBareIssue} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'No Linked Issue Detection',
  description: 'Detects PRs without any linked/tracked issue references',
  labels: [
    { name: 'no-linked-issue', color: '7F8C8D', description: 'PR has no linked issue reference' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'meta'
};
