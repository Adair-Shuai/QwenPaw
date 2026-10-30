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
  function hasWork(node) {
    if (ts.isCallExpression(node)) {
      const parts = chain(node.expression);
      // A resolved empty promise is another common async placeholder.
      if (!(parts.join(".") === "Promise.resolve" && !node.arguments.length))
        return true;
    }
    if (ts.isAwaitExpression(node)) return hasWork(node.expression);
    if (ts.isBinaryExpression(node) || ts.isThrowStatement(node)) return true;
    return ts.forEachChild(node, hasWork) ?? false;
  }
  function checkCallback(callback, title) {
    if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))
      return;
    if (!hasWork(callback.body))
      throw new Error(`Empty protected fork test: ${filename}: ${title}`);
    const parameter = callback.parameters[0]?.name;
    const skipNames = new Set();
    if (parameter && ts.isObjectBindingPattern(parameter)) {
      for (const binding of parameter.elements) {
        if ((binding.propertyName ?? binding.name).getText(tree) === "skip")
          skipNames.add(binding.name.getText(tree));
      }
    }
    function checkSkip(node) {
      if (ts.isCallExpression(node)) {
        const parts = chain(node.expression);
        if (
          (parts.length === 1 && skipNames.has(parts[0])) ||
          (parameter &&
            ts.isIdentifier(parameter) &&
            parts[0] === parameter.text &&
            parts[1] === "skip")
        )
          throw new Error(
            `Protected fork tests cannot use runtime skip: ${filename}`,
          );
      }
      ts.forEachChild(node, checkSkip);
    }
    checkSkip(callback.body);
  }
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
        if (
          parts.at(-1) === "each" &&
          node.arguments[0] &&
          ts.isArrayLiteralExpression(node.arguments[0]) &&
          node.arguments[0].elements.length === 0
        )
          throw new Error(`Empty protected parameter table: ${filename}`);
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
          checkCallback(callback, title.text);
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
