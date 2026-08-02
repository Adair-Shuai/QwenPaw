import { lazy } from "react";
import type { ComponentType } from "react";
import { moduleRegistry } from "../plugins/moduleRegistry";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Derive the module-registry key from an import path, e.g.
 *   "../pages/Settings/Debug/index.tsx"  →  "Settings/Debug/index"
 *   "../../pages/Settings/Debug"         →  "Settings/Debug/index"
 *   "../../pages/AppCenter"              →  "AppCenter/index"
 *
 * The dynamic module registry (dynamicModuleRegistry.ts) registers every
 * file as "<relative-path-without-extension>", so a directory import like
 * `pages/AppCenter` is registered as `"AppCenter/index"` (from the file
 * `AppCenter/index.tsx`).  The key must therefore end with `/index` when
 * the caller's path has no file extension.
 */
function pathToModuleKey(importPath: string): string {
  const stripped = importPath.replace(/^.*\/pages\//, "");
  const hasExtension = /\.\w+$/.test(stripped);
  const key = stripped.replace(/\.\w+$/, "");
  // Bare-directory imports (no file extension) are registered as
  // "<Dir>/index" in the dynamic module registry.
  if (!hasExtension && !/\/index$/.test(key)) {
    return `${key}/index`;
  }
  return key;
}

function retryImport<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  retries: number,
): Promise<{ default: T }> {
  return factory().catch((error: unknown) => {
    if (retries <= 0) throw error;
    return new Promise<{ default: T }>((resolve) =>
      setTimeout(
        () => resolve(retryImport(factory, retries - 1)),
        RETRY_DELAY_MS,
      ),
    );
  });
}

// All page modules, keyed relative to this file (src/utils/).
// e.g. "../pages/Settings/Debug/index.tsx"
const PAGE_MODULES = import.meta.glob<ComponentType<unknown>>(
  ["../pages/**/*.{ts,tsx}", "!../pages/**/*.test.{ts,tsx}"],
  { import: "default" },
);

/**
 * Normalize any caller-relative path to the glob key used by PAGE_MODULES.
 * Callers in src/layouts/MainLayout use "../../pages/…"
 * The glob map is keyed as "../pages/…" (relative to src/utils/).
 */
function toGlobKey(path: string): string {
  // Strip everything up to and including the first occurrence of "pages/"
  let afterPages = path.replace(/^.*pages\//, "pages/");
  // Remove a bare "/index" suffix so both "Foo/index" and "Foo" resolve the same
  afterPages = afterPages.replace(/\/index$/, "");
  // Add the ../  prefix to match the glob map
  return `../${afterPages}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Like `React.lazy` but retries on chunk-load failure.
 * Pass the import path as a second argument to enable plugin-registry lookup:
 *
 * ```ts
 * // registry lookup enabled
 * const DebugPage = lazyWithRetry(
 *   () => import("../../pages/Settings/Debug"),
 *   "../../pages/Settings/Debug",
 * );
 * // no registry lookup (default behaviour, unchanged)
 * const ModelsPage = lazyWithRetry(() => import("../../pages/Settings/Models"));
 * ```
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  moduleKeyOrPath?: string,
) {
  return lazy(() =>
    retryImport(factory, MAX_RETRIES).then((mod) => {
      if (!moduleKeyOrPath) return mod;
      const key = moduleKeyOrPath.startsWith(".")
        ? pathToModuleKey(moduleKeyOrPath)
        : moduleKeyOrPath;
      // Use getModule (silent) instead of get (warns) — a miss is the
      // normal case when no plugin has patched this module, especially
      // before registerHostModulesDynamic finishes warming the registry.
      const patched = moduleRegistry.getModule(key)?.["default"];
      if (patched) return { default: patched as T };
      return mod;
    }),
  );
}

/**
 * Convenience variant — call sites only need the **path string**.
 * The dynamic import is sourced from an `import.meta.glob` map, so Vite
 * still creates individual chunks while allowing a runtime registry override.
 *
 * Path is relative to the caller — bare-directory or full-extension paths both work:
 *
 * ```ts
 * // from src/layouts/MainLayout/ — bare directory, index.tsx resolved automatically
 * const DebugPage = lazyImportWithRetry("../../pages/Settings/Debug");
 * ```
 *
 * Any plugin that patches `Settings/Debug/index.default` in the module
 * registry will automatically take effect.
 */
export function lazyImportWithRetry(
  path: string,
): ReturnType<typeof lazy<ComponentType<unknown>>> {
  // Normalise to the glob-map key (relative to src/utils/).
  // Bare-directory paths like "../../pages/Settings/Debug" are tried with
  // /index.tsx and /index.ts suffixes automatically.
  const base = toGlobKey(path);
  const globKey = PAGE_MODULES[base]
    ? base
    : PAGE_MODULES[`${base}/index.tsx`]
    ? `${base}/index.tsx`
    : PAGE_MODULES[`${base}/index.ts`]
    ? `${base}/index.ts`
    : base;
  const factory = PAGE_MODULES[globKey];
  if (!factory) {
    throw new Error(
      `[lazyImportWithRetry] No glob entry found for "${path}".\n` +
        `Resolved key: "${globKey}". ` +
        `Available: ${Object.keys(PAGE_MODULES).join(", ")}`,
    );
  }
  const key = pathToModuleKey(path);
  return lazy(() =>
    retryImport(
      () => factory().then((comp) => ({ default: comp })),
      MAX_RETRIES,
    ).then((mod) => {
      // Use getModule (silent) instead of get (warns) — a miss is the
      // normal case when no plugin has patched this module, especially
      // before registerHostModulesDynamic finishes warming the registry.
      const patched = moduleRegistry.getModule(key)?.["default"];
      if (patched) return { default: patched as ComponentType<unknown> };
      return mod;
    }),
  );
}
