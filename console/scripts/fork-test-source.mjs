import ts from "typescript";

// Parse actual test registrations: comments and strings are not executable tests.
export function inspectForkTestSource(filename, source, requiredTitles = []) {
  const tree = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const titles = new Set();
  let tests = 0;
  function chain(node) {
    if (ts.isIdentifier(node)) return [node.text];
    if (ts.isPropertyAccessExpression(node))
      return [...chain(node.expression), node.name.text];
    if (
      ts.isElementAccessExpression(node) &&
      node.argumentExpression &&
      ts.isStringLiteral(node.argumentExpression)
    )
      return [...chain(node.expression), node.argumentExpression.text];
    if (ts.isCallExpression(node) || ts.isTaggedTemplateExpression(node))
      return chain(node.expression ?? node.tag);
    return [];
  }
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const parts = chain(node.expression);
      if (["it", "test", "describe"].includes(parts[0])) {
        const forbidden = parts.find((part) =>
          ["skip", "todo", "only", "skipIf", "runIf", "fails"].includes(part),
        );
        if (forbidden)
          throw new Error(
            `Protected fork tests cannot use ${forbidden}: ${filename}`,
          );
        const [title, callback] = node.arguments;
        if (
          parts[0] !== "describe" &&
          title &&
          ts.isStringLiteralLike(title) &&
          callback
        ) {
          if (
            (ts.isArrowFunction(callback) ||
              ts.isFunctionExpression(callback)) &&
            ts.isBlock(callback.body) &&
            callback.body.statements.every((statement) =>
              ts.isEmptyStatement(statement),
            )
          )
            throw new Error(
              `Empty protected fork test: ${filename}: ${title.text}`,
            );
          titles.add(title.text);
          tests++;
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (!tests) throw new Error(`No executable fork tests: ${filename}`);
  for (const title of requiredTitles) {
    if (!titles.has(title))
      throw new Error(
        `Required executable fork integration case missing: ${filename}: ${title}`,
      );
  }
  return titles;
}
