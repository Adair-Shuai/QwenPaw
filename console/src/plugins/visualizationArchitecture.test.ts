import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const visualizationRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../plugins/bundle/ugsci/ui/src/visualization",
);
const uiRoot = path.resolve(visualizationRoot, "../..");
const configFile = ts.readConfigFile(
  path.join(uiRoot, "tsconfig.json"),
  ts.sys.readFile,
);
if (configFile.error)
  throw new Error(
    ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"),
  );
const compilerOptions = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  uiRoot,
).options;

interface Dependency {
  specifier: string;
  line: number;
  typeOnly: boolean;
  target?: string;
  external: boolean;
}
interface SourceModule {
  dependencies: Dependency[];
  unresolved: string[];
}
type DependencyGraph = Map<string, SourceModule>;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const filename = path.join(directory, entry.name);
      return entry.isDirectory()
        ? sourceFiles(filename)
        : /\.tsx?$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name)
        ? [filename]
        : [];
    })
    .sort();
}

function display(filename: string): string {
  return path.relative(visualizationRoot, filename).replace(/\\/g, "/");
}

function readModule(filename: string): SourceModule {
  const source = ts.createSourceFile(
    filename,
    readFileSync(filename, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const dependencies: Dependency[] = [];
  const unresolved: string[] = [];
  const add = (
    node: ts.Node,
    specifierNode: ts.Node | undefined,
    typeOnly: boolean,
  ) => {
    const line =
      source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    if (!specifierNode || !ts.isStringLiteralLike(specifierNode)) {
      unresolved.push(
        `${display(
          filename,
        )}:${line}: computed module dependency cannot be checked`,
      );
      return;
    }
    const specifier = specifierNode.text;
    const resolved = ts.resolveModuleName(
      specifier,
      filename,
      compilerOptions,
      ts.sys,
    ).resolvedModule;
    const external =
      resolved?.isExternalLibraryImport ?? !specifier.startsWith(".");
    if (!resolved)
      unresolved.push(
        `${display(filename)}:${line}: cannot resolve ${specifier}`,
      );
    dependencies.push({
      specifier,
      line,
      typeOnly,
      target: resolved ? path.resolve(resolved.resolvedFileName) : undefined,
      external,
    });
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const typeOnly = Boolean(
        clause?.isTypeOnly ||
          (clause &&
            !clause.name &&
            bindings &&
            ts.isNamedImports(bindings) &&
            bindings.elements.length > 0 &&
            bindings.elements.every((item) => item.isTypeOnly)),
      );
      add(node, node.moduleSpecifier, typeOnly);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const bindings = node.exportClause;
      const typeOnly =
        node.isTypeOnly ||
        Boolean(
          bindings &&
            ts.isNamedExports(bindings) &&
            bindings.elements.length > 0 &&
            bindings.elements.every((item) => item.isTypeOnly),
        );
      add(node, node.moduleSpecifier, typeOnly);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      add(node, node.moduleReference.expression, node.isTypeOnly);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument)
    ) {
      add(node, node.argument.literal, true);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      add(node, node.arguments[0], false);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { dependencies, unresolved };
}

function dependencyGraph(roots: string[]): DependencyGraph {
  const graph: DependencyGraph = new Map();
  const visit = (filename: string) => {
    if (graph.has(filename)) return;
    const module = readModule(filename);
    graph.set(filename, module);
    for (const dependency of module.dependencies) {
      if (dependency.target && !dependency.external) visit(dependency.target);
    }
  };
  roots.forEach(visit);
  return graph;
}

function runtimeCycles(graph: DependencyGraph): string[] {
  const complete = new Set<string>();
  const stack: string[] = [];
  const cycles: string[] = [];
  const visit = (filename: string) => {
    const ancestor = stack.indexOf(filename);
    if (ancestor >= 0) {
      cycles.push(
        [...stack.slice(ancestor), filename].map(display).join(" -> "),
      );
      return;
    }
    if (complete.has(filename)) return;
    stack.push(filename);
    for (const dependency of graph.get(filename)?.dependencies || []) {
      if (!dependency.typeOnly && !dependency.external && dependency.target)
        visit(dependency.target);
    }
    stack.pop();
    complete.add(filename);
  };
  for (const filename of graph.keys()) visit(filename);
  return cycles;
}

const catalogRoots = ["viewer/capabilities", "imports"].flatMap((directory) => {
  const files = sourceFiles(path.join(visualizationRoot, directory));
  if (!files.length)
    throw new Error(`Missing visualization boundary: ${directory}`);
  return files;
});
const rendererRoots = ["viewer/features", "viewer/scene"].flatMap(
  (directory) => {
    const files = sourceFiles(path.join(visualizationRoot, directory));
    if (!files.length)
      throw new Error(`Missing visualization boundary: ${directory}`);
    return files;
  },
);
const catalogs = dependencyGraph(catalogRoots);
const renderers = dependencyGraph(rendererRoots);

describe("visualization architecture dependency boundaries", () => {
  it("keeps capability and import catalogs independent of rendering, UI, transport and host modules", () => {
    const violations: string[] = [];
    for (const [filename, module] of catalogs) {
      violations.push(...module.unresolved);
      for (const dependency of module.dependencies) {
        const target = dependency.target
          ? display(dependency.target)
          : dependency.specifier;
        const dataLayer =
          /^(?:viewer\/capabilities|imports|viewer\/contracts)\//.test(target);
        if (dependency.external || !dataLayer) {
          violations.push(
            `${display(filename)}:${dependency.line} -> ${target}`,
          );
        }
      }
    }
    expect(
      violations,
      "Data catalogs may depend on each other and data contracts only",
    ).toEqual([]);
  });

  it("keeps domain renderers and shared scene resources independent of workbench orchestration", () => {
    const violations: string[] = [];
    for (const [filename, module] of renderers) {
      violations.push(...module.unresolved);
      for (const dependency of module.dependencies) {
        if (dependency.external || !dependency.target) continue;
        const target = display(dependency.target);
        const orchestration =
          /^(?:viewer\/(?:engines|stores|api|app|ui|commands|panels)\/|\.\.\/)/.test(
            target,
          ) ||
          /^(?:hostAdapter|viewerLoader|PluginPage|WorkspaceRenderer|embed|workspaceImport|index)\./.test(
            target,
          ) ||
          /^viewer\/(?:mount|index)\./.test(target);
        if (orchestration)
          violations.push(
            `${display(filename)}:${dependency.line} -> ${target}`,
          );
      }
    }
    expect(
      violations,
      "Renderers receive data and callbacks, never the engine, store, API or host",
    ).toEqual([]);
  });

  it("has no runtime dependency cycles across catalogs, domain renderers and shared geometry helpers", () => {
    const combined = new Map([...catalogs, ...renderers]);
    expect(
      runtimeCycles(combined),
      "Cycles are reported as their complete import path",
    ).toEqual([]);
  });
});
