/**
 * Non-Functional Change Detection Rule
 *
 * Adds `non-functional-change` for doc/markdown and config-only changes.
 * Heuristic: if all changed files are docs or text (no code extensions).
 */

module.exports = function nonFunctionalChangeRule({ files, pr, enableDebug }) {
  const labels = [];

  const isDoc = (name) => /\.(md|mdx|txt|rst)$/i.test(name) || /^(docs|documentation)\//i.test(name);
  const isTextConfig = (name) => /\.(adoc|asciidoc|csv)$/i.test(name);
  const isCode = (name) => /\.(js|jsx|ts|tsx|java|go|py|rb|rs|php|cpp|c|cs|scala|kt|swift|vue|svelte)$/i.test(name);

  const names = (files || []).map(f => (f && f.filename ? String(f.filename).toLowerCase() : ''));
  const hasCode = names.some(n => n && isCode(n));
  const allDocsOrText = names.length > 0 && names.every(n => n && (isDoc(n) || isTextConfig(n)));

  if (!hasCode && allDocsOrText) {
    labels.push('non-functional-change');
  }

  if (enableDebug) {
    console.log(`[Non-Functional Change Rule] hasCode=${hasCode} allDocsOrText=${allDocsOrText} → ${labels.join(', ') || 'none'}`);
  }

  return labels;
};

module.exports.metadata = {
  name: 'Non-Functional Changes',
  description: 'Detects documentation/text-only changes',
  labels: [
    { name: 'non-functional-change', color: '7F8C8D', description: 'Non-code changes (docs/text only)' }
  ],
  author: 'pr-auto-labeler',
  version: '1.0.0',
  category: 'semantics'
};


