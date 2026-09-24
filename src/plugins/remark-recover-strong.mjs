const skippedNodeTypes = new Set(['code', 'inlineCode', 'html']);

const recoverStrongInText = (node) => {
  const pattern = /\*\*([^*\n]+?)\*\*/g;
  const children = [];
  let cursor = 0;
  let match;

  while ((match = pattern.exec(node.value)) !== null) {
    if (match.index > cursor) {
      children.push({ type: 'text', value: node.value.slice(cursor, match.index) });
    }

    const leadingSpace = match[1].match(/^\s*/)?.[0] ?? '';
    const trailingSpace = match[1].match(/\s*$/)?.[0] ?? '';
    const value = match[1].trim();

    if (leadingSpace) children.push({ type: 'text', value: leadingSpace });
    if (value) children.push({ type: 'strong', children: [{ type: 'text', value }] });
    if (trailingSpace) children.push({ type: 'text', value: trailingSpace });
    cursor = pattern.lastIndex;
  }

  if (cursor === 0) return null;
  if (cursor < node.value.length) {
    children.push({ type: 'text', value: node.value.slice(cursor) });
  }
  return children;
};

const visitChildren = (parent) => {
  if (!Array.isArray(parent.children) || skippedNodeTypes.has(parent.type)) return;

  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];
    if (child.type === 'text') {
      const replacement = recoverStrongInText(child);
      if (replacement) {
        parent.children.splice(index, 1, ...replacement);
        index += replacement.length - 1;
      }
    } else {
      visitChildren(child);
    }
  }
};

export default function remarkRecoverStrong() {
  return (tree) => visitChildren(tree);
}
